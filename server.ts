import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import express from 'express';
import { WebSocketServer } from 'ws';
import { LiveServerMessage, Modality } from '@google/genai';
import { app } from './server/app';
import { getGemini, getActiveApiKey, generateVietnameseSpeechTTS } from './server/gemini';
import { processUserArenaMessage } from './server/arenaEngine';
import { SCAM_SCENARIOS } from './src/data/scenarios';

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

async function startServer() {
  const PORT = 3000;

  // --- VITE / STATIC MIDDLEWARE SETUP ---
  const distPath = path.join(process.cwd(), 'dist');
  const distExists = fs.existsSync(path.join(distPath, 'index.html'));

  if (process.env.NODE_ENV === 'production' || (distExists && process.env.SERVE_DIST === 'true')) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API route not found' });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        if (vite) vite.ssrFixStacktrace(e);
        console.error('Vite transform error:', e);
        res.status(500).end(e?.message || 'Internal Server Error');
      }
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🛡️ SCAMGUARD server running on http://localhost:${PORT}`);
  });

  // --- GEMINI 3.8 LIVE API WEBSOCKET BRIDGE (/api/live-voice) ---
  const wss = new WebSocketServer({ server, path: '/api/live-voice' });

  wss.on('connection', async (clientWs, req) => {
    const urlObj = new URL(req.url || '/api/live-voice', 'http://localhost:3000');
    const scenarioId = urlObj.searchParams.get('scenarioId') || 'scam-01';
    const voiceName = urlObj.searchParams.get('voice') || 'Kore';
    const scenario = SCAM_SCENARIOS.find((s) => s.id === scenarioId) || SCAM_SCENARIOS[0];
    const fallbackSessionId = `live_${Date.now()}`;

    let liveSessionPromise: Promise<any> | null = null;
    const hasApiKey = Boolean(getActiveApiKey());

    if (hasApiKey) {
      try {
        const ai = getGemini();
        liveSessionPromise = ai.live.connect({
          model: 'gemini-3.8-live',
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName },
              },
            },
            outputAudioTranscription: {},
            inputAudioTranscription: {},
            systemInstruction: `Bạn đang nhập vai đối tượng "${scenario.attackerProfile.name}" (${scenario.attackerProfile.organization}) trong kịch bản mô phỏng cuộc gọi thực tế tại Việt Nam: "${scenario.title}".
Bối cảnh: ${scenario.subtitle}. ${scenario.systemContext}.
QUY TẮC BẮT BUỘC:
1. Giao tiếp hoàn toàn bằng tiếng Việt tự nhiên, khẩu ngữ đời thường y hệt người Việt đang gọi điện thoại ngoài đời thực.
2. Nói ngắn gọn (1-3 câu mỗi lượt), phản ứng trực tiếp và tự nhiên với lời nói của người nghe.
3. Tuyệt đối không xưng là AI hay trợ lý ảo.`,
          },
          callbacks: {
            onmessage: (message: LiveServerMessage) => {
              if (clientWs.readyState !== 1) return;
              const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (audio) {
                clientWs.send(JSON.stringify({ type: 'audio', audio }));
              }
              const outText = (message.serverContent as any)?.outputTranscription?.text;
              if (outText) {
                clientWs.send(JSON.stringify({ type: 'outputTranscript', text: outText }));
              }
              const inText = (message.serverContent as any)?.inputTranscription?.text;
              if (inText) {
                clientWs.send(JSON.stringify({ type: 'inputTranscript', text: inText }));
              }
              if (message.serverContent?.interrupted) {
                clientWs.send(JSON.stringify({ type: 'interrupted', interrupted: true }));
              }
            },
            onerror: () => {
              liveSessionPromise = null;
            },
          },
        });
      } catch {
        liveSessionPromise = null;
      }
    }

    clientWs.on('message', async (raw) => {
      try {
        const payload = JSON.parse(raw.toString());

        if (payload.audio && liveSessionPromise) {
          liveSessionPromise
            .then((session) => {
              session.sendRealtimeInput({
                audio: { data: payload.audio, mimeType: 'audio/pcm;rate=16000' },
              });
            })
            .catch(() => {
              liveSessionPromise = null;
            });
          return;
        }

        if (payload.text) {
          if (liveSessionPromise) {
            try {
              const session = await liveSessionPromise;
              session.sendRealtimeInput({ text: payload.text });
              return;
            } catch {
              liveSessionPromise = null;
            }
          }

          // Fallback conversational + Vietnamese TTS response
          const turn = await processUserArenaMessage(fallbackSessionId, payload.text, {
            scenarioId: scenario.id,
          });
          const replyText = turn.evaluation.scammerResponse;
          const tts = await generateVietnameseSpeechTTS({
            text: replyText,
            persona:
              scenario.category === 'Government'
                ? 'police'
                : scenario.category === 'Family Emergency'
                ? 'family_urgent'
                : 'bank_staff',
          });

          if (clientWs.readyState === 1) {
            clientWs.send(
              JSON.stringify({
                type: 'fallbackTurn',
                text: replyText,
                coachTip: turn.evaluation.aiCoachTip,
                tactic: turn.evaluation.nextTactic,
                wavBase64: tts?.audioBase64 || null,
              })
            );
          }
        }
      } catch (e) {
        // Ignore malformed frame
      }
    });

    clientWs.on('close', () => {
      if (liveSessionPromise) {
        liveSessionPromise.then((s) => s?.close?.()).catch(() => {});
      }
    });
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});


