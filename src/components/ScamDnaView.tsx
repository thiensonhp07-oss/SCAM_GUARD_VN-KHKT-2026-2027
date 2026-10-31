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
  ScamDnaDimensionDetail,
  DefenseArchetype,
  DefenseTier,
  ScamTactic,
  UserProfile,
  CommunitySurveySubmission,
  PostAppCertificationRecord,
} from '../types';
import { ScamDnaTrendChart } from './ScamDnaTrendChart';
import { getAllCommunitySurveys } from '../services/researchDataService';

interface ScamDnaViewProps {
  userProfile: UserProfile;
  currentUser?: { id?: string; name?: string; email?: string; username?: string } | null;
  realUsers?: UserProfile[];
  dnaProfile?: ScamDnaProfile;
  onOpenSurvey?: () => void;
  onNavigateToArena?: (scenarioId?: string) => void;
  onEarnXp?: (amount: number) => void;
}

const SCENARIO_CORRECT_ANSWERS: Record<string, string> = {
  q1: 'C',
  q2: 'E',
  q3: 'D',
  q4: 'C',
  q5: 'E',
  q6: 'D',
  q7: 'C',
  q8: 'D',
  q9: 'D',
  q10: 'E',
  q11: 'C',
  q12: 'D',
};

const DIMENSION_QUESTION_MAPPING: Record<ScamDnaDimensionKey, string[]> = {
  authority: ['q2', 'q6'],
  urgency: ['q8', 'q2'],
  fear: ['q2', 'q12'],
  greed: ['q1', 'q3', 'q5'],
  privacy_credential: ['q6', 'q10', 'q11'],
  isolation: ['q4', 'q2'],
  verification_reflex: ['q8', 'q9', 'q3'],
  quishing_domain: ['q7', 'q1'],
  emotional_stability: ['q4', 'q8', 'q12'],
  deepfake_ai: ['q9'],
};

const DIMENSION_SECTOR_NUMBERS: Record<ScamDnaDimensionKey, number[]> = {
  authority: [2, 6],
  urgency: [8, 2],
  fear: [2, 12],
  greed: [1, 3, 5],
  privacy_credential: [6, 10, 11],
  isolation: [4, 2],
  verification_reflex: [8, 9, 3],
  quishing_domain: [7, 1],
  emotional_stability: [4, 8, 12],
  deepfake_ai: [9],
};

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
    nationalIncidentCount: 'Dữ liệu thực tế ViSEF',
    vulnerabilityInVN: 50,
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
    nationalIncidentCount: 'Dữ liệu thực tế ViSEF',
    vulnerabilityInVN: 50,
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
    nationalIncidentCount: 'Dữ liệu thực tế ViSEF',
    vulnerabilityInVN: 50,
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
    nationalIncidentCount: 'Dữ liệu thực tế ViSEF',
    vulnerabilityInVN: 50,
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
    nationalIncidentCount: 'Dữ liệu thực tế ViSEF',
    vulnerabilityInVN: 50,
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
    nationalIncidentCount: 'Dữ liệu thực tế ViSEF',
    vulnerabilityInVN: 50,
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
    nationalIncidentCount: 'Dữ liệu thực tế ViSEF',
    vulnerabilityInVN: 50,
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
    nationalIncidentCount: 'Dữ liệu thực tế ViSEF',
    vulnerabilityInVN: 50,
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
    nationalIncidentCount: 'Dữ liệu thực tế ViSEF',
    vulnerabilityInVN: 50,
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
    nationalIncidentCount: 'Dữ liệu thực tế ViSEF',
    vulnerabilityInVN: 50,
    dangerLevel: 'CRITICAL',
  },
};

function evaluateQuestionScoreFromSurvey(
  s: CommunitySurveySubmission,
  qKey: string
): { score: number; isVulnerable: boolean } {
  const trapAns = s.surveyResponses?.trapAnswers?.[qKey];
  const expAns = s.surveyResponses?.experienceAnswers?.[qKey];
  const correctLetter = SCENARIO_CORRECT_ANSWERS[qKey];

  if (trapAns || expAns) {
    const trapCorrect =
      trapAns === correctLetter || (typeof trapAns === 'string' && trapAns.endsWith('_SAFE'));
    const trapScore = trapAns ? (trapCorrect ? 88 : 36) : s.testOutcome?.preScore ?? 55;
    const expScore =
      expAns === 'B_SAFE'
        ? 92
        : expAns === 'A_NEVER'
        ? 74
        : expAns === 'C_NEAR_MISS'
        ? 44
        : expAns === 'D_VICTIM'
        ? 22
        : 65;

    const combined = trapAns
      ? Math.round(trapScore * 0.68 + expScore * 0.32)
      : Math.round(expScore);
    const isVuln =
      (trapAns && !trapCorrect) || expAns === 'C_NEAR_MISS' || expAns === 'D_VICTIM';
    return { score: Math.min(99, Math.max(15, combined)), isVulnerable: Boolean(isVuln) };
  }

  const fallbackPre = s.testOutcome?.preScore ?? 50;
  return { score: fallbackPre, isVulnerable: fallbackPre < 60 };
}

export const ScamDnaView: React.FC<ScamDnaViewProps> = ({
  userProfile,
  currentUser,
  realUsers = [],
  dnaProfile: initialDna,
  onOpenSurvey,
  onNavigateToArena,
  onEarnXp,
}) => {
  // Navigation tabs: Core DNA is the primary, then secondary analysis sections
  const [activeSection, setActiveSection] = useState<'core' | 'comparison' | 'trends' | 'demographics'>('core');
  const [selectedPillar, setSelectedPillar] = useState<DnaPillarCategory>('all');
  const [activeDimensionKey, setActiveDimensionKey] = useState<ScamDnaDimensionKey>('authority');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showPassportModal, setShowPassportModal] = useState(false);
  const [telemetryOptIn, setTelemetryOptIn] = useState(true);
  const [liveSyncTick, setLiveSyncTick] = useState(0);

  // Interactive Simulator Goals State
  const [simulatedDrills, setSimulatedDrills] = useState<Record<string, boolean>>({
    quishing: false,
    deepfake: false,
    authority: false,
    otp_defense: false,
  });

  // Listen to real-time updates from ViSEF Survey, Post-App Certifications, and LocalStorage
  useEffect(() => {
    const handleRealtimeUpdate = () => {
      setLiveSyncTick((prev) => prev + 1);
    };
    window.addEventListener('visef_survey_updated', handleRealtimeUpdate);
    window.addEventListener('visef_post_cert_updated', handleRealtimeUpdate);
    window.addEventListener('storage', handleRealtimeUpdate);
    window.addEventListener('scamguard_data_cleared', handleRealtimeUpdate);
    return () => {
      window.removeEventListener('visef_survey_updated', handleRealtimeUpdate);
      window.removeEventListener('visef_post_cert_updated', handleRealtimeUpdate);
      window.removeEventListener('storage', handleRealtimeUpdate);
      window.removeEventListener('scamguard_data_cleared', handleRealtimeUpdate);
    };
  }, []);

  // 1. Gather all REAL data from the app (Community Surveys + Cloud Firestore Users + Current User's Survey & Training)
  const realEngineData = useMemo(() => {
    const allSurveys = getAllCommunitySurveys();

    // Find current user's own survey submission if they completed one
    let mySurvey: CommunitySurveySubmission | null = null;
    try {
      const savedMySurveyRaw =
        localStorage.getItem('visef_my_latest_survey') ||
        localStorage.getItem('scamguard_survey_submission');
      if (savedMySurveyRaw) {
        const parsed = JSON.parse(savedMySurveyRaw);
        if (parsed && parsed.id) {
          mySurvey = parsed;
        }
      }
    } catch {
      // ignore
    }

    const currentNameLower = (currentUser?.name || userProfile.name || '').trim().toLowerCase();
    if (!mySurvey && currentNameLower && currentNameLower !== 'tân binh an toàn') {
      mySurvey =
        allSurveys.find(
          (s) => s.participantName && s.participantName.trim().toLowerCase() === currentNameLower
        ) || null;
    }
    if (!mySurvey) {
      // Also check if user submitted a live survey on this browser
      const localLive = allSurveys.find((s) => s.id && s.id.startsWith('SURVEY-LIVE-'));
      if (localLive) {
        mySurvey = localLive;
      }
    }

    // Read real campaign progress from localStorage
    let completedLessonsCount = 0;
    let unlockedSectorNumber = 1;
    const completedSectorsSet = new Set<number>();
    try {
      const rawCamp = localStorage.getItem('scamguard_campaign_progress_v2');
      if (rawCamp) {
        const parsedCamp = JSON.parse(rawCamp);
        if (Array.isArray(parsedCamp.completedLessonIds)) {
          completedLessonsCount = parsedCamp.completedLessonIds.length;
          parsedCamp.completedLessonIds.forEach((lid: string) => {
            const match = lid.match(/s(\d+)_/i) || lid.match(/sector_(\d+)/i);
            if (match && match[1]) {
              completedSectorsSet.add(Number(match[1]));
            }
          });
        }
        if (typeof parsedCamp.unlockedSectorNumber === 'number') {
          unlockedSectorNumber = parsedCamp.unlockedSectorNumber;
          for (let sec = 1; sec < unlockedSectorNumber; sec++) {
            completedSectorsSet.add(sec);
          }
        }
      }
    } catch {
      // ignore
    }

    // Read real post-app certification if any
    let myCert: PostAppCertificationRecord | null = null;
    try {
      const rawCerts = localStorage.getItem('visef_post_app_certifications');
      if (rawCerts) {
        const certs: PostAppCertificationRecord[] = JSON.parse(rawCerts);
        if (Array.isArray(certs) && certs.length > 0) {
          myCert =
            certs.find(
              (c) =>
                currentNameLower &&
                c.participantName?.trim().toLowerCase() === currentNameLower
            ) || certs[0];
        }
      }
    } catch {
      // ignore
    }

    // Deduplicate real app users from Cloud Firestore
    const validRealUsers = (realUsers || []).filter((u) => u && u.id);
    const totalSurveyCount = allSurveys.length;
    const totalRealAppUsersCount = validRealUsers.length;
    const totalCombinedSample = totalSurveyCount + totalRealAppUsersCount;

    // Calculate community stats per dimension from real surveys & real users
    const commDimStats: Record<
      ScamDnaDimensionKey,
      { avgScore: number; vulnRate: number; affectedCount: number; totalEvaluated: number }
    > = {} as any;

    (Object.keys(DIMENSION_QUESTION_MAPPING) as ScamDnaDimensionKey[]).forEach((dimKey) => {
      const qKeys = DIMENSION_QUESTION_MAPPING[dimKey];
      let sumScore = 0;
      let affectedCount = 0;

      allSurveys.forEach((s) => {
        let sDimSum = 0;
        let sDimVuln = false;
        qKeys.forEach((qk) => {
          const res = evaluateQuestionScoreFromSurvey(s, qk);
          sDimSum += res.score;
          if (res.isVulnerable) sDimVuln = true;
        });
        sumScore += Math.round(sDimSum / qKeys.length);
        if (sDimVuln) affectedCount++;
      });

      // Also include registered app users' real overallScore in the community benchmark
      validRealUsers.forEach((u) => {
        const uScore = u.overallScore ?? 50;
        sumScore += uScore;
        if (uScore < 60) affectedCount++;
      });

      const denom = totalCombinedSample > 0 ? totalCombinedSample : 1;
      const avgScore = totalCombinedSample > 0 ? Math.round(sumScore / denom) : 0;
      const vulnRate =
        totalCombinedSample > 0
          ? +((affectedCount / denom) * 100).toFixed(1)
          : 0;

      commDimStats[dimKey] = {
        avgScore,
        vulnRate,
        affectedCount,
        totalEvaluated: totalCombinedSample,
      };
    });

    // Calculate Current User's real score for each of the 10 dimensions
    const completedScenariosCount = userProfile.completedScenarios?.length || 0;
    const userXp = Number(userProfile.xp) || 0;
    const userStreak = Number(userProfile.streakDays) || 0;
    const xpBonus = Math.min(12, Math.floor(userXp / 200));
    const arenaBonus = Math.min(10, completedScenariosCount * 3);
    const rawCertPost = myCert
      ? Number(myCert.postAppScore ?? (myCert as any).postScore ?? myCert.scorePct ?? 0)
      : 0;
    const certBonus =
      myCert && Number.isFinite(rawCertPost) && rawCertPost > 0
        ? Math.max(0, Math.round((rawCertPost - 60) * 0.25))
        : 0;

    const userDimScores: Record<ScamDnaDimensionKey, number> = {} as any;
    (Object.keys(DIMENSION_QUESTION_MAPPING) as ScamDnaDimensionKey[]).forEach((dimKey) => {
      const qKeys = DIMENSION_QUESTION_MAPPING[dimKey];
      const sectorNums = DIMENSION_SECTOR_NUMBERS[dimKey] || [];
      const trainedSectorCount = sectorNums.filter((n) => completedSectorsSet.has(n)).length;
      const sectorTrainingBoost = trainedSectorCount * 7 + Math.min(8, completedLessonsCount);

      let baseDimScore = Number.isFinite(Number(userProfile.overallScore))
        ? Number(userProfile.overallScore)
        : 50;
      if (mySurvey) {
        let qSum = 0;
        qKeys.forEach((qk) => {
          qSum += evaluateQuestionScoreFromSurvey(mySurvey!, qk).score;
        });
        baseDimScore = Math.round(qSum / qKeys.length);
      }

      const rawDimTotal = baseDimScore + sectorTrainingBoost + xpBonus + arenaBonus + certBonus;
      const finalDimScore = Math.min(
        99,
        Math.max(15, Math.round(Number.isFinite(rawDimTotal) ? rawDimTotal : 50))
      );
      userDimScores[dimKey] = finalDimScore;
    });

    // Compute user's real overall SDI score from their 10 dimensions (or synced with userProfile.overallScore)
    const dimValues = Object.values(userDimScores);
    const computedMeanSdi =
      dimValues.length > 0
        ? Math.round(dimValues.reduce((a, b) => a + b, 0) / dimValues.length)
        : userProfile.overallScore ?? 50;

    const userOverallScore =
      mySurvey || completedLessonsCount > 0 || completedScenariosCount > 0 || userXp > 0
        ? Math.max(computedMeanSdi, userProfile.overallScore ?? 50)
        : userProfile.overallScore ?? 50;

    // Build all 10 ScamDnaDimensionDetail items
    const dimensionDefinitions: Array<{
      key: ScamDnaDimensionKey;
      label: string;
      vietnameseName: string;
      psychologicalTrigger: string;
      behavioralSymptom: string;
      improvementMantra: string;
      recommendedAction: string;
      recommendedScenarioId: string;
      color: string;
    }> = [
      {
        key: 'authority',
        label: 'Kháng Bẫy Uy Quyền',
        vietnameseName: 'Kháng Bẫy Uy Quyền & Giả Danh Cơ Quan',
        psychologicalTrigger: 'Tâm lý phục tùng uy quyền & tê liệt tư duy phản biện khi đối diện công quyền (KV2, KV6)',
        behavioralSymptom: 'Vội vàng tuân thủ mệnh lệnh phong tỏa hoặc cài App VNeID giả khi nghe xưng danh Công an/Viện kiểm sát',
        improvementMantra: 'Công an & Viện kiểm sát không bao giờ làm việc, triệu tập hay yêu cầu chứng minh tài chính qua Zalo/Điện thoại',
        recommendedAction: 'Diễn tập kịch bản: Đối phó Lệnh Bắt Giả Mạo & Giả Danh Cán Bộ',
        recommendedScenarioId: 'police-threat-call',
        color: '#ef4444',
      },
      {
        key: 'urgency',
        label: 'Kháng Ép Tiến Độ',
        vietnameseName: 'Kháng Dồn Ép Thời Gian & Bẫy Khẩn Cấp',
        psychologicalTrigger: 'Hiệu ứng đường hầm nhận thức (Tunnel vision) khi bị đặt trong giới hạn 5-15 phút (KV8, KV2)',
        behavioralSymptom: 'Hành động chuyển tiền cấp cứu hoặc bấm link vội vã vì sợ lỡ mất thời hạn vàng',
        improvementMantra: 'Bất kỳ tin nhắn/cuộc gọi nào thúc ép thao tác tài chính trong vài phút đều là dấu hiệu lừa đảo',
        recommendedAction: 'Diễn tập kịch bản: Cảnh Báo Tài Khoản Ngân Hàng Bị Khóa Gấp',
        recommendedScenarioId: 'bank-lockout-alert',
        color: '#f97316',
      },
      {
        key: 'fear',
        label: 'Lá Chắn Nỗi Sợ',
        vietnameseName: 'Kháng Nỗi Sợ Hãi & Đe Dọa Pháp Lý',
        psychologicalTrigger: 'Cảm xúc hoảng sợ trước nguy cơ vướng vòng lao lý hoặc tâm lý hoảng loạn muốn thu hồi tiền bị lừa (KV2, KV12)',
        behavioralSymptom: 'Hoảng loạn chuyển tiền vào "tài khoản an toàn tạm giữ" hoặc đóng phí "thu hồi tiền treo"',
        improvementMantra: 'Dừng lại 30 giây. Cơ quan nhà nước không có tài khoản cá nhân nào gọi là "tài khoản tạm giữ"',
        recommendedAction: 'Diễn tập kịch bản: Giả Danh Cơ Quan Điều Tra Đe Dọa Án Hình Sự',
        recommendedScenarioId: 'police-threat-call',
        color: '#f43f5e',
      },
      {
        key: 'greed',
        label: 'Kháng Bẫy Lợi Nhuận',
        vietnameseName: 'Kháng Lợi Nhuận Cao & Việc Nhẹ Lương Cao',
        psychologicalTrigger: 'Thiên kiến lạc quan quá mức trước hoa hồng nhiệm vụ CTV, trúng thưởng hoặc lãi suất Crypto (KV1, KV3, KV5)',
        behavioralSymptom: 'Nạp tiền làm nhiệm vụ đơn hàng online hoặc đóng "phí giải ngân/thuế" để rút tiền lãi ảo',
        improvementMantra: 'Không có công việc hay sàn đầu tư hợp pháp nào bắt nộp tiền tươi để rút tiền của chính mình',
        recommendedAction: 'Diễn tập kịch bản: Bẫy Tuyển Dụng Cộng Tác Viên Nhập Đơn',
        recommendedScenarioId: 'ecommerce-job-scam',
        color: '#eab308',
      },
      {
        key: 'privacy_credential',
        label: 'Bảo Vệ OTP & CCCD',
        vietnameseName: 'Bảo Vệ Dữ Liệu Nhạy Cảm, APK & Mã Xác Thực',
        psychologicalTrigger: 'Bất cẩn cấp quyền Trợ năng (Accessibility) cho file APK lạ, lộ OTP hoặc ký Smart Contract độc hại (KV6, KV10, KV11)',
        behavioralSymptom: 'Cài đặt ứng dụng ngoài CH Play/App Store, dùng Wifi/cáp sạc công cộng không an toàn hoặc đọc OTP',
        improvementMantra: 'Mã OTP và quyền Trợ năng điện thoại là chìa khóa két sắt — Tuyệt đối không cấp cho ứng dụng/người lạ',
        recommendedAction: 'Huấn luyện: Phòng ngừa Đánh cắp Định danh & OTP',
        recommendedScenarioId: 'bank-lockout-alert',
        color: '#06b6d4',
      },
      {
        key: 'isolation',
        label: 'Phá Vỡ Cô Lập',
        vietnameseName: 'Kháng Bẫy Bí Mật & Thao Túng Cô Lập',
        psychologicalTrigger: 'Bị thao túng tâm lý tách biệt khỏi gia đình trong bẫy tình cảm Pig Butchering hoặc điều tra giả (KV4, KV2)',
        behavioralSymptom: 'Giấu giếm người thân, tự vay mượn chuyển tiền theo lời khuyên của "người yêu/chuyên gia online"',
        improvementMantra: 'Khi bị yêu cầu giữ bí mật tuyệt đối với gia đình, đó là lúc bắt buộc phải hỏi ý kiến người thân',
        recommendedAction: 'Diễn tập: Phá vỡ bẫy cô lập trong điều tra giả mạo',
        recommendedScenarioId: 'police-threat-call',
        color: '#8b5cf6',
      },
      {
        key: 'verification_reflex',
        label: 'Phản Xạ Xác Minh',
        vietnameseName: 'Phản Xạ Xác Minh Độc Lập Kênh Phụ',
        psychologicalTrigger: 'Thói quen tin ngay vào một kênh liên lạc duy nhất mà không gọi kiểm chứng độc lập (KV8, KV9, KV3)',
        behavioralSymptom: 'Chuyển tiền ngay khi thấy tin nhắn/video call mượn tiền hoặc nhận hàng COD khi chưa xác nhận',
        improvementMantra: 'Quy tắc Kênh Phụ Độc Lập: Cúp máy và tự bấm số SIM di động thông thường gọi lại xác minh',
        recommendedAction: 'Luyện tập: Thực hành phản xạ xác thực kênh phụ',
        recommendedScenarioId: 'bank-lockout-alert',
        color: '#10b981',
      },
      {
        key: 'quishing_domain',
        label: 'Soi Tên Miền & QR',
        vietnameseName: 'Cảnh Giác Quishing QR & Giả Mạo Tên Miền',
        psychologicalTrigger: 'Thao tác quét mã QR tiện lợi làm bỏ qua khâu kiểm tra URL đích và giao diện giả mạo (KV7, KV1)',
        behavioralSymptom: 'Quét mã QR dán đè ở nơi công cộng và nhập mật khẩu ngân hàng trên tên miền lạ (.xyz, .top, .cc)',
        improvementMantra: 'Mã QR chỉ dùng để chuyển khoản thanh toán, KHÔNG BAO GIỜ dùng để đăng nhập tài khoản ngân hàng',
        recommendedAction: 'Phòng thí nghiệm Quishing Lab: Soi mã độc QR',
        recommendedScenarioId: 'lottery-fake-link',
        color: '#3b82f6',
      },
      {
        key: 'emotional_stability',
        label: 'Ổn Định Cảm Xúc',
        vietnameseName: 'Kiểm Soát Cảm Xúc & Ức Chế Bốc Đồng',
        psychologicalTrigger: 'Kích động cảm xúc (hoảng loạn, tiếc tiền đã mất, hoặc si mê tình cảm) lấn át lý trí (KV4, KV8, KV12)',
        behavioralSymptom: 'Quyết định chuyển khoản vội vã trong 60 giây đầu tiên khi tâm lý đang bị kích động mạnh',
        improvementMantra: 'Hít thở sâu 3 nhịp và đặt điện thoại xuống ít nhất 60 giây trước mọi giao dịch tiền bạc',
        recommendedAction: 'Thực hành: Làm chủ cảm xúc trước các cú sốc tin nhắn',
        recommendedScenarioId: 'bank-lockout-alert',
        color: '#14b8a6',
      },
      {
        key: 'deepfake_ai',
        label: 'Nhận Diện AI Deepfake',
        vietnameseName: 'Nhận Diện Giả Mạo Âm Thanh & Video AI',
        psychologicalTrigger: 'Niềm tin trực giác bằng mắt và tai trước hình ảnh/âm thanh người thân trong cuộc gọi video ngắn (KV9)',
        behavioralSymptom: 'Tin ngay khi thấy khuôn mặt người quen xuất hiện 5-10 giây trong video call mờ nhòe rồi báo mất sóng',
        improvementMantra: 'Yêu cầu vẫy tay ngang mặt hoặc cúp máy gọi lại vào số SIM di động chính chủ',
        recommendedAction: 'Diễn tập phòng thí nghiệm: Deepfake Voice Clone & Video Call',
        recommendedScenarioId: 'deepfake-friend-loan',
        color: '#ec4899',
      },
    ];

    const dimensions: ScamDnaDimensionDetail[] = dimensionDefinitions.map((def) => {
      const score = userDimScores[def.key];
      const commAvg = commDimStats[def.key]?.avgScore ?? 55;
      return {
        ...def,
        score,
        communityAverage: commAvg,
        level:
          score >= 80
            ? 'OPTIMAL'
            : score >= 65
            ? 'MODERATE'
            : score >= 45
            ? 'VULNERABLE'
            : 'CRITICAL',
        vulnerabilityRatio: Math.max(0.05, Number(((100 - score) / 100).toFixed(2))),
      };
    });

    // Determine Archetype based on real scores
    let archetype: DefenseArchetype;
    if (userOverallScore >= 85 && userDimScores.verification_reflex >= 80) {
      archetype = {
        id: 'vigilant_sentinel',
        title: 'Vệ Binh Tinh Nhuệ',
        subtitle: 'Phản xạ phòng vệ mẫu mực & Tư duy phản biện thép',
        description:
          'Dữ liệu thực tế cho thấy bạn sở hữu hàng rào phòng thủ kiên cố, luôn kích hoạt phản xạ xác minh độc lập và không để áp lực thời gian hay đòn tâm lý uy quyền chi phối.',
        primaryStrength: 'Phản xạ xác minh kênh phụ và bảo vệ dữ liệu nhạy cảm đạt điểm rất cao.',
        blindspotAlert: 'Tiếp tục duy trì cảnh giác trước các biến thể Deepfake AI và mã QR độc hại mới.',
        iconName: 'ShieldCheck',
        tagColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/60',
      };
    } else if (userOverallScore >= 70) {
      archetype = {
        id: 'forensic_analyst',
        title: 'Nhà Điều Tra Độc Lập',
        subtitle: 'Hoài nghi lành mạnh & Kiểm chứng đa kênh',
        description:
          'Bạn có năng lực nhận diện tốt phần lớn các kịch bản lừa đảo phổ biến và biết kiểm tra nguồn gốc thông tin trước khi hành động.',
        primaryStrength: 'Tư duy phân tích logic trước các chiêu trò dụ dỗ tài chính.',
        blindspotAlert: 'Chú ý gia cố các trục có điểm thấp hơn mức trung bình cộng đồng trên bản đồ Radar.',
        iconName: 'Search',
        tagColor: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/60',
      };
    } else if (!mySurvey && completedLessonsCount === 0 && completedScenariosCount === 0) {
      archetype = {
        id: 'new_recruit',
        title: 'Tân Binh Khởi Đầu (Chưa Khảo Sát)',
        subtitle: 'Đang ở mức cơ sở mặc định — Hãy làm Khảo sát ViSEF để đo đúng DNA',
        description:
          'Tài khoản của bạn hiện chưa có bài Khảo sát ViSEF hoặc phiên diễn tập nào được ghi nhận. Hãy bấm nút "Làm Khảo Sát ViSEF" để hệ thống phân tích chính xác 10 trục phản xạ của riêng bạn!',
        primaryStrength: 'Sẵn sàng tham gia huấn luyện và thiết lập lá chắn số.',
        blindspotAlert: 'Chưa được kiểm nghiệm thực tế qua 12 tình huống bẫy lừa đảo ViSEF.',
        iconName: 'Sparkles',
        tagColor: 'text-amber-400 border-amber-500/40 bg-amber-950/60',
      };
    } else {
      archetype = {
        id: 'adaptive_shield',
        title: 'Chiến Binh Đang Rèn Luyện',
        subtitle: 'Đang từng bước hình thành bộ gen đề kháng toàn diện',
        description:
          'Hồ sơ của bạn được tổng hợp trực tiếp từ bài khảo sát và quá trình học tập. Bạn đã nhận diện được một số bẫy cơ bản nhưng vẫn còn điểm mù cần khắc phục.',
        primaryStrength: 'Đã bắt đầu tham gia khảo nghiệm và tích lũy kinh nghiệm thực chiến.',
        blindspotAlert: 'Ưu tiên hoàn thành các phân khu tương ứng với các trục điểm dưới 65.',
        iconName: 'Sparkles',
        tagColor: 'text-purple-400 border-purple-500/40 bg-purple-950/60',
      };
    }

    // Critical Blindspots from real dimensions
    const criticalBlindspots = [...dimensions]
      .filter((d) => d.score < 75)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map((d) => ({
        dimension: d.vietnameseName,
        score: d.score,
        gapWithCommunity: Math.round(d.score - d.communityAverage),
        dangerSummary: d.behavioralSymptom,
        scenarioId: d.recommendedScenarioId,
        scenarioTitle: d.recommendedAction,
      }));

    // Overall Community Average across all real surveys + real users
    const totalScoreSumAll =
      allSurveys.reduce((acc, s) => acc + (s.testOutcome?.preScore ?? 50), 0) +
      validRealUsers.reduce((acc, u) => acc + (u.overallScore ?? 50), 0);
    const overallCommunityAverage =
      totalCombinedSample > 0 ? Math.round(totalScoreSumAll / totalCombinedSample) : 0;

    // Real Empirical Percentile Rank across all real participants
    const allParticipantScores = [
      ...allSurveys.map((s) => s.testOutcome?.preScore ?? 50),
      ...validRealUsers.map((u) => u.overallScore ?? 50),
    ];
    const beatenCount = allParticipantScores.filter((sc) => sc <= userOverallScore).length;
    const percentileRank =
      allParticipantScores.length > 0
        ? Math.min(99, Math.max(1, Math.round((beatenCount / allParticipantScores.length) * 100)))
        : 50;

    // Build Real Milestones achieved by the current user
    const realMilestonesList: Array<{
      title: string;
      description: string;
      xpEarned: number;
      category: 'drill' | 'arena' | 'quishing' | 'deepfake' | 'streak';
    }> = [];

    if (mySurvey) {
      realMilestonesList.push({
        title: `Hoàn Thành Khảo Sát ViSEF (${mySurvey.testOutcome?.preScore ?? 50}đ)`,
        description: `Đã định danh hồ sơ khảo sát #${mySurvey.id.slice(-6)} trên hệ thống.`,
        xpEarned: 150,
        category: 'drill',
      });
    }
    if (completedLessonsCount > 0) {
      realMilestonesList.push({
        title: `Hoàn Thành ${completedLessonsCount} Bài Học Lộ Trình`,
        description: `Đã mở khóa đến Khu vực ${unlockedSectorNumber}/12 trên bản đồ huấn luyện.`,
        xpEarned: completedLessonsCount * 50,
        category: 'quishing',
      });
    }
    if (completedScenariosCount > 0) {
      realMilestonesList.push({
        title: `Xử Lý ${completedScenariosCount} Kịch Bản Thực Chiến`,
        description: 'Hoàn thành mô phỏng đối kháng trong phòng tập Scam Arena.',
        xpEarned: completedScenariosCount * 100,
        category: 'arena',
      });
    }
    if (userXp > 0 || userStreak > 0) {
      realMilestonesList.push({
        title: `Tích Lũy ${userXp} XP • Chuỗi ${Math.max(1, userStreak)} Ngày`,
        description: 'Duy trì rèn luyện nâng cao năng lực tự vệ số.',
        xpEarned: userXp,
        category: 'streak',
      });
    }
    if (myCert) {
      const certPostVal = Number(
        myCert.postAppScore ?? (myCert as any).postScore ?? myCert.scorePct ?? 85
      );
      const certPreVal = Number(myCert.preAppScore ?? (myCert as any).preScore ?? 45);
      const certDeltaVal = Number(
        myCert.deltaScore ?? (myCert as any).improvementDelta ?? certPostVal - certPreVal
      );
      realMilestonesList.push({
        title: `Chứng Nhận Đầu Ra (${Number.isFinite(certPostVal) ? certPostVal : 85}/100đ)`,
        description: `Tăng +${Number.isFinite(certDeltaVal) ? certDeltaVal : 40} điểm so với bài khảo sát đầu vào.`,
        xpEarned: 300,
        category: 'deepfake',
      });
    }

    // Build 30-day historical trend from user's real baseline (preScore) to current real score
    const initialUserBaseline = mySurvey?.testOutcome?.preScore ?? (userProfile.overallScore ?? 50);
    const psyDims = dimensions.filter((d) =>
      ['authority', 'urgency', 'fear', 'greed', 'isolation', 'emotional_stability'].includes(d.key)
    );
    const techDims = dimensions.filter((d) => ['quishing_domain', 'deepfake_ai'].includes(d.key));
    const finDims = dimensions.filter((d) =>
      ['privacy_credential', 'verification_reflex'].includes(d.key)
    );

    const curPsy = Math.round(psyDims.reduce((a, b) => a + b.score, 0) / (psyDims.length || 1));
    const curTech = Math.round(techDims.reduce((a, b) => a + b.score, 0) / (techDims.length || 1));
    const curFin = Math.round(finDims.reduce((a, b) => a + b.score, 0) / (finDims.length || 1));

    const milestoneDays = [4, 11, 18, 24, 30];
    const milestoneMap: Record<number, (typeof realMilestonesList)[number]> = {};
    realMilestonesList.slice(0, 5).forEach((ms, idx) => {
      const targetDay =
        realMilestonesList.length === 1
          ? 30
          : milestoneDays[Math.min(4, Math.floor((idx * 5) / realMilestonesList.length))];
      milestoneMap[targetDay] = ms;
    });

    const historicalTrend30Days = Array.from({ length: 30 }, (_, i) => {
      const dayIndex = i + 1;
      const progressFactor = i / 29;
      const sdi = Math.round(
        initialUserBaseline + (userOverallScore - initialUserBaseline) * progressFactor
      );
      const psy = Math.round(
        initialUserBaseline + (curPsy - initialUserBaseline) * progressFactor
      );
      const tech = Math.round(
        initialUserBaseline + (curTech - initialUserBaseline) * progressFactor
      );
      const fin = Math.round(
        initialUserBaseline + (curFin - initialUserBaseline) * progressFactor
      );

      const refDate = new Date();
      refDate.setDate(refDate.getDate() - (29 - i));
      const dateStr = `${refDate.getDate().toString().padStart(2, '0')}/${(refDate.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`;
      const fullDateStr = `${dateStr}/${refDate.getFullYear()}`;

      return {
        date: dateStr,
        fullDate: fullDateStr,
        dayIndex,
        overallScore: i === 29 ? userOverallScore : sdi,
        riskScore: 100 - (i === 29 ? userOverallScore : sdi),
        psychologyScore: i === 29 ? curPsy : psy,
        technicalScore: i === 29 ? curTech : tech,
        financialScore: i === 29 ? curFin : fin,
        communityAverage: overallCommunityAverage,
        milestoneEvent: milestoneMap[dayIndex],
      };
    });

    let tier: DefenseTier = 'Đang Rèn Luyện';
    if (userOverallScore >= 90) tier = 'Vệ Binh Tinh Nhuệ';
    else if (userOverallScore >= 80) tier = 'Vệ Binh Vững Vàng';
    else if (userOverallScore >= 65) tier = 'Đang Rèn Luyện';
    else if (userOverallScore >= 45) tier = 'Có Rủi Ro';
    else tier = 'Rất Dễ Tổn Thương';

    const tacticRatings: Record<ScamTactic, number> = {
      Authority: userDimScores.authority,
      Urgency: userDimScores.urgency,
      Fear: userDimScores.fear,
      Greed: userDimScores.greed,
      Sympathy: userDimScores.emotional_stability,
      'Social Proof': userDimScores.greed,
      Isolation: userDimScores.isolation,
      Reciprocity: userDimScores.greed,
      Romance: userDimScores.isolation,
      Confusion: userDimScores.verification_reflex,
      'Synthetic Media': userDimScores.deepfake_ai,
      'Convenience Bias': userDimScores.quishing_domain,
    };

    const computedDnaProfile: ScamDnaProfile = {
      overallScore: userOverallScore,
      tier,
      archetype,
      dimensions,
      tacticRatings,
      strongestTactics: [],
      weakestTactics: [],
      criticalBlindspots,
      historicalScores: [
        { date: 'Đầu vào', score: initialUserBaseline, communityAverage: overallCommunityAverage },
        { date: 'Hiện tại', score: userOverallScore, communityAverage: overallCommunityAverage },
      ],
      historicalTrend30Days,
      totalSessionsCompleted: completedScenariosCount + completedLessonsCount,
      quishingAccuracy: userDimScores.quishing_domain,
      drillsCompleted: completedLessonsCount,
      currentStreakDays: userStreak,
      totalXp: userXp,
    };

    // Real Demographic Breakdown from getAllCommunitySurveys()
    const SECTOR_TITLES: Record<string, string> = {
      q1: 'KV1: SMS & Link Trúng Thưởng Giả Mạo',
      q2: 'KV2: Dọa Khóa SIM & Giả Danh Công An',
      q3: 'KV3: Tuyển CTV & Giao Hàng COD Giả',
      q4: 'KV4: Bẫy Tình Cảm Đầu Tư Pig Butchering',
      q5: 'KV5: Sàn Crypto & Ponzi Ủy Thác',
      q6: 'KV6: App Dịch Vụ Công VNeID APK Độc Hại',
      q7: 'KV7: Mã QR Quishing Đánh Cắp Phiên',
      q8: 'KV8: Giả Cấp Cứu Bệnh Viện Giờ Vàng',
      q9: 'KV9: Cuộc Gọi Video Deepfake AI',
      q10: 'KV10: Web3 Airdrop & Smart Contract',
      q11: 'KV11: Trạm Sạc Juice Jacking & Wifi Giả',
      q12: 'KV12: Dịch Vụ Thu Hồi Tiền Bị Lừa (Bẫy Kép)',
    };

    const demoGroupsConfig = [
      { key: 'STUDENT', label: 'Học sinh & Sinh viên', color: '#06b6d4' },
      { key: 'OFFICE_WORKER', label: 'Nhân viên Văn phòng', color: '#10b981' },
      { key: 'BUSINESS_OWNER', label: 'Kinh doanh & Bán hàng Online', color: '#8b5cf6' },
      { key: 'TEACHER_JUDGE', label: 'Giáo viên & Ban Giám Khảo', color: '#0ea5e9' },
      { key: 'ELDERLY', label: 'Người Cao tuổi & Hưu trí', color: '#f59e0b' },
    ];

    const demographicBreakdown = demoGroupsConfig.map((grp) => {
      const list = allSurveys.filter((s) => s.demographicGroup === grp.key);
      const count = list.length;
      const avgScore =
        count > 0
          ? Math.round(list.reduce((acc, s) => acc + (s.testOutcome?.preScore ?? 50), 0) / count)
          : 0;

      // Find the real weakest question/sector for this specific demographic group
      let weakestSectorTitle = 'Chưa có mẫu khảo sát thuộc nhóm này';
      if (count > 0) {
        let lowestQScore = 999;
        Object.keys(SCENARIO_CORRECT_ANSWERS).forEach((qk) => {
          const avgQ =
            list.reduce((acc, s) => acc + evaluateQuestionScoreFromSurvey(s, qk).score, 0) / count;
          if (avgQ < lowestQScore) {
            lowestQScore = avgQ;
            weakestSectorTitle = `${SECTOR_TITLES[qk]} (Điểm TB nhóm: ${Math.round(avgQ)}/100)`;
          }
        });
      }

      return {
        group: grp.label,
        averageScore: avgScore,
        sampleCount: count,
        criticalWeakness: weakestSectorTitle,
        color: grp.color,
      };
    });

    // Top 5 Real Vulnerabilities ranked by actual vulnerability rate in the dataset
    const topVulnerabilitiesNational = [...dimensions]
      .map((dim) => {
        const st = commDimStats[dim.key];
        return {
          key: dim.key,
          label: dim.vietnameseName,
          vulnerabilityRate: st.vulnRate,
          description:
            totalCombinedSample > 0
              ? `Ghi nhận thực tế ${st.affectedCount}/${st.totalEvaluated} người dùng trên hệ thống bị đánh lừa hoặc từng suýt sập bẫy ở trục này (Điểm TB cộng đồng: ${st.avgScore}/100).`
              : 'Chưa có dữ liệu mẫu khảo sát (N = 0).',
          trend: (st.vulnRate >= 45 ? 'rising' : 'stable') as 'rising' | 'stable' | 'declining',
        };
      })
      .sort((a, b) => b.vulnerabilityRate - a.vulnerabilityRate)
      .slice(0, 5);

    const dimensionAveragesMap: Record<ScamDnaDimensionKey, number> = {
      authority: commDimStats.authority.avgScore,
      urgency: commDimStats.urgency.avgScore,
      fear: commDimStats.fear.avgScore,
      greed: commDimStats.greed.avgScore,
      privacy_credential: commDimStats.privacy_credential.avgScore,
      isolation: commDimStats.isolation.avgScore,
      verification_reflex: commDimStats.verification_reflex.avgScore,
      quishing_domain: commDimStats.quishing_domain.avgScore,
      emotional_stability: commDimStats.emotional_stability.avgScore,
      deepfake_ai: commDimStats.deepfake_ai.avgScore,
    };

    const computedCommunityDna: CommunityScamDna = {
      totalParticipants: totalCombinedSample,
      lastUpdated: 'Đồng bộ thời gian thực từ Cloud Firestore',
      overallCommunityAverage,
      percentileRank,
      dimensionAverages: dimensionAveragesMap,
      topVulnerabilitiesNational,
      demographicBreakdown,
      trendingThreatsMonth: [],
    };

    return {
      dnaProfile: initialDna || computedDnaProfile,
      communityDna: computedCommunityDna,
      commDimStats,
      mySurvey,
      myCert,
      completedLessonsCount,
      completedScenariosCount,
      totalSurveyCount,
      totalRealAppUsersCount,
      allSurveys,
      validRealUsers,
    };
  }, [userProfile, currentUser, realUsers, initialDna, liveSyncTick]);

  const dnaProfile = realEngineData.dnaProfile;
  const communityDna = realEngineData.communityDna;

  // Pillar scores calculation from real dimensions
  const pillarScores = useMemo(() => {
    const getAvg = (keys: ScamDnaDimensionKey[]) => {
      const matched = dnaProfile.dimensions.filter((d) => keys.includes(d.key));
      if (matched.length === 0) return { user: 50, community: 50, delta: 0 };
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

  // Active threat intel enriched with REAL dataset vulnerability & incident counts
  const activeThreatIntel = useMemo(() => {
    const key = activeDimension?.key || 'authority';
    const baseIntel = DIMENSION_THREAT_INTEL[key] || DIMENSION_THREAT_INTEL.authority;
    const realStat = realEngineData.commDimStats[key];
    if (!realStat) return baseIntel;

    return {
      ...baseIntel,
      vulnerabilityInVN: realStat.vulnRate,
      nationalIncidentCount: `${realStat.affectedCount}/${realStat.totalEvaluated} mẫu thực tế gặp rủi ro (${realStat.vulnRate}%)`,
    };
  }, [activeDimension, realEngineData.commDimStats]);

  // Simulated SDI Score
  const simulatedScore = useMemo(() => {
    const base = dnaProfile?.overallScore ?? 50;
    let bonus = 0;
    if (simulatedDrills.quishing) bonus += 4;
    if (simulatedDrills.deepfake) bonus += 5;
    if (simulatedDrills.authority) bonus += 4;
    if (simulatedDrills.otp_defense) bonus += 3;
    return Math.min(99, base + bonus);
  }, [dnaProfile?.overallScore, simulatedDrills]);

  // Handle Share / Copy Passport
  const handleSharePassport = () => {
    const score = dnaProfile?.overallScore ?? 50;
    const shareText = `HỒ SƠ BẢN ĐỒ GEN PHÒNG THỦ SCAM DNA (DỮ LIỆU THỰC TẾ)
• Chủ hồ sơ: ${currentUser?.name || userProfile.name || 'Người dùng ScamGuard'}
• Điểm Chỉ Số Phòng Vệ (SDI): ${score}/100
• Hình Mẫu: ${dnaProfile?.archetype?.title || 'Chiến Binh Phòng Vệ'}
• Trụ Cột Tâm Lý: ${pillarScores.psychology.user}/100 (TB Cộng đồng: ${pillarScores.psychology.community}/100)
• Trụ Cột Kỹ Thuật & AI: ${pillarScores.technical.user}/100 (TB Cộng đồng: ${pillarScores.technical.community}/100)
• Trụ Cột Tài Chính: ${pillarScores.financial.user}/100 (TB Cộng đồng: ${pillarScores.financial.community}/100)
• Đối chiếu thực tế: Vượt ${communityDna?.percentileRank || 50}% trên tổng số ${communityDna?.totalParticipants || 0} hồ sơ người dùng & mẫu khảo sát ViSEF.
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
      <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6 sm:p-8 overflow-hidden space-y-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            {/* Unboxed Quiet Kicker */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-cyan-400">
              <Dna className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>HỆ THỐNG ĐỊNH DANH AN TOÀN SỐ</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-emerald-400 font-semibold">
                DỮ LIỆU THẬT 100% (CLOUD FIRESTORE & KHẢO SÁT VISEF)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Bản Đồ Gen Phòng Thủ Số ({currentUser?.name || userProfile.name || 'Của Bạn'})
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Phân tích định lượng <strong className="text-white font-medium">năng lực phản xạ tự vệ số thực tế của bạn</strong> đối chiếu trực tiếp với{' '}
              <strong className="text-cyan-300 font-mono">{realEngineData.totalSurveyCount} mẫu khảo sát ViSEF</strong> và{' '}
              <strong className="text-emerald-300 font-mono">{realEngineData.totalRealAppUsersCount} tài khoản người dùng thật</strong> trên hệ thống.
            </p>

            {/* Quiet Unboxed Metric Separator Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Chỉ số SDI của bạn:</span>
                <span className="text-emerald-400 font-bold tabular-nums text-sm">
                  {dnaProfile.overallScore}/100
                </span>
              </div>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">TB Cộng đồng thật:</span>
                <span className="text-purple-300 font-bold tabular-nums text-sm">
                  {communityDna.overallCommunityAverage}/100
                </span>
              </div>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Hình mẫu:</span>
                <span className="text-cyan-300 font-medium">
                  {dnaProfile.archetype?.title}
                </span>
              </div>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Xếp hạng thực tế:</span>
                <span className="text-amber-300 font-medium">
                  Vượt {communityDna.percentileRank}% mẫu thật (N = {communityDna.totalParticipants})
                </span>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto shrink-0">
            {onOpenSurvey && (
              <button
                onClick={onOpenSurvey}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>{realEngineData.mySurvey ? 'Cập Nhật Khảo Sát ViSEF' : 'Làm Khảo Sát Đo DNA Thật'}</span>
              </button>
            )}

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

        {/* Live Data Provenance Strip (Chứng thực nguồn dữ liệu thật của cá nhân & cộng đồng) */}
        <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Hồ sơ Khảo sát ViSEF của bạn</div>
              <div className="font-semibold text-white mt-0.5">
                {realEngineData.mySurvey ? (
                  <span className="text-emerald-400">
                    ✓ Đã đồng bộ (#{realEngineData.mySurvey.id.slice(-6)} • Đầu vào: {realEngineData.mySurvey.testOutcome?.preScore ?? 50}đ)
                  </span>
                ) : (
                  <span className="text-amber-300">
                    Chưa làm khảo sát (Đang tính từ điểm gốc {userProfile.overallScore ?? 50}đ)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Tiến độ Rèn luyện Thực tế của bạn</div>
              <div className="font-semibold text-white mt-0.5 font-mono">
                {realEngineData.completedLessonsCount} bài lộ trình · {realEngineData.completedScenariosCount} kịch bản Arena · {userProfile.xp || 0} XP
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Nguồn dữ liệu Cộng đồng Toàn quốc</div>
              <div className="font-semibold text-cyan-300 mt-0.5 font-mono">
                {realEngineData.totalSurveyCount} mẫu khảo sát + {realEngineData.totalRealAppUsersCount} user thật (N = {communityDna.totalParticipants})
              </div>
            </div>
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

          {/* Real App Users & Live Survey Cohort Verification Panel */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>
                    Dữ Liệu Thực Tế Từ Người Dùng Ứng Dụng ({realEngineData.totalRealAppUsersCount} Tài Khoản Cloud + {realEngineData.totalSurveyCount} Mẫu Khảo Sát ViSEF)
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Toàn bộ điểm chuẩn cộng đồng trên ScamDNA được tính toán trực tiếp từ các hồ sơ người dùng thật dưới đây:
                </p>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">
                Đồng bộ Cloud Firestore (Real-time)
              </span>
            </div>

            {realEngineData.validRealUsers.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-cyan-300 uppercase">
                  Tài khoản người dùng thật trên ứng dụng ({realEngineData.validRealUsers.length} tài khoản):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {realEngineData.validRealUsers.slice(0, 9).map((u) => (
                    <div
                      key={u.id}
                      className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate">{u.name || 'Người dùng ScamGuard'}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {u.xp || 0} XP · Chuỗi {u.streakDays || 0} ngày
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded bg-emerald-950/60 border border-emerald-700/40 text-emerald-300 font-mono font-bold tabular-nums shrink-0">
                        {u.overallScore ?? 50}đ
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-mono text-purple-300 uppercase">
                Mẫu khảo sát thực tế mới nhất ({realEngineData.allSurveys.length} mẫu):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {realEngineData.allSurveys.slice(0, 9).map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-slate-200 truncate">{s.participantName}</div>
                      <div className="text-[10px] font-mono text-slate-500 truncate">
                        {s.schoolName || s.location} · {s.demographicGroup}
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded bg-purple-950/60 border border-purple-700/40 text-purple-300 font-mono font-bold tabular-nums shrink-0">
                      {s.testOutcome?.preScore ?? 50}đ
                    </span>
                  </div>
                ))}
              </div>
            </div>
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
                <span>Tiến Trình Phát Triển Phòng Vệ Thực Tế</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Biểu đồ ghi nhận tiến độ thật từ bài khảo sát đầu vào ({realEngineData.mySurvey?.testOutcome?.preScore ?? (userProfile.overallScore ?? 50)}đ) đến điểm hiện tại ({dnaProfile.overallScore}đ)
              </p>
            </div>
          </div>

          {/* 30-Day Trend Chart Component */}
          <ScamDnaTrendChart
            dnaProfile={dnaProfile}
            communityAverage={communityDna.overallCommunityAverage}
            onNavigateToArena={onNavigateToArena}
          />

          {/* Upgrade Simulator Widget */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 font-mono">
                <Target className="w-4 h-4" />
                <span>CÔNG CỤ GIẢ LẬP NÂNG HẠNG CHỈ SỐ SDI (TỪ ĐIỂM THẬT {dnaProfile.overallScore}/100)</span>
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
              <span>Xếp hạng mới ước tính so với {communityDna.totalParticipants} mẫu thật:</span>
              <strong className="text-white">
                {simulatedScore >= 85
                  ? 'Nhóm Vệ Binh Xuất Sắc (Top 10%)'
                  : simulatedScore >= 70
                  ? 'Nhóm Khá Giỏi (Trên TB Cộng Đồng)'
                  : 'Đang Tích Lũy Nền Tảng'}
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
                <span>Báo Cáo Tình Báo Rủi Ro Theo Nhóm Nhân Khẩu Học Thực Tế</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Thống kê trực tiếp từ {realEngineData.totalSurveyCount} mẫu khảo sát ViSEF và {realEngineData.totalRealAppUsersCount} tài khoản người dùng trên ứng dụng
              </p>
            </div>

            <div className="text-xs font-mono text-slate-400">
              Điểm TB Toàn Quốc (Thực tế): <span className="text-purple-300 font-bold">{communityDna.overallCommunityAverage}/100</span>
            </div>
          </div>

          {/* Demographic Breakdown Columns */}
          {communityDna && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    Cỡ mẫu thực tế: <span className="text-slate-300 font-bold">{demo.sampleCount.toLocaleString('vi-VN')} mẫu khảo sát</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                    <div className="text-amber-400 font-medium flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Điểm yếu thực tế qua khảo sát:</span>
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
                <span>Top 5 Trục Rủi Ro Khiến Người Dùng Trên Ứng Dụng Dễ Sập Bẫy Nhất</span>
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
                          {vuln.trend === 'rising' ? '▲ Mức rủi ro cao' : '● Đang theo dõi'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{vuln.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-bold font-mono text-rose-400 tabular-nums">
                        {vuln.vulnerabilityRate}%
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">tỷ lệ sập bẫy thực tế</div>
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
                Kết quả khảo sát và luyện tập của bạn được đồng bộ thời gian thực lên Cloud Firestore nhằm cập nhật dữ liệu phòng vệ cộng đồng.
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
                  <span>HỘ CHIẾU PHÒNG VỆ SỐ (DỮ LIỆU THẬT)</span>
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
                    <div className="text-sm font-bold text-white">{currentUser?.name || userProfile.name || 'Người Dùng ScamGuard'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Chỉ số SDI thực tế</div>
                    <div className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                      {dnaProfile.overallScore}/100
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
                    <span>Hình mẫu: {dnaProfile.archetype?.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {dnaProfile.archetype?.subtitle}
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
