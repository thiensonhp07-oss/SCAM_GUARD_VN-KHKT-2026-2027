import React, { useState, useEffect } from 'react';
import {
  Eye,
  Volume2,
  Play,
  Pause,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Flame,
  Trophy,
  Search,
  Activity,
  Layers,
  Info,
  ArrowRight,
  Award,
  Radio,
  FileCheck,
  RefreshCw,
  Scan,
  Sun,
  Cpu,
  Camera,
} from 'lucide-react';
import { motion } from 'motion/react';
import { DEEPFAKE_QUIZ_DATA, DeepfakeQuizItem } from '../data/deepfakeQuizData';
import {
  playSuccessChime,
  playButtonClick,
  playAlertWarning,
  playRewardTrophy,
  speakVietnameseRealistic,
  stopSpeaking,
} from '../utils/audioEffects';

interface DeepfakeQuizViewProps {
  onAddXp: (amount: number) => void;
  onOpenCaseLab?: () => void;
}

export const DeepfakeQuizView: React.FC<DeepfakeQuizViewProps> = ({ onAddXp, onOpenCaseLab }) => {
  const [filterType, setFilterType] = useState<'all' | 'audio' | 'visual'>('all');
  const [quizList, setQuizList] = useState<DeepfakeQuizItem[]>(DEEPFAKE_QUIZ_DATA);
  const [currentIndex, setCurrentIndex] = useState(0);

  // User response state
  const [userChoice, setUserChoice] = useState<'real' | 'ai' | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [claimedXp, setClaimedXp] = useState(0);

  // Audio simulation state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingVoice, setIsLoadingVoice] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<0.85 | 1>(1);
  const [activeAudioTab, setActiveAudioTab] = useState<'waveform' | 'spectrogram'>('waveform');
  const [audioProgress, setAudioProgress] = useState(0);

  // Visual forensic inspection modes
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [forensicOverlayMode, setForensicOverlayMode] = useState<'rgb' | 'ela' | 'mesh' | 'uv'>('rgb');
  const [selectedLandmark, setSelectedLandmark] = useState<number | null>(null);
  const [isMagnifierActive, setIsMagnifierActive] = useState(false);
  const [magnifierPos, setMagnifierPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // Completion state
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let filtered = DEEPFAKE_QUIZ_DATA;
    if (filterType === 'audio') {
      filtered = DEEPFAKE_QUIZ_DATA.filter((item) => item.mediaType === 'audio');
    } else if (filterType === 'visual') {
      filtered = DEEPFAKE_QUIZ_DATA.filter((item) => item.mediaType === 'visual');
    }
    setQuizList(filtered);
    setCurrentIndex(0);
    setUserChoice(null);
    setIsAnswered(false);
    setIsCompleted(false);
    handleStopAudio();
  }, [filterType]);

  const currentItem = quizList[currentIndex] || quizList[0];

  useEffect(() => {
    setUserChoice(null);
    setIsAnswered(false);
    setSelectedLandmark(null);
    setForensicOverlayMode('rgb');
    handleStopAudio();
    return () => {
      stopSpeaking();
    };
  }, [currentIndex]);

  const handleStopAudio = () => {
    stopSpeaking();
    setIsPlayingAudio(false);
    setIsLoadingVoice(false);
    setAudioProgress(0);
  };

  const handleToggleAudio = async () => {
    playButtonClick();
    if (isPlayingAudio || isLoadingVoice) {
      handleStopAudio();
      return;
    }

    if (!currentItem.audioData) return;

    setIsLoadingVoice(true);
    setAudioProgress(0);

    await speakVietnameseRealistic(currentItem.audioData.transcript, {
      speakerRole: currentItem.audioData.speakerName,
      emotion:
        currentItem.verdict === 'ai'
          ? 'khẩn cấp nhưng hơi đều nhịp do AI clone giọng'
          : 'tự nhiên đời thường của người Việt Nam, có nhịp thở và ngữ điệu thực tế',
      isAiCloned: currentItem.verdict === 'ai',
      rate: audioSpeed,
      pitch: currentItem.audioData.voicePitch || 1.0,
      onStart: () => {
        setIsLoadingVoice(false);
        setIsPlayingAudio(true);
      },
      onProgress: (pct) => {
        setAudioProgress(pct);
      },
      onEnd: () => {
        setIsLoadingVoice(false);
        setIsPlayingAudio(false);
        setAudioProgress(0);
      },
    });
  };

  const handleSelectVerdict = (choice: 'real' | 'ai') => {
    if (isAnswered) return;

    playButtonClick();
    setUserChoice(choice);
    setIsAnswered(true);
    handleStopAudio();

    const isCorrect = choice === currentItem.verdict;

    if (isCorrect) {
      playSuccessChime();
      const newScore = score + 1;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      if (newStreak > highestStreak) setHighestStreak(newStreak);

      const xp = currentItem.xpReward + (newStreak >= 3 ? 25 : 0);
      setClaimedXp((prev) => prev + xp);
      onAddXp(xp);
    } else {
      playAlertWarning();
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    playButtonClick();
    if (currentIndex < quizList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      playRewardTrophy();
    }
  };

  const handleRestartQuiz = () => {
    playButtonClick();
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setUserChoice(null);
    setIsAnswered(false);
    setIsCompleted(false);
    handleStopAudio();
  };

  // High-Craft Forensic Visual & Biometric Frame Renderer
  const renderVisualMockup = (item: DeepfakeQuizItem) => {
    const vType = item.visualData?.visualScenarioType || 'traffic_officer_call';
    const isAi = item.verdict === 'ai';

    return (
      <div className="space-y-3">
        {/* Forensic Mode Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 text-[11px]">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => {
                playButtonClick();
                setForensicOverlayMode('rgb');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                forensicOverlayMode === 'rgb'
                  ? 'bg-sky-500 text-slate-950'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              <Camera className="w-3 h-3" />
              <span>Quang Học Gốc (RGB)</span>
            </button>
            <button
              onClick={() => {
                playButtonClick();
                setForensicOverlayMode('mesh');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                forensicOverlayMode === 'mesh'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              <Cpu className="w-3 h-3" />
              <span>Lưới Sinh Trắc 68 Điểm</span>
            </button>
            <button
              onClick={() => {
                playButtonClick();
                setForensicOverlayMode('ela');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                forensicOverlayMode === 'ela'
                  ? 'bg-rose-500 text-white'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>Phổ Nén ELA</span>
            </button>
            <button
              onClick={() => {
                playButtonClick();
                setForensicOverlayMode('uv');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                forensicOverlayMode === 'uv'
                  ? 'bg-purple-500 text-white'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              <Sun className="w-3 h-3" />
              <span>Đèn Cực Tím UV 365nm</span>
            </button>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => {
                playButtonClick();
                setShowLandmarks(!showLandmarks);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors flex items-center space-x-1 cursor-pointer ${
                showLandmarks
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Điểm Dấu Vết ({item.visualData?.landmarks.length || 0})</span>
            </button>
            <button
              onClick={() => {
                playButtonClick();
                setIsMagnifierActive(!isMagnifierActive);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors flex items-center space-x-1 cursor-pointer ${
                isMagnifierActive
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <Search className="w-3 h-3" />
              <span>Soi 3.0x</span>
            </button>
          </div>
        </div>

        {/* Main Forensic Viewport */}
        <div
          className="relative w-full aspect-video bg-[#070B12] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl select-none group"
          onMouseMove={(e) => {
            if (!isMagnifierActive) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
            const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
            setMagnifierPos({ x, y });
          }}
        >
          {/* Top Forensic Camera Telemetry HUD */}
          <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between text-[10px] font-mono bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800/90 z-20">
            <div className="flex items-center space-x-2.5">
              <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>FORENSIC LAB v4.2</span>
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300">
                MODE: <strong className="text-sky-400 uppercase">{forensicOverlayMode}</strong>
              </span>
            </div>
            <div className="flex items-center space-x-3 text-slate-400">
              <span>{isAi ? 'DCT RESIDUAL: ANOMALY' : 'SENSOR PRNU: VERIFIED'}</span>
              <span className="hidden sm:inline text-cyan-400">1080p • 29.97fps</span>
            </div>
          </div>

          {/* 1. TRAFFIC OFFICER VIDEO CALL FORENSIC FRAME */}
          {vType === 'traffic_officer_call' && (
            <div className="absolute inset-0 bg-gradient-to-b from-[#0b1324] via-[#090d16] to-[#0c192c] flex items-center justify-center">
              <svg viewBox="0 0 640 360" className="w-full h-full">
                <defs>
                  <radialGradient id="studioLight" cx="50%" cy="42%" r="55%">
                    <stop offset="0%" stopColor="#1e293b" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#050811" stopOpacity="1" />
                  </radialGradient>
                  <linearGradient id="skinToneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e6b89c" />
                    <stop offset="55%" stopColor="#d49b78" />
                    <stop offset="100%" stopColor="#9c6644" />
                  </linearGradient>
                  <linearGradient id="policeUniform" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3f6212" />
                    <stop offset="100%" stopColor="#1a2e05" />
                  </linearGradient>
                  <pattern id="pixelGrid" width="8" height="8" patternUnits="userSpaceOnUse">
                    <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#38bdf8" strokeWidth="0.2" opacity="0.25" />
                  </pattern>
                </defs>

                <rect width="640" height="360" fill="url(#studioLight)" />
                <rect width="640" height="360" fill="url(#pixelGrid)" />

                {/* Investigation Room Backdrop with acoustic panels & blurred emblem */}
                <rect x="45" y="45" width="160" height="210" rx="4" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />
                <line x1="45" y1="95" x2="205" y2="95" stroke="#1e293b" strokeWidth="1" />
                <line x1="45" y1="145" x2="205" y2="145" stroke="#1e293b" strokeWidth="1" />
                {/* Warped National Emblem in background (Landmark 4: x=85%, y=25%) */}
                <g transform="translate(544, 90)">
                  <circle cx="0" cy="0" r="34" fill="#78350f" opacity="0.35" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 2" />
                  <circle cx="2" cy="-1" r="24" fill="#991b1b" opacity="0.45" />
                  <polygon points="0,-14 4,-4 15,-4 6,3 9,14 0,7 -9,14 -6,3 -15,-4 -4,-4" fill="#fbbf24" opacity="0.65" />
                  <text x="0" y="46" fill="#94a3b8" fontSize="7" textAnchor="middle" fontFamily="monospace">
                    GAN_BG_HALLUCINATION
                  </text>
                </g>

                {/* Realistic Shoulders & Uniform Torso */}
                <path
                  d="M155,360 C175,250 235,232 320,232 C405,232 465,250 485,360 Z"
                  fill="url(#policeUniform)"
                  stroke="#365314"
                  strokeWidth="1.5"
                />
                {/* Shirt & Tie */}
                <polygon points="282,232 358,232 335,320 305,320" fill="#e2e8f0" />
                <polygon points="312,248 328,248 332,330 320,345 308,330" fill="#1e293b" />
                {/* Epaulettes (Cầu vai) - Left crisp, Right warped by DeepLiveCam */}
                <rect x="195" y="242" width="68" height="24" rx="4" fill="#dc2626" stroke="#facc15" strokeWidth="1.5" />
                <circle cx="220" cy="254" r="4" fill="#facc15" />
                <circle cx="240" cy="254" r="4" fill="#facc15" />
                {/* Warped Right Epaulette & Collar (Landmark 3: x=68%, y=72%) */}
                <path
                  d="M378,246 Q415,238 442,253 L438,270 Q405,260 375,266 Z"
                  fill="#b91c1c"
                  stroke="#eab308"
                  strokeWidth="1.2"
                  opacity="0.82"
                />
                <rect x="370" y="255" width="76" height="28" fill="none" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3 3" />

                {/* Neck & Deepfake Face-Swap Boundary Seam (Landmark 1: x=48%, y=58%) */}
                <path d="M286,185 L282,242 L358,242 L354,185 Z" fill="#b07d56" />
                {/* GAN Bounding Box Seam Artifact at Jawline */}
                <path
                  d="M258,195 Q320,228 382,195"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  strokeDasharray="5 3"
                />
                <text x="320" y="224" fill="#fda4af" fontSize="8" fontFamily="monospace" textAnchor="middle">
                  ΔE COLOR MISMATCH: 14.8 (MASK SEAM)
                </text>

                {/* Anatomically Proportioned Head & Face Contour */}
                <path
                  d="M258,118 C258,72 382,72 382,118 C382,162 362,204 320,208 C278,204 258,162 258,118 Z"
                  fill="url(#skinToneGrad)"
                />
                {/* Ears */}
                <path d="M258,125 C248,125 248,154 260,158" fill="#c68b65" />
                <path d="M382,125 C392,125 392,154 380,158" fill="#c68b65" />

                {/* Officer Peaked Cap (Mũ kê-pi) */}
                <path d="M242,96 C242,46 398,46 398,96 Z" fill="#1a2e05" stroke="#365314" strokeWidth="2" />
                <path d="M246,94 Q320,106 394,94" fill="none" stroke="#eab308" strokeWidth="3" />
                <path d="M248,96 Q320,115 392,96 L382,108 Q320,122 258,108 Z" fill="#090d16" />
                <circle cx="320" cy="72" r="11" fill="#dc2626" stroke="#facc15" strokeWidth="2" />
                <polygon points="320,65 322,70 327,70 323,73 324,78 320,75 316,78 317,73 313,70 318,70" fill="#facc15" />

                {/* Eyebrows & Nose Bridge */}
                <path d="M276,120 Q294,114 308,119" fill="none" stroke="#27272a" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M332,119 Q346,114 364,120" fill="none" stroke="#27272a" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M320,122 L317,154 Q320,160 326,156" fill="none" stroke="#8c583a" strokeWidth="2" />

                {/* Eyes with Corneal Specular Reflection Mismatch (Landmark 2: x=54%, y=38%) */}
                <g>
                  {/* Left Eye */}
                  <path d="M278,132 Q293,124 306,132 Q293,139 278,132 Z" fill="#f8fafc" />
                  <circle cx="292" cy="132" r="5.5" fill="#1e293b" />
                  <circle cx="290" cy="130" r="2" fill="#ffffff" />
                  {/* Right Eye (Corneal reflection square + off-axis) */}
                  <path d="M334,132 Q347,124 362,132 Q347,139 334,132 Z" fill="#f8fafc" />
                  <circle cx="348" cy="132" r="5.5" fill="#1e293b" />
                  <rect x="349" y="129" width="4.5" height="3" fill="#38bdf8" />
                  <circle cx="348" cy="132" r="14" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
                </g>

                {/* Mouth with Wav2Lip Frame Interpolation Blur */}
                <path d="M298,176 Q320,171 342,176 Q320,188 298,176 Z" fill="#7f1d1d" />
                <path d="M303,176 L337,176" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 2" opacity="0.65" />

                {/* 68-Point Biometric Face Mesh Overlay (when active or subtle in RGB) */}
                {(forensicOverlayMode === 'mesh' || forensicOverlayMode === 'rgb') && (
                  <g opacity={forensicOverlayMode === 'mesh' ? 0.95 : 0.35}>
                    <polygon
                      points="260,122 268,168 292,198 320,208 348,198 372,168 380,122 355,108 320,105 285,108"
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="1"
                      strokeDasharray="3 2"
                    />
                    <line x1="292" y1="132" x2="348" y2="132" stroke="#22d3ee" strokeWidth="0.8" />
                    <line x1="292" y1="132" x2="320" y2="156" stroke="#22d3ee" strokeWidth="0.8" />
                    <line x1="348" y1="132" x2="320" y2="156" stroke="#22d3ee" strokeWidth="0.8" />
                    <line x1="320" y1="156" x2="298" y2="176" stroke="#f43f5e" strokeWidth="1" />
                    <line x1="320" y1="156" x2="342" y2="176" stroke="#f43f5e" strokeWidth="1" />
                  </g>
                )}

                {/* Lip-Sync Phase Desync Oscilloscope Box */}
                <g transform="translate(18, 255)">
                  <rect width="195" height="58" rx="6" fill="#090d16" opacity="0.9" stroke="#1e293b" />
                  <text x="10" y="15" fill="#94a3b8" fontSize="8" fontFamily="monospace" fontWeight="bold">
                    AUDIO-VISUAL LIP SYNC PHASE
                  </text>
                  <path d="M10,32 Q30,18 50,32 T90,32 T130,32 T170,32" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                  <path d="M18,38 Q38,24 58,38 T98,38 T138,38 T178,38" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 2" />
                  <text x="10" y="51" fill="#f43f5e" fontSize="8" fontFamily="monospace">
                    DESYNC OFFSET: +184ms (WAV2LIP)
                  </text>
                </g>
              </svg>
            </div>
          )}

          {/* 2. INVESTOR SELFIE (STYLEGAN / DIFFUSION PORTRAIT) */}
          {vType === 'investor_selfie' && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#0c1222] via-[#111827] to-[#1e1b4b] flex items-center justify-center">
              <svg viewBox="0 0 640 360" className="w-full h-full">
                {/* Luxury Penthouse Skyscraper Background with Non-Euclidean Warped Mullions */}
                <rect width="640" height="360" fill="#090d16" />
                {/* Left building normal perspective */}
                <polygon points="30,40 180,55 180,340 30,340" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />
                <line x1="55" y1="80" x2="160" y2="88" stroke="#38bdf8" strokeWidth="1" opacity="0.35" />
                <line x1="55" y1="125" x2="160" y2="132" stroke="#38bdf8" strokeWidth="1" opacity="0.35" />
                {/* Right window frame warped by Diffusion model (Landmark 3: x=82%, y=30%) */}
                <path
                  d="M460,35 Q545,95 510,190 L605,175 L595,35 Z"
                  fill="#0f172a"
                  stroke="#f43f5e"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
                <path d="M475,75 Q525,115 585,85" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.5" />
                <text x="530" y="135" fill="#fda4af" fontSize="8" fontFamily="monospace" textAnchor="middle">
                  NON-EUCLIDEAN CURVE
                </text>

                {/* Tailored Business Suit */}
                <path d="M165,360 C185,255 245,235 320,235 C395,235 455,255 475,360 Z" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
                <polygon points="285,235 355,235 320,325" fill="#f8fafc" />
                <path d="M260,238 L320,325 L292,235 Z" fill="#1e293b" />
                <path d="M380,238 L320,325 L348,235 Z" fill="#1e293b" />

                {/* Neck & Over-smoothed plastic skin */}
                <rect x="292" y="190" width="56" height="52" rx="10" fill="#eab696" />
                <path
                  d="M256,120 C256,68 384,68 384,120 C384,168 360,208 320,212 C280,208 256,168 256,120 Z"
                  fill="#f3c6a8"
                />
                {/* Frequency-domain skin smoothness alert (Landmark 4: x=50%, y=48%) */}
                <ellipse cx="320" cy="162" rx="42" ry="18" fill="none" stroke="#a855f7" strokeWidth="1.2" strokeDasharray="3 3" />
                <text x="320" y="198" fill="#d8b4fe" fontSize="7.5" fontFamily="monospace" textAnchor="middle">
                  HIGH-FREQ PORE TEXTURE = 0.02 (GAN SMOOTHING)
                </text>

                {/* Hair with Dissolved Alpha Fringe (Landmark 2: x=66%, y=18%) */}
                <path d="M252,118 C248,54 392,54 388,118 C375,78 265,78 252,118 Z" fill="#18181b" />
                <circle cx="412" cy="72" r="22" fill="#38bdf8" opacity="0.18" />
                <path d="M375,65 Q415,52 428,82" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="2 3" />

                {/* Asymmetric Melted Left Earring vs Missing Right Earring (Landmark 1: x=33%, y=52%) */}
                <path d="M248,142 C240,148 242,168 254,165" fill="#e2b091" />
                <path d="M244,162 Q232,182 248,192 Q256,178 249,164 Z" fill="#fbbf24" stroke="#f43f5e" strokeWidth="1.5" />
                <circle cx="245" cy="176" r="18" fill="none" stroke="#f43f5e" strokeWidth="1.2" strokeDasharray="3 2" />
                {/* Right ear: no earring */}
                <path d="M392,142 C400,148 398,168 386,165" fill="#e2b091" />

                {/* Facial Features */}
                <path d="M276,120 Q294,113 308,118" fill="none" stroke="#18181b" strokeWidth="3" />
                <path d="M332,118 Q346,113 364,120" fill="none" stroke="#18181b" strokeWidth="3" />
                <ellipse cx="292" cy="132" rx="11" ry="5" fill="#ffffff" />
                <circle cx="292" cy="132" r="4.5" fill="#27272a" />
                <ellipse cx="348" cy="132" rx="11" ry="5" fill="#ffffff" />
                <circle cx="348" cy="132" r="4.5" fill="#27272a" />
                <path d="M302,175 Q320,185 338,175" fill="none" stroke="#be123c" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
          )}

          {/* 3. FORGED VIETNAMESE CHIP ID CARD (CCCD GẮN CHIP GIẢ MẠO) */}
          {vType === 'id_card' && (
            <div className="absolute inset-0 bg-[#070b12] flex items-center justify-center p-4 sm:p-6">
              <div
                className={`w-full max-w-md aspect-[1.586/1] rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden border-2 transition-all ${
                  forensicOverlayMode === 'uv'
                    ? 'bg-[#120924] border-purple-500 text-purple-100'
                    : 'bg-gradient-to-br from-[#f8fafc] via-[#e2e8f0] to-[#cbd5e1] border-slate-400 text-slate-900'
                } flex flex-col justify-between`}
              >
                {/* Guilloche Security Wave Pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 400 250">
                  <path d="M0,120 Q100,60 200,120 T400,120" fill="none" stroke="#0284c7" strokeWidth="1" />
                  <path d="M0,135 Q100,75 200,135 T400,135" fill="none" stroke="#0284c7" strokeWidth="1" />
                  <path d="M0,150 Q100,90 200,150 T400,150" fill="none" stroke="#eab308" strokeWidth="1" />
                  <circle cx="310" cy="130" r="65" fill="none" stroke="#eab308" strokeWidth="0.8" strokeDasharray="3 2" />
                </svg>

                {/* UV Mode Warning Overlay */}
                {forensicOverlayMode === 'uv' && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-rose-500/30 border border-rose-400 text-[9px] font-mono text-rose-200 z-20">
                    UV 365nm: KHÔNG CÓ PHÔI BẢO AN PHÁT QUANG
                  </div>
                )}

                {/* Header */}
                <div className="relative z-10 flex items-center justify-between border-b border-slate-300/80 pb-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-red-600 border-2 border-amber-400 flex items-center justify-center text-amber-300 font-black text-xs shadow">
                      ★
                    </div>
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-black tracking-tight uppercase text-slate-800">
                        CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                      </p>
                      <p className="text-[8px] sm:text-[9px] font-bold text-red-700 uppercase">
                        CĂN CƯỚC CÔNG DÂN / CITIZEN IDENTITY CARD
                      </p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="relative z-10 grid grid-cols-12 gap-3 items-center my-1">
                  {/* Portrait + Blurred Microprint (Landmark 3: x=24%, y=52%) */}
                  <div className="col-span-4 aspect-[3/4] bg-sky-100 rounded-lg border border-slate-400 flex flex-col items-center justify-between p-1.5 relative overflow-hidden">
                    <svg viewBox="0 0 80 100" className="w-full h-full">
                      <rect width="80" height="100" fill="#bae6fd" />
                      <path d="M12,100 C16,72 64,72 68,100 Z" fill="#1e3a8a" />
                      <ellipse cx="40" cy="44" rx="16" ry="20" fill="#e2b091" />
                      <path d="M24,38 C24,18 56,18 56,38 Z" fill="#18181b" />
                    </svg>
                    <div className="w-full bg-rose-600/90 text-white text-[6.5px] font-mono text-center py-0.5 rounded">
                      VI CHỮ BỊ BẾT PIXEL
                    </div>
                  </div>

                  {/* Personal Data with Font Weight Kerning Glitch (Landmark 1: x=58%, y=50%) */}
                  <div className="col-span-8 space-y-1 text-[9px] sm:text-[10px]">
                    <div>
                      <span className="text-slate-500 text-[7.5px] block">Số / No.:</span>
                      <span className="font-mono font-black text-red-700 text-xs tracking-wider">
                        001095<span className="inline-block -translate-y-[1.5px] text-rose-600 underline">034</span>821
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[7.5px] block">Họ và tên / Full name:</span>
                      <span className="font-black text-slate-900 tracking-wide">
                        NGUYỄN VĂN <span className="font-normal text-slate-700">ANH</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div>
                        <span className="text-slate-500 text-[7.5px] block">Ngày sinh / DOB:</span>
                        <span className="font-semibold text-slate-800">15/08/1995</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[7.5px] block">Giới tính / Sex:</span>
                        <span className="font-semibold text-slate-800">Nam</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Chip & Hologram */}
                <div className="relative z-10 flex items-center justify-between pt-1.5 border-t border-slate-300/80 text-[8px] font-mono">
                  <div className="flex items-center space-x-2">
                    {/* Flat 2D Forged Chip (Landmark 2: x=24%, y=84%) */}
                    <div className="w-8 h-6 bg-amber-400 rounded border border-rose-500 flex items-center justify-center text-[6.5px] font-black text-slate-950">
                      2D FLAT
                    </div>
                    <span className="text-slate-600">ICAO CHIP: NO 3D CONTACT PADS</span>
                  </div>
                  <span className="text-rose-700 font-bold">PHOTOSHOP LAYER DETECTED</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. REAL COURIER PARCEL PHOTO (AUTHENTIC CAMERA SENSOR) */}
          {vType === 'real_courier_selfie' && (
            <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] to-[#090d16] flex items-center justify-center">
              <svg viewBox="0 0 640 360" className="w-full h-full">
                {/* Real Apartment Corridor & Tiled Floor with Perspective Geometry */}
                <rect width="640" height="360" fill="#1e293b" />
                <polygon points="0,245 640,245 640,360 0,360" fill="#0f172a" />
                {/* Perspective floor tiles */}
                <line x1="120" y1="245" x2="40" y2="360" stroke="#334155" strokeWidth="1.5" />
                <line x1="320" y1="245" x2="320" y2="360" stroke="#334155" strokeWidth="1.5" />
                <line x1="520" y1="245" x2="600" y2="360" stroke="#334155" strokeWidth="1.5" />

                {/* Apartment Wooden Door & Crisp House Number Plate (Landmark 3: x=24%, y=23%) */}
                <rect x="95" y="30" width="175" height="215" fill="#451a03" stroke="#78350f" strokeWidth="3" />
                <rect x="125" y="65" width="72" height="32" rx="4" fill="#0284c7" stroke="#e2e8f0" strokeWidth="1.5" />
                <text x="161" y="86" fill="#ffffff" fontSize="15" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  P.408B
                </text>

                {/* Consistent Ray-Traced Cast Shadow (Landmark 1: x=62%, y=86%) */}
                <polygon points="315,275 445,275 510,315 355,315" fill="#020617" opacity="0.75" />

                {/* Cardboard Parcel Box with authentic shipping label & barcode (Landmark 2: x=58%, y=72%) */}
                <polygon points="315,215 430,215 450,190 335,190" fill="#d97706" />
                <rect x="315" y="215" width="115" height="65" fill="#b45309" stroke="#fbbf24" strokeWidth="1" />
                <polygon points="430,215 450,190 450,255 430,280" fill="#78350f" />
                {/* Thermal Shipping Waybill Sticker */}
                <rect x="335" y="225" width="75" height="44" rx="2" fill="#f8fafc" />
                <text x="342" y="236" fill="#0f172a" fontSize="6.5" fontFamily="monospace" fontWeight="bold">
                  VN269841029B
                </text>
                <line x1="342" y1="244" x2="402" y2="244" stroke="#0f172a" strokeWidth="3" strokeDasharray="2 1 4 1 1 2" />
                <text x="342" y="260" fill="#334155" fontSize="6" fontFamily="monospace">
                  COD: 0 VND (ĐÃ TT)
                </text>

                {/* Camera EXIF Watermark */}
                <text x="615" y="342" fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="end">
                  SHOT ON GALAXY S24 • f/1.8 1/120s ISO 250 • GPS VERIFIED
                </text>
              </svg>
            </div>
          )}

          {/* 5. REAL FAMILY GATHERING VIDEO CALL */}
          {vType === 'real_family_gathering' && (
            <div className="absolute inset-0 bg-gradient-to-b from-[#1c1917] via-[#0f172a] to-[#090d16] flex items-center justify-center">
              <svg viewBox="0 0 640 360" className="w-full h-full">
                <rect width="640" height="360" fill="#18181b" />
                {/* Warm Living Room Sofa & Framed Calligraphy */}
                <rect x="85" y="45" width="120" height="80" rx="4" fill="#27272a" stroke="#eab308" strokeWidth="1.5" />
                <text x="145" y="90" fill="#facc15" fontSize="16" fontWeight="bold" textAnchor="middle">
                  PHÚC ĐỨC
                </text>
                <rect x="90" y="185" width="460" height="150" rx="20" fill="#3f3f46" />

                {/* Father figure with natural facial wrinkles & glasses (Landmark 2: x=35%, y=44%) */}
                <path d="M165,350 C180,255 270,255 285,350 Z" fill="#1d4ed8" />
                <ellipse cx="225" cy="160" rx="36" ry="44" fill="#e2b091" />
                <rect x="198" y="148" width="22" height="14" rx="3" fill="none" stroke="#fbbf24" strokeWidth="1.8" />
                <rect x="230" y="148" width="22" height="14" rx="3" fill="none" stroke="#fbbf24" strokeWidth="1.8" />
                <line x1="220" y1="154" x2="230" y2="154" stroke="#fbbf24" strokeWidth="1.8" />

                {/* Waving Hand Occluding Face with Zero Glitch (Landmark 1: x=45%, y=46%) */}
                <g transform="translate(268, 145)">
                  <rect x="0" y="18" width="28" height="34" rx="8" fill="#e2b091" stroke="#b07d56" strokeWidth="1.5" />
                  <rect x="-4" y="2" width="6" height="20" rx="3" fill="#e2b091" />
                  <rect x="4" y="-4" width="6" height="24" rx="3" fill="#e2b091" />
                  <rect x="12" y="-2" width="6" height="22" rx="3" fill="#e2b091" />
                  <rect x="20" y="4" width="6" height="18" rx="3" fill="#e2b091" />
                </g>

                {/* Mother figure */}
                <path d="M355,350 C370,260 450,260 465,350 Z" fill="#be185d" />
                <ellipse cx="410" cy="168" rx="34" ry="42" fill="#eab696" />

                {/* Tet Peach Blossom Branch (Landmark 3: x=84%, y=32%) */}
                <path d="M540,260 Q535,160 555,85" fill="none" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
                <circle cx="535" cy="115" r="8" fill="#fb7185" />
                <circle cx="562" cy="102" r="7" fill="#f43f5e" />
                <circle cx="548" cy="82" r="9" fill="#fda4af" />
              </svg>
            </div>
          )}

          {/* 6. REAL TRAFFIC COLLISION SCENE */}
          {vType === 'real_traffic_scene' && (
            <div className="absolute inset-0 bg-[#090d16] flex items-center justify-center">
              <svg viewBox="0 0 640 360" className="w-full h-full">
                <rect width="640" height="360" fill="#0f172a" />
                <polygon points="0,210 640,210 640,360 0,360" fill="#1e293b" />
                {/* Crosswalk stripes */}
                <rect x="70" y="285" width="95" height="22" fill="#cbd5e1" opacity="0.8" />
                <rect x="240" y="285" width="95" height="22" fill="#cbd5e1" opacity="0.8" />
                <rect x="410" y="285" width="95" height="22" fill="#cbd5e1" opacity="0.8" />
                {/* Sedan Quarter Panel & Bumper */}
                <path d="M120,245 Q310,130 520,245 L550,320 L95,320 Z" fill="#334155" stroke="#64748b" strokeWidth="2" />
                {/* Linear Paint Transfer Scratch (Landmark 1: x=48%, y=68%) */}
                <path d="M245,235 Q310,248 375,240" fill="none" stroke="#f8fafc" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M255,243 Q315,254 365,248" fill="none" stroke="#94a3b8" strokeWidth="2" />
                {/* Specular street reflection (Landmark 2: x=76%, y=58%) */}
                <polygon points="440,200 525,212 495,245 425,232" fill="#fef08a" opacity="0.85" />
                {/* Consistent Ground Shadow (Landmark 3: x=50%, y=90%) */}
                <ellipse cx="320" cy="325" rx="225" ry="12" fill="#020617" opacity="0.85" />
              </svg>
            </div>
          )}

          {/* 7. FORGED BANK SAVINGS CERTIFICATE (SỔ TIẾT KIỆM GIẢ MẠO) */}
          {vType === 'bank_certificate' && (
            <div className="absolute inset-0 bg-[#070b12] flex items-center justify-center p-4 sm:p-6">
              <div className="w-full max-w-md aspect-[1.58/1] bg-[#fffbeb] text-slate-900 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden border-2 border-amber-600/80 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-950">
                      NGÂN HÀNG TMCP NGOẠI THƯƠNG • CHỨNG NHẬN TIỀN GỬI
                    </p>
                    <p className="text-[8px] font-bold text-amber-800">SAVINGS DEPOSIT CERTIFICATE • SERIES AA-2026</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[8px] font-mono font-bold">
                    LAYER SPLICE
                  </span>
                </div>

                <div className="space-y-1.5 my-1 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Chủ sở hữu / Holder:</span>
                    <span className="font-bold text-slate-900">HOÀNG VĂN THÀNH</span>
                  </div>
                  {/* Edited Deposit Amount with Floating Baseline (Landmark 1: x=68%, y=50%) */}
                  <div className="flex justify-between items-center bg-amber-100 px-2.5 py-1.5 rounded-lg border border-rose-500/60">
                    <span className="text-amber-950 font-bold text-[9px]">Số dư tiền gửi:</span>
                    <span className="font-mono font-black text-rose-700 text-xs">
                      5.<span className="inline-block -translate-y-0.5 bg-rose-200/70 px-0.5">000.000</span>.000 VNĐ
                    </span>
                  </div>
                  <div className="flex justify-between text-[8.5px] text-slate-600">
                    <span>Kỳ hạn: 12 Tháng (Lãi cuối kỳ)</span>
                    <span>Lãi suất: 7.2%/năm</span>
                  </div>
                </div>

                {/* Forged Wet Stamp with AI Gibberish Ring (Landmark 2: x=78%, y=80%) */}
                <div className="flex items-center justify-between pt-1.5 border-t border-amber-900/20 text-[8.5px]">
                  <span className="font-mono text-slate-500">SERIAL: STK-881902-AI</span>
                  <div className="w-12 h-12 rounded-full border-2 border-rose-600/80 border-dashed flex items-center justify-center text-[7px] text-rose-700 font-black -rotate-12 bg-rose-500/10">
                    MỘC NHÒE PIXEL
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 8. REAL UNIVERSITY STUDENT ID CARD */}
          {vType === 'real_student_id' && (
            <div className="absolute inset-0 bg-[#070b12] flex items-center justify-center p-4 sm:p-6">
              <div className="w-full max-w-md aspect-[1.58/1] bg-white text-slate-900 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden border border-slate-300 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-blue-900/20 pb-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-700 flex items-center justify-center text-white font-black text-xs">
                      BK
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-900 uppercase">ĐẠI HỌC BÁCH KHOA HÀ NỘI</p>
                      <p className="text-[8px] font-bold text-red-700 uppercase">THẺ SINH VIÊN CHÍNH QUY (HUST ID)</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[8px] font-mono font-bold">
                    ISO-14443A
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-3 items-center my-1">
                  <div className="col-span-4 aspect-[3/4] bg-sky-50 rounded-lg border border-slate-300 flex items-center justify-center overflow-hidden">
                    <svg viewBox="0 0 80 100" className="w-full h-full">
                      <rect width="80" height="100" fill="#e0f2fe" />
                      <path d="M12,100 C18,74 62,74 68,100 Z" fill="#ffffff" stroke="#cbd5e1" />
                      <ellipse cx="40" cy="44" rx="15" ry="19" fill="#e2b091" />
                      <path d="M25,36 C25,18 55,18 55,36 Z" fill="#0f172a" />
                    </svg>
                  </div>
                  <div className="col-span-8 space-y-1 text-[9.5px]">
                    <p className="text-slate-500 text-[7.5px]">Họ và tên sinh viên:</p>
                    <p className="font-black text-slate-900 uppercase text-xs">LÊ HOÀNG NAM</p>
                    <p className="text-slate-600 text-[8.5px]">
                      MSSV: <span className="font-mono font-bold text-red-700">20224590</span>
                    </p>
                    <p className="text-slate-600 text-[8.5px]">
                      Viện: <span className="font-semibold text-slate-900">Công nghệ Thông tin & TT</span>
                    </p>
                  </div>
                </div>

                {/* Crisp Code-128 Barcode */}
                <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex space-x-0.5 items-end h-4">
                    {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 1, 3, 2, 1, 2, 1].map((w, idx) => (
                      <div key={idx} className="bg-slate-950 h-full" style={{ width: `${w * 1.5}px` }} />
                    ))}
                  </div>
                  <span className="text-[8px] font-mono text-slate-600 font-bold">K67 • 2022 - 2027</span>
                </div>
              </div>
            </div>
          )}

          {/* ELA (Error Level Analysis) Heatmap Layer when selected */}
          {forensicOverlayMode === 'ela' && (
            <div className="absolute inset-0 bg-slate-950/75 mix-blend-hard-light pointer-events-none z-10 flex items-center justify-center">
              <div className="w-full h-full relative">
                {item.visualData?.landmarks.map((mark, idx) => (
                  <div
                    key={idx}
                    style={{ left: `${mark.x}%`, top: `${mark.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full blur-xl ${
                      mark.isArtifact ? 'bg-rose-500/75' : 'bg-emerald-500/30'
                    }`}
                  />
                ))}
                <div className="absolute bottom-3 left-3 text-[10px] font-mono text-rose-300 bg-slate-950/90 px-2.5 py-1 rounded border border-rose-500/40">
                  {isAi
                    ? 'ELA VARIANCE: HIGH COMPRESSION DISCONTINUITY AT SYNTHETIC REGIONS'
                    : 'ELA VARIANCE: UNIFORM CAMERA JPEG QUANTIZATION MATRIX'}
                </div>
              </div>
            </div>
          )}

          {/* Interactive Forensic Landmarks Overlay */}
          {showLandmarks && item.visualData?.landmarks && (
            <div className="absolute inset-0 pointer-events-auto z-20">
              {item.visualData.landmarks.map((mark, i) => {
                const isSelected = selectedLandmark === i;
                return (
                  <div
                    key={i}
                    style={{ left: `${mark.x}%`, top: `${mark.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={() => {
                      playButtonClick();
                      setSelectedLandmark(isSelected ? null : i);
                    }}
                  >
                    <div className="relative">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-black border-2 shadow-lg transition-transform ${
                          mark.isArtifact
                            ? 'bg-rose-600 text-white border-rose-200 animate-pulse'
                            : 'bg-emerald-500 text-slate-950 border-emerald-200'
                        } ${isSelected ? 'scale-125 ring-4 ring-sky-400' : 'hover:scale-110'}`}
                      >
                        {i + 1}
                      </span>

                      {isSelected && (
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-56 p-3 rounded-xl bg-slate-950/95 border border-sky-500/60 text-left shadow-2xl backdrop-blur-md z-30 pointer-events-none">
                          <div className="flex items-center space-x-1.5 text-[10px] font-bold text-sky-400 mb-1">
                            <Info className="w-3.5 h-3.5 shrink-0" />
                            <span>{mark.label}</span>
                          </div>
                          <p className="text-[11px] text-slate-200 leading-snug">{mark.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3.0x Optical Loupe Magnifier */}
          {isMagnifierActive && (
            <div
              style={{
                left: `${magnifierPos.x}%`,
                top: `${magnifierPos.y}%`,
              }}
              className="absolute w-32 h-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-sky-400 shadow-[0_0_25px_rgba(14,165,233,0.6)] backdrop-brightness-125 backdrop-contrast-150 overflow-hidden pointer-events-none z-30 flex items-center justify-center"
            >
              <div className="w-full h-full rounded-full border border-dashed border-sky-300/60 flex flex-col items-center justify-between p-2">
                <span className="text-[8px] font-mono font-bold text-sky-300 bg-slate-950/90 px-1.5 py-0.5 rounded">
                  LOUPE 3.0x
                </span>
                <span className="text-[8px] font-mono text-slate-300 bg-slate-950/90 px-1 rounded">
                  X:{Math.round(magnifierPos.x)} Y:{Math.round(magnifierPos.y)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Audio Spectrogram & Neural Vietnamese Voice Player
  const renderAudioAnalyzer = (item: DeepfakeQuizItem) => {
    const audioData = item.audioData;
    if (!audioData) return null;

    return (
      <div className="w-full bg-slate-950 rounded-2xl p-5 border border-slate-800 shadow-2xl space-y-4">
        {/* Audio Header & Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center space-x-2">
                <span>{audioData.speakerName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-sky-300 font-mono">
                  {audioData.sampleDuration} • 24kHz PCM
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{audioData.ambientDescription}</p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px]">
            <button
              onClick={() => {
                playButtonClick();
                setActiveAudioTab('waveform');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeAudioTab === 'waveform'
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dạng Sóng (Waveform)
            </button>
            <button
              onClick={() => {
                playButtonClick();
                setActiveAudioTab('spectrogram');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeAudioTab === 'spectrogram'
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Phổ Tần Học (Spectrogram)
            </button>
          </div>
        </div>

        {/* Visualized Canvas / Waveform */}
        <div className="relative h-32 bg-slate-900/90 rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center px-4">
          <div
            className="absolute top-0 left-0 bottom-0 bg-sky-500/15 transition-all duration-100 pointer-events-none"
            style={{ width: `${audioProgress}%` }}
          />

          {activeAudioTab === 'waveform' ? (
            <div className="flex items-center justify-center gap-1.5 w-full h-24">
              {audioData.waveformBars.map((val, idx) => {
                const isActive = (idx / audioData.waveformBars.length) * 100 <= audioProgress;
                const dynamicHeight = isPlayingAudio
                  ? Math.min(100, Math.max(16, val + Math.sin(Date.now() / 160 + idx) * 22))
                  : val;

                return (
                  <motion.div
                    key={idx}
                    animate={{ height: `${dynamicHeight}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`w-2 rounded-full transition-colors ${
                      isActive ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]' : 'bg-slate-800'
                    }`}
                  />
                );
              })}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col justify-between py-2.5 text-[10px] font-mono text-slate-400">
              <div className="flex justify-between items-center text-rose-400 border-b border-dashed border-rose-500/30 pb-1">
                <span>16 kHz - 24 kHz (High Harmonics)</span>
                <span>
                  {item.verdict === 'ai'
                    ? '⚠️ BỊ CẮT CỤT PHỔ TẦN > 11kHz (VOCODER CUTOFF)'
                    : '✓ DẢI HÀI ÂM TỰ NHIÊN ĐẦY ĐỦ'}
                </span>
              </div>
              <div className="flex justify-between items-center text-amber-400 border-b border-dashed border-slate-800 pb-1">
                <span>6 kHz - 10 kHz (Âm xát /s/, /tr/, /ch/)</span>
                <span>
                  {item.verdict === 'ai' ? 'Rè kim loại nhân tạo (Phase Vocoder)' : 'Âm gió vòm họng tự nhiên'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sky-400 border-b border-dashed border-slate-800 pb-1">
                <span>1 kHz - 3 kHz (Formant F1/F2 Tiếng Việt)</span>
                <span>6 thanh điệu tiếng Việt & âm cuối</span>
              </div>
              <div className="flex justify-between items-center text-emerald-400">
                <span>120 Hz - 280 Hz (Pitch F0 cơ bản)</span>
                <span>
                  {item.verdict === 'ai'
                    ? 'Đường Pitch phẳng, thiếu tiếng lấy hơi'
                    : 'Có nhịp lấy hơi và rung dây thanh quản tự nhiên'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Audio Transcript box */}
        <div className="p-3.5 bg-slate-900/70 rounded-xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Bản gỡ băng âm thanh (Transcript):</span>
            <span className="text-sky-400 font-mono">Giọng đọc Tiếng Việt Tự Nhiên (Neural TTS)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            "{audioData.transcript}"
          </p>
        </div>

        {/* Playback Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleAudio}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide flex items-center space-x-2 transition-all cursor-pointer ${
                isPlayingAudio || isLoadingVoice
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/20'
              }`}
            >
              {isLoadingVoice ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang Tạo Giọng Việt Tự Nhiên...</span>
                </>
              ) : isPlayingAudio ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Dừng Phát Ghi Âm</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Phát Giọng Nói Thực Tế</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                playButtonClick();
                setAudioSpeed((prev) => (prev === 1 ? 0.85 : 1));
              }}
              className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono font-bold border border-slate-800 transition-colors cursor-pointer"
              title="Chỉnh tốc độ nghe chậm để soi âm tiết"
            >
              Tốc độ: {audioSpeed}x
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            {isLoadingVoice
              ? 'Đang tổng hợp âm học tiếng Việt...'
              : isPlayingAudio
              ? 'Đang phát mẫu giọng nói...'
              : 'Nhấn Phát để nghe ngữ điệu & nhịp thở'}
          </span>
        </div>
      </div>
    );
  };

  if (isCompleted) {
    const accuracy = Math.round((score / quizList.length) * 100);

    return (
      <div className="max-w-2xl mx-auto p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mx-auto">
          <Trophy className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white">HOÀN THÀNH GIÁM ĐỊNH PHÁP Y DEEPFAKE</h3>
          <p className="text-sm text-slate-300">
            Bạn đã hoàn tất kiểm định toàn bộ các mẫu bằng chứng âm thanh và hình ảnh.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
          <div>
            <div className="text-2xl font-black text-sky-400 font-mono">
              {score}/{quizList.length}
            </div>
            <div className="text-[11px] text-slate-400 font-bold uppercase">Chính Xác</div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400 font-mono">{accuracy}%</div>
            <div className="text-[11px] text-slate-400 font-bold uppercase">Tỷ Lệ Phát Hiện</div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-400 font-mono">+{claimedXp}</div>
            <div className="text-[11px] text-slate-400 font-bold uppercase">XP Tích Lũy</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-1.5">
          <div className="flex items-center space-x-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Nhận Xét Chuyên Gia Giám Định Số:</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {accuracy >= 80
              ? 'Khả năng phân tích xuất sắc! Bạn nhận diện chính xác các đứt gãy phổ tần âm thanh AI và sai lệch quang học trên khuôn mặt Deepfake.'
              : accuracy >= 50
              ? 'Kết quả khá tốt. Hãy sử dụng thêm chế độ Lưới Sinh Trắc 68 Điểm và Phổ Nén ELA để phát hiện biên ghép mặt (Mask Seam) chính xác hơn.'
              : 'Cần cảnh giác cao hơn! Trong thực tế, hãy luôn áp dụng quy tắc: Yêu cầu đối phương quay mặt 90 độ hoặc gọi lại vào số di động truyền thống.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleRestartQuiz}
            className="flex-1 py-3 px-6 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Giám Định Lại Bộ Mẫu</span>
          </button>

          {onOpenCaseLab && (
            <button
              onClick={onOpenCaseLab}
              className="flex-1 py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider border border-slate-700 transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <Scan className="w-4 h-4 text-sky-400" />
              <span>Mở Phòng Thẩm Vấn Deepfake Trực Tiếp</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">PHÒNG GIÁM ĐỊNH THỰC CHIẾN: REAL vs AI SYNTHETIC</h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-sky-400 font-mono font-bold border border-slate-800">
                  FORENSIC BENCHMARK
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sử dụng công cụ soi lưới sinh trắc 68 điểm, đèn UV 365nm và phân tích giọng nói tiếng Việt để kết luận thật hay giả.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 text-xs font-bold font-mono">
              <Flame className="w-4 h-4" />
              <span>Chuỗi: {streak}</span>
            </div>
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-sky-400 text-xs font-bold font-mono">
              <Trophy className="w-4 h-4" />
              <span>
                {score}/{quizList.length} Mẫu
              </span>
            </div>
          </div>
        </div>

        {/* Filter & Stepper */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <div className="flex items-center space-x-1.5 w-full sm:w-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-sky-500 text-slate-950'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Tất Cả ({DEEPFAKE_QUIZ_DATA.length})
            </button>
            <button
              onClick={() => setFilterType('audio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                filterType === 'audio'
                  ? 'bg-sky-500 text-slate-950'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Giọng Nói Tiếng Việt</span>
            </button>
            <button
              onClick={() => setFilterType('visual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                filterType === 'visual'
                  ? 'bg-sky-500 text-slate-950'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Video Call & Giấy Tờ</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {quizList.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => {
                  handleStopAudio();
                  setCurrentIndex(idx);
                }}
                className={`w-7 h-7 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center justify-center ${
                  idx === currentIndex
                    ? 'bg-sky-500 text-slate-950 ring-2 ring-sky-400/50'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
                title={q.title}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Evidence Stage (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between text-xs">
            <span className="px-2.5 py-1 rounded-md bg-slate-950 text-sky-400 font-semibold border border-slate-800 flex items-center space-x-1.5">
              {currentItem.mediaType === 'audio' ? (
                <Volume2 className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
              <span>{currentItem.category}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded bg-slate-950 text-slate-400 font-mono text-[11px] border border-slate-800">
              Mức độ: {currentItem.difficulty}
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-bold text-white leading-snug">{currentItem.title}</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              {currentItem.context}
            </p>
          </div>

          <div>
            {currentItem.mediaType === 'visual'
              ? renderVisualMockup(currentItem)
              : renderAudioAnalyzer(currentItem)}
          </div>

          {/* Decision Buttons */}
          <div className="space-y-2.5 pt-2">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block text-center">
              Kết luận giám định pháp y của bạn:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleSelectVerdict('real')}
                disabled={isAnswered}
                className={`py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  isAnswered
                    ? currentItem.verdict === 'real'
                      ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400'
                      : userChoice === 'real'
                      ? 'bg-rose-600 text-white line-through opacity-70'
                      : 'bg-slate-950 text-slate-600 border border-slate-800'
                    : 'bg-slate-950 hover:bg-emerald-950/40 text-emerald-400 border border-emerald-500/40 hover:border-emerald-400'
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>NGƯỜI THẬT / BẢN GỐC (AUTHENTIC)</span>
              </button>

              <button
                onClick={() => handleSelectVerdict('ai')}
                disabled={isAnswered}
                className={`py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  isAnswered
                    ? currentItem.verdict === 'ai'
                      ? 'bg-rose-500 text-white ring-2 ring-rose-400'
                      : userChoice === 'ai'
                      ? 'bg-rose-600 text-white line-through opacity-70'
                      : 'bg-slate-950 text-slate-600 border border-slate-800'
                    : 'bg-slate-950 hover:bg-rose-950/40 text-rose-400 border border-rose-500/40 hover:border-rose-400'
                }`}
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>DO AI TỔNG HỢP (DEEPFAKE / FORGED)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Forensic Analysis Report (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          {isAnswered ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div
                className={`p-4 rounded-xl border flex items-center space-x-3 ${
                  userChoice === currentItem.verdict
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                }`}
              >
                {userChoice === currentItem.verdict ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-7 h-7 text-rose-400 shrink-0" />
                )}
                <div>
                  <h4 className="text-sm font-black uppercase">
                    {userChoice === currentItem.verdict
                      ? `GIÁM ĐỊNH CHÍNH XÁC! (+${currentItem.xpReward} XP)`
                      : 'NHẬN ĐỊNH CHƯA CHÍNH XÁC'}
                  </h4>
                  <p className="text-xs opacity-90">
                    Bằng chứng: {currentItem.verdict === 'ai' ? 'Giả mạo bằng AI (Synthetic Media)' : 'Người thật / Tài liệu thật'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed">
                {currentItem.forensicExplanation.summary}
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Các Dấu Vết Pháp Y Bóc Tách:</span>
                </h5>
                <ul className="space-y-1.5">
                  {currentItem.forensicExplanation.telltaleSigns.map((sign, idx) => (
                    <li
                      key={idx}
                      className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-start space-x-2"
                    >
                      <span className="text-sky-400 font-bold shrink-0">•</span>
                      <span>{sign}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs">
                <span className="font-bold text-amber-400 flex items-center space-x-1.5">
                  <Radio className="w-3.5 h-3.5" />
                  <span>Cơ chế thuật toán:</span>
                </span>
                <p className="text-slate-300 leading-relaxed">{currentItem.forensicExplanation.technicalAnalysis}</p>
              </div>

              <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-1 text-xs">
                <span className="font-bold text-emerald-300 flex items-center space-x-1.5">
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Nguyên tắc xác minh thực tế:</span>
                </span>
                <p className="text-slate-200 font-medium leading-relaxed">
                  {currentItem.forensicExplanation.defenseRule}
                </p>
              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>{currentIndex < quizList.length - 1 ? 'Mẫu Giám Định Tiếp Theo' : 'Xem Tổng Kết Giám Định'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12 text-slate-500">
              <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500">
                <Scan className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-300">Đang Chờ Kết Luận Giám Định</h4>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Hãy bật các lớp phủ <strong>Lưới Sinh Trắc 68 Điểm</strong>, <strong>Phổ Nén ELA</strong> hoặc nhấn <strong>Phát Giọng Nói Thực Tế</strong> trước khi đưa ra phán quyết.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
