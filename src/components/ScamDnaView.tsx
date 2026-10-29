import React, { useState, useEffect, useMemo } from 'react';
import {
  Dna,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  User,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  Target,
  Flame,
  Share2,
  Brain,
  Zap,
  ArrowRight,
  Layers,
  Award,
  Cpu,
  Wallet,
  FileText,
  BarChart3,
  SlidersHorizontal,
  Activity,
  ArrowUpRight,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ScamDnaProfile,
  CommunityScamDna,
  ScamDnaDimensionKey,
  UserProfile,
} from '../types';
import { ScamDnaTrendChart } from './ScamDnaTrendChart';

interface ScamDnaViewProps {
  userProfile: UserProfile;
  dnaProfile?: ScamDnaProfile;
  onNavigateToArena?: (scenarioId?: string) => void;
  onEarnXp?: (amount: number) => void;
}

// 3 Core Pillars Classification
export type DnaPillarCategory = 'all' | 'psychology' | 'technical' | 'financial';

interface PillarDefinition {
  id: DnaPillarCategory;
  name: string;
  shortName: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  accentColor: string;
  badgeBg: string;
  description: string;
  dimensionKeys: ScamDnaDimensionKey[];
}

const PILLARS: PillarDefinition[] = [
  {
    id: 'psychology',
    name: 'Kháng Thao Túng Tâm Lý',
    shortName: 'Tâm Lý Hành Vi',
    icon: Brain,
    accentColor: '#a855f7', // Purple
    badgeBg: 'rgba(168, 85, 247, 0.1)',
    description: 'Năng lực giữ vững lý trí trước các đòn tâm lý kích động: đe dọa sợ hãi, mạo danh uy quyền, dồn ép thời gian, bẫy lòng tham và thao túng cô lập.',
    dimensionKeys: ['authority', 'urgency', 'fear', 'greed', 'isolation', 'emotional_stability'],
  },
  {
    id: 'technical',
    name: 'Giám Định Kỹ Thuật & AI',
    shortName: 'Kỹ Thuật & AI',
    icon: Cpu,
    accentColor: '#0ea5e9', // Sky blue
    badgeBg: 'rgba(14, 165, 233, 0.1)',
    description: 'Năng lực phát hiện dấu vết tấn công công nghệ cao: Quét mã QR độc hại (Quishing), tên miền giả mạo (Typosquatting), và nhận diện video/giọng nói AI Deepfake.',
    dimensionKeys: ['quishing_domain', 'deepfake_ai'],
  },
  {
    id: 'financial',
    name: 'Bảo Vệ Tài Chính & Dữ Liệu',
    shortName: 'Tài Chính & Danh Tính',
    icon: Wallet,
    accentColor: '#10b981', // Emerald
    badgeBg: 'rgba(16, 185, 129, 0.1)',
    description: 'Thiết lập rào chắn bảo vệ tài sản và dữ liệu nhạy cảm: Bảo vệ mã Smart OTP, thông tin Căn cước công dân (CCCD) và kích hoạt phản xạ xác minh chéo độc lập.',
    dimensionKeys: ['privacy_credential', 'verification_reflex'],
  },
];

// Rich 2026 Threat Intelligence per Dimension
const DIMENSION_THREAT_INTEL: Record<
  ScamDnaDimensionKey,
  {
    pillar: 'psychology' | 'technical' | 'financial';
    realWorldScenarioVN: string;
    protocolSteps: string[];
    nationalIncidentCount: string;
    vulnerabilityInVN: number;
    dangerLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  }
> = {
  authority: {
    pillar: 'psychology',
    realWorldScenarioVN: 'Kẻ gian mạo danh Cán bộ Điều tra, Viện Kiểm Sát hoặc Cục Thuế gọi điện đe dọa dính líu đến đường dây rửa tiền, yêu cầu cài App dịch vụ công giả mạo hoặc chuyển tiền vào "tài khoản tạm giữ".',
    protocolSteps: [
      'Ghi nhớ: Cơ quan công an và tư pháp không bao giờ làm việc, triệu tập hoặc lấy lời khai qua điện thoại hay Zalo.',
      'Yêu cầu giấy triệu tập chính thức gửi về địa chỉ cư trú hoặc mời trực tiếp lên trụ sở Công an Phường.',
      'Cúp máy ngay và tự chủ động tra cứu số điện thoại trực ban Công an địa phương để xác minh.',
    ],
    nationalIncidentCount: '42.150+ vụ báo cáo',
    vulnerabilityInVN: 68.4,
    dangerLevel: 'CRITICAL',
  },
  urgency: {
    pillar: 'psychology',
    realWorldScenarioVN: 'Thông báo tài khoản ngân hàng bị đăng nhập bất thường từ thiết bị lạ, yêu cầu bấm vào liên kết xác thực trong vòng 5 phút nếu không sẽ khóa thẻ vĩnh viễn.',
    protocolSteps: [
      'Áp dụng "Quy tắc 5 Phút Vàng": Không có bất kỳ giao dịch ngân hàng hợp pháp nào ép buộc xử lý ngay mà không có kênh đối chứng.',
      'Đặt điện thoại xuống, không bấm vào bất kỳ đường link nào gửi qua tin nhắn dồn ép.',
      'Mở ứng dụng ngân hàng chính thức trên điện thoại để kiểm tra mục Thông Báo Hệ Thống.',
    ],
    nationalIncidentCount: '58.900+ vụ báo cáo',
    vulnerabilityInVN: 72.1,
    dangerLevel: 'CRITICAL',
  },
  fear: {
    pillar: 'psychology',
    realWorldScenarioVN: 'Đe dọa khởi tố hình sự, dọa tung video cắt ghép nhạy cảm cho bạn bè và đồng nghiệp nếu không chuyển khoản tiền chuộc trong vòng 24 giờ.',
    protocolSteps: [
      'Nhận diện đòn tâm lý tống tiền: Kẻ gian luôn lợi dụng sự hoảng loạn ban đầu để ngăn bạn tư duy logic.',
      'Lưu lại toàn bộ ảnh chụp màn hình, số tài khoản nhận tiền và tin nhắn đe dọa làm chứng cứ.',
      'Chặn liên lạc ngay và báo cáo sự việc cho cơ quan công an hoặc Tổng đài An toàn An ninh Mạng.',
    ],
    nationalIncidentCount: '31.400+ vụ báo cáo',
    vulnerabilityInVN: 64.7,
    dangerLevel: 'HIGH',
  },
  greed: {
    pillar: 'psychology',
    realWorldScenarioVN: 'Mời làm nhiệm vụ xem video nhận 500k-1 triệu/ngày, đầu tư chứng khoán quốc tế cam kết lợi nhuận 30%/tháng, hoặc bẫy nhận thưởng trúng xe máy.',
    protocolSteps: [
      'Khắc sâu nguyên lý tài chính: Không tồn tại công việc hay kênh đầu tư nào "việc nhẹ - lợi nhuận cao - không rủi ro".',
      'Nếu được rút tiền lãi nhỏ ở 1-2 lần đầu, đó chỉ là mồi nhử để bạn nạp số tiền lớn hơn gấp hàng chục lần.',
      'Dứt khoát từ chối và thoát khỏi mọi hội nhóm Telegram/Zalo kêu gọi nạp tiền làm nhiệm vụ nâng cấp VIP.',
    ],
    nationalIncidentCount: '63.200+ vụ báo cáo',
    vulnerabilityInVN: 69.3,
    dangerLevel: 'CRITICAL',
  },
  isolation: {
    pillar: 'psychology',
    realWorldScenarioVN: 'Yêu cầu vào phòng kín, cắm tai nghe, tuyệt đối không được nói cho vợ/chồng/bố mẹ biết vì "đây là chuyên án tuyệt mật quốc gia" hoặc "sợ người nhà lo lắng".',
    protocolSteps: [
      'Nguyên tắc vàng: Khi bất kỳ ai yêu cầu bạn "GIỮ BÍ MẬT VỚI GIA ĐÌNH", 100% đó là kịch bản lừa đảo đang cô lập bạn.',
      'Mở cửa phòng ngay lập tức và kể lại toàn bộ nội dung cuộc gọi cho người thân cận hoặc bạn bè tin cậy.',
      'Góc nhìn của người thứ ba luôn là liều thuốc hóa giải hiệu quả nhất trước bẫy thao túng tâm lý.',
    ],
    nationalIncidentCount: '38.600+ vụ báo cáo',
    vulnerabilityInVN: 61.2,
    dangerLevel: 'HIGH',
  },
  emotional_stability: {
    pillar: 'psychology',
    realWorldScenarioVN: 'Kẻ lừa đảo liên tục thay đổi giọng điệu từ đe dọa gay gắt sang tỏ vẻ đồng cảm giúp đỡ ("Anh thấy em còn trẻ nên mới hỗ trợ né án phạt...") nhằm gây rối loạn cảm xúc.',
    protocolSteps: [
      'Nhận biết phản ứng cơ thể: Tim đập nhanh, toát mồ hôi, bối rối là tín hiệu bạn đang bị thao túng cảm xúc.',
      'Ngắt cuộc gọi bằng câu dứt khoát: "Tôi đang bận, tôi sẽ liên hệ lại sau" và cúp máy ngay.',
      'Dành 60 giây uống một ngụm nước và hít thở sâu trước khi đưa ra bất kỳ quyết định tài chính nào.',
    ],
    nationalIncidentCount: '29.800+ vụ báo cáo',
    vulnerabilityInVN: 55.4,
    dangerLevel: 'MEDIUM',
  },
  quishing_domain: {
    pillar: 'technical',
    realWorldScenarioVN: 'Dán đè mã QR độc hại tại điểm gửi xe, bàn ăn nhà hàng, hoặc gửi thông báo phạt nguội giả kèm QR dẫn đến trang web giả mạo ngân hàng (dạng vietcombank-ebank.online).',
    protocolSteps: [
      'Không quét mã QR dán lỏng lẻo hoặc có dấu hiệu dán đè ở nơi công cộng mà không hỏi lại nhân viên.',
      'Soi kỹ tên miền trên thanh địa chỉ trước khi xác nhận: Tên miền chính thống phải kết thúc bằng .vn, .com.vn hoặc thương hiệu chuẩn.',
      'Tuyệt đối không nhập mật khẩu Internet Banking hay mã OTP trên bất kỳ trang web nào mở ra từ mã QR lạ.',
    ],
    nationalIncidentCount: '47.500+ vụ báo cáo',
    vulnerabilityInVN: 74.8,
    dangerLevel: 'CRITICAL',
  },
  deepfake_ai: {
    pillar: 'technical',
    realWorldScenarioVN: 'Kẻ gian dùng AI mô phỏng khuôn mặt và giọng nói của người thân gọi video call chập chờn 5-10 giây kêu đang ở đồn cảnh sát/bệnh viện cần chuyển gấp 50 triệu.',
    protocolSteps: [
      'Yêu cầu người gọi thực hiện hành động kiểm chứng: Quay mặt góc 90 độ, vẫy tay ngang mặt hoặc đọc Mật Khẩu An Toàn Gia Đình.',
      'Cúp máy ngay và chủ động dùng số điện thoại viễn thông thông thường (SIM di động) gọi lại cho người thân.',
      'Nhận diện khuyết tật của AI: Nháy mắt không tự nhiên, viền mặt mờ nhòe, âm sắc giọng nói kim loại.',
    ],
    nationalIncidentCount: '36.700+ vụ báo cáo',
    vulnerabilityInVN: 67.2,
    dangerLevel: 'CRITICAL',
  },
  privacy_credential: {
    pillar: 'financial',
    realWorldScenarioVN: 'Mạo danh nhân viên nhà mạng viễn thông hoặc hỗ trợ ngân hàng yêu cầu đọc mã OTP gửi về máy để "nâng cấp Sim 5G" hoặc "hủy lệnh chuyển nhầm tiền".',
    protocolSteps: [
      'Nguyên tắc bất di bất dịch: Mã OTP và mã Smart OTP là chìa khóa két sắt cá nhân - Không bao giờ chia sẻ cho bất kỳ ai.',
      'Không chụp 2 mặt Căn cước công dân (CCCD) gửi lên các ứng dụng vay tiền online không rõ nguồn gốc.',
      'Nếu lỡ tiết lộ OTP, ngay lập tức gọi hotline khẩn cấp của ngân hàng để khóa tài khoản và dịch vụ e-Banking.',
    ],
    nationalIncidentCount: '52.300+ vụ báo cáo',
    vulnerabilityInVN: 63.5,
    dangerLevel: 'CRITICAL',
  },
  verification_reflex: {
    pillar: 'financial',
    realWorldScenarioVN: 'Nhận được tin nhắn từ tài khoản mạng xã hội của bạn bè/người thân nhờ chuyển tiền gấp vì đang kẹt việc, tài khoản nhận lại mang tên một người lạ.',
    protocolSteps: [
      'Nguyên tắc "Kênh Phụ Độc Lập": Luôn gọi trực tiếp bằng số điện thoại di động chính để xác minh người nhờ chuyển tiền.',
      'Nếu số tài khoản thụ hưởng khác tên người quen, 100% tài khoản mạng xã hội đó đã bị hack.',
      'Không tin vào bất kỳ lý do nào như "đây là tài khoản của bạn anh/đối tác" khi chưa được nghe giọng nói xác nhận.',
    ],
    nationalIncidentCount: '49.100+ vụ báo cáo',
    vulnerabilityInVN: 70.9,
    dangerLevel: 'CRITICAL',
  },
};

export const ScamDnaView: React.FC<ScamDnaViewProps> = ({
  userProfile,
  dnaProfile: initialDna,
  onNavigateToArena,
  onEarnXp,
}) => {
  // Navigation tabs: Core DNA is the primary, then secondary analysis sections
  const [activeSection, setActiveSection] = useState<'core' | 'comparison' | 'trends' | 'demographics'>('core');
  const [selectedPillar, setSelectedPillar] = useState<DnaPillarCategory>('all');
  const [activeDimensionKey, setActiveDimensionKey] = useState<ScamDnaDimensionKey>('authority');
  const [dnaProfile, setDnaProfile] = useState<ScamDnaProfile | null>(initialDna || null);
  const [communityDna, setCommunityDna] = useState<CommunityScamDna | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showPassportModal, setShowPassportModal] = useState(false);
  const [telemetryOptIn, setTelemetryOptIn] = useState(true);

  // Interactive Simulator Goals State
  const [simulatedDrills, setSimulatedDrills] = useState<Record<string, boolean>>({
    quishing: false,
    deepfake: false,
    authority: false,
    otp_defense: false,
  });

  // Fetch DNA and Community Data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const progRes = await fetch('/api/progress');
        if (progRes.ok) {
          const progData = await progRes.json();
          if (progData.dnaProfile) {
            setDnaProfile(progData.dnaProfile);
          }
        }

        const commRes = await fetch(`/api/scamdna/community?userScore=${initialDna?.overallScore || 82}`);
        if (commRes.ok) {
          const commJson = await commRes.json();
          if (commJson.data) {
            setCommunityDna(commJson.data);
          }
        }
      } catch (err) {
        console.warn('Scam DNA Data Load Error (handled):', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 4000);
    return () => clearInterval(interval);
  }, [initialDna?.overallScore]);

  // Pillar scores calculation
  const pillarScores = useMemo(() => {
    if (!dnaProfile) {
      return {
        psychology: { user: 78, community: 64, delta: 14 },
        technical: { user: 82, community: 58, delta: 24 },
        financial: { user: 86, community: 62, delta: 24 },
      };
    }

    const getAvg = (keys: ScamDnaDimensionKey[]) => {
      const matched = dnaProfile.dimensions.filter((d) => keys.includes(d.key));
      if (matched.length === 0) return { user: 75, community: 60, delta: 15 };
      const userSum = matched.reduce((acc, curr) => acc + curr.score, 0);
      const commSum = matched.reduce((acc, curr) => acc + curr.communityAverage, 0);
      const userAvg = Math.round(userSum / matched.length);
      const commAvg = Math.round(commSum / matched.length);
      return {
        user: userAvg,
        community: commAvg,
        delta: userAvg - commAvg,
      };
    };

    return {
      psychology: getAvg(['authority', 'urgency', 'fear', 'greed', 'isolation', 'emotional_stability']),
      technical: getAvg(['quishing_domain', 'deepfake_ai']),
      financial: getAvg(['privacy_credential', 'verification_reflex']),
    };
  }, [dnaProfile]);

  // Filtered dimensions based on selected pillar
  const displayedDimensions = useMemo(() => {
    if (!dnaProfile?.dimensions) return [];
    if (selectedPillar === 'all') return dnaProfile.dimensions;
    const targetPillar = PILLARS.find((p) => p.id === selectedPillar);
    if (!targetPillar) return dnaProfile.dimensions;
    return dnaProfile.dimensions.filter((d) => targetPillar.dimensionKeys.includes(d.key));
  }, [dnaProfile, selectedPillar]);

  // Active dimension details
  const activeDimension = useMemo(() => {
    if (!dnaProfile) return null;
    return (
      dnaProfile.dimensions.find((d) => d.key === activeDimensionKey) ||
      dnaProfile.dimensions[0]
    );
  }, [dnaProfile, activeDimensionKey]);

  // Active threat intel
  const activeThreatIntel = useMemo(() => {
    if (!activeDimension) return DIMENSION_THREAT_INTEL.authority;
    return DIMENSION_THREAT_INTEL[activeDimension.key] || DIMENSION_THREAT_INTEL.authority;
  }, [activeDimension]);

  // Simulated SDI Score
  const simulatedScore = useMemo(() => {
    const base = dnaProfile?.overallScore || 82;
    let bonus = 0;
    if (simulatedDrills.quishing) bonus += 4;
    if (simulatedDrills.deepfake) bonus += 5;
    if (simulatedDrills.authority) bonus += 4;
    if (simulatedDrills.otp_defense) bonus += 3;
    return Math.min(99, base + bonus);
  }, [dnaProfile?.overallScore, simulatedDrills]);

  // Handle Share / Copy Passport
  const handleSharePassport = () => {
    const score = dnaProfile?.overallScore || 82;
    const shareText = `HỒ SƠ BẢN ĐỒ GEN PHÒNG THỦ SCAM DNA
• Điểm Chỉ Số Phòng Vệ (SDI): ${score}/100
• Hình Mẫu: ${dnaProfile?.archetype?.title || 'Vệ Binh Tinh Nhuệ'}
• Trụ Cột Tâm Lý: ${pillarScores.psychology.user}/100
• Trụ Cột Kỹ Thuật & AI: ${pillarScores.technical.user}/100
• Trụ Cột Tài Chính: ${pillarScores.financial.user}/100
• Xếp hạng: Thuộc nhóm Top ${100 - (communityDna?.percentileRank || 84)}% người dùng có phản xạ tự vệ số tốt nhất toàn quốc.
Khảo sát và rèn luyện phản xạ phòng thủ tại ScamGuard!`;
    navigator.clipboard?.writeText(shareText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // SVG Radar Coordinates
  const radarData = useMemo(() => {
    if (!displayedDimensions || displayedDimensions.length === 0) return null;

    const dimensions = displayedDimensions;
    const numPoints = dimensions.length;
    const center = 160;
    const maxRadius = 110;
    const angleStep = (Math.PI * 2) / numPoints;

    // Grid webs (25%, 50%, 75%, 100%)
    const webs = [0.25, 0.5, 0.75, 1.0].map((level) => {
      const points = Array.from({ length: numPoints }).map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const r = maxRadius * level;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      });
      return points.join(' ');
    });

    // Axis lines and labels
    const axes = dimensions.map((dim, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const xEnd = center + maxRadius * Math.cos(angle);
      const yEnd = center + maxRadius * Math.sin(angle);
      const labelR = maxRadius + (numPoints <= 4 ? 32 : 24);
      const xLabel = center + labelR * Math.cos(angle);
      const yLabel = center + labelR * Math.sin(angle);

      return {
        key: dim.key,
        name: dim.label,
        angle,
        xEnd,
        yEnd,
        xLabel,
        yLabel,
        score: dim.score,
        commAvg: dim.communityAverage,
      };
    });

    // User polygon points
    const userPoints = dimensions.map((dim, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const rawScore = Number(dim.score);
      const safeScore = Number.isFinite(rawScore) ? rawScore : 50;
      const ratio = Math.max(0.12, Math.min(1, safeScore / 100));
      const r = maxRadius * ratio;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return { x, y, str: `${x.toFixed(1)},${y.toFixed(1)}`, score: safeScore, key: dim.key };
    });

    // Community polygon points
    const commPoints = dimensions.map((dim, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const rawComm = Number(dim.communityAverage);
      const safeComm = Number.isFinite(rawComm) ? rawComm : 50;
      const ratio = Math.max(0.12, Math.min(1, safeComm / 100));
      const r = maxRadius * ratio;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return { x, y, str: `${x.toFixed(1)},${y.toFixed(1)}`, score: safeComm, key: dim.key };
    });

    return {
      center,
      maxRadius,
      webs,
      axes,
      userPolygon: userPoints.map((p) => p.str).join(' '),
      userVertices: userPoints,
      commPolygon: commPoints.map((p) => p.str).join(' '),
      commVertices: commPoints,
    };
  }, [displayedDimensions]);

  // Top Strengths and Weaknesses Gap vs Community
  const comparisonInsights = useMemo(() => {
    if (!dnaProfile?.dimensions) return { topAdvantages: [], criticalGaps: [] };

    const deltas = dnaProfile.dimensions.map((d) => ({
      ...d,
      delta: d.score - d.communityAverage,
      intel: DIMENSION_THREAT_INTEL[d.key],
    }));

    const sortedByDelta = [...deltas].sort((a, b) => b.delta - a.delta);

    return {
      topAdvantages: sortedByDelta.slice(0, 3),
      criticalGaps: sortedByDelta.slice(-3).reverse(),
    };
  }, [dnaProfile]);

  return (
    <div id="scam-dna-root" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 text-slate-100">
      {/* 1. EXECUTIVE HERO HEADER */}
      <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6 sm:p-8 overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            {/* Unboxed Quiet Kicker */}
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Dna className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>HỆ THỐNG ĐỊNH DANH AN TOÀN SỐ</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">SCAMGUARD GENOME v3.5</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Bản Đồ Gen Phòng Thủ Số
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Khảo sát định lượng <strong className="text-white font-medium">năng lực phản xạ tự vệ số</strong> qua 3 trụ cột thiết yếu và 10 trục rủi ro thực chiến. Giúp bạn nhận diện chính xác các điểm mù tâm lý và rào chắn công nghệ trước các đợt tấn công lừa đảo tinh vi.
            </p>

            {/* Quiet Unboxed Metric Separator Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Chỉ số SDI:</span>
                <span className="text-emerald-400 font-bold tabular-nums text-sm">
                  {dnaProfile?.overallScore || 82}/100
                </span>
              </div>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Hình mẫu:</span>
                <span className="text-cyan-300 font-medium">
                  {dnaProfile?.archetype?.title || 'Vệ Binh Tinh Nhuệ'}
                </span>
              </div>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Phân vị quốc gia:</span>
                <span className="text-purple-300 font-medium">
                  Top {100 - (communityDna?.percentileRank || 84)}% cả nước
                </span>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={() => setShowPassportModal(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Hộ Chiếu Phòng Vệ Số</span>
            </button>

            <button
              onClick={handleSharePassport}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              <Share2 className="w-4 h-4 text-slate-400" />
              <span>{copiedLink ? 'Đã Sao Chép Kết Quả' : 'Sao Chép Báo Cáo'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. THREE CORE PILLARS OVERVIEW (Nền tảng trang trọng nhất) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>3 Trụ Cột Nền Tảng Của Hệ Thống Tự Vệ</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Nhấp vào từng trụ cột để lọc tức thời trên bản đồ radar và hồ sơ giám định
            </p>
          </div>

          <button
            onClick={() => setSelectedPillar('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              selectedPillar === 'all'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Tất cả 10 trục
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PILLARS.map((pillar) => {
            const PillarIcon = pillar.icon;
            const isSelected = selectedPillar === pillar.id;
            const scores = pillarScores[pillar.id as keyof typeof pillarScores];

            return (
              <div
                key={pillar.id}
                onClick={() => setSelectedPillar(isSelected ? 'all' : pillar.id)}
                className={`p-5 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-cyan-500/60 bg-slate-900/90 shadow-md ring-1 ring-cyan-500/20'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: pillar.badgeBg }}
                    >
                      <PillarIcon className="w-4 h-4" style={{ color: pillar.accentColor }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{pillar.shortName}</h3>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {pillar.dimensionKeys.length} trục khảo sát
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className="text-lg font-bold font-mono tabular-nums"
                      style={{ color: pillar.accentColor }}
                    >
                      {scores.user}/100
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      TB Toàn quốc: <span className="text-slate-400">{scores.community}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed line-clamp-2">
                  {pillar.description}
                </p>

                {/* Progress bar and delta indicator */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">So với trung bình quốc gia:</span>
                    <span
                      className={`font-semibold tabular-nums ${
                        scores.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {scores.delta >= 0 ? `+${scores.delta} điểm` : `${scores.delta} điểm`}
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      style={{ width: `${scores.user}%`, backgroundColor: pillar.accentColor }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. ELEGANT SEGMENTED SECTION NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="inline-flex p-1 bg-slate-900 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveSection('core')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              activeSection === 'core'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1. Bản Đồ Gen & Giám Định (Trọng tâm)
          </button>

          <button
            onClick={() => setActiveSection('comparison')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              activeSection === 'comparison'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2. Đối Chiếu Toàn Quốc ({communityDna?.totalParticipants ? communityDna.totalParticipants.toLocaleString('vi-VN') : '0'} mẫu)
          </button>

          <button
            onClick={() => setActiveSection('trends')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              activeSection === 'trends'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3. Xu Hướng 30 Ngày & Giả Lập
          </button>

          <button
            onClick={() => setActiveSection('demographics')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              activeSection === 'demographics'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            4. Nhân Khẩu Học Toàn Quốc
          </button>
        </div>

        <div className="text-xs text-slate-500 font-mono hidden md:block">
          {activeSection === 'core' && 'Phân tích phản xạ thực chiến và điểm mù'}
          {activeSection === 'comparison' && 'So sánh định lượng Bạn vs. Mẫu cộng đồng Việt Nam'}
          {activeSection === 'trends' && 'Biểu đồ tiến trình an ninh và công cụ nâng hạng'}
          {activeSection === 'demographics' && 'Thống kê rủi ro theo nhóm tuổi và thủ đoạn lừa đảo'}
        </div>
      </div>

      {/* 4. PRIMARY SECTION CONTENT */}
      {/* SECTION 1: CORE GENOME RADAR + FORENSIC DOSSIER (TRỌNG TÂM HAY NHẤT) */}
      {activeSection === 'core' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 5 Cols: Scientific Spider Radar Chart */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-cyan-400" />
                      <span>
                        Biểu Đồ Radar {selectedPillar === 'all' ? '10 Trục Phản Xạ' : PILLARS.find((p) => p.id === selectedPillar)?.shortName}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Bấm vào bất kỳ đỉnh nào để xem hồ sơ giám định</p>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
                      <span className="text-slate-300">Bạn</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" />
                      <span className="text-purple-300">Toàn quốc</span>
                    </div>
                  </div>
                </div>

                {/* SVG Visualizer */}
                <div className="relative flex justify-center items-center py-2 select-none">
                  {radarData && (
                    <svg
                      viewBox="0 0 320 320"
                      className="w-full max-w-[310px] h-auto overflow-visible"
                    >
                      <defs>
                        <radialGradient id="radarCenterSubtle" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.16" />
                          <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.06" />
                          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                        </radialGradient>
                      </defs>

                      {/* Central field */}
                      <circle cx={radarData.center} cy={radarData.center} r={115} fill="url(#radarCenterSubtle)" />

                      {/* Concentric webs */}
                      {radarData.webs.map((pts, idx) => (
                        <polygon
                          key={`web-${idx}`}
                          points={pts}
                          fill={idx === 3 ? 'rgba(224, 242, 254, 0.35)' : 'none'}
                          stroke={idx === 3 ? '#7dd3fc' : '#cbd5e1'}
                          strokeWidth={idx === 3 ? '1.5' : '1'}
                          strokeDasharray={idx === 3 ? 'none' : '2 3'}
                        />
                      ))}

                      {/* Radial axis lines */}
                      {radarData.axes.map((ax, idx) => (
                        <line
                          key={`axis-${idx}`}
                          x1={radarData.center}
                          y1={radarData.center}
                          x2={ax.xEnd}
                          y2={ax.yEnd}
                          stroke="#cbd5e1"
                          strokeWidth="1"
                        />
                      ))}

                      {/* Community Polygon */}
                      <polygon
                        points={radarData.commPolygon}
                        fill="rgba(147, 51, 234, 0.14)"
                        stroke="#9333ea"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                      />
                      {radarData.commVertices.map((v, i) => (
                        <circle
                          key={`comm-v-${i}`}
                          cx={v.x}
                          cy={v.y}
                          r={2.5}
                          fill="#9333ea"
                        />
                      ))}

                      {/* User Polygon */}
                      <polygon
                        points={radarData.userPolygon}
                        fill="rgba(2, 132, 199, 0.22)"
                        stroke="#0284c7"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      {radarData.userVertices.map((v, i) => {
                        const isSelected = v.key === activeDimensionKey;
                        return (
                          <g key={`user-v-${i}`}>
                            {isSelected && (
                              <circle
                                cx={v.x}
                                cy={v.y}
                                r={8}
                                fill="none"
                                stroke="#059669"
                                strokeWidth="1.5"
                                className="opacity-80"
                              />
                            )}
                            <circle
                              cx={v.x}
                              cy={v.y}
                              r={isSelected ? 5.5 : 3.5}
                              fill={isSelected ? '#059669' : '#0284c7'}
                              stroke="#ffffff"
                              strokeWidth="2"
                              className="cursor-pointer transition-transform hover:scale-125"
                              onClick={() => setActiveDimensionKey(v.key as ScamDnaDimensionKey)}
                            />
                          </g>
                        );
                      })}

                      {/* Axis text labels */}
                      {radarData.axes.map((ax) => {
                        const isSelected = ax.key === activeDimensionKey;
                        return (
                          <g
                            key={`label-${ax.key}`}
                            className="cursor-pointer transition-colors"
                            onClick={() => setActiveDimensionKey(ax.key as ScamDnaDimensionKey)}
                          >
                            <text
                              x={ax.xLabel}
                              y={ax.yLabel}
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill={isSelected ? '#0284c7' : '#0f172a'}
                              fontWeight={isSelected ? 'bold' : '600'}
                              className="text-[9px] font-mono transition-colors"
                            >
                              {ax.name}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  )}
                </div>

                {/* Dimension Quick Segmented Selector */}
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="text-[11px] font-mono text-slate-400 mb-2">
                    Chọn nhanh trục khảo sát:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {displayedDimensions.map((dim) => {
                      const isSelected = dim.key === activeDimensionKey;
                      return (
                        <button
                          key={dim.key}
                          onClick={() => setActiveDimensionKey(dim.key)}
                          className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                              : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          <span>{dim.label}</span>
                          <span
                            className={`text-[10px] tabular-nums font-bold ${
                              isSelected ? 'text-slate-900' : 'text-slate-400'
                            }`}
                          >
                            {dim.score}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Archetype & Personal Defense Profile Card */}
              {dnaProfile?.archetype && (
                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <Brain className="w-4 h-4 text-purple-400" />
                      <span>HÌNH MẪU PHÒNG THỦ CỦA BẠN</span>
                    </div>
                    <span className="text-xs font-semibold text-cyan-300">
                      {dnaProfile.archetype.title}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {dnaProfile.archetype.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                      <div className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Thế mạnh cốt lõi:</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        {dnaProfile.archetype.primaryStrength}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                      <div className="text-[11px] font-medium text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Điểm mù cần phòng bị:</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        {dnaProfile.archetype.blindspotAlert}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right 7 Cols: Forensic Threat Dossier & Prescriptive SOP */}
            <div className="lg:col-span-7 space-y-4">
              {activeDimension && (
                <motion.div
                  key={activeDimension.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="p-6 sm:p-7 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-6"
                >
                  {/* Header: Title, Level & Score */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                    <div className="space-y-1">
                      <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                        Trục Đánh Giá: {activeThreatIntel.pillar === 'psychology' ? 'Tâm Lý Hành Vi' : activeThreatIntel.pillar === 'technical' ? 'Kỹ Thuật & AI' : 'Tài Chính & Danh Tính'}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        {activeDimension.vietnameseName}
                      </h2>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold font-mono tabular-nums text-white">
                          {activeDimension.score}
                          <span className="text-xs text-slate-500 font-normal">/100</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          TB Toàn quốc: <span className="text-slate-400 tabular-nums">{activeDimension.communityAverage}</span>
                        </div>
                      </div>

                      <div
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                          activeDimension.level === 'OPTIMAL'
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50'
                            : activeDimension.level === 'MODERATE'
                            ? 'bg-cyan-950/40 text-cyan-400 border-cyan-800/50'
                            : activeDimension.level === 'VULNERABLE'
                            ? 'bg-amber-950/40 text-amber-400 border-amber-800/50'
                            : 'bg-rose-950/40 text-rose-400 border-rose-800/50'
                        }`}
                      >
                        {activeDimension.level === 'OPTIMAL'
                          ? 'Tối Ưu'
                          : activeDimension.level === 'MODERATE'
                          ? 'Vững Vàng'
                          : activeDimension.level === 'VULNERABLE'
                          ? 'Có Rủi Ro'
                          : 'Báo Động'}
                      </div>
                    </div>
                  </div>

                  {/* Visual Benchmarking Progress Bar */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-300">Phản xạ của bạn</span>
                        <span className="text-cyan-400 font-bold tabular-nums">{activeDimension.score}/100</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                        <div
                          style={{ width: `${activeDimension.score}%` }}
                          className="h-full rounded-full bg-cyan-400 transition-all duration-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-500">Trung bình người dùng toàn quốc</span>
                        <span className="text-purple-300 tabular-nums">{activeDimension.communityAverage}/100</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                        <div
                          style={{ width: `${activeDimension.communityAverage}%` }}
                          className="h-full rounded-full bg-purple-500/60"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                      <span>Tỷ lệ người Việt dễ sập bẫy trục này: <strong className="text-rose-400 font-semibold tabular-nums">{activeThreatIntel.vulnerabilityInVN}%</strong></span>
                      <span className={activeDimension.score >= activeDimension.communityAverage ? 'text-emerald-400' : 'text-amber-400'}>
                        {activeDimension.score >= activeDimension.communityAverage
                          ? `▲ Vượt mức trung bình +${activeDimension.score - activeDimension.communityAverage} đ`
                          : `▼ Thấp hơn mức trung bình ${activeDimension.communityAverage - activeDimension.score} đ`}
                      </span>
                    </div>
                  </div>

                  {/* 2 Dossier Quadrants: Real Scenario vs Psychological Exploit */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Quadrant 1: Real-world Scenario */}
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs font-medium text-rose-400">
                        <div className="flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-rose-400" />
                          <span>Kịch Bản Lừa Đảo Điển Hình</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          {activeThreatIntel.nationalIncidentCount}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {activeThreatIntel.realWorldScenarioVN}
                      </p>
                    </div>

                    {/* Quadrant 2: Psychological Mechanism */}
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
                        <Brain className="w-4 h-4 text-amber-400" />
                        <span>Điểm Yếu Tâm Lý Bị Khai Thác</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {activeDimension.psychologicalTrigger}
                      </p>
                    </div>
                  </div>

                  {/* 3-Step Defense Standard Operating Procedure (SOP) */}
                  <div className="p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                        <span>Quy Trình 3 Bước Phản Xạ Hóa Giải (SOP)</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">Chuẩn Khuyến Nghị An Toàn</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      {activeThreatIntel.protocolSteps.map((step, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1">
                          <div className="text-[11px] font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            <span>Bước {idx + 1}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-snug">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reflex Mantra & Training Action */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1">
                    <div className="flex-1 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                      <span className="text-[11px] font-mono text-emerald-400 block mb-0.5">
                        Thần chú phản xạ 3 giây vô điều kiện:
                      </span>
                      <span className="text-slate-200 font-medium italic">
                        "{activeDimension.improvementMantra}"
                      </span>
                    </div>

                    <button
                      onClick={() => onNavigateToArena?.(activeDimension.recommendedScenarioId)}
                      className="px-5 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
                    >
                      <Target className="w-4 h-4" />
                      <span>Luyện Tập Tình Huống Này</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Critical Blindspots Alert Strip */}
              {dnaProfile?.criticalBlindspots && dnaProfile.criticalBlindspots.length > 0 && (
                <div className="p-4 sm:p-5 rounded-xl border border-rose-900/40 bg-rose-950/20 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Cảnh Báo Điểm Mù Chí Mạng (Ưu Tiên Rèn Luyện Trước)</span>
                  </div>

                  <div className="space-y-2">
                    {dnaProfile.criticalBlindspots.map((blind, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{blind.dimension}</span>
                            <span className="text-[11px] font-mono text-rose-400">
                              {blind.score}/100
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">{blind.dangerSummary}</p>
                        </div>

                        <button
                          onClick={() => onNavigateToArena?.(blind.scenarioId)}
                          className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
                        >
                          <span>Hóa giải ngay</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: SIDE-BY-SIDE BENCHMARK & GAP ANALYSIS */}
      {activeSection === 'comparison' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <span>Bảng Đối Chiếu Song Song & Khoảng Cách An Toàn (Gap Analysis)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Đo lường mức độ chênh lệch giữa năng lực tự vệ của bạn với dữ liệu khảo sát thực tế toàn quốc
              </p>
            </div>

            <div className="text-xs font-mono text-slate-400">
              Độ tin cậy dữ liệu: <span className="text-emerald-400">99.8%</span>
            </div>
          </div>

          {/* Top 3 Strengths vs Top 3 Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top 3 Advantages */}
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>TOP 3 ĐIỂM VƯỢT TRỘI NHẤT SO VỚI CỘNG ĐỒNG</span>
              </div>

              <div className="space-y-2">
                {comparisonInsights.topAdvantages.map((adv, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-medium text-white">{adv.vietnameseName}</div>
                      <div className="text-[11px] font-mono text-slate-500">
                        Bạn: <span className="text-emerald-400 tabular-nums">{adv.score}</span> · Toàn quốc: <span className="tabular-nums">{adv.communityAverage}</span>
                      </div>
                    </div>
                    <div className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                      +{adv.delta} đ
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 3 Critical Gaps */}
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 font-mono">
                <AlertTriangle className="w-4 h-4" />
                <span>TOP 3 KHOẢNG CÁCH TỤT HẬU CẦN GIA CỐ</span>
              </div>

              <div className="space-y-2">
                {comparisonInsights.criticalGaps.map((gap, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-medium text-white">{gap.vietnameseName}</div>
                      <div className="text-[11px] font-mono text-slate-500">
                        Bạn: <span className="text-rose-400 tabular-nums">{gap.score}</span> · Toàn quốc: <span className="tabular-nums">{gap.communityAverage}</span>
                      </div>
                    </div>
                    <div className="text-xs font-mono font-bold text-rose-400 tabular-nums">
                      {gap.delta} đ
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed 10-Dimension Matrix Table */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4 overflow-x-auto">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Ma Trận Đánh Giá 10 Trục Rủi Ro Chi Tiết</span>
            </h3>

            <table className="w-full text-left border-collapse min-w-[620px]">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Trục Rủi Ro</th>
                  <th className="py-2.5 px-3">Trụ Cột</th>
                  <th className="py-2.5 px-3 text-center">Bạn</th>
                  <th className="py-2.5 px-3 text-center">Toàn Quốc</th>
                  <th className="py-2.5 px-3 text-center">Độ Lệch (Δ)</th>
                  <th className="py-2.5 px-3 text-center">Trạng Thái</th>
                  <th className="py-2.5 px-3 text-right">Rèn Luyện</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {dnaProfile?.dimensions.map((dim) => {
                  const delta = dim.score - dim.communityAverage;
                  const intel = DIMENSION_THREAT_INTEL[dim.key];

                  return (
                    <tr
                      key={dim.key}
                      onClick={() => {
                        setActiveDimensionKey(dim.key);
                        setActiveSection('core');
                      }}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-3 font-medium text-white">
                        {dim.vietnameseName}
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        {intel?.pillar === 'psychology'
                          ? 'Tâm Lý'
                          : intel?.pillar === 'technical'
                          ? 'Kỹ Thuật'
                          : 'Tài Chính'}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-cyan-400 tabular-nums">
                        {dim.score}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-400 tabular-nums">
                        {dim.communityAverage}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-semibold tabular-nums">
                        <span className={delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {delta >= 0 ? `+${delta}` : delta}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[11px] font-medium ${
                            dim.level === 'OPTIMAL'
                              ? 'text-emerald-400'
                              : dim.level === 'MODERATE'
                              ? 'text-cyan-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {dim.level === 'OPTIMAL' ? 'Tối ưu' : dim.level === 'MODERATE' ? 'Khá' : 'Cần chú ý'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToArena?.(dim.recommendedScenarioId);
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
                        >
                          Tập ngay
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: 30-DAY TRENDS & SCORE UPGRADE SIMULATOR */}
      {activeSection === 'trends' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Tiến Trình Phát Triển Phòng Vệ 30 Ngày</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Quan sát sự thay đổi của phản xạ tự vệ và mức độ hạ giảm rủi ro theo thời gian
              </p>
            </div>
          </div>

          {/* 30-Day Trend Chart Component */}
          <ScamDnaTrendChart
            dnaProfile={dnaProfile}
            onNavigateToArena={onNavigateToArena}
          />

          {/* Upgrade Simulator Widget */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 font-mono">
                <Target className="w-4 h-4" />
                <span>CÔNG CỤ GIẢ LẬP NÂNG HẠNG CHỈ SỐ SDI</span>
              </div>
              <div className="text-xs font-mono text-emerald-400">
                SDI Dự kiến: <strong className="text-base tabular-nums">{simulatedScore}</strong>/100
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Chọn các mục tiêu thực chiến bạn dự kiến hoàn thành để ước tính mức độ bứt phá năng lực phòng vệ:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer text-xs text-slate-300 hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={simulatedDrills.quishing}
                  onChange={(e) => setSimulatedDrills({ ...simulatedDrills, quishing: e.target.checked })}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span className="flex-1">Vượt qua 5 bài soi mã QR Quishing</span>
                <span className="font-mono text-cyan-400 tabular-nums">+4 SDI</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer text-xs text-slate-300 hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={simulatedDrills.deepfake}
                  onChange={(e) => setSimulatedDrills({ ...simulatedDrills, deepfake: e.target.checked })}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span className="flex-1">Nhận diện 3 video AI Deepfake</span>
                <span className="font-mono text-cyan-400 tabular-nums">+5 SDI</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer text-xs text-slate-300 hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={simulatedDrills.authority}
                  onChange={(e) => setSimulatedDrills({ ...simulatedDrills, authority: e.target.checked })}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span className="flex-1">Hóa giải bẫy Công An giả mạo</span>
                <span className="font-mono text-cyan-400 tabular-nums">+4 SDI</span>
              </label>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/80">
              <span>Xếp hạng mới ước tính:</span>
              <strong className="text-white">
                {simulatedScore >= 90 ? 'Thuộc Top 3% Quốc Gia' : simulatedScore >= 85 ? 'Thuộc Top 8% Quốc Gia' : 'Thuộc Top 15% Quốc Gia'}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: DEMOGRAPHIC INTELLIGENCE & NATIONAL VULNERABILITIES */}
      {activeSection === 'demographics' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Báo Cáo Tình Báo Rủi Ro Theo Nhóm Nhân Khẩu Học</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Dữ liệu khảo sát diện rộng về các điểm yếu phòng thủ phổ biến tại Việt Nam
              </p>
            </div>

            <div className="text-xs font-mono text-slate-400">
              Điểm TB Toàn Quốc: <span className="text-purple-300 font-bold">{communityDna?.overallCommunityAverage || 64}/100</span>
            </div>
          </div>

          {/* Demographic Breakdown Columns */}
          {communityDna && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {communityDna.demographicBreakdown.map((demo, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{demo.group}</span>
                    <span className="text-xs font-mono font-bold text-slate-300 tabular-nums">
                      {demo.averageScore}/100
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      style={{ width: `${demo.averageScore}%`, backgroundColor: demo.color }}
                      className="h-full rounded-full"
                    />
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono">
                    Cỡ mẫu: <span className="text-slate-400">{demo.sampleCount.toLocaleString('vi-VN')} người dùng</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                    <div className="text-amber-400 font-medium flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Điểm yếu phổ biến nhất:</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{demo.criticalWeakness}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Top 5 National Vulnerabilities */}
          {communityDna && (
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400" />
                <span>Top 5 Đòn Tâm Lý Khiến Người Việt Nam Dễ Sập Bẫy Nhất</span>
              </h3>

              <div className="space-y-2">
                {communityDna.topVulnerabilitiesNational.map((vuln, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-500">0{idx + 1}.</span>
                        <span className="font-semibold text-white">{vuln.label}</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {vuln.trend === 'rising' ? '▲ Đang gia tăng' : '● Ổn định'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{vuln.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-bold font-mono text-rose-400 tabular-nums">
                        {vuln.vulnerabilityRate}%
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">người dùng mắc bẫy</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy & Anonymous Telemetry Card */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="font-medium text-white flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Đóng Góp Dữ Liệu Khảo Sát Ẩn Danh Vì An Toàn Cộng Đồng</span>
              </div>
              <p className="text-[11px] text-slate-400 max-w-xl">
                Kết quả luyện tập của bạn được mã hóa một chiều nhằm cập nhật dữ liệu phòng vệ quốc gia, hỗ trợ bảo vệ trẻ em và người lớn tuổi.
              </p>
            </div>

            <label className="inline-flex items-center cursor-pointer select-none shrink-0">
              <input
                type="checkbox"
                checked={telemetryOptIn}
                onChange={(e) => setTelemetryOptIn(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              <span className="ml-2.5 text-xs font-mono text-slate-400">
                {telemetryOptIn ? 'Đang bật' : 'Đã tắt'}
              </span>
            </label>
          </div>
        </div>
      )}

      {/* 5. PRESTIGIOUS DIGITAL DEFENSE PASSPORT MODAL */}
      <AnimatePresence>
        {showPassportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-medium">
                  <Award className="w-4 h-4" />
                  <span>HỘ CHIẾU PHÒNG VỆ SỐ</span>
                </div>
                <button
                  onClick={() => setShowPassportModal(false)}
                  className="text-xs text-slate-400 hover:text-white font-mono px-2 py-1 rounded bg-slate-900 border border-slate-800 cursor-pointer"
                >
                  Đóng
                </button>
              </div>

              {/* Certificate Card Body */}
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Chủ sở hữu</div>
                    <div className="text-sm font-bold text-white">{userProfile.name || 'Người Dùng ScamGuard'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Chỉ số SDI</div>
                    <div className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                      {dnaProfile?.overallScore || 82}/100
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono pt-1">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <div className="text-purple-400 font-medium">TÂM LÝ</div>
                    <div className="text-sm font-bold text-white tabular-nums mt-0.5">{pillarScores.psychology.user}</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <div className="text-sky-400 font-medium">KỸ THUẬT</div>
                    <div className="text-sm font-bold text-white tabular-nums mt-0.5">{pillarScores.technical.user}</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <div className="text-emerald-400 font-medium">TÀI CHÍNH</div>
                    <div className="text-sm font-bold text-white tabular-nums mt-0.5">{pillarScores.financial.user}</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Hình mẫu: {dnaProfile?.archetype?.title || 'Vệ Binh Tinh Nhuệ'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {dnaProfile?.archetype?.subtitle || 'Phản xạ cảnh giác công nghệ cao và bảo vệ dữ liệu độc lập.'}
                  </p>
                </div>
              </div>

              {/* Modal Action */}
              <button
                onClick={handleSharePassport}
                className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>{copiedLink ? 'Đã Sao Chép Kết Quả' : 'Sao Chép Báo Cáo Chia Sẻ'}</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
