import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Search,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Layers,
  ChevronDown,
  ChevronUp,
  Filter,
  Building2,
  Truck,
  Zap,
  Coffee,
  Hospital,
  ShoppingBag,
  CreditCard,
  Grid,
  Smartphone,
  Lock,
  Unlock,
  MessageSquare,
  Send,
  Volume2,
  VolumeX,
  RefreshCw,
  Eye,
  FileWarning,
  Terminal,
  UserCheck,
  Scan,
} from 'lucide-react';
import { QUISHING_CASES } from '../data/quishingData';
import { QuishingCase } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import {
  playButtonClick,
  playSuccessChime,
  playAlertWarning,
  speakVietnameseRealistic,
  stopSpeaking,
} from '../utils/audioEffects';
import { QrLaserScannerOverlay } from './QrLaserScannerOverlay';

interface QuishingLabViewProps {
  onAddXp: (amount: number) => void;
  initialCaseId?: string | null;
}

interface FieldChatTurn {
  id: string;
  sender: 'user' | 'ai';
  mode: 'suspect_roleplay' | 'forensic_expert';
  text: string;
  behaviorHint?: string;
  forensicHighlight?: string;
}

export const QuishingLabView: React.FC<QuishingLabViewProps> = ({ onAddXp, initialCaseId }) => {
  const { t } = useTranslation();
  const [selectedCase, setSelectedCase] = useState<QuishingCase>(() => {
    if (initialCaseId) {
      const found = QUISHING_CASES.find((c) => c.id === initialCaseId);
      if (found) return found;
    }
    return QUISHING_CASES[0];
  });

  useEffect(() => {
    if (initialCaseId) {
      const found = QUISHING_CASES.find((c) => c.id === initialCaseId);
      if (found) {
        setSelectedCase(found);
        setInspected(false);
        setUserGuess(null);
      }
    }
  }, [initialCaseId]);

  const [inspected, setInspected] = useState(false);
  const [userGuess, setUserGuess] = useState<boolean | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFullGrid, setShowFullGrid] = useState<boolean>(false);

  // Real QR Code Data URL & Physical Inspection Tools
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [stickerPeeled, setStickerPeeled] = useState<boolean>(false);
  const [showRawPayload, setShowRawPayload] = useState<boolean>(false);
  const [laserOverlayActive, setLaserOverlayActive] = useState<boolean>(true);
  const [isLaserScanning, setIsLaserScanning] = useState<boolean>(false);
  const [activeRightTab, setActiveRightTab] = useState<'sandbox' | 'roleplay' | 'dissection'>('sandbox');

  // Live Field AI Dialogue State
  const [chatMode, setChatMode] = useState<'suspect_roleplay' | 'forensic_expert'>('suspect_roleplay');
  const [chatHistory, setChatHistory] = useState<FieldChatTurn[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  // Generate Real Scannable QR Matrix whenever selectedCase changes
  useEffect(() => {
    let mounted = true;
    QRCode.toDataURL(selectedCase.visibleUrl, {
      width: 220,
      margin: 1,
      color: {
        dark: '#090d16',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (mounted) setQrDataUrl(url);
      })
      .catch(() => {});

    setStickerPeeled(false);
    setShowRawPayload(false);
    setIsLaserScanning(true);
    const sweepTimer = window.setTimeout(() => setIsLaserScanning(false), 1100);
    stopSpeaking();
    setIsPlayingVoice(false);

    // Initialize realistic opening message from the field persona
    const personaIntro = getSuspectOpeningLine(selectedCase);
    setChatHistory([
      {
        id: 'init-1',
        sender: 'ai',
        mode: 'suspect_roleplay',
        text: personaIntro,
        behaviorHint: selectedCase.isScam
          ? 'Đối tượng đang tìm cách thúc giục bạn quét mã QR nhanh mà không kiểm tra tên miền.'
          : 'Nhân viên/hệ thống hợp lệ hướng dẫn khách hàng theo đúng quy trình chuẩn.',
      },
    ]);

    return () => {
      mounted = false;
      window.clearTimeout(sweepTimer);
      stopSpeaking();
    };
  }, [selectedCase]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(QUISHING_CASES.map((c) => c.category)));
    return ['all', ...cats];
  }, []);

  const filteredCases = useMemo(() => {
    return QUISHING_CASES.filter((c) => {
      const matchCat = selectedCategory === 'all' || c.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.physicalContext.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.visibleUrl.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const currentIndex = QUISHING_CASES.findIndex((c) => c.id === selectedCase.id);

  const handleSelectCase = (qc: QuishingCase) => {
    playButtonClick();
    setSelectedCase(qc);
    setInspected(false);
    setUserGuess(null);
  };

  const handlePrevCase = () => {
    const prevIndex = (currentIndex - 1 + QUISHING_CASES.length) % QUISHING_CASES.length;
    handleSelectCase(QUISHING_CASES[prevIndex]);
  };

  const handleNextCase = () => {
    const nextIndex = (currentIndex + 1) % QUISHING_CASES.length;
    handleSelectCase(QUISHING_CASES[nextIndex]);
  };

  const handleGuess = (isScamGuess: boolean) => {
    playButtonClick();
    setUserGuess(isScamGuess);
    setInspected(true);
    setActiveRightTab('dissection');
    if (isScamGuess === selectedCase.isScam) {
      playSuccessChime();
      onAddXp(50);
    } else {
      playAlertWarning();
    }
  };

  const handleSpeakMessage = async (text: string) => {
    if (isPlayingVoice) {
      stopSpeaking();
      setIsPlayingVoice(false);
      return;
    }
    setIsPlayingVoice(true);
    await speakVietnameseRealistic(text, {
      speakerRole: chatMode === 'suspect_roleplay' ? 'Người hướng dẫn quét mã QR' : 'Chuyên gia pháp y mạng',
      emotion: selectedCase.isScam ? 'thúc giục, đời thường tự nhiên' : 'lịch sự, rõ ràng',
      onEnd: () => setIsPlayingVoice(false),
    });
  };

  const handleSendFieldMessage = async (presetText?: string) => {
    const msg = (presetText ?? chatInput).trim();
    if (!msg || isSendingChat) return;

    playButtonClick();
    if (!presetText) setChatInput('');

    const userTurn: FieldChatTurn = {
      id: `u-${Date.now()}`,
      sender: 'user',
      mode: chatMode,
      text: msg,
    };

    const updatedHistory = [...chatHistory, userTurn];
    setChatHistory(updatedHistory);
    setIsSendingChat(true);

    try {
      const response = await fetch('/api/quishing/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseTitle: selectedCase.title,
          physicalContext: selectedCase.physicalContext,
          visibleUrl: selectedCase.visibleUrl,
          actualDomain: selectedCase.actualRegistrableDomain,
          isScam: selectedCase.isScam,
          redFlags: selectedCase.redFlags,
          mode: chatMode,
          userMessage: msg,
          history: updatedHistory.map((m) => ({
            sender: m.sender === 'user' ? 'user' : 'scammer',
            text: m.text,
          })),
        }),
      });

      const data = await response.json();
      const aiTurn: FieldChatTurn = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        mode: chatMode,
        text:
          data.replyText ||
          'Anh/chị kiểm tra kỹ tên miền chính thức trên màn hình xem có trùng khớp với đơn vị chủ quản không nhé.',
        behaviorHint: data.behaviorHint,
        forensicHighlight: data.forensicHighlight,
      };
      setChatHistory((prev) => [...prev, aiTurn]);
      onAddXp(20);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          mode: chatMode,
          text: selectedCase.isScam
            ? 'Hệ thống bên em đang nâng cấp cổng mới nên tên miền nó thế đấy, anh/chị cứ nhập mã OTP để hoàn tất hồ sơ nhanh đi ạ!'
            : 'Dạ anh/chị có thể kiểm tra trực tiếp tên miền chính chủ có chứng chỉ bảo mật HTTPS hợp lệ trước khi thao tác ạ.',
        },
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  function getSuspectOpeningLine(qc: QuishingCase): string {
    if (!qc.isScam) {
      return `Chào bạn, đây là mã QR chính thức tại "${qc.title}". Bạn có thể dùng camera hoặc ứng dụng ngân hàng quét để kiểm tra tên miền chính chủ ${qc.actualRegistrableDomain} nhé.`;
    }
    switch (qc.category) {
      case 'Government':
        return 'Chào anh/chị, hồ sơ định danh và biên lai phạt nguội của mình sắp quá hạn khóa tài khoản rồi. Anh/chị lấy điện thoại quét ngay mã QR trên giấy báo này rồi nhập CCCD + mật khẩu để đồng bộ gấp nhé!';
      case 'Utilities':
        return 'Anh/chị ơi bên Điện lực báo công tơ nhà mình nợ cước sắp cắt điện tự động sau 2 tiếng nữa. Anh/chị quét mã QR này tải ứng dụng xác nhận thanh toán ngay kẻo tối mất điện nhé!';
      case 'Delivery':
        return 'Em bên giao hàng đây anh/chị ơi, đơn hàng bị hoàn kho nên anh/chị quét mã QR trên phiếu này rồi đăng nhập ngân hàng nhận lại tiền cọc phí ship giúp em nhé!';
      case 'Banking':
        return 'Anh/chị quét mã QR trên bảng này rồi điền tên đăng nhập với mã SmartOTP để nhận tiền đặt cọc hoặc nâng hạn mức thẻ tín dụng miễn phí ngay trong ngày hôm nay nhé!';
      default:
        return 'Anh/chị lấy Zalo hoặc Camera quét mã QR này rồi đăng nhập xác nhận ngay đi ạ, hệ thống đang giữ ưu đãi trong 5 phút thôi!';
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Banking':
        return <CreditCard className="w-3.5 h-3.5" />;
      case 'Government':
        return <Building2 className="w-3.5 h-3.5" />;
      case 'Delivery':
        return <Truck className="w-3.5 h-3.5" />;
      case 'Utilities':
        return <Zap className="w-3.5 h-3.5" />;
      case 'Restaurant':
        return <Coffee className="w-3.5 h-3.5" />;
      case 'Healthcare':
        return <Hospital className="w-3.5 h-3.5" />;
      case 'E-commerce':
      case 'Retail & Grocery':
        return <ShoppingBag className="w-3.5 h-3.5" />;
      default:
        return <QrCode className="w-3.5 h-3.5" />;
    }
  };

  // Render Realistic Physical Surface around the real QR Code
  const renderPhysicalArtifactStage = () => {
    const isStickerAttack =
      selectedCase.isScam &&
      (selectedCase.physicalContext.toLowerCase().includes('dán đè') ||
        selectedCase.physicalContext.toLowerCase().includes('bảng') ||
        selectedCase.physicalContext.toLowerCase().includes('trụ') ||
        selectedCase.category === 'Restaurant' ||
        selectedCase.category === 'Banking');

    return (
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
        {/* Top Physical Artifact Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
              PHYSICAL ARTIFACT
            </span>
            <span className="text-slate-400">Mô phỏng vật thể thực tế tại hiện trường</span>
          </div>

          <div className="flex items-center space-x-1.5">
            {isStickerAttack && (
              <button
                type="button"
                onClick={() => {
                  playButtonClick();
                  setStickerPeeled(!stickerPeeled);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                  stickerPeeled
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>{stickerPeeled ? 'Đã Bóc Tem Dán Đè' : 'Thử Cạo / Bóc Viền Tem QR'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                playButtonClick();
                setLaserOverlayActive(true);
                setIsLaserScanning(true);
                setShowRawPayload(true);
                window.setTimeout(() => setIsLaserScanning(false), 1100);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                isLaserScanning
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-sky-400 border border-sky-500/40'
              }`}
            >
              <Scan className="w-3 h-3" />
              <span>{isLaserScanning ? 'Đang Quét Laser...' : 'Quét Laser Pháp Y'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playButtonClick();
                setShowRawPayload(!showRawPayload);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                showRawPayload
                  ? 'bg-sky-500 text-slate-950'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <Terminal className="w-3 h-3" />
              <span>Giải Mã Chuỗi EMVCo / Raw</span>
            </button>
          </div>
        </div>

        {/* Realistic Physical Standee / Notice Card */}
        <div className="relative mx-auto max-w-sm rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200 text-slate-900 p-5 shadow-2xl border-4 border-slate-300">
          {/* Physical Header Banner */}
          <div className="text-center border-b border-slate-300 pb-2.5 mb-3">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[9px] font-bold uppercase tracking-wider mb-1">
              {getCategoryIcon(selectedCase.category)}
              <span>{selectedCase.category.toUpperCase()} CHECKPOINT</span>
            </div>
            <h4 className="text-xs font-black text-slate-900 uppercase leading-snug">
              {selectedCase.title}
            </h4>
          </div>

          {/* QR Code Frame with Realistic Peelable Sticker Layer */}
          <div className="relative mx-auto w-48 h-48 bg-white rounded-xl p-3 shadow-inner border-2 border-slate-300 flex items-center justify-center">
            {/* Underlying Original Authentic VietQR (Visible when sticker is peeled) */}
            {isStickerAttack && stickerPeeled && (
              <div className="absolute inset-0 bg-emerald-50 rounded-xl p-3 flex flex-col items-center justify-center text-center border-2 border-emerald-500 z-10">
                <ShieldCheck className="w-8 h-8 text-emerald-600 mb-1" />
                <p className="text-[10px] font-black text-emerald-900 uppercase">
                  PHÁT HIỆN TEM GIẢ DÁN ĐÈ!
                </p>
                <p className="text-[9px] text-emerald-800 mt-1 leading-tight">
                  Bên dưới lớp decal bóng của kẻ gian là mã VietQR Napas247 gốc của cửa hàng bị che khuất.
                </p>
              </div>
            )}

            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Scannable Forensic QR Code"
                className={`w-full h-full object-contain transition-all duration-300 ${
                  stickerPeeled ? 'translate-x-12 -translate-y-8 rotate-12 opacity-25 scale-90' : ''
                }`}
              />
            ) : (
              <QrCode className="w-32 h-32 text-slate-900" />
            )}

            {/* Corner Sticker Shadow Hint for Tampered QR */}
            {isStickerAttack && !stickerPeeled && (
              <div
                title="Mép decal dán chồng hơi kênh lên 0.5mm"
                className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-bl from-slate-300 via-white to-transparent border-b border-l border-slate-400 rounded-bl shadow-md z-10"
              />
            )}

            {/* Real-Time Optical Laser Scanner Overlay */}
            <QrLaserScannerOverlay
              isScanning={isLaserScanning}
              laserActive={laserOverlayActive && !stickerPeeled}
              verdictStatus={
                inspected
                  ? selectedCase.isScam
                    ? 'danger'
                    : 'safe'
                  : 'neutral'
              }
              compact
            />
          </div>

          {/* Footer on physical standee */}
          <div className="mt-3 text-center space-y-1">
            <div className="flex items-center justify-center space-x-2 text-[9px] font-bold text-slate-700">
              <span>VIETQR</span>
              <span>•</span>
              <span>NAPAS 247</span>
              <span>•</span>
              <span>CAMERA SCAN</span>
            </div>
            <p className="text-[9px] font-mono text-slate-500 truncate px-2">
              {selectedCase.visibleUrl}
            </p>
          </div>
        </div>

        {/* Raw Payload Decoder Box */}
        {showRawPayload && (
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] space-y-1.5">
            <div className="flex items-center justify-between text-sky-400 font-bold">
              <span>DECODED QR RAW PAYLOAD:</span>
              <span>{selectedCase.visibleUrl.startsWith('http') ? 'TYPE: URI_REDIRECT' : 'TYPE: TEXT'}</span>
            </div>
            <p className="text-slate-200 break-all bg-slate-950 p-2 rounded border border-slate-800">
              {selectedCase.visibleUrl}
            </p>
            <p className="text-[10px] text-amber-300">
              {selectedCase.isScam
                ? '⚠️ Cảnh báo kỹ thuật: Mã VietQR chuyển khoản ngân hàng chuẩn EMVCo luôn bắt đầu bằng chuỗi số "00020101...", KHÔNG BAO GIỜ là một đường link http/https bắt nhập mật khẩu hay tải file .apk!'
                : '✓ Chuỗi URL trỏ đúng về tên miền chính thức đã đăng ký xác thực.'}
            </p>
          </div>
        )}

        {/*Decoded URL Preview Strip */}
        <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              URL Đích Khi Đưa Camera Vào Quét:
            </span>
            <p className="text-xs font-mono font-bold text-sky-400 break-all">
              {selectedCase.visibleUrl}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              playButtonClick();
              setActiveRightTab('sandbox');
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-[11px] font-bold shrink-0 flex items-center space-x-1 cursor-pointer border border-slate-700"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Xem Trang Đích</span>
          </button>
        </div>
      </div>
    );
  };

  // Render Interactive Smartphone Sandbox Browser Preview
  const renderSmartphoneSandbox = () => {
    const isHttps = selectedCase.urlDissection.protocol.includes('https');

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-sky-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Hộp Cát Điện Thoại Ảo (Isolated Browser Sandbox)
            </h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-slate-800">
            SANDBOX VM: ISOLATED
          </span>
        </div>

        {/* Simulated Mobile Phone Screen */}
        <div className="mx-auto max-w-sm rounded-3xl bg-slate-950 border-4 border-slate-800 shadow-2xl overflow-hidden">
          {/* Mobile Browser Address Bar */}
          <div className="bg-slate-900 px-3 py-2.5 border-b border-slate-800 flex items-center space-x-2">
            {isHttps ? (
              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            ) : (
              <Unlock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            )}
            <div className="flex-1 bg-slate-950 rounded-lg px-2.5 py-1 text-[11px] font-mono truncate border border-slate-800">
              <span className="text-slate-500">{selectedCase.urlDissection.protocol}</span>
              {selectedCase.urlDissection.subdomain && (
                <span className="text-slate-400">{selectedCase.urlDissection.subdomain}.</span>
              )}
              <span
                className={
                  selectedCase.isScam
                    ? 'text-rose-400 font-bold underline decoration-wavy'
                    : 'text-emerald-400 font-bold'
                }
              >
                {selectedCase.actualRegistrableDomain}
              </span>
              <span className="text-slate-500">{selectedCase.urlDissection.path}</span>
            </div>
          </div>

          {/* Simulated Webpage Body inside the Phone */}
          <div className="p-4 bg-slate-900/60 space-y-3.5 text-xs">
            {selectedCase.isScam ? (
              <>
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-rose-300">
                    <span>CẢNH BÁO TRANG THU THẬP DỮ LIỆU</span>
                    <span>WHOIS: 3 NGÀY TUỔI</span>
                  </div>
                  <p className="text-xs font-bold text-white">{selectedCase.title}</p>
                </div>

                {/* Simulated Phishing Form / APK Trap */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <p className="text-[11px] text-slate-300 font-medium">
                    Trang web giả mạo này đang yêu cầu nạn nhân cung cấp:
                  </p>
                  <div className="space-y-2">
                    <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Số CCCD / Tài khoản Ngân hàng</span>
                      <span className="text-[9px] font-mono text-rose-400">PHISHING INPUT</span>
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Mật khẩu đăng nhập & Mã SmartOTP</span>
                      <span className="text-[9px] font-mono text-rose-400">OTP HARVESTER</span>
                    </div>
                    {selectedCase.visibleUrl.toLowerCase().includes('apk') ||
                    selectedCase.explanation.toLowerCase().includes('apk') ? (
                      <div className="p-2.5 rounded-lg bg-rose-600/20 border border-rose-500/50 text-rose-200 text-[11px] flex items-center space-x-2">
                        <FileWarning className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>Tự động tải xuống gói cài đặt độc hại (.APK) đòi quyền Trợ năng (Accessibility)!</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2 text-center">
                <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                <h5 className="text-xs font-bold text-white">Cổng Dịch Vụ Chính Thức</h5>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Tên miền gốc <strong>{selectedCase.actualRegistrableDomain}</strong> có chứng chỉ SSL/TLS hợp lệ của tổ chức và chỉ hiển thị thông tin tra cứu/menu tiêu chuẩn, không đòi mã OTP hay tải file .APK.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Case Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">{t('quish_header_title')}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-emerald-400 font-mono font-bold border border-slate-800">
                  {QUISHING_CASES.length} HIỆN TRƯỜNG THỰC TẾ
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Kiểm tra mã QR thực tế, bóc lớp tem dán đè, soi trang đích trong hộp cát và chất vấn trực tiếp đối tượng tại hiện trường.
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
              <div className="text-[10px] font-bold text-slate-500 uppercase">Hiện trường</div>
              <div className="text-xs font-mono font-bold text-emerald-400">
                #{currentIndex + 1} / {QUISHING_CASES.length}
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
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>{showFullGrid ? 'Ẩn Danh Sách' : 'Danh Sách Tình Huống'}</span>
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
                  <span>Lĩnh vực:</span>
                </span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                      selectedCategory === cat
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {cat === 'all' ? (
                      <span>Tất cả ({QUISHING_CASES.length})</span>
                    ) : (
                      <>
                        {getCategoryIcon(cat)}
                        <span>{cat}</span>
                      </>
                    )}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Tìm tình huống, tên miền..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredCases.map((qc) => {
                const isCurrent = selectedCase.id === qc.id;
                const caseIdx = QUISHING_CASES.findIndex((c) => c.id === qc.id);
                return (
                  <div
                    key={qc.id}
                    onClick={() => handleSelectCase(qc)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-left space-y-1.5 ${
                      isCurrent
                        ? 'bg-emerald-950/30 border-emerald-500/60'
                        : 'bg-slate-950/70 hover:bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono font-bold text-emerald-400">
                        #{String(caseIdx + 1).padStart(2, '0')} • {qc.category}
                      </span>
                      <span className="text-slate-400 font-semibold">{qc.difficulty}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{qc.title}</h4>
                    <div className="text-[10px] font-mono text-slate-400 truncate">{qc.visibleUrl}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main 12-Col Lab Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 6 Cols: Physical Artifact Inspection & Verdict */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="px-2.5 py-1 rounded bg-slate-950 text-emerald-400 font-semibold border border-slate-800 flex items-center space-x-1.5">
                {getCategoryIcon(selectedCase.category)}
                <span>Bối cảnh: {selectedCase.category}</span>
              </span>
              <span className="text-slate-400 font-mono text-[11px]">Độ khó: {selectedCase.difficulty}</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white">{selectedCase.title}</h3>
            <p className="text-xs sm:text-sm text-slate-300 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
              <strong className="text-white">Hiện trường thực tế:</strong> {selectedCase.physicalContext}
            </p>
          </div>

          {renderPhysicalArtifactStage()}

          {/* Verdict Buttons */}
          {!inspected ? (
            <div className="space-y-2.5 pt-1">
              <span className="text-xs font-bold text-slate-300 block text-center">
                Sau khi kiểm tra vật lý & hỏi đối tượng, kết luận của bạn là gì?
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleGuess(false)}
                  className="py-3.5 rounded-xl bg-slate-950 hover:bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mã QR Hợp Lệ & An Toàn</span>
                </button>

                <button
                  onClick={() => handleGuess(true)}
                  className="py-3.5 rounded-xl bg-slate-950 hover:bg-rose-950/40 border border-rose-500/40 text-rose-400 font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Mã QR Giả Mạo / Độc Hại</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => {
                  setInspected(false);
                  setUserGuess(null);
                }}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Kiểm Tra Lại</span>
              </button>

              <button
                onClick={handleNextCase}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Hiện Trường Tiếp Theo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right 6 Cols: Interactive Tabs (1. Sandbox Preview, 2. Live Field AI Roleplay, 3. URL Dissection) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          {/* Right Workbench Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => {
                playButtonClick();
                setActiveRightTab('sandbox');
              }}
              className={`py-2 px-2 rounded-lg font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeRightTab === 'sandbox'
                  ? 'bg-sky-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Hộp Cát Web</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playButtonClick();
                setActiveRightTab('roleplay');
              }}
              className={`py-2 px-2 rounded-lg font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeRightTab === 'roleplay'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Hỏi Đối Tượng AI</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playButtonClick();
                setActiveRightTab('dissection');
              }}
              className={`py-2 px-2 rounded-lg font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeRightTab === 'dissection'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Giải Phẫu URL</span>
            </button>
          </div>

          {/* TAB 1: SMARTPHONE SANDBOX */}
          {activeRightTab === 'sandbox' && renderSmartphoneSandbox()}

          {/* TAB 2: LIVE FIELD AI ROLEPLAY & FORENSIC EXPERT */}
          {activeRightTab === 'roleplay' && (
            <div className="space-y-4">
              {/* Roleplay Persona Toggle */}
              <div className="flex items-center justify-between gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setChatMode('suspect_roleplay')}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold flex items-center justify-center space-x-1.5 cursor-pointer ${
                    chatMode === 'suspect_roleplay'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Nói chuyện với Người đưa mã QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChatMode('forensic_expert')}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold flex items-center justify-center space-x-1.5 cursor-pointer ${
                    chatMode === 'forensic_expert'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Hỏi Chuyên Gia Pháp Y Mạng</span>
                </button>
              </div>

              {/* Quick Field Questions */}
              <div className="flex flex-wrap gap-1.5">
                {chatMode === 'suspect_roleplay' ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        handleSendFieldMessage(
                          'Sao tôi quét mã QR chuyển khoản mà nó lại mở ra trang web lạ bắt nhập mật khẩu với mã OTP thế này?'
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] cursor-pointer"
                    >
                      "Sao quét QR lại bắt nhập mật khẩu/OTP?"
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleSendFieldMessage(
                          'Sao cái tem QR này dán chồng lệch lên bảng gốc thế? Để tôi gọi quản lý xác nhận số tài khoản nhé!'
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] cursor-pointer"
                    >
                      "Sao tem QR dán đè lên bảng gốc thế?"
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        handleSendFieldMessage(
                          'Hãy phân tích cấu trúc Subdomain và Root Domain của đường link trong mã QR này giúp tôi.'
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] cursor-pointer"
                    >
                      "Phân tích Subdomain vs Root Domain"
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleSendFieldMessage(
                          'Nếu lỡ quét mã QR này và nhập thông tin thì kẻ gian chiếm tài khoản theo cơ chế nào?'
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] cursor-pointer"
                    >
                      "Cơ chế chiếm đoạt sau khi quét là gì?"
                    </button>
                  </>
                )}
              </div>

              {/* Chat Messages */}
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                {chatHistory.map((turn) => (
                  <div
                    key={turn.id}
                    className={`p-3 rounded-xl text-xs space-y-1.5 ${
                      turn.sender === 'user'
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-slate-100 ml-8'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 mr-6'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                      <span>
                        {turn.sender === 'user'
                          ? 'Bạn (Tại hiện trường)'
                          : turn.mode === 'suspect_roleplay'
                          ? 'Đối tượng tại hiện trường'
                          : 'Chuyên gia Pháp y Quishing'}
                      </span>
                      {turn.sender === 'ai' && (
                        <button
                          type="button"
                          onClick={() => handleSpeakMessage(turn.text)}
                          className="text-emerald-400 hover:underline flex items-center space-x-1 cursor-pointer"
                        >
                          {isPlayingVoice ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                          <span>Nghe giọng Việt</span>
                        </button>
                      )}
                    </div>
                    <p className="leading-relaxed">{turn.text}</p>
                    {turn.behaviorHint && (
                      <div className="pt-1 border-t border-slate-800/80 text-[10px] text-amber-300 font-mono">
                        💡 Tâm lý đối tượng: {turn.behaviorHint}
                      </div>
                    )}
                  </div>
                ))}
                {isSendingChat && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    <span>Đang phản hồi...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendFieldMessage();
                  }}
                  placeholder="Nhập câu chất vấn đối tượng hoặc hỏi chuyên gia pháp y..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => handleSendFieldMessage()}
                  disabled={isSendingChat || !chatInput.trim()}
                  className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center space-x-1 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: URL DISSECTION & FORENSIC REPORT */}
          {activeRightTab === 'dissection' && (
            <div className="space-y-4">
              {inspected && (
                <div
                  className={`p-3.5 rounded-xl border flex items-center space-x-3 ${
                    selectedCase.isScam
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  }`}
                >
                  {selectedCase.isScam ? (
                    <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
                  ) : (
                    <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                  )}
                  <div>
                    <h4 className="text-xs font-black uppercase">
                      {selectedCase.isScam ? t('quish_verdict_scam') : t('quish_verdict_legit')}
                    </h4>
                    <span className="text-[11px] opacity-90">
                      {userGuess === selectedCase.isScam
                        ? 'Chính xác! Bạn đã nhận diện đúng bản chất mã QR (+50 XP)'
                        : 'Hãy xem kỹ phần bóc tách Tên miền chính (Registrable Domain) bên dưới.'}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Giao thức (Protocol):</span>
                  <span className="font-mono text-slate-200">{selectedCase.urlDissection.protocol}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Tên miền phụ đánh lừa (Subdomain):</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {selectedCase.urlDissection.subdomain || '(Không có)'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Tên miền thực sự sở hữu (Root Domain):</span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded border ${
                      selectedCase.isScam
                        ? 'text-rose-400 bg-rose-950/40 border-rose-500/30'
                        : 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30'
                    }`}
                  >
                    {selectedCase.actualRegistrableDomain}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Đường dẫn (Path):</span>
                  <span className="font-mono text-slate-300 break-all">{selectedCase.urlDissection.path}</span>
                </div>
              </div>

              {selectedCase.redFlags && selectedCase.redFlags.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{t('quish_red_flags')}:</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {selectedCase.redFlags.map((flag, idx) => (
                      <li key={idx} className="p-2 bg-slate-950 rounded-lg border border-slate-800 flex items-start space-x-2">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <strong className="text-white block mb-1">{t('quish_explanation')}:</strong>
                {selectedCase.explanation}
              </div>

              <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs space-y-1">
                <span className="font-bold text-emerald-400 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t('quish_defense_tip')}:</span>
                </span>
                <p className="text-slate-200 leading-relaxed">{selectedCase.educationalTip}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
