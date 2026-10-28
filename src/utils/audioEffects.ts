/**
 * Web Audio API & Gemini Neural Vietnamese TTS Engine for CyberGuard Defense
 * Supports real Vietnamese neural voice synthesis via /api/tts/vietnamese (Gemini 3.8 TTS)
 * with in-memory WAV caching, playback speed control, and clause-paced Web Speech fallback.
 */

let audioCtx: AudioContext | null = null;
let soundEnabled = true;
let activeHtmlAudio: HTMLAudioElement | null = null;
let activeSpeechTimer: ReturnType<typeof setInterval> | null = null;
const ttsAudioCache = new Map<string, string>(); // key -> data:audio/wav;base64,...

export interface SpeakVietnameseOptions {
  speakerRole?: string;
  emotion?: string;
  isAiCloned?: boolean;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onProgress?: (percent: number) => void;
  onEnd?: () => void;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem('sg_sound_enabled');
  if (saved !== null) {
    soundEnabled = saved === 'true';
  }
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem('sg_sound_enabled', String(enabled));
  }
}

/**
 * Play pleasant positive chime (correct answer, level up, quest complete)
 */
export function playSuccessChime(): void {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      gain.gain.setValueAtTime(0.001, now + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.18, now + index * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.4);
    });
  } catch (e) {
    // Graceful fallback
  }
}

/**
 * Play alert warning tone (scam detected or penalty)
 */
export function playAlertWarning(): void {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.25);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch (e) {
    // Graceful fallback
  }
}

/**
 * Play Loot Chest opening fanfare / Trophy sound
 */
export function playChestFanfare(): void {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const melody = [
      { f: 440, t: 0 },
      { f: 554.37, t: 0.1 },
      { f: 659.25, t: 0.2 },
      { f: 880, t: 0.35 },
      { f: 1108.73, t: 0.5 },
    ];

    melody.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, now + note.t);

      gain.gain.setValueAtTime(0.001, now + note.t);
      gain.gain.exponentialRampToValueAtTime(0.2, now + note.t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.t);
      osc.stop(now + note.t + 0.45);
    });
  } catch (e) {
    // Graceful fallback
  }
}

export const playRewardTrophy = playChestFanfare;

/**
 * Play Phone Ring for Live Deepfake Call Simulator
 */
export function playPhoneRingPattern(): void {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [440, 480].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
      gain.gain.setValueAtTime(0.12, now + 0.6);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.75);
    });
  } catch (e) {
    // Graceful fallback
  }
}

/**
 * Play PvP Duel Gong / Start bell
 */
export function playDuelBell(): void {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.6);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.85);
  } catch (e) {
    // Graceful fallback
  }
}

/**
 * Select the most natural Vietnamese voice available on the browser
 */
function pickBestVietnameseVoice(speakerRole = ''): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const viVoices = voices.filter(
    (v) =>
      v.lang.toLowerCase().startsWith('vi') ||
      v.name.toLowerCase().includes('vietnam') ||
      v.name.toLowerCase().includes('tiếng việt') ||
      v.name.toLowerCase().includes('hoaimy') ||
      v.name.toLowerCase().includes('namminh') ||
      v.name.toLowerCase().includes('linh') ||
      v.name.toLowerCase().includes('an ')
  );

  if (viVoices.length === 0) return null;

  const roleLower = speakerRole.toLowerCase();
  const preferMale =
    roleLower.includes('công an') ||
    roleLower.includes('đại úy') ||
    roleLower.includes('giám đốc') ||
    roleLower.includes('shipper') ||
    roleLower.includes('tài xế') ||
    roleLower.includes('nam') ||
    roleLower.includes('hùng') ||
    roleLower.includes('minh');

  // Prefer Microsoft Neural / Natural or Google voices
  const scored = viVoices.map((v) => {
    let score = 0;
    const n = v.name.toLowerCase();
    if (n.includes('natural') || n.includes('online')) score += 50;
    if (n.includes('google')) score += 35;
    if (n.includes('linh')) score += 30;
    if (preferMale && (n.includes('namminh') || n.includes('an') || n.includes('male'))) score += 25;
    if (!preferMale && (n.includes('hoaimy') || n.includes('linh') || n.includes('female'))) score += 25;
    return { voice: v, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].voice;
}

/**
 * Speak Vietnamese with realistic neural TTS via /api/tts/vietnamese (Gemini 3.8 TTS),
 * falling back seamlessly to natural clause-paced Vietnamese SpeechSynthesis.
 */
export async function speakVietnameseRealistic(
  text: string,
  options: SpeakVietnameseOptions = {}
): Promise<void> {
  if (typeof window === 'undefined') return;
  stopSpeaking();

  const {
    speakerRole = 'Người gọi',
    emotion = 'tự nhiên đời thường',
    isAiCloned = false,
    rate = 1.0,
    pitch = 1.0,
    onStart,
    onProgress,
    onEnd,
  } = options;

  const cacheKey = `${speakerRole}::${isAiCloned ? 'ai' : 'real'}::${text.slice(0, 140)}`;

  const playFromDataUrl = (dataUrl: string): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        const audio = new Audio(dataUrl);
        activeHtmlAudio = audio;
        audio.playbackRate = Math.max(0.5, Math.min(1.5, rate));

        audio.onplay = () => {
          onStart?.();
          if (activeSpeechTimer) clearInterval(activeSpeechTimer);
          activeSpeechTimer = setInterval(() => {
            if (audio.duration && !isNaN(audio.duration)) {
              const pct = Math.min(100, (audio.currentTime / audio.duration) * 100);
              onProgress?.(pct);
            }
          }, 80);
        };

        audio.onended = () => {
          if (activeSpeechTimer) clearInterval(activeSpeechTimer);
          activeSpeechTimer = null;
          activeHtmlAudio = null;
          onProgress?.(100);
          onEnd?.();
          resolve(true);
        };

        audio.onerror = () => {
          if (activeSpeechTimer) clearInterval(activeSpeechTimer);
          activeSpeechTimer = null;
          activeHtmlAudio = null;
          resolve(false);
        };

        audio.play().catch(() => {
          resolve(false);
        });
      } catch {
        resolve(false);
      }
    });
  };

  // 1. Check in-memory cache first
  const cachedUrl = ttsAudioCache.get(cacheKey);
  if (cachedUrl) {
    const played = await playFromDataUrl(cachedUrl);
    if (played) return;
  }

  // 2. Request server-side Gemini 3.8 Neural Vietnamese TTS
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);
    const response = await fetch('/api/tts/vietnamese', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        speakerRole,
        emotion,
        isAiCloned,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data?.audioBase64) {
        const mime = data.mimeType || 'audio/wav';
        const dataUrl = `data:${mime};base64,${data.audioBase64}`;
        ttsAudioCache.set(cacheKey, dataUrl);
        const played = await playFromDataUrl(dataUrl);
        if (played) return;
      }
    }
  } catch {
    // Proceed to local Vietnamese voice synthesis fallback
  }

  // 3. Fallback: Natural clause-paced Vietnamese Web Speech Synthesis
  if (!('speechSynthesis' in window)) {
    onStart?.();
    let elapsed = 0;
    const durationMs = Math.max(3500, text.split(/\s+/).length * 320);
    activeSpeechTimer = setInterval(() => {
      elapsed += 100;
      const pct = Math.min(100, (elapsed / durationMs) * 100);
      onProgress?.(pct);
      if (pct >= 100) {
        stopSpeaking();
        onEnd?.();
      }
    }, 100);
    return;
  }

  try {
    window.speechSynthesis.cancel();
    // Normalize text so punctuation creates natural Vietnamese breathing pauses
    const normalizedText = text
      .replace(/\.\.\./g, ', ')
      .replace(/—/g, ', ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(normalizedText);
    utterance.lang = 'vi-VN';

    const bestVoice = pickBestVietnameseVoice(speakerRole);
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    // Natural conversational Vietnamese cadence
    utterance.rate = Math.max(0.7, Math.min(1.25, (isAiCloned ? 1.02 : 0.96) * rate));
    utterance.pitch = isAiCloned ? 0.94 : pitch;

    const estDurationMs = Math.max(3500, (normalizedText.split(/\s+/).length * 310) / utterance.rate);
    let elapsed = 0;

    utterance.onstart = () => {
      onStart?.();
      if (activeSpeechTimer) clearInterval(activeSpeechTimer);
      activeSpeechTimer = setInterval(() => {
        elapsed += 90;
        onProgress?.(Math.min(98, (elapsed / estDurationMs) * 100));
      }, 90);
    };

    utterance.onend = () => {
      if (activeSpeechTimer) clearInterval(activeSpeechTimer);
      activeSpeechTimer = null;
      onProgress?.(100);
      onEnd?.();
    };

    utterance.onerror = () => {
      if (activeSpeechTimer) clearInterval(activeSpeechTimer);
      activeSpeechTimer = null;
      onEnd?.();
    };

    onStart?.();
    window.speechSynthesis.speak(utterance);
  } catch {
    onEnd?.();
  }
}

/**
 * Speak text with enhanced Vietnamese voice selection
 */
export function speakText(text: string, lang = 'vi-VN'): void {
  if (lang.startsWith('vi')) {
    speakVietnameseRealistic(text, { speakerRole: 'Người gọi Việt Nam' });
    return;
  }
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.96;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    // Fallback if voice synthesis unavailable
  }
}

/**
 * Stop any active text-to-speech voice playback immediately
 */
export function stopSpeaking(): void {
  if (activeSpeechTimer) {
    clearInterval(activeSpeechTimer);
    activeSpeechTimer = null;
  }
  if (activeHtmlAudio) {
    try {
      activeHtmlAudio.pause();
      activeHtmlAudio.currentTime = 0;
    } catch {}
    activeHtmlAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // Silently ignore if canceled
    }
  }
}

export function playCardFlip(): void {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  } catch (e) {}
}

export function playButtonClick(): void {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.03);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  } catch (e) {}
}
