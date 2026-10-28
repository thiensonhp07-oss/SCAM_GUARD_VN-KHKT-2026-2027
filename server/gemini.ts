import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse, ThinkingLevel } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;
let cachedApiKey: string = '';

// Primary and fallback models according to latest Gemini API guidelines
export const GEMINI_MODEL = 'gemini-3.8-flash';
export const FAST_CHAT_MODEL = 'gemini-3.8-flash';
export const FALLBACK_MODELS = ['gemini-3.1-flash-lite'];

// Cooldown tracker when quota / 429 / 503 rate limits occur
let quotaExhaustedUntil: number = 0;

// In-memory LRU cache for Vietnamese TTS audio to eliminate repeat latency
const ttsCache = new Map<string, { audioBase64: string; mimeType: string; voiceName: string; modelUsed: string }>();

export function getActiveApiKey(): string {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    ''
  ).trim();
}

export function getGemini(): GoogleGenAI {
  const apiKey = getActiveApiKey();
  if (!geminiClient || cachedApiKey !== apiKey) {
    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY environment variable is not set. Using local deterministic fallback engine.');
    }
    cachedApiKey = apiKey;
    geminiClient = new GoogleGenAI({
      apiKey: apiKey || 'dummy-key',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

export function isGeminiQuotaPaused(): boolean {
  return Date.now() < quotaExhaustedUntil;
}

/**
 * Helper to check if an error is a temporary 503 / 429 / overload issue
 */
function isTemporaryServiceError(err: any): boolean {
  const errMsg = String(err?.message || err || '').toLowerCase();
  const errCode = err?.code || err?.status;
  return (
    errMsg.includes('503') ||
    errMsg.includes('429') ||
    errMsg.includes('unavailable') ||
    errMsg.includes('resource_exhausted') ||
    errMsg.includes('high demand') ||
    errMsg.includes('quota exceeded') ||
    errCode === 503 ||
    errCode === 429
  );
}

/**
 * Helper to race a promise against a strict timeout so AI calls never hang or feel slow
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`GEMINI_TIMEOUT_${timeoutMs}MS`));
    }, timeoutMs);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Execute Gemini content generation with low-latency thinking configuration,
 * strict timeout protection, and multi-model fallback.
 */
export async function executeGeminiWithFallback(
  params: Omit<GenerateContentParameters, 'model'> & {
    preferredModel?: string;
    fastChat?: boolean;
    timeoutMs?: number;
  }
): Promise<GenerateContentResponse | null> {
  const apiKey = getActiveApiKey();
  if (!apiKey || apiKey === 'dummy-key') {
    return null;
  }

  // If in temporary rate-limit cooldown, skip directly to deterministic engine to prevent lag
  if (isGeminiQuotaPaused()) {
    return null;
  }

  const ai = getGemini();
  const primaryModel = params.preferredModel || (params.fastChat ? FAST_CHAT_MODEL : GEMINI_MODEL);
  const modelsToTry = [
    primaryModel,
    ...FALLBACK_MODELS.filter((m) => m !== primaryModel),
  ];

  const timeoutMs = params.timeoutMs || (params.fastChat ? 3800 : 6500);

  for (const model of modelsToTry) {
    try {
      const mergedConfig: any = {
        ...(params.config || {}),
      };

      // Gemini 3.8 Flash supports LOW/MEDIUM/HIGH thinking levels (MINIMAL is only supported on 3.1-flash-lite)
      if (!mergedConfig.thinkingConfig) {
        if (model.includes('gemini-3.8')) {
          mergedConfig.thinkingConfig = {
            thinkingLevel: ThinkingLevel.LOW,
          };
        } else if (model.includes('gemini-3.1-flash-lite')) {
          mergedConfig.thinkingConfig = {
            thinkingLevel: ThinkingLevel.MINIMAL,
          };
        }
      } else if (model.includes('gemini-3.8') && mergedConfig.thinkingConfig.thinkingLevel === 'MINIMAL') {
        mergedConfig.thinkingConfig = {
          ...mergedConfig.thinkingConfig,
          thinkingLevel: ThinkingLevel.LOW,
        };
      }

      const response = await withTimeout(
        ai.models.generateContent({
          contents: params.contents,
          model,
          config: mergedConfig,
        }),
        timeoutMs
      );
      return response;
    } catch (err: any) {
      const msg = String(err?.message || err || '');
      if (msg.includes('GEMINI_TIMEOUT')) {
        console.warn(`⚡ Gemini call on ${model} exceeded ${timeoutMs}ms budget, switching to fast fallback...`);
        continue;
      }
      if (isTemporaryServiceError(err)) {
        console.warn(`Model ${model} unavailable or under high demand (503/429). Switching to next fallback model...`);
        quotaExhaustedUntil = Date.now() + 4000;
        continue;
      } else {
        console.warn(`Gemini generation skipped on ${model}:`, msg);
      }
    }
  }

  return null;
}

export interface VietnameseTTSOptions {
  text: string;
  persona?: 'police' | 'family_urgent' | 'bank_staff' | 'teacher' | 'ceo' | 'friend' | 'scammer_general';
  gender?: 'male' | 'female';
}

/**
 * Synthesize natural Vietnamese speech using Gemini 3.8 TTS models.
 * Unary generateContent returns a complete 24kHz mono 16-bit WAV file in base64.
 * Includes in-memory LRU caching and timeout protection for zero-delay playback.
 */
export async function generateVietnameseSpeechTTS(
  options: VietnameseTTSOptions
): Promise<{ audioBase64: string; mimeType: string; voiceName: string; modelUsed: string } | null> {
  const apiKey = getActiveApiKey();
  if (!apiKey || apiKey === 'dummy-key' || isGeminiQuotaPaused()) {
    return null;
  }

  const { text, persona = 'scammer_general', gender } = options;
  const cacheKey = `${persona}:${gender || 'auto'}:${text.trim().slice(0, 300)}`;
  const cached = ttsCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const ai = getGemini();

  // Map persona to prebuilt voice ('Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr') and natural Vietnamese style instruction
  let voiceName = 'Kore';
  let stylePrompt =
    'Giọng người Việt Nam tự nhiên, phát âm chuẩn thanh điệu tiếng Việt Bắc - Nam đời thường, nhịp điệu chân thực như đang nói chuyện trực tiếp qua điện thoại';

  if (persona === 'police') {
    voiceName = 'Fenrir';
    stylePrompt =
      'Giọng nam người Việt Nam trung niên nghiêm nghị, đanh thép, tốc độ nói dồn dập tạo áp lực tâm lý như cuộc gọi mạo danh cán bộ điều tra';
  } else if (persona === 'family_urgent') {
    voiceName = gender === 'female' ? 'Zephyr' : 'Puck';
    stylePrompt =
      'Giọng người Việt Nam trẻ tuổi đang hoảng hốt, gấp gáp, hơi thở dồn dập cầu cứu người thân trong tình huống khẩn cấp';
  } else if (persona === 'ceo') {
    voiceName = 'Charon';
    stylePrompt =
      'Giọng nam lãnh đạo doanh nghiệp Việt Nam điềm tĩnh, dứt khoát, chỉ đạo công việc khẩn cấp qua điện thoại';
  } else if (persona === 'teacher' || persona === 'bank_staff') {
    voiceName = 'Kore';
    stylePrompt =
      'Giọng nữ người Việt Nam rõ ràng, lịch sự, truyền cảm, phát âm chuẩn xác tự nhiên như nhân viên tổng đài hoặc giáo viên';
  } else if (persona === 'friend') {
    voiceName = gender === 'female' ? 'Zephyr' : 'Puck';
    stylePrompt =
      'Giọng người Việt Nam trẻ trung, thân mật, tự nhiên đời thường như gửi tin nhắn thoại Zalo cho bạn thân';
  } else {
    voiceName = gender === 'male' ? 'Fenrir' : 'Kore';
  }

  const ttsModels = ['gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts'];

  for (const model of ttsModels) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text,
                  // @ts-ignore - speechMetadata supported by Gemini 3.8 TTS
                  speechMetadata: {
                    style: stylePrompt,
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName },
              },
            },
          },
        }),
        4800
      );

      const part = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.data);
      const base64Audio = part?.inlineData?.data;
      if (base64Audio) {
        const result = {
          audioBase64: base64Audio,
          mimeType: part?.inlineData?.mimeType || 'audio/wav',
          voiceName,
          modelUsed: model,
        };
        if (ttsCache.size > 60) {
          const firstKey = ttsCache.keys().next().value;
          if (firstKey) ttsCache.delete(firstKey);
        }
        ttsCache.set(cacheKey, result);
        return result;
      }
    } catch (err: any) {
      if (isTemporaryServiceError(err)) {
        quotaExhaustedUntil = Date.now() + 4000;
        continue;
      }
      console.warn(`Vietnamese TTS skipped on ${model}:`, err?.message || err);
    }
  }

  return null;
}
