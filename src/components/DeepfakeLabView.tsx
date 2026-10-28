import React, { useState, useEffect, useMemo } from 'react';
import {
  Eye,
  Volume2,
  VolumeX,
  Video,
  AlertTriangle,
  Scan,
  ShieldAlert,
  Sparkles,
  PhoneCall,
  Lock,
  Gamepad2,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Filter,
  Search,
  Grid,
  ChevronDown,
  ChevronUp,
  Send,
  RefreshCw,
  MessageSquare,
  Hand,
  RotateCcw,
  KeyRound,
  Activity,
} from 'lucide-react';
import { DEEPFAKE_CASES } from '../data/deepfakeData';
import { DeepfakeCase } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { DeepfakeQuizView } from './DeepfakeQuizView';
import {
  speakVietnameseRealistic,
  stopSpeaking,
  playButtonClick,
  playSuccessChime,
} from '../utils/audioEffects';

interface DeepfakeLabViewProps {
  onAddXp: (amount: number) => void;
  initialCaseId?: string | null;
}

interface InterrogationTurn {
  id: string;
  sender: 'user' | 'caller';
  text: string;
  visualGlitchTriggered?: boolean;
  glitchDescription?: string;
  confidenceFakeScore?: number;
  forensicNote?: string;
}

export const DeepfakeLabView: React.FC<DeepfakeLabViewProps> = ({ onAddXp, initialCaseId }) => {
  const { t } = useTranslation();
  const [activeMode, setActiveMode] = useState<'quiz' | 'forensics'>('quiz');
  const [selectedCase, setSelectedCase] = useState<DeepfakeCase>(() => {
    if (initialCaseId) {
      const found = DEEPFAKE_CASES.find((c) => c.id === initialCaseId);
      if (found) return found;
    }
    return DEEPFAKE_CASES[0];
  });

  useEffect(() => {
    if (initialCaseId) {
      const found = DEEPFAKE_CASES.find((c) => c.id === initialCaseId);
      if (found) {
        setSelectedCase(found);
        setActiveMode('forensics');
        setScanned(false);
      }
    }
  }, [initialCaseId]);

  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingVoice, setIsLoadingVoice] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMediaType, setSelectedMediaType] = useState<'all' | 'voice' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFullGrid, setShowFullGrid] = useState<boolean>(false);

  // Live Interrogation State
  const [interrogationHistory, setInterrogationHistory] = useState<InterrogationTurn[]>([]);
  const [challengeInput, setChallengeInput] = useState('');
  const [isInterrogating, setIsInterrogating] = useState(false);
  const [latestGlitchScore, setLatestGlitchScore] = useState<number>(42);
  const [activeGlitchBanner, setActiveGlitchBanner] = useState<string | null>(null);

  const filteredCases = useMemo(() => {
    return DEEPFAKE_CASES.filter((c) => {
      const matchCat = selectedCategory === 'all' || c.category === selectedCategory;
      const matchMedia = selectedMediaType === 'all' || c.mediaType === selectedMediaType;
      const matchSearch =
        searchQuery.trim() === '' ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.callerInfo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.scenarioText.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchMedia && matchSearch;
    });
  }, [selectedCategory, selectedMediaType, searchQuery]);

  const currentIndex = DEEPFAKE_CASES.findIndex((c) => c.id === selectedCase.id);

  useEffect(() => {
    stopSpeaking();
    setIsPlayingAudio(false);
    setIsLoadingVoice(false);
    setAudioProgress(0);
    setInterrogationHistory([
      {
        id: 'opening-line',
        sender: 'caller',
        text: selectedCase.scenarioText,
        visualGlitchTriggered: false,
        confidenceFakeScore: 48,
      },
    ]);
    setLatestGlitchScore(48);
    setActiveGlitchBanner(null);
    return () => {
      stopSpeaking();
    };
  }, [selectedCase, activeMode]);

  const handleToggleVoice = async (customText?: string) => {
    playButtonClick();
    if (isPlayingAudio || isLoadingVoice) {
      stopSpeaking();
      setIsPlayingAudio(false);
      setIsLoadingVoice(false);
      setAudioProgress(0);
      return;
    }

    const textToSpeak = customText || selectedCase.scenarioText;
    setIsLoadingVoice(true);

    await speakVietnameseRealistic(textToSpeak, {
      speakerRole: selectedCase.callerInfo,
      emotion: 'khẩn cấp, thúc giục chuyển tiền như cuộc gọi thực tế tại Việt Nam',
      isAiCloned: true,
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

  const handleScan = () => {
    playButtonClick();
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
      setLatestGlitchScore(94);
      playSuccessChime();
      onAddXp(60);
    }, 900);
  };

  const handleSelectCase = (c: DeepfakeCase) => {
    stopSpeaking();
    setIsPlayingAudio(false);
    setSelectedCase(c);
    setScanned(false);
  };

  const handlePrevCase = () => {
    const prevIndex = (currentIndex - 1 + DEEPFAKE_CASES.length) % DEEPFAKE_CASES.length;
    handleSelectCase(DEEPFAKE_CASES[prevIndex]);
  };

  const handleNextCase = () => {
    const nextIndex = (currentIndex + 1) % DEEPFAKE_CASES.length;
    handleSelectCase(DEEPFAKE_CASES[nextIndex]);
  };

  const handleSendChallenge = async (presetChallenge?: string) => {
    const text = (presetChallenge ?? challengeInput).trim();
    if (!text || isInterrogating) return;

    playButtonClick();
    if (!presetChallenge) setChallengeInput('');

    const userTurn: InterrogationTurn = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
    };
    const nextHistory = [...interrogationHistory, userTurn];
    setInterrogationHistory(nextHistory);
    setIsInterrogating(true);

    try {
      const response = await fetch('/api/deepfake/interrogate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseTitle: selectedCase.title,
          callerInfo: selectedCase.callerInfo,
          mediaType: selectedCase.mediaType,
          scenarioText: selectedCase.scenarioText,
          artifactsDetected: selectedCase.artifactsDetected,
          userChallenge: text,
          history: nextHistory.map((m) => ({
            sender: m.sender === 'user' ? 'user' : 'scammer',
            text: m.text,
          })),
        }),
      });

      const data = await response.json();
      const callerTurn: InterrogationTurn = {
        id: `c-${Date.now()}`,
        sender: 'caller',
        text:
          data.replyText ||
          'Mạng bên này đang yếu quá, cứ chuyển khoản gấp vào số tài khoản tôi vừa nhắn đi nhé!',
        visualGlitchTriggered: Boolean(data.visualGlitchTriggered),
        glitchDescription: data.glitchDescription,
        confidenceFakeScore: Number(data.confidenceFakeScore) || 85,
        forensicNote: data.forensicNote,
      };

      setInterrogationHistory((prev) => [...prev, callerTurn]);
      if (callerTurn.confidenceFakeScore) {
        setLatestGlitchScore(callerTurn.confidenceFakeScore);
      }
      if (callerTurn.glitchDescription) {
        setActiveGlitchBanner(callerTurn.glitchDescription);
      }
      onAddXp(25);
      // Automatically speak the caller's live response in Vietnamese
      handleToggleVoice(callerTurn.text);
    } catch {
      setInterrogationHistory((prev) => [
        ...prev,
        {
          id: `c-${Date.now()}`,
          sender: 'caller',
          text: 'Sóng 4G chỗ này chập chờn quá không xoay camera được, làm nhanh giúp tôi đi!',
          visualGlitchTriggered: true,
          glitchDescription: 'Biên ghép mặt bị giật 14 frame khi đối tượng né yêu cầu xác thực.',
          confidenceFakeScore: 89,
        },
      ]);
      setLatestGlitchScore(89);
    } finally {
      setIsInterrogating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex items-center justify-center">
        <div className="inline-flex p-1.5 rounded-xl bg-slate-900 border border-slate-800 shadow-lg max-w-xl w-full">
          <button
            onClick={() => setActiveMode('quiz')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-bold tracking-wide transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              activeMode === 'quiz'
                ? 'bg-sky-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>GIÁM ĐỊNH THỰC CHIẾN (REAL vs AI)</span>
          </button>

          <button
            onClick={() => setActiveMode('forensics')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-bold tracking-wide transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              activeMode === 'forensics'
                ? 'bg-sky-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>THẨM VẤN DEEPFAKE & BÓC TÁCH PHÁP Y</span>
          </button>
        </div>
      </div>

      {activeMode === 'quiz' ? (
        <DeepfakeQuizView
          onAddXp={onAddXp}
          onOpenCaseLab={() => setActiveMode('forensics')}
        />
      ) : (
        <div className="space-y-6">
          {/* Header & Case Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg sm:text-xl font-bold text-white">{t('df_header_title')}</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-sky-400 font-mono font-bold border border-slate-800">
                      {DEEPFAKE_CASES.length} KỊCH BẢN THỰC TẾ
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Nghe giọng nói tiếng Việt tự nhiên và trực tiếp thẩm vấn đối tượng nghi dùng Deepfake bằng các nghiệm pháp vật lý.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
                <button
                  onClick={handlePrevCase}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-all border border-slate-800 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="px-3 py-0.5 text-center">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Hồ sơ</div>
                  <div className="text-xs font-mono font-bold text-sky-400">
                    #{currentIndex + 1} / {DEEPFAKE_CASES.length}
                  </div>
                </div>
                <button
                  onClick={handleNextCase}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-all border border-slate-800 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowFullGrid(!showFullGrid)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    showFullGrid
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>{showFullGrid ? 'Ẩn Danh Sách' : 'Chọn Hồ Sơ'}</span>
                  {showFullGrid ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {showFullGrid && (
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center space-x-1 mr-1">
                      <Filter className="w-3 h-3" />
                      <span>Loại:</span>
                    </span>
                    <button
                      onClick={() => setSelectedMediaType('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        selectedMediaType === 'all'
                          ? 'bg-sky-500 text-slate-950'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      Tất cả ({DEEPFAKE_CASES.length})
                    </button>
                    <button
                      onClick={() => setSelectedMediaType('voice')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer flex items-center space-x-1 ${
                        selectedMediaType === 'voice'
                          ? 'bg-sky-500 text-slate-950'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Giọng Nói AI</span>
                    </button>
                    <button
                      onClick={() => setSelectedMediaType('video')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer flex items-center space-x-1 ${
                        selectedMediaType === 'video'
                          ? 'bg-sky-500 text-slate-950'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      <Video className="w-3 h-3" />
                      <span>Video Call Deepfake</span>
                    </button>
                  </div>

                  <div className="relative min-w-[220px]">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Tìm kịch bản..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                  {filteredCases.map((df) => {
                    const isCurrent = selectedCase.id === df.id;
                    const caseIdx = DEEPFAKE_CASES.findIndex((c) => c.id === df.id);
                    return (
                      <div
                        key={df.id}
                        onClick={() => handleSelectCase(df)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer text-left space-y-1.5 ${
                          isCurrent
                            ? 'bg-sky-950/30 border-sky-500/60'
                            : 'bg-slate-950/70 hover:bg-slate-950 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-mono font-bold text-sky-400">
                            #{String(caseIdx + 1).padStart(2, '0')} • {df.mediaType === 'voice' ? 'Thoại' : 'Video'}
                          </span>
                          <span className="text-slate-400 font-semibold">{df.category}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{df.title}</h4>
                        <p className="text-[11px] text-slate-400 truncate">{df.callerInfo}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Main 12-Col Workspace: Left (Audio/Video + Live Interrogation) | Right (Forensic Telemetry & Countermeasures) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Cols: Live Call Monitor & Interactive Interrogation */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
              {/* Caller Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">{selectedCase.title}</h3>
                    <p className="text-xs text-slate-400">Đầu dây: {selectedCase.callerInfo}</p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Chỉ Số Nghi Ngờ AI</div>
                  <div
                    className={`text-sm font-mono font-black ${
                      latestGlitchScore >= 75 ? 'text-rose-400' : 'text-amber-400'
                    }`}
                  >
                    {latestGlitchScore}% SYNTHETIC
                  </div>
                </div>
              </div>

              {/* Voice Synthesis & Acoustic Stream Bar */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 text-xs text-slate-300 font-semibold">
                    <Activity className="w-4 h-4 text-sky-400" />
                    <span>Phân Tích Giọng Nói Tiếng Việt Tự Nhiên (24kHz Neural Audio)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleVoice()}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                      isPlayingAudio || isLoadingVoice
                        ? 'bg-rose-600 text-white'
                        : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                    }`}
                  >
                    {isLoadingVoice ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang tạo giọng...</span>
                      </>
                    ) : isPlayingAudio ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Dừng Phát</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Nghe Giọng Đối Tượng</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Live Spectral Bars */}
                <div className="h-12 bg-slate-900 rounded-lg border border-slate-800/80 px-3 flex items-center justify-between gap-1 overflow-hidden relative">
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-sky-500/10 transition-all duration-100 pointer-events-none"
                    style={{ width: `${audioProgress}%` }}
                  />
                  {[35, 60, 45, 80, 55, 90, 40, 75, 50, 85, 60, 95, 45, 70, 35, 80, 55, 65, 40, 75, 50, 85, 45, 60].map(
                    (h, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-150 ${
                          isPlayingAudio ? 'bg-sky-400' : 'bg-slate-700'
                        }`}
                        style={{
                          height: `${
                            isPlayingAudio
                              ? Math.min(95, Math.max(20, h + Math.sin(Date.now() / 150 + i) * 25))
                              : h * 0.45
                          }%`,
                        }}
                      />
                    )
                  )}
                </div>
              </div>

              {/* Interactive Live Deepfake Interrogation Panel */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Thẩm Vấn & Kiểm Tra Nghiệm Pháp Vật Lý Trực Tiếp
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                    LIVE AI INTERROGATION
                  </span>
                </div>

                {/* Quick Physical Challenge Buttons */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleSendChallenge('Anh/chị hãy quay mặt sang ngang 90 độ chậm rãi trước camera xem nào?')
                    }
                    disabled={isInterrogating}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[11px] font-medium flex items-center space-x-1.5 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3 h-3 text-sky-400" />
                    <span>Yêu cầu quay mặt 90°</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSendChallenge('Đưa bàn tay lên vẫy qua lại ngay sát trước mũi và miệng trên camera đi!')
                    }
                    disabled={isInterrogating}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[11px] font-medium flex items-center space-x-1.5 cursor-pointer transition-colors"
                  >
                    <Hand className="w-3 h-3 text-amber-400" />
                    <span>Yêu cầu vẫy tay cắt ngang mặt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSendChallenge(
                        'Đợt nghỉ lễ vừa rồi nhà mình đi ăn ở quán nào và ai trả tiền? Trả lời đúng mật khẩu gia đình đi!'
                      )
                    }
                    disabled={isInterrogating}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[11px] font-medium flex items-center space-x-1.5 cursor-pointer transition-colors"
                  >
                    <KeyRound className="w-3 h-3 text-emerald-400" />
                    <span>Hỏi câu hỏi mật khẩu riêng</span>
                  </button>
                </div>

                {/* Glitch Alert Banner */}
                {activeGlitchBanner && (
                  <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-[11px] text-rose-200 flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-rose-300">Phát hiện rạn vỡ khung hình Deepfake: </span>
                      <span>{activeGlitchBanner}</span>
                    </div>
                  </div>
                )}

                {/* Chat Transcript */}
                <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                  {interrogationHistory.map((turn) => (
                    <div
                      key={turn.id}
                      className={`p-3 rounded-xl text-xs space-y-1.5 ${
                        turn.sender === 'user'
                          ? 'bg-sky-500/15 border border-sky-500/30 text-slate-100 ml-8'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 mr-6'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                        <span>{turn.sender === 'user' ? 'Bạn (Người kiểm tra)' : selectedCase.callerInfo}</span>
                        {turn.sender === 'caller' && (
                          <button
                            type="button"
                            onClick={() => handleToggleVoice(turn.text)}
                            className="text-sky-400 hover:underline flex items-center space-x-1 cursor-pointer"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>Nghe câu này</span>
                          </button>
                        )}
                      </div>
                      <p className="leading-relaxed">{turn.text}</p>
                      {turn.forensicNote && (
                        <div className="pt-1 border-t border-slate-800 text-[10px] text-amber-300 font-mono">
                          🔍 Pháp y AI: {turn.forensicNote}
                        </div>
                      )}
                    </div>
                  ))}
                  {isInterrogating && (
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                      <span>Đối tượng đang phản ứng trước nghiệm pháp của bạn...</span>
                    </div>
                  )}
                </div>

                {/* Custom Interrogation Input */}
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    value={challengeInput}
                    onChange={(e) => setChallengeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendChallenge();
                    }}
                    placeholder="Nhập câu hỏi vặn hoặc yêu cầu kiểm tra bất ngờ..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendChallenge()}
                    disabled={isInterrogating || !challengeInput.trim()}
                    className="px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Thẩm Vấn</span>
                  </button>
                </div>
              </div>

              {/* Action: Full Scan */}
              <button
                onClick={handleScan}
                disabled={scanning || scanned}
                className="w-full py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                <Scan className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
                <span>
                  {scanning
                    ? 'Đang Bóc Tách Dấu Vết Sinh Trắc & Khẩu Hình...'
                    : scanned
                    ? 'Đã Xuất Báo Cáo Giám Định Pháp Y'
                    : t('df_btn_scan')}
                </span>
              </button>
            </div>

            {/* Right 5 Cols: Forensic Report & Defense Formula */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
              {scanned ? (
                <div className="space-y-5 animate-fadeIn">
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center space-x-3">
                    <ShieldAlert className="w-7 h-7 text-rose-400 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-black uppercase">
                        XÁC NHẬN GIẢ MẠO SINH TRẮC AI (SYNTHETIC CLONE)
                      </h4>
                      <span className="text-xs opacity-90">Đã lưu hồ sơ giám định (+60 XP)</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{t('df_artifacts_detected')}:</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {selectedCase.artifactsDetected.map((item, idx) => (
                        <li
                          key={idx}
                          className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-start space-x-2"
                        >
                          <span className="text-rose-400 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>{t('df_defense_tactics')}:</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {selectedCase.detectionClues.map((clue, idx) => (
                        <li
                          key={idx}
                          className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-start space-x-2"
                        >
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>{clue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <span className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>{t('df_response_formula')}:</span>
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      "{selectedCase.recommendedResponse}"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12 text-slate-500">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500">
                    <Scan className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-300">Báo Cáo Pháp Y Chuyên Sâu</h4>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                    Hãy thử thẩm vấn đối tượng ở khung bên trái hoặc nhấn <strong>{t('df_btn_scan')}</strong> để hiển thị toàn bộ lỗi ghép mặt và âm học AI.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
