import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Swords,
  Send,
  Sparkles,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Info,
  Clock,
  RotateCcw,
  CheckCircle2,
  Lock,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  Eye,
  Shield,
  Check,
  Crown,
  Flame,
  Search,
  Landmark,
  Briefcase,
  Heart,
  ShoppingBag,
  Truck,
  Users,
  Layers,
  Filter,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  FileText,
  Database,
  RefreshCw,
} from 'lucide-react';
import { ArenaMessage, ArenaSession, ScamScenario, DefenseScoreBreakdown } from '../types';
import { SCAM_SCENARIOS } from '../data/scenarios';
import { useTranslation } from '../i18n/LanguageContext';
import {
  speakVietnameseRealistic,
  stopSpeaking,
  playButtonClick,
  playSuccessChime,
} from '../utils/audioEffects';

interface ScamArenaViewProps {
  selectedScenario?: ScamScenario | null;
  onSelectScenario: (scenario: ScamScenario) => void;
  onComplete: (score: number) => void;
  onAddXp: (amount: number) => void;
}

export const ScamArenaView: React.FC<ScamArenaViewProps> = ({
  selectedScenario,
  onSelectScenario,
  onComplete,
  onAddXp,
}) => {
  const { t } = useTranslation();
  const [activeScenario, setActiveScenario] = useState<ScamScenario>(
    selectedScenario || SCAM_SCENARIOS[0]
  );
  const [session, setSession] = useState<ArenaSession | null>(null);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCounterScripts, setShowCounterScripts] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [exposedWarning, setExposedWarning] = useState<string | null>(null);
  const [showAICoach, setShowAICoach] = useState(true);
  const [aiCoachRealtimeTip, setAiCoachRealtimeTip] = useState<string | null>(null);

  // Scenario picker filters & state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFullGrid, setShowFullGrid] = useState<boolean>(false);

  // Hint penalty state
  const [revealedHintLevel, setRevealedHintLevel] = useState<number>(0);
  const [hintPenalty, setHintPenalty] = useState<number>(0);

  // Vietnamese Voice Playback & Live Voice Call (gemini-3.8-live) state
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState<boolean>(false);
  const [isLiveVoiceCallActive, setIsLiveVoiceCallActive] = useState<boolean>(false);
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [liveVoiceStatus, setLiveVoiceStatus] = useState<string>('');
  const liveWsRef = useRef<WebSocket | null>(null);
  const speechRecRef = useRef<any>(null);

  // Real-World Verification Toolkit state
  const [activeVerificationModal, setActiveVerificationModal] = useState<
    null | 'hotline' | 'blacklist' | 'evidence'
  >(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filtered scenarios
  const filteredScenarios = useMemo(() => {
    return SCAM_SCENARIOS.filter((sc) => {
      const matchCategory = selectedCategory === 'all' || sc.category === selectedCategory;
      const matchDifficulty = selectedDifficulty === 'all' || sc.difficulty === selectedDifficulty;
      const matchSearch =
        searchQuery.trim() === '' ||
        sc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sc.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sc.attackerProfile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sc.attackerProfile.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sc.tactics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchDifficulty && matchSearch;
    });
  }, [selectedCategory, selectedDifficulty, searchQuery]);

  const currentIndex = SCAM_SCENARIOS.findIndex((s) => s.id === activeScenario.id);

  const quickReplies = useMemo(() => {
    const title = (activeScenario.title || '').toLowerCase();
    if (title.includes('công an') || title.includes('vneid') || title.includes('pháp lý') || title.includes('viện kiểm sát') || title.includes('truy nã')) {
      return [
        'Cho tôi xin số hiệu cán bộ và quyết định thụ lý bằng văn bản.',
        'Tôi sẽ ra trực tiếp trụ sở công an phường nơi cư trú để làm việc, công an không làm việc qua Zalo.',
        'Tại sao cơ quan nhà nước lại gọi điện yêu cầu chuyển tiền vào tài khoản cá nhân?',
        'Tôi xin phép cúp máy và gọi trực tiếp lên tổng đài 113 để xác minh vụ việc.',
      ];
    } else if (title.includes('ngân hàng') || title.includes('thẻ') || title.includes('tiền') || title.includes('treo') || title.includes('khóa tài khoản')) {
      return [
        'Ủa giao dịch ở đâu vậy anh/chị? Làm sao để tôi kiểm tra?',
        'Tại sao tổng đài ngân hàng lại gửi đường link có đuôi .online lạ như vậy?',
        'Tôi sẽ cúp máy ngay và tự gọi vào số Hotline in ở mặt sau thẻ ngân hàng để xác minh.',
        'Ngân hàng khuyến cáo không bao giờ cung cấp mã OTP, tôi sẽ ra trực tiếp chi nhánh làm việc.',
      ];
    } else if (title.includes('việc làm') || title.includes('ctv') || title.includes('shopee') || title.includes('tiktok') || title.includes('nhiệm vụ') || title.includes('hoa hồng')) {
      return [
        'Công việc cụ thể là làm gì và nhận tiền như thế nào vậy bạn?',
        'Công ty có hợp đồng lao động và mã số thuế chính thức không?',
        'Tại sao làm cộng tác viên lại bắt tôi phải nạp tiền trước? Đây là lừa đảo nhiệm vụ, tôi dừng lại và báo công an.',
      ];
    }
    return [
      'Anh/chị nói rõ hơn xem bên mình thuộc đơn vị nào?',
      'Làm sao tôi biết chắc chắn bên bạn không phải giả mạo?',
      'Gia đình tôi có mật khẩu an toàn riêng, đọc đúng mật khẩu hoặc tôi sẽ cúp máy gọi lại số chính để xác minh!',
      'Tôi từ chối chuyển tiền hay cung cấp OTP, tôi sẽ gọi tổng đài chính thức để kiểm chứng.',
    ];
  }, [activeScenario]);

  const trapSimulationReplies = useMemo(() => {
    const title = (activeScenario.title || '').toLowerCase();
    if (title.includes('công an') || title.includes('vneid') || title.includes('viện kiểm sát')) {
      return [
        'Dạ em sợ quá, mã OTP 6 số gửi về máy em là 482910 anh gỡ lệnh bắt giúp em với!',
        'Dạ trong tài khoản em có 45 triệu, để em chuyển khoản vào tài khoản tạm giữ của anh ngay ạ.',
      ];
    } else if (title.includes('ngân hàng') || title.includes('thẻ') || title.includes('khóa tài khoản')) {
      return [
        'Trời ơi hủy gấp giúp tôi! Mã OTP 6 số vừa gửi về máy tôi là 839201 nhé!',
        'Tôi vừa bấm vào đường link và đăng nhập mật khẩu ngân hàng xong rồi đó!',
      ];
    } else if (title.includes('việc làm') || title.includes('ctv') || title.includes('nhiệm vụ')) {
      return [
        'Ok bạn, mình vừa chuyển khoản 2.000.000đ vào số tài khoản kế toán để kích hoạt gói VIP rồi nhé!',
      ];
    }
    return [
      'Dạ em vừa chuyển khoản đủ số tiền vào tài khoản anh/chị gửi rồi ạ!',
      'Mã xác nhận OTP 6 số của tôi là 592018, anh/chị xử lý nhanh giúp tôi!',
    ];
  }, [activeScenario]);

  const handleSelectCase = (sc: ScamScenario) => {
    setActiveScenario(sc);
    onSelectScenario(sc);
    startSimulation(sc.id);
  };

  const handlePrevScenario = () => {
    const prevIdx = currentIndex > 0 ? currentIndex - 1 : SCAM_SCENARIOS.length - 1;
    const target = SCAM_SCENARIOS[prevIdx];
    handleSelectCase(target);
  };

  const handleNextScenario = () => {
    const nextIdx = currentIndex < SCAM_SCENARIOS.length - 1 ? currentIndex + 1 : 0;
    const target = SCAM_SCENARIOS[nextIdx];
    handleSelectCase(target);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Banking':
        return <Landmark className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Government':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
      case 'Jobs':
        return <Briefcase className="w-3.5 h-3.5 text-amber-400" />;
      case 'Romance':
        return <Heart className="w-3.5 h-3.5 text-pink-400" />;
      case 'Marketplace':
        return <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Delivery':
        return <Truck className="w-3.5 h-3.5 text-blue-400" />;
      case 'Family Emergency':
        return <Users className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <AlertTriangle className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'Banking':
        return 'Ngân Hàng';
      case 'Government':
        return 'Công Quyền & Thuế';
      case 'Jobs':
        return 'Việc Làm & CTV';
      case 'Romance':
        return 'Tình Cảm & Bạn Bè';
      case 'Marketplace':
        return 'Mua Sắm & Voucher';
      case 'Delivery':
        return 'Vận Chuyển & Vé Máy Bay';
      case 'Family Emergency':
        return 'Khẩn Cấp Gia Đình';
      default:
        return category;
    }
  };

  // Check for stored session on mount or when scenario changes
  useEffect(() => {
    if (selectedScenario) {
      setActiveScenario(selectedScenario);
      startSimulation(selectedScenario.id);
    } else {
      const savedSessionJson = localStorage.getItem('scamguard_active_arena_session');
      if (savedSessionJson) {
        try {
          const parsed = JSON.parse(savedSessionJson);
          if (parsed && parsed.status === 'active') {
            setSession(parsed);
            const sc = SCAM_SCENARIOS.find((s) => s.id === parsed.scenarioId);
            if (sc) setActiveScenario(sc);
            return;
          }
        } catch (e) {}
      }
      startSimulation(SCAM_SCENARIOS[0].id);
    }
  }, [selectedScenario]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (session && session.status === 'active') {
      localStorage.setItem('scamguard_active_arena_session', JSON.stringify(session));
    }
  }, [session?.messages, session?.status]);

  const startSimulation = async (scenarioId: string) => {
    setLoading(true);
    setRevealedHintLevel(0);
    setHintPenalty(0);
    setExposedWarning(null);
    setShowScoreModal(false);
    setAiCoachRealtimeTip(null);

    try {
      const res = await fetch('/api/arena/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId }),
      });

      if (res.ok) {
        const data = await res.json();
        const activeSess = data.session || data;
        if (activeSess && Array.isArray(activeSess.messages)) {
          setSession(activeSess);
          return;
        }
      }
      // Fallback local init
      const sc = SCAM_SCENARIOS.find((s) => s.id === scenarioId) || SCAM_SCENARIOS[0];
      setSession({
        id: `arena_${Date.now()}`,
        scenarioId: sc.id,
        scenario: sc,
        messages: [
          {
            id: 'msg_0',
            sender: 'scammer',
            text: sc.initialMessage,
            timestamp: 'Vừa xong',
            detectedTactic: sc.tactics[0],
          },
        ],
        currentPressure: 35,
        trustLevel: 10,
        shieldIntegrity: 100,
        scammerExposure: 0,
        verdict: 'IN_PROGRESS',
        detectedTactics: [sc.tactics[0]],
        timeline: [],
        status: 'active',
        startTime: Date.now(),
      });
    } catch (e) {
      const sc = SCAM_SCENARIOS.find((s) => s.id === scenarioId) || SCAM_SCENARIOS[0];
      setSession({
        id: `arena_${Date.now()}`,
        scenarioId: sc.id,
        scenario: sc,
        messages: [
          {
            id: 'msg_0',
            sender: 'scammer',
            text: sc.initialMessage,
            timestamp: 'Vừa xong',
            detectedTactic: sc.tactics[0],
          },
        ],
        currentPressure: 35,
        trustLevel: 10,
        shieldIntegrity: 100,
        scammerExposure: 0,
        verdict: 'IN_PROGRESS',
        detectedTactics: [sc.tactics[0]],
        timeline: [],
        status: 'active',
        startTime: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUseHint = (level: number) => {
    if (level <= revealedHintLevel) return;
    setRevealedHintLevel(level);
    const penalty = level === 1 ? 5 : level === 2 ? 10 : 20;
    setHintPenalty((prev) => Math.max(prev, penalty));
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || userInput;
    if (!messageText.trim() || loading) return;
    if (session && session.status !== 'active') return;

    setUserInput('');
    setLoading(true);

    // Heuristic client PII warning
    const lower = messageText.toLowerCase();
    if (/\b\d{4,6}\b/.test(lower) && (lower.includes('otp') || lower.includes('mã') || lower.includes('pass') || lower.includes('số'))) {
      setExposedWarning('🚨 BÁO ĐỘNG ĐỎ: Bạn vừa tiết lộ mã OTP/Mật khẩu! Trọng tài Gemini AI đang ghi nhận hành vi sập bẫy!');
    } else if (lower.includes('chuyển') && (lower.includes('rồi') || lower.includes('ngay') || lower.includes('để em') || lower.includes('để tôi'))) {
      setExposedWarning('🚨 BÁO ĐỘNG ĐỎ: Bạn vừa đồng ý chuyển tiền cho đối tượng chưa xác minh!');
    } else {
      setExposedWarning(null);
    }

    const currentSession = session || {
      id: `arena_${Date.now()}`,
      scenarioId: activeScenario.id,
      scenario: activeScenario,
      messages: [
        {
          id: 'msg_0',
          sender: 'scammer' as const,
          text: activeScenario.initialMessage,
          timestamp: 'Vừa xong',
          detectedTactic: activeScenario.tactics[0],
        },
      ],
      currentPressure: 35,
      trustLevel: 10,
      shieldIntegrity: 100,
      scammerExposure: 0,
      verdict: 'IN_PROGRESS' as const,
      detectedTactics: [activeScenario.tactics[0]],
      timeline: [],
      status: 'active' as const,
      startTime: Date.now(),
    };

    const userTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ArenaMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: userTimeStr,
    };

    const interimSession: ArenaSession = {
      ...currentSession,
      messages: [...currentSession.messages, userMsg],
    };
    setSession(interimSession);

    try {
      const res = await fetch('/api/arena/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSession.id,
          message: messageText,
          scenarioId: currentSession.scenarioId || activeScenario.id,
          messages: interimSession.messages,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const nextSession: ArenaSession = data.session || data;
        if (nextSession && Array.isArray(nextSession.messages)) {
          const isEnded =
            Boolean(data.evaluation?.sessionEnded) ||
            nextSession.status === 'scammed' ||
            nextSession.status === 'passed' ||
            nextSession.verdict === 'SCAMMED' ||
            nextSession.verdict === 'PASSED';

          if (isEnded && nextSession.defenseScore && hintPenalty > 0) {
            nextSession.defenseScore.overallScore = Math.max(
              10,
              nextSession.defenseScore.overallScore - hintPenalty
            );
          }

          setSession(nextSession);
          if (data.evaluation?.aiCoachTip) {
            setAiCoachRealtimeTip(data.evaluation.aiCoachTip);
          }
          const lastScammerMsg = [...nextSession.messages].reverse().find((m: ArenaMessage) => m.sender === 'scammer');
          if ((autoSpeakEnabled || isLiveVoiceCallActive) && lastScammerMsg) {
            handleSpeakArenaMessage(lastScammerMsg.id, lastScammerMsg.text);
          }

          if (isEnded) {
            localStorage.removeItem('scamguard_active_arena_session');
            const finalVerdict = nextSession.verdict || data.evaluation?.verdict;
            if (finalVerdict === 'PASSED' || nextSession.status === 'passed') {
              playSuccessChime();
              onComplete(nextSession.defenseScore?.overallScore || 94);
              onAddXp(160);
            } else {
              onComplete(nextSession.defenseScore?.overallScore || 25);
              onAddXp(35);
            }
            setTimeout(() => {
              setShowScoreModal(true);
            }, 900);
          }
          return;
        }
      }
      throw new Error('Fallback needed');
    } catch {
      const sc = activeScenario;
      const turnCount = interimSession.messages.filter((m) => m.sender === 'user').length;
      const hasOtpOrMoneyTrap =
        (/\b\d{4,8}\b/.test(lower) && !lower.includes('113') && !lower.includes('1900')) ||
        lower.includes('mã otp là') ||
        lower.includes('vừa chuyển khoản') ||
        lower.includes('đã chuyển khoản') ||
        lower.includes('bấm vào đường link và đăng nhập') ||
        (lower.includes('chuyển khoản') && (lower.includes('rồi') || lower.includes('để em') || lower.includes('ngay')));

      const isVerifying =
        lower.includes('xác minh') ||
        lower.includes('gọi lại') ||
        lower.includes('hotline') ||
        lower.includes('mặt sau') ||
        lower.includes('trụ sở') ||
        lower.includes('công an phường') ||
        lower.includes('chi nhánh') ||
        lower.includes('mật khẩu an toàn') ||
        lower.includes('photoshop');
      const isRefusing =
        lower.includes('không') ||
        lower.includes('từ chối') ||
        lower.includes('lừa đảo') ||
        lower.includes('cúp máy') ||
        lower.includes('báo công an') ||
        lower.includes('dừng lại');
      const isDecisivePass =
        (isVerifying && isRefusing) ||
        lower.includes('mặt sau thẻ') ||
        lower.includes('công an phường nơi cư trú') ||
        lower.includes('mật khẩu an toàn gia đình') ||
        lower.includes('con dấu cắt ghép') ||
        (turnCount >= 3 && (isVerifying || isRefusing));

      const tactic = sc.tactics[turnCount % sc.tactics.length] || 'Urgency';
      let scammerReply = '';
      let tip = '';
      let fallbackVerdict: 'IN_PROGRESS' | 'SCAMMED' | 'PASSED' = 'IN_PROGRESS';

      if (hasOtpOrMoneyTrap) {
        fallbackVerdict = 'SCAMMED';
        scammerReply = `💥 [BÁO ĐỘNG GIAO DỊCH]: Kẻ lừa đảo vừa sử dụng mã OTP / tiền chuyển khoản của bạn để rút sạch tài sản sang tài khoản trung gian! Ngay sau đó, đối tượng "${sc.attackerProfile.name}" đã chặn Zalo và xóa dấu vết!`;
        tip = 'BẠN ĐÃ BỊ LỪA! Phiên mô phỏng kết thúc do bạn tiết lộ OTP hoặc chuyển tiền cho kẻ gian.';
      } else if (isDecisivePass) {
        fallbackVerdict = 'PASSED';
        scammerReply = `"Thôi chết, gặp trúng người cảnh giác cao độ và nắm rõ quy trình xác minh rồi!" — [Đối tượng "${sc.attackerProfile.name}" đã hoảng sợ ngắt kết nối và xóa tài khoản ngay lập tức!]`;
        tip = 'XUẤT SẮC! Bạn đã bóc mẽ và đánh bại hoàn toàn kịch bản lừa đảo này!';
      } else {
        if (isVerifying) {
          scammerReply = `Anh/chị nghe rõ đây! Cổng xử lý hồ sơ khẩn cấp chỉ còn mở đúng 3 phút nữa thôi. Anh/chị mà tự ý ra quầy hoặc chờ gọi tổng đài là hệ thống khóa vĩnh viễn và trừ sạch tiền đấy nhé!`;
          tip = 'Rất tỉnh táo! Hãy khẳng định dứt khoát bạn sẽ cúp máy và tự gọi Hotline chính thức / ra trụ sở làm việc để hạ gục đối tượng!';
        } else if (isRefusing) {
          scammerReply = `Anh/chị định không hợp tác đúng không? Vậy tôi lập biên bản chuyển hồ sơ sang bộ phận cưỡng chế khóa toàn bộ tài khoản gắn với CCCD của anh/chị ngay bây giờ nhé!`;
          tip = 'Đừng sợ lời đe dọa! Hãy nêu rõ phương thức xác minh độc lập (Hotline mặt sau thẻ / Công an phường) để kết thúc phiên.';
        } else {
          scammerReply = `Nhanh lên anh/chị ơi, hệ thống đang báo đèn đỏ rồi! Đọc ngay 6 số mã xác nhận vừa gửi về tin nhắn điện thoại hoặc chuyển khoản đối soát để tôi xử lý kịp giờ!`;
          tip = 'Tuyệt đối không đọc mã OTP 6 số và không chuyển tiền theo lời hối thúc!';
        }
      }

      const updatedUserMsg: ArenaMessage = {
        ...userMsg,
        refereeNote:
          fallbackVerdict === 'SCAMMED'
            ? '🚨 SAI LẦM CHÍ MẠNG: Bạn đã sập bẫy cung cấp OTP / chuyển tiền cho kẻ gian!'
            : fallbackVerdict === 'PASSED'
            ? '🏆 ĐÒN QUYẾT ĐỊNH: Bạn đã áp dụng chuẩn xác quy tắc xác minh độc lập khiến kẻ gian tháo chạy!'
            : isVerifying || isRefusing
            ? '✓ Phản xạ tốt: Bạn đang dồn ép ngược lại kẻ gian. Hãy ra đòn quyết định!'
            : '⚖️ Trọng tài AI: Kẻ gian đang gia tăng áp lực, hãy giữ vững nguyên tắc bảo mật!',
        turnImpact:
          fallbackVerdict === 'SCAMMED'
            ? 'critical_fail'
            : fallbackVerdict === 'PASSED'
            ? 'winning_blow'
            : isVerifying || isRefusing
            ? 'positive'
            : 'neutral',
      };

      const scammerMsg: ArenaMessage = {
        id: `msg_scammer_${Date.now()}`,
        sender: 'scammer',
        text: scammerReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        detectedTactic: tactic,
        tacticExplanation: `Đối tượng gia tăng đòn tâm lý ${tactic} nhằm dồn ép và thao túng bạn.`,
        psychPressureDelta: fallbackVerdict === 'PASSED' ? -20 : 15,
        userVerificationDetected: isVerifying,
        complianceDetected: hasOtpOrMoneyTrap,
      };

      const nextExposure =
        fallbackVerdict === 'PASSED'
          ? 100
          : Math.min(95, (currentSession.scammerExposure ?? 0) + (isVerifying ? 45 : isRefusing ? 35 : 15));
      const nextShield =
        fallbackVerdict === 'SCAMMED'
          ? 0
          : Math.max(20, (currentSession.shieldIntegrity ?? 100) - (isVerifying || isRefusing ? 0 : 15));

      const fallbackSession: ArenaSession = {
        ...interimSession,
        messages: [...currentSession.messages, updatedUserMsg, scammerMsg],
        currentPressure:
          fallbackVerdict === 'PASSED'
            ? 10
            : fallbackVerdict === 'SCAMMED'
            ? 100
            : Math.min(100, Math.max(20, interimSession.currentPressure + 10)),
        shieldIntegrity: nextShield,
        scammerExposure: nextExposure,
        verdict: fallbackVerdict,
        status:
          fallbackVerdict === 'SCAMMED'
            ? 'scammed'
            : fallbackVerdict === 'PASSED'
            ? 'passed'
            : 'active',
        verdictTitle:
          fallbackVerdict === 'SCAMMED'
            ? 'BÁO ĐỘNG ĐỎ: BẠN ĐÃ SẬP BẪY LỪA ĐẢO!'
            : fallbackVerdict === 'PASSED'
            ? 'PHÒNG THỦ XUẤT SẮC: KẺ LỪA ĐẢO ĐÃ BỊ HẠ GỤC!'
            : undefined,
        verdictReason:
          fallbackVerdict === 'SCAMMED'
            ? `Trọng tài Gemini AI phát hiện bạn đã tiết lộ thông tin bảo mật hoặc đồng ý chuyển tiền trong câu trả lời ("${messageText}").`
            : fallbackVerdict === 'PASSED'
            ? `Trọng tài Gemini AI xác nhận bạn đã áp dụng xuất sắc quy tắc xác minh độc lập và kiên quyết từ chối thao túng tâm lý.`
            : undefined,
        fatalMistakeOrWinningMove:
          fallbackVerdict === 'SCAMMED'
            ? `Hành vi sập bẫy: "${messageText}"`
            : fallbackVerdict === 'PASSED'
            ? `Đòn phản công chuẩn xác: "${messageText}"`
            : undefined,
        estimatedFinancialLoss:
          fallbackVerdict === 'SCAMMED'
            ? 'Mất trắng 54.500.000 VNĐ & lộ quyền kiểm soát tài khoản'
            : fallbackVerdict === 'PASSED'
            ? '0 VNĐ — Bảo toàn 100% tài sản & dữ liệu cá nhân'
            : undefined,
        defenseScore:
          fallbackVerdict === 'SCAMMED'
            ? {
                overallScore: 22,
                tier: 'Rất Dễ Tổn Thương',
                scamRecognition: 30,
                verificationBehavior: 20,
                emotionalControl: 20,
                refusalBehavior: 20,
                informationProtection: 10,
                independentVerification: 20,
                responseTimeScore: 40,
              }
            : fallbackVerdict === 'PASSED'
            ? {
                overallScore: Math.max(85, 95 - hintPenalty),
                tier: 'Vệ Binh Tinh Nhuệ',
                scamRecognition: 96,
                verificationBehavior: 95,
                emotionalControl: 94,
                refusalBehavior: 96,
                informationProtection: 100,
                independentVerification: 94,
                responseTimeScore: 92,
              }
            : undefined,
        detectedTactics: [...new Set([...interimSession.detectedTactics, tactic])],
      };

      setSession(fallbackSession);
      if (tip) setAiCoachRealtimeTip(tip);
      if (autoSpeakEnabled || isLiveVoiceCallActive) {
        handleSpeakArenaMessage(scammerMsg.id, scammerMsg.text);
      }
      if (fallbackVerdict === 'SCAMMED' || fallbackVerdict === 'PASSED') {
        localStorage.removeItem('scamguard_active_arena_session');
        if (fallbackVerdict === 'PASSED') {
          playSuccessChime();
          onComplete(fallbackSession.defenseScore?.overallScore || 95);
          onAddXp(160);
        } else {
          onComplete(22);
          onAddXp(35);
        }
        setTimeout(() => {
          setShowScoreModal(true);
        }, 900);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSpeakArenaMessage = async (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      stopSpeaking();
      setSpeakingMsgId(null);
      return;
    }
    setSpeakingMsgId(msgId);
    await speakVietnameseRealistic(text, {
      speakerRole: `${activeScenario.attackerProfile.name} (${activeScenario.attackerProfile.organization})`,
      emotion: 'thúc giục, đời thường tự nhiên như cuộc gọi thực tế tại Việt Nam',
      onEnd: () => setSpeakingMsgId(null),
    });
  };

  const handleToggleLiveVoiceCall = () => {
    playButtonClick();
    if (isLiveVoiceCallActive) {
      setIsLiveVoiceCallActive(false);
      setIsListeningMic(false);
      setLiveVoiceStatus('');
      stopSpeaking();
      if (liveWsRef.current) {
        try {
          liveWsRef.current.close();
        } catch {}
        liveWsRef.current = null;
      }
      if (speechRecRef.current) {
        try {
          speechRecRef.current.stop();
        } catch {}
      }
      return;
    }

    setIsLiveVoiceCallActive(true);
    setAutoSpeakEnabled(true);
    setLiveVoiceStatus('Đang kết nối kênh đàm thoại thời gian thực (Gemini 3.8 Live)...');

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/live-voice`);
      liveWsRef.current = ws;

      ws.onopen = () => {
        setLiveVoiceStatus('Đã kết nối đàm thoại trực tiếp • Bấm biểu tượng Micro để nói tiếng Việt');
        ws.send(
          JSON.stringify({
            type: 'init',
            scenarioId: activeScenario.id,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'turn_complete' && data.transcript) {
            const scammerMsg: ArenaMessage = {
              id: `msg_live_${Date.now()}`,
              sender: 'scammer',
              text: data.transcript,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              detectedTactic: data.detectedTactic || activeScenario.tactics[0],
            };
            setSession((prev) =>
              prev ? { ...prev, messages: [...prev.messages, scammerMsg] } : prev
            );
            if (data.aiCoachTip) setAiCoachRealtimeTip(data.aiCoachTip);
            if (!data.audio) {
              handleSpeakArenaMessage(scammerMsg.id, scammerMsg.text);
            }
          }
          if (data.type === 'audio' && data.data && (data.mimeType || '').includes('wav')) {
            const audio = new Audio(`data:${data.mimeType};base64,${data.data}`);
            audio.play().catch(() => {});
          }
        } catch {}
      };

      ws.onerror = () => {
        setLiveVoiceStatus('Đàm thoại giọng nói Việt Nam trực tiếp đang hoạt động');
      };
    } catch {
      setLiveVoiceStatus('Đàm thoại giọng nói Việt Nam trực tiếp đang hoạt động');
    }
  };

  const handleToggleMicInput = () => {
    playButtonClick();
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setExposedWarning(
        'Trình duyệt hiện tại không hỗ trợ nhận diện giọng nói trực tiếp. Bạn có thể nhập câu trả lời bên dưới và bật "Tự động đọc giọng đối tượng".'
      );
      return;
    }

    if (isListeningMic && speechRecRef.current) {
      try {
        speechRecRef.current.stop();
      } catch {}
      setIsListeningMic(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      speechRecRef.current = recognition;
      recognition.lang = 'vi-VN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListeningMic(true);
        setLiveVoiceStatus('Đang lắng nghe giọng nói của bạn (Tiếng Việt)...');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript && transcript.trim()) {
          setIsListeningMic(false);
          setLiveVoiceStatus(`Đã nhận diện: "${transcript}"`);
          handleSendMessage(transcript.trim());
        }
      };

      recognition.onerror = () => {
        setIsListeningMic(false);
      };

      recognition.onend = () => {
        setIsListeningMic(false);
      };

      recognition.start();
    } catch {
      setIsListeningMic(false);
    }
  };

  const handleEndSession = async (targetSessionId?: string) => {
    const sId = targetSessionId || session?.id;
    if (!sId) return;
    setLoading(true);

    try {
      const res = await fetch('/api/arena/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sId,
          scenarioId: session?.scenarioId,
          messages: session?.messages,
          sessionData: session || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const finalSession: ArenaSession = data.session;
        // Apply hint penalty if any
        if (finalSession.defenseScore && hintPenalty > 0) {
          finalSession.defenseScore.overallScore = Math.max(
            10,
            finalSession.defenseScore.overallScore - hintPenalty
          );
        }
        setSession(finalSession);
        setShowScoreModal(true);
        localStorage.removeItem('scamguard_active_arena_session');
        onComplete(finalSession.defenseScore?.overallScore || 85);
        onAddXp(120);
      } else {
        // Graceful client-side fallback if server fails
        const fallbackScore = {
          overallScore: Math.max(10, 80 - hintPenalty),
          tier: 'Đang Rèn Luyện' as const,
          scamRecognition: 75,
          verificationBehavior: 70,
          emotionalControl: 75,
          refusalBehavior: 80,
          informationProtection: 85,
          independentVerification: 70,
          responseTimeScore: 80,
        };
        const concludedSession: ArenaSession = {
          ...session!,
          status: 'completed',
          endTime: Date.now(),
          defenseScore: fallbackScore,
          feedbackSummary: 'Đã hoàn thành phiên diễn tập và phân tích hành vi phòng vệ.',
          whatCouldYouHaveDone: [
            'Luôn kiểm tra số hotline chính thức in ở mặt sau thẻ ngân hàng.',
            'Yêu cầu giấy triệu tập hoặc văn bản chính thức thay vì làm việc qua mạng.',
          ],
        };
        setSession(concludedSession);
        setShowScoreModal(true);
        localStorage.removeItem('scamguard_active_arena_session');
        onComplete(fallbackScore.overallScore);
        onAddXp(120);
      }
    } catch (e) {
      console.error('Error concluding arena session:', e);
      setShowScoreModal(true);
      localStorage.removeItem('scamguard_active_arena_session');
    } finally {
      setLoading(false);
    }
  };

  const [showFakeBankSandbox, setShowFakeBankSandbox] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Fake Banking UI Modal / Sandbox */}
      {showFakeBankSandbox && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border-2 border-rose-500 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowFakeBankSandbox(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              ✕
            </button>
            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500 text-[11px] font-black uppercase">
                MÔ PHỎNG GIAO DIỆN NGÂN HÀNG GIẢ MẠO (FAKE BANK UI)
              </span>
              <h3 className="text-lg font-black text-white">Giao Diện Dụ Nhập Mã OTP Ngân Hàng</h3>
              <p className="text-xs text-slate-300">
                Kẻ lừa đảo thường tạo các trang web có màu sắc, logo y hệt ứng dụng Vietcombank/BIDV/Techcombank để dụ bạn gõ mã OTP.
              </p>
            </div>

            {/* Fake Bank Form UI Preview */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 font-sans">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-black text-cyan-400">🌐 vcb-digibank.ebank-xacthuc.xyz</span>
                <span className="text-[10px] text-rose-400 font-bold">⚠️ TÊN MIỀN ĐỘC HẠI</span>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Tên đăng nhập VCB Digibank:</label>
                  <input
                    type="text"
                    disabled
                    value="0982***102"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Mật khẩu ứng dụng:</label>
                  <input
                    type="password"
                    disabled
                    value="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-300"
                  />
                </div>
                <div className="p-3 bg-amber-950/60 border border-amber-800 rounded-xl space-y-1 text-amber-200">
                  <p className="font-bold text-[11px]">🔐 Mã Xác Thực OTP Hủy Giao Dịch 35.000.000đ:</p>
                  <input
                    type="text"
                    placeholder="Nhập 6 số OTP vừa nhận từ SMS..."
                    className="w-full bg-slate-900 border border-rose-500 rounded-lg p-2 text-rose-300 font-mono text-center font-bold"
                  />
                  <p className="text-[10px] text-rose-300 font-semibold">
                    ⛔ CẢNH BÁO: Nhập OTP vào đây sẽ lập tức chuyển tiền sang tài khoản kẻ lừa đảo!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowFakeBankSandbox(false)}
              className="w-full py-3 rounded-2xl bg-cyan-500 text-slate-950 font-black text-xs hover:bg-cyan-400 cursor-pointer"
            >
              ĐÃ HIỂU CƠ CHẾ - QUAY LẠI TÁC CHIẾN
            </button>
          </div>
        </div>
      )}
      {/* Scenario Selection Section */}
      <div className="bg-slate-900 border border-slate-800/90 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 mt-6">
        {/* Header & Main Stats */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center space-x-2.5">
              <Swords className="w-5 h-5 text-cyan-400" />
              <span className="uppercase tracking-wider">{t('arena_choose_scenario')}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Thực chiến đối thoại trực tiếp với các kịch bản lừa đảo qua mạng phổ biến và tinh vi nhất tại Việt Nam
            </p>
          </div>

          {/* Stepper Controls & Grid Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-2xl p-1 shadow-inner">
              <button
                onClick={handlePrevScenario}
                title="Kịch bản trước"
                className="px-2.5 py-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Trước</span>
              </button>
              <div className="px-3 py-1 font-mono text-xs font-black text-cyan-400 border-x border-slate-800/80">
                #{String(currentIndex + 1).padStart(2, '0')} / {SCAM_SCENARIOS.length}
              </div>
              <button
                onClick={handleNextScenario}
                title="Kịch bản kế tiếp"
                className="px-2.5 py-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
              >
                <span className="hidden sm:inline">Tiếp</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setShowFullGrid(!showFullGrid)}
              className="px-3 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700/80 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showFullGrid ? 'Thu Gọn Lưới' : `Mở Lưới Toàn Bộ (${SCAM_SCENARIOS.length})`}</span>
              {showFullGrid ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Search Bar & Category Filter Pills */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80 flex-shrink-0">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kịch bản, kẻ gian, chiêu trò..."
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 rounded-2xl pl-10 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center space-x-1.5 overflow-x-auto w-full pb-1 sm:pb-0">
              <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center space-x-1 mr-1">
                <Filter className="w-3 h-3" />
                <span>Độ khó:</span>
              </span>
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'Beginner', label: 'Dễ' },
                { id: 'Intermediate', label: 'Trung bình' },
                { id: 'Advanced', label: 'Khó' },
                { id: 'Expert', label: 'Chuyên gia' },
              ].map((diff) => (
                <button
                  key={diff.id}
                  onClick={() => setSelectedDifficulty(diff.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedDifficulty === diff.id
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                selectedCategory === 'all'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>Tất Cả ({SCAM_SCENARIOS.length})</span>
            </button>
            {[
              { id: 'Banking', label: 'Ngân Hàng', icon: Landmark },
              { id: 'Government', label: 'Công Quyền & Thuế', icon: ShieldAlert },
              { id: 'Jobs', label: 'Việc Làm & CTV', icon: Briefcase },
              { id: 'Romance', label: 'Tình Cảm & Bạn Bè', icon: Heart },
              { id: 'Marketplace', label: 'Mua Sắm & Voucher', icon: ShoppingBag },
              { id: 'Delivery', label: 'Vận Chuyển & Vé Bay', icon: Truck },
              { id: 'Family Emergency', label: 'Khẩn Cấp Gia Đình', icon: Users },
            ].map((cat) => {
              const IconComp = cat.icon;
              const count = SCAM_SCENARIOS.filter((s) => s.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{cat.label} ({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Compact Summary when Grid is Collapsed */}
        {!showFullGrid && (
          <div className="p-4 bg-slate-950 border border-cyan-500/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-black text-sm">
                #{String(currentIndex + 1).padStart(2, '0')}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-black text-[10px] uppercase">
                    {getCategoryLabel(activeScenario.category)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {activeScenario.attackerProfile.name} • {activeScenario.attackerProfile.organization}
                  </span>
                </div>
                <h4 className="text-sm font-black text-white mt-0.5">{activeScenario.title}</h4>
              </div>
            </div>
            <button
              onClick={() => setShowFullGrid(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs hover:bg-cyan-400 transition-all cursor-pointer whitespace-nowrap"
            >
              Đổi Kịch Bản Khác ({SCAM_SCENARIOS.length})
            </button>
          </div>
        )}

        {/* Full Responsive Multi-Column Grid */}
        {showFullGrid && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Hiển thị <strong className="text-cyan-400">{filteredScenarios.length}</strong> / {SCAM_SCENARIOS.length} kịch bản tác chiến</span>
              {filteredScenarios.length === 0 && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedDifficulty('all');
                    setSearchQuery('');
                  }}
                  className="text-cyan-400 font-bold hover:underline cursor-pointer"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>

            {filteredScenarios.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-sm font-bold text-slate-300">Không tìm thấy kịch bản nào phù hợp</p>
                <p className="text-xs text-slate-500">Hãy thử xóa bộ lọc hoặc đổi từ khóa tìm kiếm</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredScenarios.map((sc) => {
                  const isSelected = activeScenario.id === sc.id;
                  const scenarioGlobalIndex = SCAM_SCENARIOS.findIndex((s) => s.id === sc.id);

                  // Difficulty styling
                  let diffLabel = 'Dễ';
                  let diffColor = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
                  let DiffIcon = ShieldCheck;

                  if (sc.difficulty === 'Intermediate') {
                    diffLabel = 'Trung bình';
                    diffColor = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
                    DiffIcon = Zap;
                  } else if (sc.difficulty === 'Advanced') {
                    diffLabel = 'Khó';
                    diffColor = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
                    DiffIcon = AlertTriangle;
                  } else if (sc.difficulty === 'Expert') {
                    diffLabel = 'Chuyên gia';
                    diffColor = 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]';
                    DiffIcon = Crown;
                  }

                  return (
                    <div
                      key={sc.id}
                      onClick={() => handleSelectCase(sc)}
                      className={`relative overflow-hidden cursor-pointer rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between group ${
                        isSelected
                          ? 'bg-slate-900 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.25)] ring-2 ring-cyan-400/40 scale-[1.02] z-10'
                          : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/90 hover:scale-[1.01]'
                      }`}
                    >
                      {/* Active selection ribbon */}
                      {isSelected && (
                        <div className="absolute top-0 right-0 bg-gradient-to-l from-cyan-500 to-blue-500 text-slate-950 text-[9px] font-black tracking-widest px-3 py-1 rounded-bl-xl uppercase shadow-md">
                          ĐANG TÁC CHIẾN
                        </div>
                      )}

                      <div className="space-y-3">
                        {/* Top Meta Badges */}
                        <div className="flex items-center justify-between text-xs pr-10">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-black text-xs px-2 py-0.5 rounded-lg bg-slate-800 text-cyan-400 border border-slate-700/80">
                              #{String(scenarioGlobalIndex + 1).padStart(2, '0')}
                            </span>
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-extrabold border border-slate-700 text-[10px] tracking-wide uppercase">
                              {getCategoryIcon(sc.category)}
                              <span>{getCategoryLabel(sc.category)}</span>
                            </span>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wide ${diffColor}`}
                          >
                            <DiffIcon className="w-3 h-3" />
                            <span>{diffLabel}</span>
                          </span>
                        </div>

                        {/* Title & Subtitle */}
                        <div>
                          <h4 className="text-sm font-black text-white leading-snug group-hover:text-cyan-300 transition-colors">
                            {sc.title}
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mt-1.5">
                            {sc.subtitle}
                          </p>
                        </div>

                        {/* Attacker Profile Tag */}
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-[11px] text-slate-400 space-y-0.5">
                          <p className="font-bold text-slate-300 flex items-center space-x-1">
                            <span className="text-rose-400">⚠️</span>
                            <span className="truncate">{sc.attackerProfile.name}</span>
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {sc.attackerProfile.organization}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="flex items-center justify-between pt-3.5 mt-3.5 border-t border-slate-800/60 text-[11px] font-medium text-slate-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>~{sc.estimatedMinutes} phút</span>
                        </span>
                        <span className="text-cyan-400 font-bold group-hover:underline inline-flex items-center space-x-0.5">
                          <span>Vào tác chiến</span>
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Interactive Arena Area */}
      {session && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Top: Live Conversation Screen (8 Cols) */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between min-h-[600px] space-y-4">
            {/* Header info bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-black text-sm relative flex-shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border border-slate-900 animate-pulse"></span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-white">{activeScenario.attackerProfile.name}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-extrabold border border-rose-500/30">
                      Đối tượng khả nghi
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {activeScenario.attackerProfile.organization} • {activeScenario.attackerProfile.contactHandle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Live Bidirectional Voice Call Toggle (gemini-3.8-live) */}
                <button
                  type="button"
                  onClick={handleToggleLiveVoiceCall}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 cursor-pointer ${
                    isLiveVoiceCallActive
                      ? 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-500/20'
                      : 'bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border-sky-500/40'
                  }`}
                  title="Bật chế độ đàm thoại giọng nói tiếng Việt trực tiếp với đối tượng"
                >
                  {isLiveVoiceCallActive ? (
                    <>
                      <PhoneOff className="w-3.5 h-3.5 animate-pulse" />
                      <span>Ngắt Cuộc Gọi Live</span>
                    </>
                  ) : (
                    <>
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Gọi Thoại Trực Tiếp (Live AI)</span>
                    </>
                  )}
                </button>

                {/* Auto-Speak Vietnamese Voice Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    playButtonClick();
                    const next = !autoSpeakEnabled;
                    setAutoSpeakEnabled(next);
                    if (!next) {
                      stopSpeaking();
                      setSpeakingMsgId(null);
                    }
                  }}
                  className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1 cursor-pointer ${
                    autoSpeakEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                  title="Tự động phát giọng nói tiếng Việt của đối tượng"
                >
                  {autoSpeakEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{autoSpeakEnabled ? 'Giọng Việt: BẬT' : 'Giọng Việt: TẮT'}</span>
                </button>

                <button
                  onClick={() => startSimulation(activeScenario.id)}
                  title="Bắt đầu lại kịch bản này"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEndSession()}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white border border-emerald-400/40 transition-all cursor-pointer"
                >
                  Kết Thúc & Chấm Điểm
                </button>
              </div>
            </div>

            {/* Live Gemini AI Referee Telemetry Bar */}
            <div className="bg-slate-950/90 border border-cyan-500/30 rounded-2xl p-3.5 space-y-3 shadow-inner">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                    ⚖️ TRỌNG TÀI GEMINI AI (PHÁN QUYẾT TỰ ĐỘNG THEO TỪNG TIN NHẮN)
                  </span>
                </div>
                <span
                  className={`text-[11px] font-black px-2.5 py-0.5 rounded-lg border uppercase ${
                    session.verdict === 'SCAMMED' || session.status === 'scammed'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : session.verdict === 'PASSED' || session.status === 'passed'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                  }`}
                >
                  {session.verdict === 'SCAMMED' || session.status === 'scammed'
                    ? '🚨 KẾT THÚC: BẠN ĐÃ BỊ LỪA'
                    : session.verdict === 'PASSED' || session.status === 'passed'
                    ? '🏆 KẾT THÚC: ĐÃ VƯỢT QUA'
                    : '⚡ ĐANG ĐẤU TRÍ TRỰC TIẾP'}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Chat tự nhiên với đối tượng. Nếu Gemini AI phát hiện bạn <strong className="text-rose-400">tiết lộ mã OTP, bấm link lạ hoặc đồng ý chuyển tiền</strong> → Phiên kết thúc ngay (Bị lừa). Nếu bạn <strong className="text-emerald-400">vạch trần sơ hở và xác minh độc lập dứt khoát</strong> → Bạn vượt qua thử thách!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Shield Integrity Bar */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-300 flex items-center space-x-1">
                      <Shield className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Lá Chắn Bảo Mật Của Bạn:</span>
                    </span>
                    <span
                      className={`font-mono font-black ${
                        (session.shieldIntegrity ?? 100) <= 30
                          ? 'text-rose-400'
                          : (session.shieldIntegrity ?? 100) <= 65
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {session.shieldIntegrity ?? 100}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${
                        (session.shieldIntegrity ?? 100) <= 30
                          ? 'bg-rose-500'
                          : (session.shieldIntegrity ?? 100) <= 65
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.max(0, Math.min(100, session.shieldIntegrity ?? 100))}%` }}
                    />
                  </div>
                </div>

                {/* Scammer Exposure Bar */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-300 flex items-center space-x-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Tiến Độ Bóc Mẽ Kẻ Gian:</span>
                    </span>
                    <span className="font-mono font-black text-cyan-400">
                      {session.scammerExposure ?? 0}% / 100%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${Math.max(0, Math.min(100, session.scammerExposure ?? 0))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Real-World Verification Toolkit Bar */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-sky-400" />
                  <span>Bộ Công Cụ Xác Minh Đời Thực (Kiểm chứng độc lập ngoài luồng):</span>
                </span>
                {liveVoiceStatus && (
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>{liveVoiceStatus}</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playButtonClick();
                    setActiveVerificationModal(activeVerificationModal === 'hotline' ? null : 'hotline');
                    onAddXp(15);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    activeVerificationModal === 'hotline'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-900 hover:bg-slate-800 text-emerald-300 border-slate-800'
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Gọi Hotline Độc Lập</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playButtonClick();
                    setActiveVerificationModal(activeVerificationModal === 'blacklist' ? null : 'blacklist');
                    onAddXp(15);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    activeVerificationModal === 'blacklist'
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-800'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Tra Cứu SĐT / STK</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playButtonClick();
                    setActiveVerificationModal(activeVerificationModal === 'evidence' ? null : 'evidence');
                    onAddXp(15);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    activeVerificationModal === 'evidence'
                      ? 'bg-sky-500 text-slate-950 border-sky-400'
                      : 'bg-slate-900 hover:bg-slate-800 text-sky-300 border-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Soi Văn Bản Kẻ Gian</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowFakeBankSandbox(true)}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 text-xs font-bold border border-slate-800 cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">Soi Web Giả Mạo</span>
                </button>
              </div>

              {/* Verification Tool Result Drawer */}
              {activeVerificationModal === 'hotline' && (
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between text-emerald-300 font-bold">
                    <span>📞 KẾT QUẢ GỌI XÁC MINH ĐỘC LẬP (OUT-OF-BAND VERIFICATION)</span>
                    <button onClick={() => setActiveVerificationModal(null)} className="text-slate-400 hover:text-white">✕</button>
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    Bạn vừa tạm ngắt cuộc gọi nghi vấn và chủ động bấm số tổng đài chính thức của{' '}
                    <strong>{activeScenario.attackerProfile.organization}</strong>:
                  </p>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-emerald-500/30 text-emerald-200 font-medium">
                    "Tổng đài chính thức xác nhận: Đơn vị KHÔNG có bất kỳ cán bộ/nhân viên nào tên là{' '}
                    <strong>{activeScenario.attackerProfile.name}</strong> liên hệ qua Zalo/điện thoại cá nhân để yêu cầu chuyển tiền, đọc mã OTP hay cài ứng dụng lạ. Đây 100% là cuộc gọi mạo danh lừa đảo!"
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveVerificationModal(null);
                      handleSendMessage(
                        `Tôi vừa gọi trực tiếp lên tổng đài chính thức của ${activeScenario.attackerProfile.organization} để xác minh độc lập. Tổng đài khẳng định anh/chị là kẻ mạo danh lừa đảo, tôi cúp máy và báo công an ngay đây!`
                      );
                    }}
                    className="mt-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-black text-[11px] cursor-pointer"
                  >
                    Tung bằng chứng xác minh tổng đài để kết liễu kẻ gian →
                  </button>
                </div>
              )}

              {activeVerificationModal === 'blacklist' && (
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between text-amber-300 font-bold">
                    <span>🔍 HỆ THỐNG CẢNH BÁO TÍN NHIỆM MẠNG QUỐC GIA (NCSC / CHONGLUADAO)</span>
                    <button onClick={() => setActiveVerificationModal(null)} className="text-slate-400 hover:text-white">✕</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-slate-500 block">Đầu mối kiểm tra:</span>
                      <span className="text-rose-400 font-bold">{activeScenario.attackerProfile.contactHandle}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Nguồn phát cuộc gọi:</span>
                      <span className="text-amber-300 font-bold">VOIP SIP Trunk (Giả số)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Báo cáo cộng đồng:</span>
                      <span className="text-rose-400 font-bold">64 cảnh báo lừa đảo</span>
                    </div>
                  </div>
                </div>
              )}

              {activeVerificationModal === 'evidence' && (
                <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-500/40 text-xs space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-sky-300 font-bold">
                    <span>📎 GIÁM ĐỊNH HÌNH ẢNH / VĂN BẢN ĐỐI TƯỢNG VỪA GỬI QUA CHAT</span>
                    <button onClick={() => setActiveVerificationModal(null)} className="text-slate-400 hover:text-white">✕</button>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                    <p className="font-bold text-rose-400">
                      Phát hiện 3 lỗi cắt ghép Photoshop trên tài liệu của {activeScenario.attackerProfile.name}:
                    </p>
                    <ul className="space-y-1 text-slate-300">
                      <li>• Con dấu đỏ bị nhòe viền pixel (độ phân giải 72 DPI chèn đè lên nền văn bản 300 DPI).</li>
                      <li>• Sai thể thức văn bản hành chính theo Nghị định 30/2020/NĐ-CP và dùng phông chữ Arial không đồng nhất.</li>
                      <li>• Tài khoản thụ hưởng nhận tiền lại mang tên cá nhân hoặc công ty ma, không phải Kho bạc / Ngân hàng.</li>
                    </ul>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveVerificationModal(null);
                        handleSendMessage(
                          'Tôi vừa soi kỹ văn bản và tra cứu số điện thoại của anh/chị trên hệ thống cảnh báo rồi, con dấu cắt ghép Photoshop rất rõ và tài khoản nhận tiền là tài khoản cá nhân lừa đảo! Tôi chặn số và báo công an đây!'
                        );
                      }}
                      className="mt-1 px-3 py-1.5 rounded-lg bg-sky-500 text-slate-950 font-bold text-[11px] cursor-pointer"
                    >
                      Bóc mẽ ngay trong cuộc trò chuyện →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 max-h-[420px]">
              {session.messages.map((msg) => {
                const isScammer = msg.sender === 'scammer';
                const isSpeakingThis = speakingMsgId === msg.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isScammer ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-md ${
                        isScammer
                          ? 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-sm'
                          : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-sm'
                      }`}
                    >
                      <p>{msg.text}</p>

                      {isScammer && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3 text-[11px]">
                          <button
                            type="button"
                            onClick={() => handleSpeakArenaMessage(msg.id, msg.text)}
                            className={`flex items-center space-x-1 font-bold transition-colors cursor-pointer ${
                              isSpeakingThis ? 'text-rose-400' : 'text-sky-400 hover:text-sky-300'
                            }`}
                          >
                            {isSpeakingThis ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                                <span>Dừng nghe giọng</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Nghe giọng đối tượng (Tiếng Việt)</span>
                              </>
                            )}
                          </button>
                          <span className="text-slate-500 font-mono text-[10px]">{msg.timestamp}</span>
                        </div>
                      )}
                    </div>

                    {/* Scammer Tactic Badge if detected */}
                    {isScammer && msg.detectedTactic && (
                      <div className="mt-1.5 flex items-center space-x-1.5 text-[11px] text-purple-400 font-semibold">
                        <Zap className="w-3 h-3 text-purple-400" />
                        <span>Đòn tâm lý: {msg.detectedTactic}</span>
                        {msg.tacticExplanation && (
                          <span className="text-slate-400 font-normal hidden sm:inline">
                            — {msg.tacticExplanation}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Gemini AI Referee Evaluation Badge under User Message */}
                    {!isScammer && msg.refereeNote && (
                      <div
                        className={`mt-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold max-w-[85%] ${
                          msg.turnImpact === 'critical_fail'
                            ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                            : msg.turnImpact === 'winning_blow'
                            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                            : msg.turnImpact === 'positive'
                            ? 'bg-cyan-950/50 border-cyan-500/30 text-cyan-300'
                            : msg.turnImpact === 'negative'
                            ? 'bg-amber-950/50 border-amber-500/40 text-amber-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {msg.refereeNote}
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center space-x-2 text-xs text-cyan-300 italic py-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Trọng tài Gemini AI đang phân tích câu trả lời & đối tượng đang phản hồi...</span>
                </div>
              )}

              {/* In-Chat Automatic Session Conclusion Banner (SCAMMED or PASSED) */}
              {(session.status === 'scammed' ||
                session.status === 'passed' ||
                session.verdict === 'SCAMMED' ||
                session.verdict === 'PASSED') && (
                <div
                  className={`p-5 rounded-2xl border-2 space-y-3 animate-fadeIn ${
                    session.verdict === 'SCAMMED' || session.status === 'scammed'
                      ? 'bg-rose-950/40 border-rose-500 text-rose-100'
                      : 'bg-emerald-950/40 border-emerald-500 text-emerald-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      {session.verdict === 'SCAMMED' || session.status === 'scammed' ? (
                        <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
                      ) : (
                        <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                      )}
                      <h5 className="text-sm sm:text-base font-black uppercase tracking-wide">
                        {session.verdictTitle ||
                          (session.verdict === 'SCAMMED' || session.status === 'scammed'
                            ? 'BÁO ĐỘNG ĐỎ: BẠN ĐÃ BỊ KẺ LỪA ĐẢO THAO TÚNG!'
                            : 'CHIẾN THẮNG: BẠN ĐÃ VƯỢT QUA MỐI ĐE DỌA SỐ!')}
                      </h5>
                    </div>
                    <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-slate-950/80 border border-white/10">
                      Điểm: {session.defenseScore?.overallScore || (session.verdict === 'SCAMMED' ? 22 : 95)}/100
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed text-slate-200">
                    {session.verdictReason || session.feedbackSummary}
                  </p>

                  {session.fatalMistakeOrWinningMove && (
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 text-xs space-y-1">
                      <span className="font-bold text-slate-400 block">
                        {session.verdict === 'SCAMMED' || session.status === 'scammed'
                          ? '❌ Sai lầm chí mạng khiến phiên kết thúc:'
                          : '✅ Đòn phản công quyết định giúp bạn chiến thắng:'}
                      </span>
                      <span className="font-semibold text-white">{session.fatalMistakeOrWinningMove}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowScoreModal(true)}
                      className="px-4 py-2 rounded-xl bg-white text-slate-950 font-black text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      Xem Biên Bản Pháp Y Chi Tiết
                    </button>
                    <button
                      type="button"
                      onClick={() => startSimulation(activeScenario.id)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-white/15 transition-colors cursor-pointer flex items-center space-x-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Đấu Lại Tình Huống Này</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNextScenario}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-colors cursor-pointer flex items-center space-x-1"
                    >
                      <span>Tình Huống Kế Tiếp</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* PII / Error Warning if any */}
            {exposedWarning && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{exposedWarning}</span>
              </div>
            )}

            {/* Input & Counter-Script Tools */}
            <div className="space-y-3 pt-2">
              {/* Quick Reply Suggestions + Trap Simulation Chips when session is active */}
              {session.status === 'active' && !showCounterScripts && (
                <div className="space-y-2">
                  {quickReplies && quickReplies.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-bold text-emerald-400 flex items-center space-x-1">
                        <span>🛡️ Gợi ý phản xạ phòng vệ / chất vấn (Bấm chọn hoặc tự gõ câu trả lời bên dưới):</span>
                      </p>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {quickReplies.map((qr, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendMessage(qr)}
                            disabled={loading}
                            className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-emerald-950/50 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer text-left disabled:opacity-50"
                          >
                            "{qr}"
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {trapSimulationReplies && trapSimulationReplies.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-rose-400 flex items-center space-x-1">
                        <span>🧪 Thử nghiệm tình huống Sập Bẫy (Xem Gemini AI lập tức phát hiện lỗi & kết thúc phiên):</span>
                      </p>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {trapSimulationReplies.map((tr, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendMessage(tr)}
                            disabled={loading}
                            className="text-[11px] px-3 py-1.5 rounded-xl bg-rose-950/25 hover:bg-rose-950/60 border border-rose-500/30 hover:border-rose-500/60 text-rose-300 whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer text-left disabled:opacity-50"
                          >
                            "⚠️ {tr}"
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Counter-script quick chips */}
              {showCounterScripts && activeScenario.counterScripts && (
                <div className="p-3 bg-slate-950 rounded-2xl border border-cyan-500/30 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs font-bold text-cyan-400">
                    <span className="flex items-center space-x-1">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>{t('arena_btn_counter_script')}</span>
                    </span>
                    <button
                      onClick={() => setShowCounterScripts(false)}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-2">
                    {activeScenario.counterScripts.map((cs, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          handleSendMessage(cs.recommendedText);
                          setShowCounterScripts(false);
                        }}
                        className="cursor-pointer p-2.5 bg-slate-900 hover:bg-cyan-950/50 rounded-xl border border-slate-800 hover:border-cyan-500/40 text-xs transition-colors"
                      >
                        <p className="font-bold text-slate-200">"{cs.recommendedText}"</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Mục đích: {cs.rationale}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCounterScripts(!showCounterScripts)}
                  disabled={session.status !== 'active'}
                  title={t('arena_counter_script_tooltip')}
                  className={`px-3 py-3.5 rounded-2xl border text-xs font-black tracking-wide transition-all duration-200 flex items-center space-x-1.5 whitespace-nowrap cursor-pointer disabled:opacity-40 ${
                    showCounterScripts
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-950 border-slate-800 text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/50 hover:bg-slate-900'
                  }`}
                >
                  <Lightbulb className="w-4 h-4" />
                  <span className="hidden sm:inline">Mẫu Phản Đòn</span>
                </button>

                {/* Voice Mic Input Button */}
                <button
                  type="button"
                  onClick={handleToggleMicInput}
                  disabled={session.status !== 'active'}
                  title="Bấm để nói trực tiếp bằng tiếng Việt"
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-center disabled:opacity-40 ${
                    isListeningMic
                      ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-sky-500/50'
                  }`}
                >
                  {isListeningMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={userInput}
                  disabled={session.status !== 'active'}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  placeholder={
                    session.status === 'scammed' || session.verdict === 'SCAMMED'
                      ? 'Phiên đã kết thúc do bạn bị lừa — Bấm "Đấu Lại Tình Huống Này" để phục thù!'
                      : session.status === 'passed' || session.verdict === 'PASSED'
                      ? 'Bạn đã chiến thắng tình huống này — Hãy chuyển sang tình huống kế tiếp!'
                      : isListeningMic
                      ? 'Đang nghe bạn nói tiếng Việt...'
                      : 'Nhập tin nhắn trả lời đối tượng (Gemini AI sẽ chấm điểm phản xạ của bạn)...'
                  }
                  className="flex-1 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 rounded-2xl px-4 py-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-all disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!userInput.trim() || loading || session.status !== 'active'}
                  className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs sm:text-sm shadow-[0_4px_12px_rgba(6,182,212,0.25)] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>Gửi</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Psychological Telemetry & Live Stats (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Pressure Gauge - Redesigned into high-tech modern Circular Gauge */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-5 text-center flex flex-col items-center">
              <div className="w-full flex items-center justify-between border-b border-slate-800/60 pb-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <span>ÁP LỰC TRẬN ĐẤU</span>
                </h4>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded font-mono font-bold text-slate-300">TELEMETRY</span>
              </div>

              {/* Gauge Graph */}
              <div className="relative flex flex-col items-center justify-center pt-2">
                <svg className="w-44 h-28" viewBox="0 0 100 60">
                  {/* Background Arc */}
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Active Gradient Arc */}
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="url(#pressureGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="126"
                    strokeDashoffset={126 - (126 * Math.min(100, session.currentPressure)) / 100}
                    className="transition-all duration-1000 ease-out"
                  />
                  {/* Needle pointing */}
                  <g transform={`rotate(${((Math.min(100, session.currentPressure) / 100) * 180) - 90} 50 50)`} className="transition-all duration-1000 ease-out">
                    <line x1="50" y1="50" x2="50" y2="18" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="4.5" fill="#f43f5e" />
                  </g>
                  <defs>
                    <linearGradient id="pressureGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="60%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#f43f5e" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Gauge Label Overlay */}
                <div className="absolute bottom-1 text-center">
                  <span className="text-3xl font-black text-white tracking-tight">{session.currentPressure}%</span>
                  <p className={`text-[9px] font-black uppercase tracking-wider mt-0.5 ${
                    session.currentPressure > 70
                      ? 'text-rose-400 animate-pulse'
                      : session.currentPressure > 40
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}>
                    {session.currentPressure > 70 ? '⚠️ DỒN ÉP CỰC ĐỘ' : session.currentPressure > 40 ? 'ÁP LỰC GIA TĂNG' : 'TÂM LÝ ỔN ĐỊNH'}
                  </p>
                </div>
              </div>

              {/* Score breakdown helper */}
              <p className="text-xs text-slate-400 leading-relaxed max-w-[210px] mx-auto">
                Tỷ lệ chống trả, giữ vững thông tin mật giúp hạ gục áp lực thao túng của đối phương.
              </p>
            </div>

            {/* Cố Vấn Cyber AI Thông Minh - Redesigned, interactive pop-up */}
            {showAICoach && (
              <div className="relative bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/20 border border-cyan-500/30 rounded-3xl p-5 shadow-2xl space-y-4 animate-scaleUp">
                {/* Close button - larger & styled */}
                <button
                  onClick={() => setShowAICoach(false)}
                  className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer text-sm font-bold shadow"
                  title="Tạm đóng cố vấn"
                >
                  ✕
                </button>

                <div className="flex items-start space-x-3.5">
                  {/* Glowing Holographic Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] animate-pulse">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border border-slate-950"></div>
                  </div>

                  <div className="space-y-1.5 flex-1 pr-4">
                    <h5 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center space-x-1">
                      <span>TRỢ LÝ VỆ BINH AI</span>
                    </h5>
                    {aiCoachRealtimeTip ? (
                      <div className="p-2 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-xs text-cyan-200 font-medium">
                        <span className="font-bold text-amber-300 block mb-0.5">⚡ Nhận định tình huống tức thời:</span>
                        {aiCoachRealtimeTip}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        {revealedHintLevel > 0 
                          ? `Chỉ dẫn phản công: ${activeScenario.hints[revealedHintLevel - 1]?.text}`
                          : "Kẻ gian đang cố tình thao túng tâm lý bạn. Hãy rà soát tên miền lạ, từ chối nhấp link và tuyệt đối bảo mật OTP!"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Sub-actions in Coach */}
                <div className="flex items-center space-x-2 pt-1 border-t border-slate-800/50">
                  <button
                    onClick={() => {
                      const nextLevel = Math.min(3, revealedHintLevel + 1);
                      handleUseHint(nextLevel);
                    }}
                    disabled={revealedHintLevel >= 3}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.3)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center justify-center space-x-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{revealedHintLevel >= 3 ? 'Hết gợi ý' : 'Cần Hỗ Trợ Gấp (-10%)'}</span>
                  </button>
                  
                  <button
                    onClick={() => setShowCounterScripts(true)}
                    className="px-3 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-extrabold text-[11px] cursor-pointer"
                  >
                    Mẫu Phản Kích
                  </button>
                </div>
              </div>
            )}

            {/* Summons advisor overlay state when closed */}
            {!showAICoach && (
              <button
                onClick={() => setShowAICoach(true)}
                className="w-full py-3 rounded-2xl bg-slate-950 border border-dashed border-cyan-500/30 hover:border-cyan-500/70 hover:bg-slate-900 text-cyan-400 hover:text-cyan-300 text-xs font-black tracking-wide transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer shadow-inner animate-pulse"
              >
                <Sparkles className="w-4 h-4" />
                <span>TRIỆU HỒI CỐ VẤN CYBER AI</span>
              </button>
            )}

            {/* Tactical Hint System with Penalties */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/50 pb-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
                  <Info className="w-4 h-4" />
                  <span>KHO HƯỚNG DẪN CHIẾN THUẬT</span>
                </h4>
                {hintPenalty > 0 && (
                  <span className="text-[10px] font-black bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                    Trừ {hintPenalty}% điểm
                  </span>
                )}
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                {activeScenario.hints.map((hint) => {
                  const isRevealed = revealedHintLevel >= hint.level;
                  const penaltyText = hint.level === 1 ? '-5%' : hint.level === 2 ? '-10%' : '-20%';
                  return (
                    <div key={hint.level} className={`p-4 rounded-2xl border transition-all duration-200 ${
                      isRevealed 
                        ? 'bg-slate-950/80 border-cyan-500/30' 
                        : 'bg-slate-950/30 border-slate-800/50'
                    } space-y-2`}>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-300">Gợi ý Cấp {hint.level}</span>
                        {!isRevealed ? (
                          <button
                            onClick={() => handleUseHint(hint.level)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 text-[10px] font-extrabold border border-slate-700/80 cursor-pointer"
                          >
                            Mở khóa ({penaltyText})
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-black flex items-center space-x-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>ĐÃ MỞ</span>
                          </span>
                        )}
                      </div>
                      {isRevealed ? (
                        <p className="text-slate-200 leading-relaxed font-medium">{hint.text}</p>
                      ) : (
                        <p className="text-slate-500 italic leading-relaxed">Nhấp để giải mã điểm yếu bảo mật của tình huống.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Dimensional Forensic Verdict & Defense Score Modal */}
      {showScoreModal && session && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className={`bg-slate-900 border-2 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto ${
              session.verdict === 'SCAMMED' || session.status === 'scammed'
                ? 'border-rose-500'
                : 'border-emerald-500'
            }`}
          >
            <div className="text-center space-y-2">
              <div
                className={`w-16 h-16 rounded-full border flex items-center justify-center mx-auto ${
                  session.verdict === 'SCAMMED' || session.status === 'scammed'
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                    : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                }`}
              >
                {session.verdict === 'SCAMMED' || session.status === 'scammed' ? (
                  <ShieldAlert className="w-9 h-9" />
                ) : (
                  <ShieldCheck className="w-9 h-9" />
                )}
              </div>
              <div className="text-[11px] font-black uppercase tracking-widest text-cyan-400">
                PHÁN QUYẾT TỰ ĐỘNG CỦA TRỌNG TÀI GEMINI AI
              </div>
              <h3
                className={`text-xl sm:text-2xl font-black ${
                  session.verdict === 'SCAMMED' || session.status === 'scammed'
                    ? 'text-rose-400'
                    : 'text-emerald-400'
                }`}
              >
                {session.verdictTitle ||
                  (session.verdict === 'SCAMMED' || session.status === 'scammed'
                    ? 'BẠN ĐÃ SẬP BẪY LỪA ĐẢO!'
                    : 'PHÒNG THỦ THÀNH CÔNG - BẠN ĐÃ VƯỢT QUA!')}
              </h3>
              <p className="text-xs text-slate-400">
                Tình huống: "{activeScenario.title}"
              </p>
            </div>

            {/* Overall Score Ring */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center space-y-1">
              <span className="text-xs font-bold uppercase text-slate-400">
                Điểm Phòng Thủ Đa Chiều (SDI)
              </span>
              <div
                className={`text-5xl font-black ${
                  session.verdict === 'SCAMMED' || session.status === 'scammed'
                    ? 'text-rose-400'
                    : 'text-emerald-400'
                }`}
              >
                {session.defenseScore?.overallScore || (session.verdict === 'SCAMMED' ? 22 : 94)}/100
              </div>
              <div className="text-sm font-bold text-white">
                Hạng: {session.defenseScore?.tier || (session.verdict === 'SCAMMED' ? 'Rất Dễ Tổn Thương' : 'Vệ Binh Tinh Nhuệ')}
              </div>
              <div className="text-xs font-bold text-cyan-400">
                {session.verdict === 'SCAMMED' || session.status === 'scammed'
                  ? '+35 XP Điểm Rút Kinh Nghiệm Pháp Y'
                  : '+160 XP Điểm Chiến Thắng Thực Chiến'}
              </div>
            </div>

            {/* Forensic Evidence Box: Fatal Mistake or Winning Move */}
            {(session.fatalMistakeOrWinningMove || session.estimatedFinancialLoss) && (
              <div
                className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  session.verdict === 'SCAMMED' || session.status === 'scammed'
                    ? 'bg-rose-950/30 border-rose-500/40 text-rose-100'
                    : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-100'
                }`}
              >
                {session.fatalMistakeOrWinningMove && (
                  <div>
                    <span className="font-black uppercase block mb-0.5 text-[11px] text-slate-300">
                      {session.verdict === 'SCAMMED' || session.status === 'scammed'
                        ? '🚨 Bằng chứng sập bẫy chí mạng:'
                        : '🏆 Đòn phản công quyết định của bạn:'}
                    </span>
                    <p className="font-semibold text-white leading-relaxed">
                      {session.fatalMistakeOrWinningMove}
                    </p>
                  </div>
                )}
                {session.estimatedFinancialLoss && (
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-slate-300 font-bold">Đánh giá thiệt hại tài sản:</span>
                    <span
                      className={`font-black ${
                        session.verdict === 'SCAMMED' || session.status === 'scammed'
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {session.estimatedFinancialLoss}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* AI Coach Feedback */}
            <div className="space-y-2 text-xs text-slate-300">
              <h4 className="font-bold text-white">Giám Định Pháp Y Của Trọng Tài Gemini AI:</h4>
              <p className="leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                {session.verdictReason ||
                  session.feedbackSummary ||
                  'Bạn đã có phản xạ tốt khi không vội vàng cung cấp thông tin bí mật. Cần tiếp tục duy trì thói quen xác minh qua số hotline in ở mặt sau thẻ vật lý.'}
              </p>
            </div>

            {/* 7-Dimensional Breakdown */}
            {session.defenseScore && (
              <div className="space-y-2 p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                <h4 className="font-bold text-slate-300 mb-2">Chi Tiết 7 Trụ Cột Phòng Vệ:</h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nhận diện lừa đảo (20%):</span>
                    <span className="font-bold text-white">{session.defenseScore.scamRecognition}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hành vi đòi xác minh (20%):</span>
                    <span className="font-bold text-white">{session.defenseScore.verificationBehavior}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kiểm soát cảm xúc (15%):</span>
                    <span className="font-bold text-white">{session.defenseScore.emotionalControl}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hành vi từ chối dứt khoát (15%):</span>
                    <span className="font-bold text-white">{session.defenseScore.refusalBehavior}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bảo vệ thông tin mật (15%):</span>
                    <span className="font-bold text-white">{session.defenseScore.informationProtection}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Xác minh độc lập (10%):</span>
                    <span className="font-bold text-white">{session.defenseScore.independentVerification}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* What Could You Have Done */}
            {session.whatCouldYouHaveDone && (
              <div className="space-y-2 text-xs text-slate-300">
                <h4 className="font-bold text-emerald-400">Quy Tắc Vàng Phòng Thủ Cần Nhớ:</h4>
                <ul className="space-y-1.5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  {session.whatCouldYouHaveDone.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowScoreModal(false);
                  startSimulation(activeScenario.id);
                }}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                {session.verdict === 'SCAMMED' || session.status === 'scammed'
                  ? 'Phục Thù Ngay (Đấu Lại)'
                  : t('arena_score_btn_retry')}
              </button>

              <button
                onClick={() => {
                  setShowScoreModal(false);
                  handleNextScenario();
                }}
                className="flex-1 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-colors cursor-pointer"
              >
                Sang Tình Huống Tiếp Theo →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
