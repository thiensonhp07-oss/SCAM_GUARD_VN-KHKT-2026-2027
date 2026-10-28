import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  Flame,
  CheckCircle2,
  Lock,
  Play,
  Check,
  ChevronRight,
  ChevronLeft,
  Shield,
  ShieldCheck,
  BookOpen,
  Target,
  Trophy,
  Swords,
  Zap,
  Compass,
  ArrowRight,
  Cpu,
  Radio,
  ShoppingBag,
  HeartCrack,
  TrendingUp,
  Scale,
  ScanFace,
  Crown,
  AlertTriangle,
  FileText,
  Package,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { UserProfile } from '../types';
import {
  CAMPAIGN_SECTORS,
  CampaignNode,
  BossBattle,
  SpeedReflexChallenge,
  SupplyChest,
} from '../data/campaignData';
import { DuolingoLessonRunner } from './DuolingoLessonRunner';
import { BossBattleRunner } from './BossBattleRunner';
import { SpeedReflexRunner } from './SpeedReflexRunner';
import { SupplyChestModal } from './SupplyChestModal';
import { SectorTopic1CertificationModal } from './SectorTopic1CertificationModal';
import { NationalScienceFairDemoModal } from './NationalScienceFairDemoModal';
import {
  CyberGuardianFinalExamModal,
  CyberGuardianCertificationRecord,
} from './CyberGuardianFinalExamModal';
import {
  SECTOR_MEMORY_BLUEPRINTS,
  INTERACTIVE_SCAM_ANATOMY_CASES,
  PERMANENT_MEMORY_FLASHCARDS,
  PEDAGOGY_METHOD_PILLARS,
} from '../data/cyberPedagogyData';
import { syncUserProfileToFirestore } from '../services/firebaseAuthService';

interface RoadmapSnakePathProps {
  userProfile: UserProfile;
  onNavigate: (tab: 'home' | 'train' | 'check' | 'progress' | 'learn', subView?: string) => void;
  onOpenLeaderboard: () => void;
  onEarnXp?: (amount: number) => void;
  onOpenSurvey?: () => void;
}

const SECTOR_METADATA_THEMES: Record<
  number,
  {
    icon: React.ReactNode;
    threatLevel: string;
    domainCode: string;
    simulationDossier: string;
  }
> = {
  1: {
    icon: <Cpu className="w-4 h-4 text-slate-300" />,
    threatLevel: 'Mức độ 1 · Bẫy Mồi Nhử & Quà Tặng Ảo',
    domainCode: 'SEC-01',
    simulationDossier:
      'Phân tích các thủ đoạn tặng quà 0 đồng, vòng quay trúng thưởng giả mạo thương hiệu lớn và liên kết thu thập dữ liệu cá nhân.',
  },
  2: {
    icon: <Radio className="w-4 h-4 text-slate-300" />,
    threatLevel: 'Mức độ 2 · Giả Mạo Trạm BTS & SMS Brandname',
    domainCode: 'SEC-02',
    simulationDossier:
      'Nhận diện kỹ thuật phát tán tin nhắn SMS Brandname giả mạo ngân hàng thông qua trạm thu phát sóng di động (BTS) trái phép.',
  },
  3: {
    icon: <ShoppingBag className="w-4 h-4 text-slate-300" />,
    threatLevel: 'Mức độ 3 · Gian Lận Thương Mại Điện Tử & COD',
    domainCode: 'SEC-03',
    simulationDossier:
      'Quy trình đối soát đơn hàng COD, nhận diện shipper giả mạo yêu cầu chuyển khoản trước và bẫy tuyển dụng cộng tác viên thương mại điện tử.',
  },
  4: {
    icon: <HeartCrack className="w-4 h-4 text-slate-300" />,
    threatLevel: 'Mức độ 4 · Thao Túng Tâm Lý Tình Cảm (Pig Butchering)',
    domainCode: 'SEC-04',
    simulationDossier:
      'Phân tích kịch bản xây dựng lòng tin dài hạn trên mạng xã hội nhằm dẫn dụ nạn nhân tham gia đầu tư tài chính hoặc nộp phí hải quan giả.',
  },
  5: {
    icon: <TrendingUp className="w-4 h-4 text-slate-300" />,
    threatLevel: 'Mức độ 5 · Sàn Giao Dịch Tài Chính & Tiền Ảo Trái Phép',
    domainCode: 'SEC-05',
    simulationDossier:
      'Nhận diện mô hình Ponzi, sàn Forex/Crypto tự lập can thiệp biểu đồ giá và thủ đoạn khóa quyền rút vốn để ép nộp thêm phí.',
  },
  6: {
    icon: <Scale className="w-4 h-4 text-slate-300" />,
    threatLevel: 'Mức độ 6 · Mạo Danh Cơ Quan Tư Pháp & Hành Chính',
    domainCode: 'SEC-06',
    simulationDossier:
      'Đối phó với kịch bản giả danh Công an, Viện kiểm sát, Cán bộ Thuế đe dọa lệnh bắt giữ hoặc ép cài đặt ứng dụng VNeID/.APK độc hại.',
  },
  7: {
    icon: <ScanFace className="w-4 h-4 text-slate-300" />,
    threatLevel: 'Mức độ 7 · Mã Độc Quishing QR & Biên Lai Giả',
    domainCode: 'SEC-07',
    simulationDossier:
      'Kiểm tra cấu trúc mã QR thanh toán bị dán đè tại điểm bán lẻ và giám định biên lai chuyển khoản ngân hàng chỉnh sửa quang học.',
  },
  8: {
    icon: <Crown className="w-4 h-4 text-slate-300" />,
    threatLevel: 'Mức độ 8 · Khủng Hoảng Khẩn Cấp & Sơ Cứu Tài Chính',
    domainCode: 'SEC-08',
    simulationDossier:
      'Thực hành quy tắc "Khoảng dừng nhận thức 5 phút" trước tin báo tai nạn khẩn cấp và quy trình phong tỏa tài khoản trong giờ vàng.',
  },
  9: {
    icon: <ScanFace className="w-4 h-4 text-slate-300" />,
    threatLevel: 'Mức độ 9 · Deepfake AI Video Call & Giọng Nói Tổng Hợp',
    domainCode: 'SEC-09',
    simulationDossier:
      'Phát hiện dấu hiệu bất thường về đồng bộ môi, ánh sáng viền khuôn mặt và âm sắc nhân tạo trong các cuộc gọi video Deepfake.',
  },
  10: {
    icon: <Zap className="w-4 h-4 text-slate-300" />,
    threatLevel: 'Mức độ 10 · Bảo Mật Ví Web3 & Smart Contract Drainer',
    domainCode: 'SEC-10',
    simulationDossier:
      'Phòng vệ trước các liên kết Airdrop giả mạo yêu cầu ký hợp đồng thông minh (Unlimited Token Approval) hoặc đánh cắp cụm từ khôi phục (Seed Phrase).',
  },
  11: {
    icon: <Radio className="w-4 h-4 text-slate-300" />,
    threatLevel: 'Mức độ 11 · An Toàn Mạng WiFi Công Cộng & Cổng Sạc USB',
    domainCode: 'SEC-11',
    simulationDossier:
      'Ngăn chặn tấn công nghe lén Man-in-the-Middle qua điểm truy cập WiFi giả mạo (Evil Twin) và rủi ro truyền dữ liệu qua cổng sạc công cộng (Juice Jacking).',
  },
  12: {
    icon: <Shield className="w-4 h-4 text-slate-300" />,
    threatLevel: 'Mức độ 12 · Phòng Chống Bẫy Lừa Đảo Kép Thu Hồi Vốn',
    domainCode: 'SEC-12',
    simulationDossier:
      'Nhận diện các tổ chức/cá nhân mạo danh văn phòng luật sư hoặc cục an ninh mạng cam kết "thu hồi tiền bị lừa" nhằm chiếm đoạt phí dịch vụ.',
  },
};

export const RoadmapSnakePath: React.FC<RoadmapSnakePathProps> = ({
  userProfile,
  onOpenLeaderboard,
  onEarnXp,
}) => {
  const [completedNodeIds, setCompletedNodeIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('scamguard_campaign_completed_nodes');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [ageMode, setAgeMode] = useState<'teen' | 'adult' | 'senior'>(() => {
    try {
      const saved = localStorage.getItem('scamguard_roadmap_age_mode');
      if (saved === 'teen' || saved === 'adult' || saved === 'senior') {
        return saved;
      }
      if (userProfile.mode === 'kids' || userProfile.mode === 'teen') return 'teen';
      if (userProfile.mode === 'senior') return 'senior';
    } catch (e) {
      console.error(e);
    }
    return 'adult';
  });

  useEffect(() => {
    try {
      localStorage.setItem('scamguard_roadmap_age_mode', ageMode);
    } catch (e) {
      console.error(e);
    }
  }, [ageMode]);

  const SECTOR_QUESTION_MAP: Record<string, { qKey: string; correct: string }> = {
    'sector-1': { qKey: 'q1', correct: 'C' },
    'sector-2': { qKey: 'q2', correct: 'E' },
    'sector-3': { qKey: 'q3', correct: 'D' },
    'sector-4': { qKey: 'q4', correct: 'C' },
    'sector-5': { qKey: 'q5', correct: 'E' },
    'sector-6': { qKey: 'q6', correct: 'F' },
    'sector-7': { qKey: 'q7', correct: 'E' },
    'sector-8': { qKey: 'q8', correct: 'C' },
    'sector-9': { qKey: 'q9', correct: 'D' },
    'sector-10': { qKey: 'q10', correct: 'E' },
    'sector-11': { qKey: 'q11', correct: 'C' },
    'sector-12': { qKey: 'q12', correct: 'D' },
  };

  const [hasCompletedSurvey, setHasCompletedSurvey] = useState<boolean>(() => {
    if (userProfile.hasCompletedSurvey !== undefined) {
      return Boolean(userProfile.hasCompletedSurvey || userProfile.surveyData);
    }
    try {
      const latest = localStorage.getItem('visef_my_latest_survey');
      const submission = localStorage.getItem('scamguard_survey_submission');
      const completed =
        localStorage.getItem('scamguard_survey_completed') ||
        localStorage.getItem('visef_survey_completed');
      const result = localStorage.getItem('scamguard_last_survey_result');
      return Boolean(latest || submission || completed === 'true' || result);
    } catch {
      return false;
    }
  });

  const [personalSurveyData, setPersonalSurveyData] = useState<any>(() => {
    if (userProfile.surveyData) {
      return userProfile.surveyData;
    }
    if (userProfile.hasCompletedSurvey === false) {
      return null;
    }
    try {
      const raw =
        localStorage.getItem('scamguard_survey_submission') ||
        localStorage.getItem('visef_my_latest_survey') ||
        localStorage.getItem('scamguard_last_survey_result');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Synchronize survey & roadmap state whenever the authenticated user profile changes
  useEffect(() => {
    if (userProfile.id && userProfile.id !== 'unauthenticated') {
      const profileHasSurvey = Boolean(userProfile.hasCompletedSurvey || userProfile.surveyData);
      setHasCompletedSurvey(profileHasSurvey);
      setPersonalSurveyData(userProfile.surveyData || null);
      if (Array.isArray(userProfile.completedRoadmapNodes)) {
        setCompletedNodeIds(userProfile.completedRoadmapNodes);
      }
      if (!profileHasSurvey) {
        setCertifiedSectors([]);
      }
    }
  }, [
    userProfile.id,
    userProfile.hasCompletedSurvey,
    userProfile.surveyData,
    userProfile.completedRoadmapNodes,
  ]);

  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [sectorsSorted, setSectorsSorted] = useState<typeof CAMPAIGN_SECTORS>(() => CAMPAIGN_SECTORS);

  // Pedagogical & 100% Memory Retention Interactive States
  const [roadmapTab, setRoadmapTab] = useState<
    'PATH_AND_MEMORY' | 'SCAM_XRAY' | 'FLASHCARDS_100' | 'TEACHING_METHOD'
  >('PATH_AND_MEMORY');
  const [openAccessMode, setOpenAccessMode] = useState<boolean>(false);
  const [selectedAnatomyId, setSelectedAnatomyId] = useState<string>(
    INTERACTIVE_SCAM_ANATOMY_CASES[0].id
  );
  const [selectedLayerId, setSelectedLayerId] = useState<string>(
    INTERACTIVE_SCAM_ANATOMY_CASES[0].layers[0].id
  );
  const [flashcardCategory, setFlashcardCategory] = useState<string>('ALL');
  const [flippedCardIds, setFlippedCardIds] = useState<string[]>([]);
  const [masteredCardIds, setMasteredCardIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('scamguard_mastered_flashcards');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [sectorFeynmanAnswers, setSectorFeynmanAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    const handleSurveyDone = (e?: any) => {
      try {
        const raw =
          localStorage.getItem('scamguard_survey_submission') ||
          localStorage.getItem('visef_my_latest_survey') ||
          localStorage.getItem('scamguard_last_survey_result');
        const parsed = e?.detail || (raw ? JSON.parse(raw) : null);
        setPersonalSurveyData(parsed);
        setHasCompletedSurvey(true);
        if (userProfile.id && userProfile.id !== 'unauthenticated') {
          syncUserProfileToFirestore(userProfile.id, {
            hasCompletedSurvey: true,
            surveyData: parsed,
          });
        }
      } catch (err) {
        console.error(err);
        setHasCompletedSurvey(true);
      }
    };

    window.addEventListener('visef_survey_updated', handleSurveyDone);
    window.addEventListener('scamguard_survey_completed', handleSurveyDone);
    return () => {
      window.removeEventListener('visef_survey_updated', handleSurveyDone);
      window.removeEventListener('scamguard_survey_completed', handleSurveyDone);
    };
  }, [userProfile.id]);

  const handleQuickDemoSurvey = () => {
    const mockPayload = {
      participantName: userProfile.name || 'Học viên ViSEF',
      isAnonymous: false,
      schoolName: 'THPT Chuyên Lê Hồng Phong',
      className: 'Khối 11',
      demographicGroup:
        userProfile.mode === 'senior'
          ? 'SENIOR'
          : userProfile.mode === 'teen'
          ? 'STUDENT'
          : 'WORKER',
      location: 'TP. Hồ Chí Minh',
      surveyResponses: {
        everEncounteredScam: true,
        pastLossOrNearMiss: 'LOST_MONEY',
        preConfidenceScore: 38,
        biggestFearTactic: 'TELEGRAM_INCOME',
        experiencedSectors: ['KV5', 'KV9', 'KV7'],
        experienceAnswers: {
          q1: 'B_SAFE',
          q2: 'B_SAFE',
          q3: 'C_NEAR_MISS',
          q4: 'A_NEVER',
          q5: 'D_VICTIM',
          q6: 'C_NEAR_MISS',
          q7: 'C_NEAR_MISS',
          q8: 'B_SAFE',
          q9: 'D_VICTIM',
          q10: 'A_NEVER',
          q11: 'B_SAFE',
          q12: 'C_NEAR_MISS',
        },
        trapAnswers: {
          q1: 'C',
          q2: 'E',
          q3: 'A',
          q4: 'C',
          q5: 'A',
          q6: 'F',
          q7: 'A',
          q8: 'C',
          q9: 'A',
          q10: 'E',
          q11: 'C',
          q12: 'D',
        },
      },
      testOutcome: {
        preScore: 42,
        postScore: 88,
      },
    };

    try {
      localStorage.setItem('scamguard_survey_submission', JSON.stringify(mockPayload));
      localStorage.setItem('visef_my_latest_survey', JSON.stringify(mockPayload));
      localStorage.setItem('scamguard_survey_completed', 'true');
      localStorage.setItem('visef_survey_completed', 'true');
    } catch (e) {
      console.error(e);
    }

    setPersonalSurveyData(mockPayload);
    setHasCompletedSurvey(true);
    if (userProfile.id && userProfile.id !== 'unauthenticated') {
      syncUserProfileToFirestore(userProfile.id, {
        hasCompletedSurvey: true,
        surveyData: mockPayload,
      });
    }
    window.dispatchEvent(new CustomEvent('visef_survey_updated', { detail: mockPayload }));
    window.dispatchEvent(new CustomEvent('scamguard_survey_completed', { detail: mockPayload }));
  };

  const [activeSectorId, setActiveSectorId] = useState<string>(() => {
    try {
      const savedIdx = localStorage.getItem('scamguard_active_sector_idx');
      if (savedIdx) {
        const parsed = parseInt(savedIdx, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < CAMPAIGN_SECTORS.length) {
          return CAMPAIGN_SECTORS[parsed].id;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return CAMPAIGN_SECTORS[0].id;
  });

  const calculateSectorFailureRate = (
    sectorId: string,
    analytics: any,
    surveyData?: any
  ): number => {
    const currentSurvey = surveyData || personalSurveyData;
    let personalPenalty = 0;

    if (currentSurvey) {
      const responses = currentSurvey.surveyResponses || currentSurvey;
      const trapAnswers = responses.trapAnswers || {};
      const experienceAnswers = responses.experienceAnswers || {};
      const qInfo = SECTOR_QUESTION_MAP[sectorId];

      if (qInfo) {
        const userTrapAnswer = trapAnswers[qInfo.qKey];
        if (userTrapAnswer) {
          if (userTrapAnswer !== qInfo.correct) {
            personalPenalty += 45;
          } else {
            personalPenalty -= 10;
          }
        }

        const userExp = experienceAnswers[qInfo.qKey];
        if (userExp === 'D_VICTIM') {
          personalPenalty += 35;
        } else if (userExp === 'C_NEAR_MISS') {
          personalPenalty += 25;
        } else if (userExp === 'A_NEVER') {
          personalPenalty += 12;
        } else if (userExp === 'B_SAFE') {
          personalPenalty -= 5;
        }
      }

      const demoGroup = currentSurvey.demographicGroup || responses.demographicGroup;
      if (demoGroup === 'STUDENT') {
        if (sectorId === 'sector-5') personalPenalty += 20;
        if (sectorId === 'sector-1') personalPenalty += 15;
        if (sectorId === 'sector-11') personalPenalty += 15;
        if (sectorId === 'sector-4') personalPenalty += 10;
      } else if (demoGroup === 'SENIOR') {
        if (sectorId === 'sector-8') personalPenalty += 25;
        if (sectorId === 'sector-6') personalPenalty += 20;
        if (sectorId === 'sector-9') personalPenalty += 20;
        if (sectorId === 'sector-12') personalPenalty += 15;
      } else if (demoGroup === 'WORKER') {
        if (sectorId === 'sector-3') personalPenalty += 20;
        if (sectorId === 'sector-7') personalPenalty += 20;
        if (sectorId === 'sector-2') personalPenalty += 15;
        if (sectorId === 'sector-10') personalPenalty += 15;
      }

      const pastLoss = responses.pastLossOrNearMiss;
      if (
        pastLoss === 'LOST_MONEY' &&
        (sectorId === 'sector-5' || sectorId === 'sector-6' || sectorId === 'sector-12')
      )
        personalPenalty += 18;
      if (
        pastLoss === 'SHARED_OTP_PASSWORD' &&
        (sectorId === 'sector-2' || sectorId === 'sector-8' || sectorId === 'sector-10')
      )
        personalPenalty += 18;
      if (
        pastLoss === 'CLICKED_SUSPICIOUS_LINK' &&
        (sectorId === 'sector-1' || sectorId === 'sector-7' || sectorId === 'sector-3')
      )
        personalPenalty += 18;

      const fearTactic = responses.biggestFearTactic;
      if (sectorId === 'sector-6' && fearTactic === 'AUTHORITY_POLICE') personalPenalty += 25;
      if (sectorId === 'sector-8' && fearTactic === 'URGENT_ACCIDENT') personalPenalty += 25;
      if (sectorId === 'sector-3' && fearTactic === 'FAKE_BILL_QR') personalPenalty += 25;
      if (sectorId === 'sector-5' && fearTactic === 'TELEGRAM_INCOME') personalPenalty += 25;
      if (sectorId === 'sector-9' && fearTactic === 'DEEPFAKE_CALL') personalPenalty += 25;
      if (sectorId === 'sector-10' && fearTactic === 'CRYPTO_WEB3') personalPenalty += 25;
    }

    const getDnaVuln = (key: string) => {
      const item = analytics?.scamDnaComparativeRadar?.find((d: any) => d.dimensionKey === key);
      return item ? item.preAppVulnerability : 45;
    };

    const getTacticPct = (key: string) => {
      const item = analytics?.fearTacticsDistribution?.find((t: any) => t.tacticKey === key);
      return item ? item.percentage : 18;
    };

    let baseRate = 45;
    switch (sectorId) {
      case 'sector-1':
        baseRate = (getDnaVuln('G') + getDnaVuln('R') + getTacticPct('TELEGRAM_INCOME')) / 3;
        break;
      case 'sector-2':
        baseRate = (getDnaVuln('R') + getDnaVuln('T')) / 2;
        break;
      case 'sector-3':
        baseRate = (getDnaVuln('C') + getTacticPct('FAKE_BILL_QR')) / 2;
        break;
      case 'sector-4':
        baseRate = (getDnaVuln('E') + getTacticPct('DEEPFAKE_CALL')) / 2;
        break;
      case 'sector-5':
        baseRate = getDnaVuln('G') * 0.4 + getTacticPct('TELEGRAM_INCOME') * 1.5;
        break;
      case 'sector-6':
        baseRate = getDnaVuln('A') * 0.4 + getTacticPct('AUTHORITY_POLICE') * 1.5;
        break;
      case 'sector-7':
        baseRate = (getDnaVuln('C') + getTacticPct('FAKE_BILL_QR')) / 2;
        break;
      case 'sector-8':
        baseRate = getDnaVuln('T') * 0.4 + getTacticPct('URGENT_ACCIDENT') * 1.5;
        break;
      case 'sector-9':
        baseRate = getDnaVuln('E') * 0.4 + getTacticPct('DEEPFAKE_CALL') * 1.5;
        break;
      case 'sector-10':
        baseRate = getDnaVuln('G');
        break;
      case 'sector-11':
        baseRate = getDnaVuln('C');
        break;
      case 'sector-12':
        baseRate = getDnaVuln('R');
        break;
      default:
        baseRate = 45;
    }
    return Math.min(99.5, Math.max(15, +(baseRate + personalPenalty).toFixed(1)));
  };

  useEffect(() => {
    const sorted = [...CAMPAIGN_SECTORS].sort((a, b) => {
      const rateA = calculateSectorFailureRate(a.id, analyticsData, personalSurveyData);
      const rateB = calculateSectorFailureRate(b.id, analyticsData, personalSurveyData);
      return rateB - rateA;
    });
    setSectorsSorted(sorted);

    if (hasCompletedSurvey && sorted.length > 0) {
      setActiveSectorId((currentId) => {
        const foundIdx = sorted.findIndex((s) => s.id === currentId);
        if (foundIdx === -1 || foundIdx > 0) {
          return sorted[0].id;
        }
        return currentId;
      });
    }
  }, [analyticsData, personalSurveyData, hasCompletedSurvey]);

  const activeSectorIndex = Math.max(0, sectorsSorted.findIndex((s) => s.id === activeSectorId));

  const isSectorUnlocked = (sectorIdx: number) => {
    if (openAccessMode) return true;
    if (!hasCompletedSurvey) return false;
    if (sectorIdx === 0) return true;
    const prevSector = sectorsSorted[sectorIdx - 1];
    if (!prevSector) return false;
    const isPrevSectorNodesCompleted = prevSector.nodes.every((n) =>
      completedNodeIds.includes(n.id)
    );
    const isPrevSectorExamPassed = certifiedSectors.includes(prevSector.sectorNumber);
    return isPrevSectorNodesCompleted && isPrevSectorExamPassed;
  };

  const handleSelectSectorIndex = (idx: number) => {
    if (!hasCompletedSurvey && !openAccessMode) {
      setIsSurveyModalOpen(true);
      return;
    }
    if (!isSectorUnlocked(idx)) return;
    const targetSector = sectorsSorted[idx];
    if (targetSector) {
      setActiveSectorId(targetSector.id);
      try {
        const staticIdx = CAMPAIGN_SECTORS.findIndex((s) => s.id === targetSector.id);
        localStorage.setItem('scamguard_active_sector_idx', staticIdx.toString());
      } catch (e) {
        console.error(e);
      }
    }
  };

  const getSectorFailureReason = (sectorId: string): string => {
    switch (sectorId) {
      case 'sector-1':
        return 'Mức độ nhạy cảm cao trước các chương trình khuyến mãi, quà tặng miễn phí chưa xác thực nguồn gốc.';
      case 'sector-2':
        return 'Rủi ro cao trước tin nhắn giả mạo thương hiệu ngân hàng (SMS Brandname) kết hợp áp lực khóa tài khoản.';
      case 'sector-3':
        return 'Thói quen thanh toán đơn hàng COD hoặc nhận biên lai điện tử mà chưa đối chiếu biến động số dư thực tế.';
      case 'sector-4':
        return 'Điểm yếu nhận thức trước các kịch bản tạo dựng niềm tin tình cảm dài hạn để dẫn dụ đầu tư tài chính.';
      case 'sector-5':
        return 'Nguy cơ sập bẫy tuyển dụng cộng tác viên làm nhiệm vụ trực tuyến hưởng hoa hồng cao trên Telegram.';
      case 'sector-6':
        return 'Tâm lý lo ngại khi bị đối tượng mạo danh cơ quan công an, viện kiểm sát hoặc cán bộ thuế uy hiếp.';
      case 'sector-7':
        return 'Rủi ro quét mã QR thanh toán chưa kiểm tra tên miền đích hoặc tin tưởng hình ảnh biên lai chỉnh sửa.';
      case 'sector-8':
        return 'Phản xạ quyết định quá nhanh dưới áp lực thời gian khẩn cấp, dễ dẫn đến thao tác chuyển khoản hoặc cung cấp OTP.';
      case 'sector-9':
        return 'Khó khăn trong việc phân biệt tín hiệu hình ảnh và giọng nói tổng hợp AI (Deepfake) trong các cuộc gọi video ngắn.';
      case 'sector-10':
        return 'Nguy cơ cấp quyền hợp đồng thông minh (Smart Contract) không giới hạn khi tương tác với các trang Airdrop Web3 lạ.';
      case 'sector-11':
        return 'Thói quen sử dụng mạng WiFi công cộng không mã hóa hoặc cổng sạc USB lạ tại nơi công cộng.';
      case 'sector-12':
        return 'Nguy cơ bị tổn thất kép bởi các dịch vụ giả mạo cam kết thu hồi tiền bị lừa đảo trực tuyến.';
      default:
        return 'Chỉ số rủi ro được tổng hợp từ dữ liệu khảo sát chẩn đoán ViSEF và ma trận Scam DNA.';
    }
  };

  const fetchRoadmapAnalytics = async () => {
    try {
      const res = await fetch('/api/research/survey-analytics');
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.scamDnaComparativeRadar) {
            setAnalyticsData(data);
          }
        }
      }
    } catch {
      // Offline / local fallback
    }
  };

  useEffect(() => {
    fetchRoadmapAnalytics();
    const interval = setInterval(fetchRoadmapAnalytics, 6000);
    return () => clearInterval(interval);
  }, []);

  const [activeLessonNode, setActiveLessonNode] = useState<CampaignNode | null>(null);
  const [activeBossNode, setActiveBossNode] = useState<BossBattle | null>(null);
  const [activeReflexNode, setActiveReflexNode] = useState<SpeedReflexChallenge | null>(null);
  const [activeChestNode, setActiveChestNode] = useState<SupplyChest | null>(null);

  useEffect(() => {
    const handleReset = () => {
      localStorage.removeItem('scamguard_campaign_completed_nodes');
      localStorage.removeItem('scamguard_active_sector_idx');
      setCompletedNodeIds([]);
      setActiveSectorId(sectorsSorted[0]?.id || CAMPAIGN_SECTORS[0].id);
    };

    window.addEventListener('scamguard_data_cleared', handleReset);
    window.addEventListener('scamguard_reset_data', handleReset);
    return () => {
      window.removeEventListener('scamguard_data_cleared', handleReset);
      window.removeEventListener('scamguard_reset_data', handleReset);
    };
  }, [sectorsSorted]);

  const currentXp = userProfile.xp ?? 0;
  const level = Math.floor(currentXp / 500) + 1;
  const currentLevelXp = currentXp % 500;
  const xpPercent = Math.min(100, (currentLevelXp / 500) * 100);

  const allNodesFlat = sectorsSorted.flatMap((s) => s.nodes);
  const totalNodesCount = allNodesFlat.length;
  const completedCount = completedNodeIds.length;
  const progressPercent = Math.round((completedCount / Math.max(1, totalNodesCount)) * 100);

  const currentSector = sectorsSorted[activeSectorIndex] || sectorsSorted[0];
  const envTheme =
    SECTOR_METADATA_THEMES[currentSector.sectorNumber] || SECTOR_METADATA_THEMES[1];

  const [briefingNode, setBriefingNode] = useState<CampaignNode | null>(null);
  const [isCertificationModalOpen, setIsCertificationModalOpen] = useState(false);
  const [isFinalExamModalOpen, setIsFinalExamModalOpen] = useState(false);
  const [certifiedSectors, setCertifiedSectors] = useState<number[]>([]);
  const [cyberGuardianCert, setCyberGuardianCert] =
    useState<CyberGuardianCertificationRecord | null>(null);

  useEffect(() => {
    const checkCerts = () => {
      try {
        const raw = localStorage.getItem('visef_post_app_certifications');
        if (raw) {
          const list = JSON.parse(raw);
          const passedSecs = list
            .filter((r: any) => r.isPassed && r.sectorNumber >= 1 && r.sectorNumber <= 12)
            .map((r: any) => r.sectorNumber);
          setCertifiedSectors(Array.from(new Set(passedSecs)));
        }
        const cgRaw = localStorage.getItem('scamguard_cyber_guardian_cert');
        if (cgRaw) {
          setCyberGuardianCert(JSON.parse(cgRaw));
        } else {
          setCyberGuardianCert(null);
        }
      } catch {
        // ignore
      }
    };
    const handleCloudRestored = () => {
      checkCerts();
      try {
        const savedNodes = localStorage.getItem('scamguard_campaign_completed_nodes');
        if (savedNodes) {
          setCompletedNodeIds(JSON.parse(savedNodes));
        }
        const savedCards = localStorage.getItem('scamguard_mastered_flashcards');
        if (savedCards) {
          setMasteredCardIds(JSON.parse(savedCards));
        }
      } catch {
        // ignore
      }
    };

    checkCerts();
    window.addEventListener('visef_post_cert_updated', checkCerts);
    window.addEventListener('visef_cyber_guardian_updated', checkCerts);
    window.addEventListener('scamguard_cloud_profile_restored', handleCloudRestored);
    return () => {
      window.removeEventListener('visef_post_cert_updated', checkCerts);
      window.removeEventListener('visef_cyber_guardian_updated', checkCerts);
      window.removeEventListener('scamguard_cloud_profile_restored', handleCloudRestored);
    };
  }, []);

  const sectorsProgressSummary = sectorsSorted.map((sec) => {
    const completedNodesInSec = sec.nodes.filter((n) =>
      completedNodeIds.includes(n.id)
    ).length;
    return {
      id: sec.id,
      sectorNumber: sec.sectorNumber,
      title: sec.title,
      completedNodes: completedNodesInSec,
      totalNodes: sec.nodes.length,
      isExamPassed: certifiedSectors.includes(sec.sectorNumber),
    };
  });

  const isAllSectorsCompletedAndCertified =
    hasCompletedSurvey &&
    sectorsProgressSummary.length > 0 &&
    sectorsProgressSummary.every(
      (s) => s.completedNodes >= s.totalNodes && s.isExamPassed
    );

  const canAccessCyberGuardianExam =
    isAllSectorsCompletedAndCertified || openAccessMode;

  const markNodeComplete = (nodeId: string, earnedXp: number) => {
    setCompletedNodeIds((prev) => {
      const next = prev.includes(nodeId) ? prev : [...prev, nodeId];
      try {
        localStorage.setItem('scamguard_campaign_completed_nodes', JSON.stringify(next));
        window.dispatchEvent(new CustomEvent('scamguard_roadmap_progress_updated', { detail: next }));
      } catch (e) {
        console.error(e);
      }

      const isSectorNowComplete = currentSector.nodes.every((n) => next.includes(n.id));
      if (isSectorNowComplete && !certifiedSectors.includes(currentSector.sectorNumber)) {
        setTimeout(() => {
          setIsCertificationModalOpen(true);
        }, 900);
      }

      return next;
    });

    if (onEarnXp) {
      onEarnXp(earnedXp);
    }
  };

  const getNodeStatus = (
    node: CampaignNode,
    nodeIndexInSector: number
  ): 'completed' | 'active' | 'locked' => {
    if (completedNodeIds.includes(node.id)) {
      return 'completed';
    }

    if (openAccessMode) {
      return 'active';
    }

    // Bước 1: Phải hoàn thành Bài Khảo Sát đầu vào trước mới mở lộ trình
    if (!hasCompletedSurvey) {
      return 'locked';
    }

    // Bước 4: Trạm hiện tại phải được mở khóa (Trạm #1 mở ngay sau khảo sát; Trạm #2+ chỉ mở khi Trạm trước hoàn thành 10/10 bài VÀ Pass Bài Kiểm Tra Trạm)
    if (!isSectorUnlocked(activeSectorIndex)) {
      return 'locked';
    }

    // Bước 2: Trong Trạm đã mở, Bài 01 mở đầu tiên; Bài tiếp theo chỉ mở khi đã hoàn thành Bài ngay trước đó
    if (nodeIndexInSector === 0) {
      return 'active';
    }

    if (nodeIndexInSector > 0) {
      const prevNode = currentSector.nodes[nodeIndexInSector - 1];
      if (prevNode && completedNodeIds.includes(prevNode.id)) {
        return 'active';
      }
    }

    return 'locked';
  };

  const sectorCompletedNodes = currentSector.nodes.filter((n) =>
    completedNodeIds.includes(n.id)
  );
  const sectorProgressPercent = Math.round(
    (sectorCompletedNodes.length / Math.max(1, currentSector.nodes.length)) * 100
  );
  const isCurrentSectorFinished =
    sectorCompletedNodes.length === currentSector.nodes.length;

  // Serpentine (Snake Path) horizontal offset in px
  const getHorizontalOffset = (index: number) => {
    const pattern = [-72, 72, -72, 72, -72, 72, -72, 72, -72, 72];
    return pattern[index % pattern.length];
  };

  const getNodeKindIcon = (kind: CampaignNode['kind'], className = 'w-5 h-5') => {
    switch (kind) {
      case 'boss':
        return <Swords className={className} />;
      case 'reflex':
        return <Zap className={className} />;
      case 'chest':
        return <Package className={className} />;
      default:
        return <BookOpen className={className} />;
    }
  };

  const getNodeKindLabel = (kind: CampaignNode['kind'], idx: number) => {
    switch (kind) {
      case 'boss':
        return 'SÁT HẠCH TÌNH HUỐNG';
      case 'reflex':
        return 'KIỂM TRA PHẢN XẠ';
      case 'chest':
        return 'TÀI LIỆU BẢO MẬT';
      default:
        return `TRẠM ${(idx + 1).toString().padStart(2, '0')} · BÀI HỌC`;
    }
  };

  const handleLaunchNode = (node: CampaignNode) => {
    const status = getNodeStatus(node, node.nodeIndex);
    if (status === 'locked') {
      setBriefingNode(node);
      return;
    }

    if (node.kind === 'lesson' && node.lessonData) {
      setActiveLessonNode(node);
    } else if (node.kind === 'boss' && node.bossData) {
      setActiveBossNode(node.bossData);
    } else if (node.kind === 'reflex' && node.reflexData) {
      setActiveReflexNode(node.reflexData);
    } else if (node.kind === 'chest' && node.chestData) {
      setActiveChestNode(node.chestData);
    }
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    const rack = document.getElementById('scamguard-blade-rack');
    if (rack) {
      const selectedButton = rack.children[activeSectorIndex] as HTMLElement;
      if (selectedButton) {
        const rackWidth = rack.clientWidth;
        const buttonWidth = selectedButton.clientWidth;
        const buttonLeft = selectedButton.offsetLeft;
        rack.scrollTo({
          left: buttonLeft - rackWidth / 2 + buttonWidth / 2,
          behavior: 'smooth',
        });
      }
    }
  }, [activeSectorIndex]);

  const currentFailureRate = calculateSectorFailureRate(
    currentSector.id,
    analyticsData,
    personalSurveyData
  );

  return (
    <div className="space-y-6 font-sans">
      {/* 1. EXECUTIVE SUMMARY & OVERALL CURRICULUM PROGRESS */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0 shadow-2xs">
              <Shield className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                  CẤP ĐỘ {level} · CHƯƠNG TRÌNH ĐÀO TẠO THÍCH ỨNG
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="flex items-center gap-1 text-slate-600 font-mono font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {userProfile.streakDays ?? 0} ngày liên tiếp
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Hệ Thống Huấn Luyện Phòng Thủ Nhận Thức (12 Phân Khu)
              </h2>
              <p className="text-xs text-slate-500">
                Lộ trình được sắp xếp tự động dựa trên chỉ số rủi ro cá nhân hóa từ bài khảo nghiệm ViSEF 2026.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">
                Tiến độ toàn khóa
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono tabular-nums">
                {completedCount} / {totalNodesCount} trạm ({progressPercent}%)
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                const node =
                  currentSector.nodes.find((n) => n.kind === 'reflex') || currentSector.nodes[1];
                handleLaunchNode(node);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-2 transition cursor-pointer shadow-2xs"
            >
              <Zap className="w-3.5 h-3.5 text-sky-600" />
              <span>Kiểm Tra Phản Xạ (25s)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCertificationModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Kiểm Tra Trạm Hiện Tại</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFinalExamModalOpen(true)}
              className={`px-3.5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 border transition cursor-pointer shadow-2xs ${
                cyberGuardianCert?.isPassed
                  ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white'
                  : canAccessCyberGuardianExam
                  ? 'bg-amber-500 hover:bg-amber-400 border-amber-400 text-slate-950 font-bold'
                  : 'bg-white hover:bg-slate-50 border-amber-200 text-amber-700'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>
                {cyberGuardianCert?.isPassed
                  ? `Chứng Chỉ Cyber Guardian (${cyberGuardianCert.score}/100)`
                  : canAccessCyberGuardianExam
                  ? 'Thi Tốt Nghiệp Cyber Guardian (Đã Mở)'
                  : `Cyber Guardian (${certifiedSectors.length}/12 Trạm)`}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenLeaderboard}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-2 transition cursor-pointer shadow-2xs"
            >
              <Award className="w-4 h-4 text-slate-400" />
              <span>Bảng Xếp Hạng</span>
            </button>
          </div>
        </div>

        {/* Clean Enterprise Progress Bar */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Tiến độ điểm kinh nghiệm (Cấp {level} → Cấp {level + 1})</span>
              <span className="font-mono tabular-nums text-slate-700 font-semibold">
                {currentLevelXp} / 500 XP (Tổng {currentXp} XP)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-sky-600 rounded-full transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between md:justify-end gap-3">
            <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setOpenAccessMode(false)}
                className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                  !openAccessMode
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lộ trình tuần tự (Chuẩn khảo sát & vượt trạm)
              </button>
              <button
                type="button"
                onClick={() => setOpenAccessMode(true)}
                className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                  openAccessMode
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Chế độ Giảng viên (Xem trước)
              </button>
            </div>

            <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
              {[
                { id: 'teen', label: 'Học sinh / SV' },
                { id: 'adult', label: 'Tiêu chuẩn' },
                { id: 'senior', label: 'Cỡ chữ lớn' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setAgeMode(m.id as 'teen' | 'adult' | 'senior')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                    ageMode === m.id
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4-MODE PEDAGOGICAL & PERMANENT MEMORY NAVIGATION BAR */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {[
            {
              id: 'PATH_AND_MEMORY',
              title: '1. Lộ Trình & Neo Trí Nhớ 3 Giây',
              sub: '12 Phân khu + Khẩu quyết + Feynman',
              badge: `${completedCount}/${totalNodesCount} trạm`,
            },
            {
              id: 'SCAM_XRAY',
              title: '2. Bàn Giải Phẫu Chiêu Trò X-Ray',
              sub: 'Bóc tách tâm lý & kỹ thuật trực quan',
              badge: `${INTERACTIVE_SCAM_ANATOMY_CASES.length} ca điển hình`,
            },
            {
              id: 'FLASHCARDS_100',
              title: '3. Thẻ Lật Ghi Nhớ Vĩnh Cửu',
              sub: 'Ôn tập chủ động Leitner (Active Recall)',
              badge: `${masteredCardIds.length}/${PERMANENT_MEMORY_FLASHCARDS.length} thuộc lòng`,
            },
            {
              id: 'TEACHING_METHOD',
              title: '4. Phương Pháp Dạy Nhớ 100%',
              sub: 'Mô hình 4 tầng nhận thức cho Học sinh',
              badge: '98% lưu giữ',
            },
          ].map((tab) => {
            const active = roadmapTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRoadmapTab(tab.id as any)}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                  active
                    ? 'bg-sky-50 border-sky-400 text-sky-950 shadow-xs ring-1 ring-sky-400/30'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-bold ${active ? 'text-sky-900' : 'text-slate-800'}`}>
                    {tab.title}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-medium ${
                      active ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">{tab.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. VISEF 4-STEP SEQUENTIAL PROGRESSION GATE & PERSONALIZED ROUTING */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${
                hasCompletedSurvey
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  : 'bg-amber-50 border-amber-200 text-amber-600'
              }`}
            >
              {hasCompletedSurvey ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span
                  className={`font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                    hasCompletedSurvey
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {hasCompletedSurvey
                    ? 'ĐÃ PHÂN LỘ TRÌNH CÁ NHÂN HÓA THEO KHẢO SÁT'
                    : 'BƯỚC 1 BẮT BUỘC: LÀM BÀI KHẢO SÁT PHÂN LỘ TRÌNH'}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-600 font-mono text-[11px]">
                  {hasCompletedSurvey
                    ? `Trạm Ưu Tiên #1 của bạn: ${sectorsSorted[0]?.title} (${calculateSectorFailureRate(sectorsSorted[0]?.id, analyticsData, personalSurveyData).toFixed(1)}% rủi ro)`
                    : 'Chưa mở khóa bài học — Cần hoàn thành khảo sát đầu vào'}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                {hasCompletedSurvey
                  ? 'Cơ chế vượt trạm: Học bài này mở bài tiếp → Học hết 10 bài mở Bài Kiểm Tra Trạm → Pass Kiểm Tra mới qua Trạm tiếp theo'
                  : 'Vui lòng hoàn thành Bài Khảo Sát Chẩn Đoán (12 câu) để hệ thống xếp thứ tự 12 Trạm phù hợp với bạn và mở khóa Bài học số 01'}
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {!hasCompletedSurvey ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsSurveyModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
                >
                  <FileText className="w-4 h-4" />
                  <span>Làm Bài Khảo Sát Phân Lộ Trình Ngay</span>
                </button>
                <button
                  type="button"
                  onClick={handleQuickDemoSurvey}
                  className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Giả Lập Đã Khảo Sát (Test Nhanh)</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsSurveyModalOpen(true)}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Khảo sát lại</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextIncompleteNode =
                      currentSector.nodes.find((n) => !completedNodeIds.includes(n.id)) ||
                      currentSector.nodes[0];
                    if (nextIncompleteNode) {
                      handleLaunchNode(nextIncompleteNode);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Học Bài Đang Mở Hiện Tại</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 5-Step Rule Visualizer (Including Final Cyber Guardian Exam) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div
            className={`p-3.5 rounded-xl border ${
              hasCompletedSurvey
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase mb-1">
              <span className={hasCompletedSurvey ? 'text-emerald-700' : 'text-amber-700'}>
                BƯỚC 01 · KHẢO SÁT
              </span>
              <span className="font-bold">{hasCompletedSurvey ? '✓ ĐÃ XONG' : 'ĐANG CHỜ'}</span>
            </div>
            <p className="font-bold text-slate-900">Phân lộ trình theo cá nhân</p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Đo điểm yếu tâm lý và xếp trạm nguy cơ cao nhất lên Trạm #1.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between font-mono text-[10px] font-bold text-sky-700 uppercase mb-1">
              <span>BƯỚC 02 · HỌC TUẦN TỰ</span>
              <span>{sectorCompletedNodes.length}/{currentSector.nodes.length} BÀI</span>
            </div>
            <p className="font-bold text-slate-900">Học bài này mở bài tiếp</p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Hoàn thành Bài 01 mới mở khóa Bài 02... lần lượt đến Bài 10.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between font-mono text-[10px] font-bold text-purple-700 uppercase mb-1">
              <span>BƯỚC 03 · THI CHỐT TRẠM</span>
              <span>{isCurrentSectorFinished ? 'ĐÃ MỞ ĐỀ THI' : 'KHÓA'}</span>
            </div>
            <p className="font-bold text-slate-900">Học hết trạm mở Đề 20 câu</p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Hoàn thành 10/10 bài trong trạm mới mở Cổng Sát Hạch Cuối Trạm.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between font-mono text-[10px] font-bold text-emerald-700 uppercase mb-1">
              <span>BƯỚC 04 · VƯỢT TRẠM</span>
              <span>{certifiedSectors.length}/12 TRẠM PASS</span>
            </div>
            <p className="font-bold text-slate-900">Pass mới qua Trạm kế tiếp</p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Phải Pass Bài Kiểm Tra của Trạm hiện tại mới mở khóa Trạm kế tiếp.
            </p>
          </div>

          <div
            onClick={() => setIsFinalExamModalOpen(true)}
            className={`p-3.5 rounded-xl border transition cursor-pointer ${
              cyberGuardianCert?.isPassed
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-2xs'
                : canAccessCyberGuardianExam
                ? 'bg-amber-50/90 border-amber-300 text-amber-950 shadow-2xs ring-2 ring-amber-400/20'
                : 'bg-slate-50 border-slate-200 hover:border-amber-300 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between font-mono text-[10px] font-bold text-amber-700 uppercase mb-1">
              <span>BƯỚC 05 · TỐT NGHIỆP</span>
              <span className="font-bold">
                {cyberGuardianCert?.isPassed
                  ? '✓ ĐÃ CẤP'
                  : canAccessCyberGuardianExam
                  ? 'ĐÃ MỞ KHÓA'
                  : 'KHÓA'}
              </span>
            </div>
            <p className="font-bold text-slate-900">Chứng chỉ Cyber Guardian</p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Hoàn tất 12/12 trạm để thi 24 câu tổng hợp & nhận danh hiệu tối thượng.
            </p>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: MANDATORY SURVEY GATE (WHEN NOT SURVEYED YET) OR PERSONALIZED 12-SECTOR SNAKE PATH */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
        {roadmapTab === 'PATH_AND_MEMORY' && !hasCompletedSurvey && !openAccessMode ? (
          <div className="space-y-6">
            {/* Mandatory Survey Gate Banner */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#F8FAFC] border border-sky-200 shadow-xs space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2.5 max-w-3xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-bold uppercase">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>CỔNG CHẨN ĐOÁN ĐẦU VÀO BẮT BUỘC · LỘ TRÌNH ĐANG KHÓA</span>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
                    Hoàn Thành Bài Khảo Sát Đầu Vào Để Phân Lộ Trình Học Cá Nhân Hóa
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Tài khoản của bạn chưa thực hiện bài khảo sát chẩn đoán đầu vào. Vì mỗi học viên có điểm yếu tâm lý (Scam DNA) và mức độ rủi ro trước 12 thủ đoạn lừa đảo khác nhau, hệ thống cần bạn hoàn thành <strong>12 câu hỏi khảo sát tình huống</strong> để tính toán tỷ lệ rủi ro cá nhân (%) và tự động xếp thứ tự ưu tiên <strong>Trạm #1 → Trạm #12</strong> trước khi mở khóa lộ trình học.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsSurveyModalOpen(true)}
                    className="px-5 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition cursor-pointer shadow-sm"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Làm Bài Khảo Sát Mở Lộ Trình Ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickDemoSurvey}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Giả Lập Đã Khảo Sát (Mở Khóa Nhanh Lộ Trình)</span>
                  </button>
                </div>
              </div>

              {/* 3-Step Personalization Explanation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-sky-700 uppercase">
                    <span>GIAI ĐOẠN 01</span>
                    <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-700">
                      12 Câu Hỏi
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    Khảo Sát Phản Xạ & Điểm Mù Bảo Mật
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Trả lời 12 tình huống thực tế (Deepfake, Quishing QR, Việc nhẹ lương cao, Giả danh Công an, Trạm BTS...) để đo chỉ số nhạy cảm ban đầu.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-sky-700 uppercase">
                    <span>GIAI ĐOẠN 02</span>
                    <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-700">
                      Thuật Toán Scam DNA
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    Tự Động Phân Lộ Trình Cá Nhân Hóa
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Hệ thống chấm điểm rủi ro cá nhân ở từng mảng và đẩy các phân khu bạn dễ bị lừa nhất lên làm <strong>Trạm Ưu Tiên #1, #2, #3...</strong>
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-emerald-700 uppercase">
                    <span>GIAI ĐOẠN 03</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">
                      Mở Khóa Tuần Tự
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    Kích Hoạt Sơ Đồ Trạm & Học Vượt Cấp
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Ngay sau khi nộp khảo sát, Sơ đồ Trạm Thực Hành sẽ mở khóa từ <strong>Bài 01 của Trạm Ưu Tiên #1</strong> để bạn bắt đầu rèn luyện.
                  </p>
                </div>
              </div>
            </div>

            {/* Locked Preview Grid of the 12 Sectors Waiting for Survey Ranking */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block">
                    DANH MỤC 12 PHÂN KHU ĐÀO TẠO (ĐANG CHỜ KẾT QUẢ KHẢO SÁT ĐỂ XẾP HẠNG ƯU TIÊN)
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                    12 Phân khu sẽ được sắp xếp lại theo mức độ rủi ro của riêng bạn ngay sau khi hoàn tất khảo sát
                  </h4>
                </div>
                <span className="text-xs font-mono font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg self-start sm:self-auto">
                  0 / 12 Phân khu đã mở khóa
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {CAMPAIGN_SECTORS.map((sec) => {
                  const tabTheme =
                    SECTOR_METADATA_THEMES[sec.sectorNumber] || SECTOR_METADATA_THEMES[1];
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setIsSurveyModalOpen(true)}
                      className="p-4 rounded-xl bg-[#F8FAFC] hover:bg-sky-50/60 border border-slate-200 hover:border-sky-300 text-left transition cursor-pointer flex flex-col justify-between gap-3 group shadow-2xs"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                          CHỜ XẾP HẠNG · KHU {sec.sectorNumber}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200/80 text-slate-600 text-[10px] font-mono font-semibold group-hover:bg-sky-100 group-hover:text-sky-700">
                          <Lock className="w-3 h-3" />
                          <span>Chờ khảo sát</span>
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="shrink-0 text-slate-500">{tabTheme.icon}</span>
                          <p className="text-xs font-bold text-slate-800 line-clamp-1">
                            {sec.title}
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {sec.subtitle}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-medium text-sky-700">
                        <span>Làm khảo sát để phân thứ tự trạm</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Sector Rack Navigation Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                  DANH MỤC 12 PHÂN KHU ĐÀO TẠO (ĐÃ SẮP XẾP CÁ NHÂN HÓA THEO ĐỘ ƯU TIÊN RỦI RO)
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  Chọn phân khu để hiển thị sơ đồ trạm huấn luyện
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={activeSectorIndex <= 0}
                  onClick={() => handleSelectSectorIndex(Math.max(0, activeSectorIndex - 1))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition ${
                    activeSectorIndex > 0
                      ? 'bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:text-sky-700 cursor-pointer shadow-2xs'
                      : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Phân khu trước</span>
                </button>

                <span className="text-xs font-mono font-bold tabular-nums text-slate-600 px-2">
                  {(activeSectorIndex + 1).toString().padStart(2, '0')} / {sectorsSorted.length.toString().padStart(2, '0')}
                </span>

                <button
                  type="button"
                  disabled={
                    activeSectorIndex >= sectorsSorted.length - 1 ||
                    !isSectorUnlocked(activeSectorIndex + 1)
                  }
                  onClick={() =>
                    handleSelectSectorIndex(
                      Math.min(sectorsSorted.length - 1, activeSectorIndex + 1)
                    )
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition ${
                    activeSectorIndex < sectorsSorted.length - 1 &&
                    isSectorUnlocked(activeSectorIndex + 1)
                      ? 'bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:text-sky-700 cursor-pointer shadow-2xs'
                      : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  }`}
                >
                  <span>Phân khu tiếp</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Horizontal Scrollable Sector Cards */}
            <div
              id="scamguard-blade-rack"
              className="flex overflow-x-auto gap-2.5 pb-2 scroll-smooth snap-x"
            >
              {sectorsSorted.map((sec, idx) => {
                const isSelected = activeSectorIndex === idx;
                const unlocked = isSectorUnlocked(idx);
                const secCompleted = sec.nodes.filter((n) =>
                  completedNodeIds.includes(n.id)
                ).length;
                const isAllNodesDone = secCompleted === sec.nodes.length;
                const isExamPassed = certifiedSectors.includes(sec.sectorNumber);
                const tabTheme =
                  SECTOR_METADATA_THEMES[sec.sectorNumber] || SECTOR_METADATA_THEMES[1];
                const failureRate = calculateSectorFailureRate(sec.id, analyticsData, personalSurveyData);

                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => {
                      if (!hasCompletedSurvey && !openAccessMode) {
                        setIsSurveyModalOpen(true);
                        return;
                      }
                      if (unlocked) {
                        handleSelectSectorIndex(idx);
                      }
                    }}
                    disabled={!unlocked && hasCompletedSurvey && !openAccessMode}
                    className={`flex-shrink-0 w-[196px] p-3.5 rounded-xl border text-left transition flex flex-col justify-between snap-start relative ${
                      isSelected
                        ? 'bg-sky-50/90 border-sky-500 text-slate-900 shadow-xs ring-1 ring-sky-500/20'
                        : unlocked
                        ? 'bg-white border-slate-200 hover:border-sky-300 text-slate-800 cursor-pointer shadow-2xs'
                        : 'bg-slate-50 border-slate-200/80 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span
                        className={`text-[10px] font-mono font-bold ${
                          isSelected ? 'text-sky-700' : 'text-slate-500'
                        }`}
                      >
                        TRẠM #{idx + 1} · KHU {sec.sectorNumber}
                      </span>
                      {isAllNodesDone && isExamPassed ? (
                        <span className="text-[10px] font-mono font-bold text-emerald-600 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          PASS
                        </span>
                      ) : isAllNodesDone && !isExamPassed ? (
                        <span className="text-[10px] font-mono font-bold text-amber-600">
                          CHỜ THI
                        </span>
                      ) : unlocked ? (
                        <span className="text-[10px] font-mono text-slate-500 font-semibold">
                          {secCompleted}/{sec.nodes.length} bài
                        </span>
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="shrink-0">{tabTheme.icon}</span>
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {sec.title}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-slate-100">
                        <span className="text-slate-500 font-medium">
                          {!hasCompletedSurvey && !openAccessMode
                            ? 'Cần khảo sát'
                            : !unlocked
                            ? `Cần Pass Trạm #${idx}`
                            : `Rủi ro: ${failureRate.toFixed(0)}%`}
                        </span>
                        <span
                          className={
                            isAllNodesDone && isExamPassed
                              ? 'text-emerald-600 font-bold'
                              : unlocked
                              ? 'text-sky-600 font-bold'
                              : 'text-slate-400'
                          }
                        >
                          {isAllNodesDone && isExamPassed
                            ? 'Đã qua trạm'
                            : unlocked
                            ? 'Đang mở'
                            : 'Đang khóa'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Sector Briefing Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-sky-100/70 text-sky-700 border border-sky-200 font-mono font-bold">
                      {envTheme.domainCode} · PHÂN KHU {currentSector.sectorNumber}
                    </span>
                    <span className="text-slate-500 font-medium">{envTheme.threatLevel}</span>
                  </div>
                  <h3
                    className={`font-bold text-slate-900 tracking-tight ${
                      ageMode === 'senior' ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
                    }`}
                  >
                    {currentSector.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3 bg-white border border-slate-200 px-3.5 py-2 rounded-xl self-start sm:self-auto shadow-2xs">
                  <Target className="w-4 h-4 text-sky-600" />
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-500 block font-medium">
                      Hoàn thành phân khu
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                      {sectorCompletedNodes.length} / {currentSector.nodes.length} trạm ({sectorProgressPercent}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                <div className="lg:col-span-7 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Mục tiêu huấn luyện & Phạm vi mô phỏng
                  </span>
                  <p
                    className={`text-slate-600 leading-relaxed ${
                      ageMode === 'senior' ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
                    }`}
                  >
                    {currentSector.subtitle} {envTheme.simulationDossier}
                  </p>
                </div>

                <div className="lg:col-span-5 p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700">
                      Căn cứ xếp hạng ưu tiên #{activeSectorIndex + 1}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Rủi ro: {currentFailureRate.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {getSectorFailureReason(currentSector.id)}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 4. TAB CONTENT WORKSPACE */}
        {roadmapTab === 'PATH_AND_MEMORY' && (hasCompletedSurvey || openAccessMode) && (() => {
          const currentBlueprint =
            SECTOR_MEMORY_BLUEPRINTS[currentSector.sectorNumber] ||
            SECTOR_MEMORY_BLUEPRINTS[1];
          const chosenFeynmanId = sectorFeynmanAnswers[currentSector.sectorNumber];

          return (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* LEFT ZONE (7 COLS): SERPENTINE SNAKE PATH FIELD */}
              <div className="xl:col-span-7 relative w-full bg-gradient-to-b from-[#F2F7FD] via-[#ECF3FA] to-[#F2F7FD] rounded-2xl border-2 border-sky-200/90 overflow-hidden pt-8 pb-14 shadow-xs">
                <div
                  className="absolute inset-0 opacity-70 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(#93c5fd 1.25px, transparent 1.25px)',
                    backgroundSize: '24px 24px',
                  }}
                />

                <div className="relative z-10 flex items-center justify-between px-6 pb-4 mb-2 border-b border-sky-200/80 text-[11px] font-mono text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-sky-600" />
                    <span className="font-bold text-slate-800">
                      SƠ ĐỒ TRẠM THỰC HÀNH ({currentSector.nodes.length} TRẠM + 1 SÁT HẠCH)
                    </span>
                  </span>
                  <span className="text-sky-700 font-bold bg-sky-100/70 px-2 py-0.5 rounded border border-sky-200">{envTheme.domainCode}</span>
                </div>

                {/* SVG Serpentine Connection Path */}
                <div className="absolute inset-0 top-12 pointer-events-none flex justify-center">
                  <svg
                    className="w-full h-full"
                    viewBox={`0 0 400 ${(currentSector.nodes.length + 1) * 185 + 80}`}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {currentSector.nodes.slice(1).map((node, i) => {
                      const prevNode = currentSector.nodes[i];
                      const prevStatus = getNodeStatus(prevNode, i);
                      const currentStatus = getNodeStatus(node, i + 1);

                      const prevX = 200 + getHorizontalOffset(i);
                      const prevY = 40 + i * 185 + 46;
                      const x = 200 + getHorizontalOffset(i + 1);
                      const y = 40 + (i + 1) * 185 + 46;

                      const midY = (prevY + y) / 2;
                      const controlOffset = i % 2 === 0 ? 22 : -22;
                      const pathD = `M ${prevX} ${prevY} C ${prevX + controlOffset} ${midY}, ${
                        x - controlOffset
                      } ${midY}, ${x} ${y}`;

                      const isCompletedSegment = currentStatus === 'completed';
                      const isActiveSegment =
                        (prevStatus === 'completed' || prevStatus === 'active') &&
                        currentStatus === 'active';

                      let strokeColor = '#94A3B8';
                      if (isCompletedSegment) {
                        strokeColor = '#10B981';
                      } else if (isActiveSegment) {
                        strokeColor = '#0284C7';
                      }

                      return (
                        <g key={`snake-segment-${i}`}>
                          <path
                            d={pathD}
                            stroke="#BAE6FD"
                            strokeWidth="7"
                            strokeLinecap="round"
                          />
                          <path
                            d={pathD}
                            stroke={strokeColor}
                            strokeWidth="2.5"
                            strokeDasharray={isActiveSegment ? '6 6' : !isCompletedSegment ? '4 5' : undefined}
                            strokeLinecap="round"
                          />
                        </g>
                      );
                    })}

                    {(() => {
                      const lastNodeIdx = currentSector.nodes.length - 1;
                      const certNodeIdx = currentSector.nodes.length;
                      const prevX = 200 + getHorizontalOffset(lastNodeIdx);
                      const prevY = 40 + lastNodeIdx * 185 + 46;
                      const x = 200 + getHorizontalOffset(certNodeIdx);
                      const y = 40 + certNodeIdx * 185 + 46;
                      const midY = (prevY + y) / 2;
                      const controlOffset = lastNodeIdx % 2 === 0 ? 22 : -22;
                      const pathD = `M ${prevX} ${prevY} C ${prevX + controlOffset} ${midY}, ${
                        x - controlOffset
                      } ${midY}, ${x} ${y}`;

                      return (
                        <g key="snake-segment-cert">
                          <path d={pathD} stroke="#BAE6FD" strokeWidth="7" strokeLinecap="round" />
                          <path
                            d={pathD}
                            stroke={isCurrentSectorFinished ? '#10B981' : '#94A3B8'}
                            strokeWidth="2.5"
                            strokeDasharray={isCurrentSectorFinished ? undefined : '5 5'}
                            strokeLinecap="round"
                          />
                        </g>
                      );
                    })()}
                  </svg>
                </div>

                {/* Serpentine Station Nodes */}
                <div className="relative z-10 pt-2">
                  {currentSector.nodes.map((node, nIdx) => {
                    const status = getNodeStatus(node, nIdx);
                    const offsetPx = getHorizontalOffset(nIdx);

                    return (
                      <div
                        key={node.id}
                        className="relative w-full h-[185px] flex justify-center"
                      >
                        <div
                          className="absolute flex flex-col items-center z-20"
                          style={{
                            top: '14px',
                            transform: `translateX(${offsetPx}px)`,
                          }}
                        >
                          <div className="relative flex items-center justify-center">
                            <button
                              id={`campaign-node-${node.id}`}
                              type="button"
                              onClick={() => handleLaunchNode(node)}
                              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all cursor-pointer select-none relative z-10 border-2 ${
                                status === 'completed'
                                  ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 border-emerald-400 text-white shadow-sm hover:from-emerald-400 hover:to-emerald-500'
                                  : status === 'active'
                                  ? 'bg-gradient-to-b from-sky-500 to-sky-600 border-sky-400 text-white ring-4 ring-sky-400/30 shadow-lg shadow-sky-500/25 hover:from-sky-400 hover:to-sky-500'
                                  : 'bg-gradient-to-b from-white to-[#EEF5FB] border-sky-200 text-sky-700 shadow-xs hover:border-sky-400'
                              }`}
                            >
                              {status === 'completed' ? (
                                <Check className="w-6 h-6 stroke-[2.5] text-white" />
                              ) : status === 'active' ? (
                                getNodeKindIcon(node.kind, 'w-5 h-5')
                              ) : (
                                <Lock className="w-4 h-4 text-sky-600" />
                              )}
                            </button>

                            <span
                              className={`absolute -top-2 -right-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border z-20 ${
                                status === 'completed'
                                  ? 'bg-emerald-600 text-white border-emerald-500'
                                  : status === 'active'
                                  ? 'bg-sky-600 text-white border-sky-500 shadow-xs'
                                  : 'bg-white text-sky-800 border-sky-200 shadow-2xs'
                              }`}
                            >
                              {(nIdx + 1).toString().padStart(2, '0')}
                            </span>
                          </div>

                          <div
                            onClick={() => handleLaunchNode(node)}
                            className={`mt-2.5 w-[195px] sm:w-[215px] px-3.5 py-2.5 rounded-xl cursor-pointer transition border text-left flex flex-col justify-between ${
                              status === 'completed'
                                ? 'bg-gradient-to-b from-white to-[#F0FDF4] border-2 border-emerald-300 shadow-xs hover:border-emerald-400'
                                : status === 'active'
                                ? 'bg-gradient-to-b from-white to-[#F0F9FF] border-2 border-sky-500 shadow-md ring-2 ring-sky-400/25 border-t-4 border-t-sky-500'
                                : 'bg-gradient-to-b from-white to-[#F1F6FB] border border-sky-200/90 shadow-2xs hover:border-sky-400'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1 text-[10px] font-mono">
                              <span
                                className={
                                  status === 'completed'
                                    ? 'text-emerald-700 font-bold bg-emerald-100/70 px-1.5 py-0.5 rounded border border-emerald-200'
                                    : status === 'active'
                                    ? 'text-sky-700 font-bold bg-sky-100/70 px-1.5 py-0.5 rounded border border-sky-200'
                                    : 'text-slate-600 font-semibold bg-slate-100/80 px-1.5 py-0.5 rounded border border-slate-200/80'
                                }
                              >
                                {getNodeKindLabel(node.kind, nIdx)}
                              </span>
                              <span className="text-sky-700 font-bold font-mono">+{node.xpReward} XP</span>
                            </div>

                            <p className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                              {node.title}
                            </p>

                            <div className="mt-2 pt-1.5 border-t border-sky-100/80 flex items-center justify-between text-[11px]">
                              {status === 'completed' ? (
                                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Đã hoàn thành</span>
                                </span>
                              ) : status === 'active' ? (
                                <span className="text-sky-700 font-bold flex items-center gap-1">
                                  <Play className="w-3 h-3 fill-sky-600 text-sky-600" />
                                  <span>Học ngay</span>
                                </span>
                              ) : !hasCompletedSurvey ? (
                                <span className="text-amber-700 font-semibold flex items-center gap-1">
                                  <Lock className="w-3 h-3 text-amber-600" />
                                  <span>Cần làm Khảo Sát</span>
                                </span>
                              ) : (
                                <span className="text-slate-500 font-medium flex items-center gap-1">
                                  <Lock className="w-3 h-3 text-sky-500" />
                                  <span>Học Bài {nIdx.toString().padStart(2, '0')} trước</span>
                                </span>
                              )}
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* 11TH NODE: SECTOR CERTIFICATION GATE */}
                  {(() => {
                    const certIdx = currentSector.nodes.length;
                    const certOffsetPx = getHorizontalOffset(certIdx);
                    const isCertified = certifiedSectors.includes(currentSector.sectorNumber);
                    const remainingNodes = currentSector.nodes.length - sectorCompletedNodes.length;

                    const handleCertGateClick = () => {
                      if (isCurrentSectorFinished || openAccessMode) {
                        setIsCertificationModalOpen(true);
                      } else {
                        setBriefingNode({
                          id: `cert-gate-${currentSector.sectorNumber}`,
                          sectorId: currentSector.id,
                          nodeIndex: 99,
                          title: `Sát Hạch Chứng Chỉ Phân Khu ${currentSector.sectorNumber}`,
                          shortDesc: `Bài kiểm tra định lượng 20 câu hỏi chuẩn ViSEF đánh giá năng lực nhận diện và xử lý tình huống sau khi hoàn thành Phân khu ${currentSector.sectorNumber}. Hiện còn ${remainingNodes} trạm chưa hoàn thành.`,
                          kind: 'lesson',
                          icon: '🎖️',
                          xpReward: 300,
                        });
                      }
                    };

                    return (
                      <div className="relative w-full h-[210px] flex justify-center mt-2">
                        {activeSectorIndex === sectorsSorted.length - 1 && (
                          <svg
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            style={{ overflow: 'visible' }}
                          >
                            <path
                              d={`M calc(50% + ${certOffsetPx}px) 55 C calc(50% + ${certOffsetPx}px) 130, calc(50% + ${getHorizontalOffset(certIdx + 1)}px) 115, calc(50% + ${getHorizontalOffset(certIdx + 1)}px) 225`}
                              fill="none"
                              stroke={canAccessCyberGuardianExam ? '#F59E0B' : '#94A3B8'}
                              strokeWidth="3"
                              strokeDasharray={canAccessCyberGuardianExam ? 'none' : '5 5'}
                            />
                          </svg>
                        )}

                        <div
                          className="absolute flex flex-col items-center z-20"
                          style={{
                            top: '14px',
                            transform: `translateX(${certOffsetPx}px)`,
                          }}
                        >
                          <button
                            type="button"
                            onClick={handleCertGateClick}
                            className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition cursor-pointer border ${
                              isCurrentSectorFinished || openAccessMode
                                ? 'bg-emerald-600 border-emerald-500 text-white ring-4 ring-emerald-500/20 shadow-md hover:bg-emerald-500'
                                : 'bg-white border-slate-200 text-slate-400 shadow-xs hover:border-sky-300'
                            }`}
                          >
                            {isCurrentSectorFinished || openAccessMode ? (
                              <Award className="w-7 h-7 text-white" />
                            ) : (
                              <Lock className="w-5 h-5 text-slate-400" />
                            )}
                          </button>

                          <div
                            onClick={handleCertGateClick}
                            className={`mt-2.5 w-[205px] sm:w-[225px] px-3.5 py-2.5 rounded-xl cursor-pointer transition border text-left ${
                              isCurrentSectorFinished || openAccessMode
                                ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/10'
                                : 'bg-white border-slate-200 shadow-xs hover:border-sky-300'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1 text-[10px] font-mono">
                              <span
                                className={
                                  isCurrentSectorFinished || openAccessMode
                                    ? 'text-emerald-600 font-semibold'
                                    : 'text-slate-500 font-medium'
                                }
                              >
                                CỔNG SÁT HẠCH KHU {currentSector.sectorNumber}
                              </span>
                              <span className="text-sky-600 font-semibold">+300 XP</span>
                            </div>
                            <p className="text-xs font-bold text-slate-900">
                              Bài Kiểm Tra Qua Trạm (20 Câu)
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1">
                              {isCertified
                                ? '✓ Đã Pass & Mở khóa Trạm tiếp theo'
                                : isCurrentSectorFinished || openAccessMode
                                ? 'Đã mở · Bấm để thi Pass qua trạm'
                                : `Cần học xong ${remainingNodes} bài nữa để mở`}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 12TH CULMINATION NODE (ON FINAL STATION): CYBER GUARDIAN FINAL EXAM GATE */}
                  {activeSectorIndex === sectorsSorted.length - 1 && (() => {
                    const finalIdx = currentSector.nodes.length + 1;
                    const finalOffsetPx = getHorizontalOffset(finalIdx);
                    const isGuardianPassed = Boolean(cyberGuardianCert?.isPassed);

                    return (
                      <div className="relative w-full h-[220px] flex justify-center mt-2">
                        <div
                          className="absolute flex flex-col items-center z-20"
                          style={{
                            top: '14px',
                            transform: `translateX(${finalOffsetPx}px)`,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setIsFinalExamModalOpen(true)}
                            className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition cursor-pointer border ${
                              isGuardianPassed
                                ? 'bg-emerald-600 border-emerald-500 text-white ring-4 ring-emerald-500/30 shadow-lg'
                                : canAccessCyberGuardianExam
                                ? 'bg-amber-500 border-amber-400 text-white ring-4 ring-amber-500/30 shadow-lg hover:bg-amber-400'
                                : 'bg-white border-amber-300 text-amber-600 shadow-xs hover:border-amber-400'
                            }`}
                          >
                            {canAccessCyberGuardianExam || isGuardianPassed ? (
                              <Trophy className="w-7 h-7" />
                            ) : (
                              <Lock className="w-5 h-5" />
                            )}
                          </button>

                          <div
                            onClick={() => setIsFinalExamModalOpen(true)}
                            className={`mt-2.5 w-[220px] sm:w-[240px] px-3.5 py-2.5 rounded-xl cursor-pointer transition border text-left ${
                              isGuardianPassed
                                ? 'bg-white border-emerald-500 shadow-md'
                                : canAccessCyberGuardianExam
                                ? 'bg-white border-amber-500 shadow-md'
                                : 'bg-white border-amber-200 shadow-xs'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1 text-[10px] font-mono">
                              <span className="text-amber-600 font-bold">
                                ĐÍCH ĐẾN · CYBER GUARDIAN
                              </span>
                              <span className="text-emerald-600 font-bold">+1000 XP</span>
                            </div>
                            <p className="text-xs font-bold text-slate-900">
                              Kỳ Thi Tốt Nghiệp Tối Thượng (24 Câu)
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1">
                              {isGuardianPassed
                                ? `✓ Đã đạt Chứng chỉ (${cyberGuardianCert?.score}/100)`
                                : canAccessCyberGuardianExam
                                ? 'Đã mở khóa! Bấm để thi lấy Chứng chỉ'
                                : `Cần Pass đủ 12/12 trạm (Hiện: ${certifiedSectors.length}/12)`}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* RIGHT ZONE (5 COLS): PERMANENT MEMORY BLUEPRINT DECK FOR ACTIVE SECTOR */}
              <div className="xl:col-span-5 space-y-4 xl:sticky xl:top-20">
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-sky-700 uppercase block">
                        BỘ NEO TRÍ NHỚ VĨNH CỬU · PHÂN KHU {currentSector.sectorNumber}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                        {currentBlueprint.coreTheme}
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                      100% Nhớ Mãi
                    </span>
                  </div>

                  {/* 1. Rhythmic Mnemonic */}
                  <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-sky-800 uppercase block">
                      🎵 KHẨU QUYẾT VẦN ĐIỆU 3 GIÂY (ĐỌC THÀNH TIẾNG)
                    </span>
                    <p className="text-sm font-bold text-sky-950 leading-relaxed">
                      &ldquo;{currentBlueprint.mnemonicRhyme}&rdquo;
                    </p>
                  </div>

                  {/* 2. 3-Second Reflex Steps */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono font-bold text-slate-500 uppercase block">
                      PHẢN XẠ 3 GIÂY KHI GẶP TÌNH HUỐNG NÀY
                    </span>
                    <div className="space-y-2 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200 font-mono font-bold text-[10px] shrink-0 mt-0.5">
                          GIÂY 1
                        </span>
                        <span className="text-slate-800 font-medium leading-relaxed">
                          {currentBlueprint.threeSecondReflex.step1}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 font-mono font-bold text-[10px] shrink-0 mt-0.5">
                          GIÂY 2
                        </span>
                        <span className="text-slate-800 font-medium leading-relaxed">
                          {currentBlueprint.threeSecondReflex.step2}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono font-bold text-[10px] shrink-0 mt-0.5">
                          GIÂY 3
                        </span>
                        <span className="text-slate-800 font-medium leading-relaxed">
                          {currentBlueprint.threeSecondReflex.step3}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Brain Hijack Mechanism */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <span className="text-[10px] font-mono font-bold text-purple-700 uppercase block">
                      🧠 GIẢI PHẪU ĐIỂM MÙ NÃO BỘ ({currentBlueprint.brainMechanism.hijackTarget})
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      {currentBlueprint.brainMechanism.whyStudentsFall}
                    </p>
                    <div className="pt-2 border-t border-slate-200 text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200/80 font-medium">
                      <strong>Lá chắn nhận thức: </strong>
                      {currentBlueprint.brainMechanism.cognitiveShield}
                    </div>
                  </div>

                  {/* 4. Side-by-Side Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-rose-700 uppercase block">
                        ✗ DẤU HIỆU BẪY 100%
                      </span>
                      <p className="text-rose-950 font-medium leading-relaxed">
                        {currentBlueprint.sideBySideComparison.trapSignal}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase block">
                        ✓ DẤU HIỆU THẬT
                      </span>
                      <p className="text-emerald-950 font-medium leading-relaxed">
                        {currentBlueprint.sideBySideComparison.authenticSignal}
                      </p>
                    </div>
                  </div>

                  {/* 5. Interactive Feynman Mini-Challenge */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <span className="text-[10px] font-mono font-bold text-amber-700 uppercase block">
                      🎓 THỬ THÁCH FEYNMAN: DẠY LẠI CHO NGƯỜI THÂN ĐỂ NHỚ 100%
                    </span>
                    <p className="text-xs font-bold text-slate-900 leading-relaxed">
                      {currentBlueprint.feynmanChallenge.question}
                    </p>
                    <div className="space-y-1.5">
                      {currentBlueprint.feynmanChallenge.options.map((opt) => {
                        const isPicked = chosenFeynmanId === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setSectorFeynmanAnswers((prev) => ({
                                ...prev,
                                [currentSector.sectorNumber]: opt.id,
                              }));
                              if (opt.isBestExplanation && onEarnXp && chosenFeynmanId !== opt.id) {
                                onEarnXp(15);
                              }
                            }}
                            className={`w-full text-left p-3 rounded-xl border text-xs transition cursor-pointer ${
                              isPicked
                                ? opt.isBestExplanation
                                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-2xs'
                                  : 'bg-rose-50 border-rose-400 text-rose-950 shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs'
                            }`}
                          >
                            <div className="font-semibold leading-snug">{opt.text}</div>
                            {isPicked && (
                              <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 text-[11px] font-bold">
                                {opt.feedback}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* TAB 2: INTERACTIVE SCAM X-RAY ANATOMY SANDBOX */}
        {roadmapTab === 'SCAM_XRAY' && (() => {
          const activeCase =
            INTERACTIVE_SCAM_ANATOMY_CASES.find((c) => c.id === selectedAnatomyId) ||
            INTERACTIVE_SCAM_ANATOMY_CASES[0];
          const activeLayer =
            activeCase.layers.find((l) => l.id === selectedLayerId) || activeCase.layers[0];

          return (
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-sky-700 uppercase block">
                    PHÒNG THÍ NGHIỆM GIẢI PHẪU X-RAY (VISUAL RED-FLAG DISSECTION)
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-0.5">
                    Bóc tách từng lớp kịch bản lừa đảo học đường & gia đình
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {INTERACTIVE_SCAM_ANATOMY_CASES.map((c, idx) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedAnatomyId(c.id);
                        setSelectedLayerId(c.layers[0].id);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        activeCase.id === c.id
                          ? 'bg-sky-600 border-sky-500 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs'
                      }`}
                    >
                      Ca #{idx + 1}: {c.title.split(' ')[1]} {c.title.split(' ')[2]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Raw Scam Evidence Canvas */}
                <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between text-xs border-b border-slate-200/80 pb-3">
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Nguồn gửi giả mạo:</span>
                      <span className="font-mono font-bold text-rose-600">{activeCase.senderDisplay}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 font-mono text-[11px] font-semibold shadow-2xs">
                      {activeCase.channel} · {activeCase.targetAudience}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-slate-200 font-mono text-xs sm:text-sm text-slate-800 leading-relaxed shadow-2xs">
                    &ldquo;{activeCase.rawMessage}&rdquo;
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block">
                      Đoạn văn bản đang soi X-Ray:
                    </span>
                    <p className="text-xs font-mono text-amber-950 font-bold">
                      &ldquo;{activeLayer.highlightedSnippet}&rdquo;
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium">
                    <strong className="text-emerald-700 font-bold">Phản xạ vàng 3 giây: </strong>
                    {activeCase.goldenReflex}
                  </div>
                </div>

                {/* Right: 4 Interactive Dissection Layers */}
                <div className="lg:col-span-6 space-y-3">
                  <span className="text-xs font-bold text-slate-500 block">
                    Nhấp vào từng tầng giải phẫu bên dưới để xem cơ chế thao túng và khẩu quyết khắc chế:
                  </span>
                  {activeCase.layers.map((layer) => {
                    const isSelected = activeLayer.id === layer.id;
                    return (
                      <button
                        key={layer.id}
                        type="button"
                        onClick={() => setSelectedLayerId(layer.id)}
                        className={`w-full text-left p-4 rounded-xl border transition cursor-pointer space-y-2 ${
                          isSelected
                            ? 'bg-sky-50 border-sky-400 text-sky-950 shadow-xs ring-1 ring-sky-400/30'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-xs font-bold ${isSelected ? 'text-sky-900' : 'text-slate-900'}`}>
                            {layer.label}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-100/70 border border-sky-200 text-sky-700">
                            {layer.layerType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{layer.analysis}</p>
                        <div className="pt-1.5 border-t border-slate-200/80 text-xs font-bold text-amber-700">
                          📌 Quy tắc nhớ nhanh: {layer.memoryRule}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        {/* TAB 3: SPACED REPETITION PERMANENT FLASHCARDS */}
        {roadmapTab === 'FLASHCARDS_100' && (() => {
          const categories = ['ALL', 'Tâm lý', 'Tên miền & Link', 'Tài chính & OTP', 'Deepfake & AI', 'Mạng xã hội & Game'];
          const filteredCards =
            flashcardCategory === 'ALL'
              ? PERMANENT_MEMORY_FLASHCARDS
              : PERMANENT_MEMORY_FLASHCARDS.filter((c) => c.category === flashcardCategory);

          const toggleFlip = (id: string) => {
            setFlippedCardIds((prev) =>
              prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
            );
          };

          const toggleMastered = (id: string) => {
            setMasteredCardIds((prev) => {
              const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
              try {
                localStorage.setItem('scamguard_mastered_flashcards', JSON.stringify(next));
              } catch {
                // ignore
              }
              return next;
            });
          };

          return (
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-sky-700 uppercase block">
                    HỆ THỐNG THẺ LẬT GHI NHỚ NGẮT QUÃNG (LEITNER ACTIVE RECALL DECK)
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-0.5">
                    Nhấp vào thẻ để tự kiểm tra phản xạ 3 giây và đánh dấu thuộc lòng 100%
                  </h4>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFlashcardCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        flashcardCategory === cat
                          ? 'bg-sky-600 border-sky-500 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs'
                      }`}
                    >
                      {cat === 'ALL' ? 'Tất cả chủ đề' : cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCards.map((card) => {
                  const isFlipped = flippedCardIds.includes(card.id);
                  const isMastered = masteredCardIds.includes(card.id);

                  return (
                    <div
                      key={card.id}
                      className={`p-5 rounded-2xl border transition flex flex-col justify-between gap-4 ${
                        isMastered
                          ? 'bg-emerald-50/50 border-emerald-300 shadow-xs ring-1 ring-emerald-400/20'
                          : 'bg-slate-50 border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-sky-700 font-bold bg-sky-100/70 px-2 py-0.5 rounded border border-sky-200">
                            {card.category}
                          </span>
                          <span className={isMastered ? 'text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200' : 'text-slate-500 font-medium'}>
                            {isMastered ? '✓ Đã nhớ vĩnh viễn' : 'Đang rèn luyện'}
                          </span>
                        </div>

                        {!isFlipped ? (
                          <div
                            onClick={() => toggleFlip(card.id)}
                            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-sky-400 cursor-pointer space-y-2.5 min-h-[170px] flex flex-col justify-between shadow-2xs"
                          >
                            <div className="space-y-2">
                              <span className="text-[10px] font-mono uppercase text-amber-700 font-bold block">
                                MẶT TRƯỚC · TÌNH HUỐNG KÍCH HOẠT
                              </span>
                              <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                                {card.frontTrigger}
                              </p>
                              <p className="text-xs font-mono text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                {card.frontScenario}
                              </p>
                            </div>
                            <span className="text-[11px] text-sky-700 font-bold block pt-1">
                              👉 Nhấp để lật xem Khẩu quyết 3 giây →
                            </span>
                          </div>
                        ) : (
                          <div
                            onClick={() => toggleFlip(card.id)}
                            className="p-4 rounded-xl bg-sky-50 border border-sky-300 cursor-pointer space-y-2.5 min-h-[170px] shadow-2xs"
                          >
                            <span className="text-[10px] font-mono uppercase text-emerald-800 font-bold block">
                              MẶT SAU · KHẨU QUYẾT & HÀNH ĐỘNG CHUẨN
                            </span>
                            <p className="text-xs sm:text-sm font-black text-sky-950">
                              &ldquo;{card.backMnemonic}&rdquo;
                            </p>
                            <ul className="space-y-1 text-xs text-slate-800 font-medium">
                              {card.backActionSteps.map((step, sIdx) => (
                                <li key={sIdx} className="flex items-start gap-1.5">
                                  <span className="text-emerald-600 font-bold">•</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ul>
                            <p className="text-[11px] text-slate-500 pt-1 border-t border-sky-200">
                              Cơ sở: {card.whyItWorks}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => toggleFlip(card.id)}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 cursor-pointer shadow-2xs"
                        >
                          {isFlipped ? 'Lật lại mặt trước' : 'Lật xem đáp án'}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleMastered(card.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer shadow-2xs ${
                            isMastered
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-sky-600 hover:bg-sky-500 border-sky-500 text-white'
                          }`}
                        >
                          {isMastered ? 'Đã thuộc lòng 100%' : 'Đánh dấu Đã nhớ'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* TAB 4: 4-STAGE PEDAGOGICAL & CLASSROOM METHODOLOGY */}
        {roadmapTab === 'TEACHING_METHOD' && (
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4 space-y-1">
              <span className="text-[10px] font-mono font-bold text-sky-700 uppercase block">
                CẨM NANG SƯ PHẠM AN NINH MẠNG · MÔ HÌNH LƯU GIỮ TRÍ NHỚ 98%
              </span>
              <h4 className="text-base sm:text-lg font-bold text-slate-900">
                Cách Tiếp Cận, Bày Trí Lớp Học & Giảng Dạy Giúp Học Sinh Nhớ 100% Mãi Mãi
              </h4>
              <p className="text-xs text-slate-500">
                Thiết kế dựa trên Tháp học tập chủ động (Active Learning Pyramid), Lý thuyết Tiêm chủng Tâm lý (McGuire) và Kỹ thuật Feynman.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PEDAGOGY_METHOD_PILLARS.map((pillar) => (
                <div
                  key={pillar.id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded border border-sky-200">
                      {pillar.stepNumber}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200">
                      Tỷ lệ nhớ dài hạn: {pillar.retentionRate}%
                    </span>
                  </div>
                  <h5 className="text-sm font-bold text-slate-900">{pillar.title}</h5>
                  <p className="text-[11px] font-mono text-slate-500">
                    Nguyên lý khoa học: {pillar.scientificPrinciple}
                  </p>
                  <div className="space-y-2 text-xs text-slate-700 pt-1">
                    <div>
                      <strong className="text-slate-900">Hoạt động của học sinh: </strong>
                      {pillar.studentActivity}
                    </div>
                    <div>
                      <strong className="text-slate-900">Cách bày trí & Tổ chức dạy: </strong>
                      {pillar.classroomArrangement}
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 font-medium">
                      <strong className="text-amber-800">Ví dụ thực hành: </strong>
                      {pillar.practicalExample}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Ebbinghaus Spaced Repetition Schedule for Schools */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h5 className="text-sm font-bold text-slate-900">
                Chu Kỳ Ôn Tập Ngắt Quãng Chống Đường Cong Quên Lãng Ebbinghaus (1 - 3 - 7 - 30 Ngày)
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-mono font-bold text-sky-700 block">
                    NGÀY 01 · TRÊN LỚP (15 PHÚT)
                  </span>
                  <p className="font-bold text-slate-900">Trải nghiệm Cú sốc + Khẩu quyết 3 giây</p>
                  <p className="text-slate-500">Làm 1 bài học tương tác và đọc to khẩu quyết vần điệu.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-mono font-bold text-amber-700 block">
                    NGÀY 03 · TỐI TẠI NHÀ (3 PHÚT)
                  </span>
                  <p className="font-bold text-slate-900">Dạy lại cho Bố Mẹ (Feynman)</p>
                  <p className="text-slate-500">Kể lại 1 chiêu trò cho người thân và lập Mật khẩu gia đình.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-mono font-bold text-purple-700 block">
                    NGÀY 07 · PHẢN XẠ 25 GIÂY
                  </span>
                  <p className="font-bold text-slate-900">Quét nhanh Thẻ lật & Phản xạ</p>
                  <p className="text-slate-500">Lật lại 6 thẻ Flashcard và chơi 1 vòng Phản xạ 25 giây.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-mono font-bold text-emerald-700 block">
                    NGÀY 30 · CHỨNG CHỈ VISEF
                  </span>
                  <p className="font-bold text-slate-900">Sát hạch Thực chiến Đấu Trùm</p>
                  <p className="text-slate-500">Hoàn thành bài thi 20 câu chuyển hóa thành phản xạ vô điều kiện.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sector Completion Banner */}
        {isCurrentSectorFinished && (
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-emerald-700">
                    HOÀN THÀNH PHÂN KHU {currentSector.sectorNumber}
                  </span>
                  {certifiedSectors.includes(currentSector.sectorNumber) && (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-semibold">
                      Đã cấp chứng chỉ
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Sát Hạch Chứng Chỉ Năng Lực Phòng Thủ (20 Câu Hỏi Chuẩn ViSEF)
                </h4>
                <p className="text-xs text-slate-600">
                  Hoàn thành bài kiểm tra định lượng Post-Test để ghi nhận mức tăng trưởng điểm phòng thủ SDI.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCertificationModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shrink-0 cursor-pointer transition shadow-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {certifiedSectors.includes(currentSector.sectorNumber)
                  ? 'Xem Chứng Chỉ / Thi Lại'
                  : 'Bắt Đầu Thi Sát Hạch'}
              </span>
            </button>
          </div>
        )}

        {/* GRAND FINALE CITADEL: CYBER GUARDIAN MASTER CERTIFICATION GATE */}
        <div
          className={`p-5 rounded-2xl border flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${
            cyberGuardianCert?.isPassed
              ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
              : canAccessCyberGuardianExam
              ? 'bg-amber-50/80 border-amber-300 shadow-xs ring-2 ring-amber-400/20'
              : 'bg-slate-50 border-slate-200 shadow-2xs'
          }`}
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${
                cyberGuardianCert?.isPassed
                  ? 'bg-emerald-100 border-emerald-200 text-emerald-700'
                  : canAccessCyberGuardianExam
                  ? 'bg-amber-100 border-amber-300 text-amber-800'
                  : 'bg-white border-slate-200 text-amber-600'
              }`}
            >
              <Trophy className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="font-bold text-amber-700 uppercase">
                  CỔNG SÁT HẠCH TỐI THƯỢNG · CHỨNG CHỈ &ldquo;CYBER GUARDIAN&rdquo;
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-600 font-semibold">
                  Tiến độ mở khóa: {completedCount}/{totalNodesCount} Bài học &bull; {certifiedSectors.length}/12 Trạm đã Pass
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                {cyberGuardianCert?.isPassed
                  ? `Đã Cấp Chứng Chỉ Cyber Guardian (${cyberGuardianCert.certificateCode}) — Điểm số: ${cyberGuardianCert.score}/100`
                  : canAccessCyberGuardianExam
                  ? 'Bạn đã đủ điều kiện tham gia Kỳ Thi Tốt Nghiệp Cyber Guardian (24 Câu Hỏi Phức Hợp Đa Tầng)!'
                  : 'Hoàn thành tuần tự 12/12 Trạm Đào tạo & Kiểm tra qua trạm để mở khóa Kỳ Thi Tốt Nghiệp Cyber Guardian'}
              </h4>
              <p className="text-xs text-slate-500">
                Đánh giá tổng hợp 24 kịch bản pháp y kỹ thuật số & thao túng tâm lý học xuyên suốt 12 phân khu (Chuẩn đỗ &ge; 80%).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsFinalExamModalOpen(true)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shrink-0 cursor-pointer transition ${
              cyberGuardianCert?.isPassed
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                : canAccessCyberGuardianExam
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-2xs'
            }`}
          >
            {cyberGuardianCert?.isPassed ? (
              <>
                <Award className="w-4 h-4" />
                <span>Xem Chứng Chỉ Cyber Guardian</span>
              </>
            ) : canAccessCyberGuardianExam ? (
              <>
                <Trophy className="w-4 h-4" />
                <span>Bắt Đầu Thi Cyber Guardian (24 Câu)</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-amber-600" />
                <span>Kiểm Tra Điều Kiện Mở Khóa ({certifiedSectors.length}/12)</span>
              </>
            )}
          </button>
        </div>

        {/* Footer Navigation Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            {isCurrentSectorFinished && certifiedSectors.includes(currentSector.sectorNumber) ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  Đã hoàn thành 10/10 bài học và PASS Bài Kiểm Tra Cuối Trạm.{' '}
                  {activeSectorIndex < sectorsSorted.length - 1
                    ? 'Trạm tiếp theo đã mở khóa!'
                    : 'Kỳ Thi Tốt Nghiệp Cyber Guardian đã sẵn sàng!'}
                </span>
              </span>
            ) : isCurrentSectorFinished ? (
              <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>
                  Bạn đã học xong 10/10 bài! Hãy bấm làm &ldquo;Bài Kiểm Tra Qua Trạm (20 Câu)&rdquo; và đạt Pass để mở khóa bước kế tiếp.
                </span>
              </span>
            ) : (
              <span>
                Hoàn thành tuần lượt từng bài ({sectorCompletedNodes.length}/{currentSector.nodes.length}) → Thi đỗ Bài Kiểm Tra Cuối Trạm để mở khóa Trạm kế tiếp.
              </span>
            )}
          </div>

          {activeSectorIndex < sectorsSorted.length - 1 ? (
            <button
              type="button"
              disabled={!isSectorUnlocked(activeSectorIndex + 1)}
              onClick={() => {
                if (isSectorUnlocked(activeSectorIndex + 1)) {
                  handleSelectSectorIndex(activeSectorIndex + 1);
                }
              }}
              className={`px-4 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2 transition ${
                isSectorUnlocked(activeSectorIndex + 1)
                  ? 'bg-sky-600 text-white hover:bg-sky-500 cursor-pointer shadow-xs'
                  : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>
                {isSectorUnlocked(activeSectorIndex + 1)
                  ? `Qua Trạm Tiếp Theo (Trạm #${activeSectorIndex + 2})`
                  : isCurrentSectorFinished
                  ? `Cần Pass Bài Kiểm Tra Trạm #${activeSectorIndex + 1} Để Mở Trạm #${activeSectorIndex + 2}`
                  : `Trạm #${activeSectorIndex + 2} (Khóa — Cần Học Hết & Pass Trạm #${activeSectorIndex + 1})`}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsFinalExamModalOpen(true)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                canAccessCyberGuardianExam
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-white border border-amber-300 text-amber-700 hover:bg-amber-50/50 shadow-2xs'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>
                {cyberGuardianCert?.isPassed
                  ? 'Xem Chứng Chỉ Cyber Guardian'
                  : canAccessCyberGuardianExam
                  ? 'Thi Tốt Nghiệp Cyber Guardian Ngay'
                  : 'Cổng Thi Tốt Nghiệp Cyber Guardian (Trạm Cuối)'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 5. RUNNER MODALS */}
      {activeLessonNode && activeLessonNode.lessonData && (
        <DuolingoLessonRunner
          lesson={activeLessonNode.lessonData}
          unit={{
            id: currentSector.id,
            unitNumber: currentSector.sectorNumber,
            title: currentSector.title,
            objective: currentSector.subtitle,
            themeColor: {
              bg: currentSector.themeColor.bg,
              border: currentSector.themeColor.border,
              glow: currentSector.themeColor.glow,
              text: currentSector.themeColor.text,
              gradient: 'from-blue-600 to-slate-800',
              button: 'bg-blue-600 hover:bg-blue-500 text-white',
            },
            lessons: currentSector.nodes
              .filter((n) => n.lessonData)
              .map((n) => n.lessonData!),
          }}
          isOpen={true}
          onClose={() => setActiveLessonNode(null)}
          onCompleteLesson={(_lessonId, earnedXp) => {
            markNodeComplete(activeLessonNode.id, earnedXp);
          }}
        />
      )}

      {activeBossNode && (
        <BossBattleRunner
          boss={activeBossNode}
          isOpen={true}
          onClose={() => setActiveBossNode(null)}
          onVictory={(bossId, earnedXp) => {
            const node = currentSector.nodes.find((n) => n.bossData?.id === bossId);
            if (node) {
              markNodeComplete(node.id, earnedXp);
            }
          }}
        />
      )}

      {activeReflexNode && (
        <SpeedReflexRunner
          challenge={activeReflexNode}
          isOpen={true}
          onClose={() => setActiveReflexNode(null)}
          onComplete={(challengeId, earnedXp) => {
            const node = currentSector.nodes.find(
              (n) => n.reflexData?.id === challengeId
            );
            if (node) {
              markNodeComplete(node.id, earnedXp);
            }
          }}
        />
      )}

      {activeChestNode && (
        <SupplyChestModal
          chest={activeChestNode}
          isOpen={true}
          onClose={() => setActiveChestNode(null)}
          onClaim={(chestId, earnedXp) => {
            const node = currentSector.nodes.find((n) => n.chestData?.id === chestId);
            if (node) {
              markNodeComplete(node.id, earnedXp);
            }
          }}
        />
      )}

      {/* Station Briefing Modal */}
      {briefingNode && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4 relative">
            <button
              type="button"
              onClick={() => setBriefingNode(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5 pr-8">
              <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0 shadow-2xs">
                {getNodeKindIcon(briefingNode.kind, 'w-5 h-5')}
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-700 block">
                  {getNodeKindLabel(briefingNode.kind, briefingNode.nodeIndex)} · Khu vực {currentSector.sectorNumber}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5 leading-snug">
                  {briefingNode.title}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              {briefingNode.shortDesc || briefingNode.subtitle}
            </p>

            <div className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl">
              <span className="text-slate-500 font-medium">Điểm kinh nghiệm hoàn thành:</span>
              <span className="text-sky-700 font-mono font-bold">+{briefingNode.xpReward} XP</span>
            </div>

            {!hasCompletedSurvey ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>Cần hoàn thành khảo sát chẩn đoán ViSEF để mở khóa lộ trình đào tạo.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setBriefingNode(null);
                    setIsSurveyModalOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white transition cursor-pointer shadow-xs"
                >
                  <FileText className="w-4 h-4" />
                  <span>Làm Khảo Sát ViSEF Ngay</span>
                </button>
              </div>
            ) : getNodeStatus(briefingNode, briefingNode.nodeIndex) === 'locked' ? (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2.5 font-medium">
                <Lock className="w-4 h-4 shrink-0 text-slate-400" />
                <span>Vui lòng hoàn thành các trạm phía trước trên lộ trình để mở khóa trạm này.</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const nodeToLaunch = briefingNode;
                  setBriefingNode(null);
                  handleLaunchNode(nodeToLaunch);
                }}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>
                  {getNodeStatus(briefingNode, briefingNode.nodeIndex) === 'completed'
                    ? 'Ôn Tập Lại Trạm Này'
                    : 'Bắt Đầu Trạm Huấn Luyện'}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sector Certification Modal */}
      <SectorTopic1CertificationModal
        isOpen={isCertificationModalOpen}
        onClose={() => setIsCertificationModalOpen(false)}
        sectorNumber={currentSector.sectorNumber}
        sectorTitle={currentSector.title}
        preAppScore={45}
        forceAllowExam={openAccessMode}
        onCertificateIssued={(record) => {
          if (record.isPassed) {
            setCertifiedSectors((prev) =>
              prev.includes(currentSector.sectorNumber)
                ? prev
                : [...prev, currentSector.sectorNumber]
            );
          }
        }}
        onUnlockNextSector={
          activeSectorIndex < sectorsSorted.length - 1
            ? () => {
                const nextSector = sectorsSorted[activeSectorIndex + 1];
                if (nextSector) {
                  setActiveSectorId(nextSector.id);
                }
              }
            : () => {
                setIsCertificationModalOpen(false);
                setIsFinalExamModalOpen(true);
              }
        }
      />

      {/* Cyber Guardian Final Examination & Master Certification Modal */}
      <CyberGuardianFinalExamModal
        isOpen={isFinalExamModalOpen}
        onClose={() => setIsFinalExamModalOpen(false)}
        hasCompletedSurvey={hasCompletedSurvey}
        sectorsProgress={sectorsProgressSummary}
        forceAllowExam={openAccessMode}
        preAppScore={42}
        onSelectSectorIndex={(idx) => {
          handleSelectSectorIndex(idx);
        }}
        onOpenSurvey={() => {
          setIsSurveyModalOpen(true);
        }}
        onGuardianCertified={(record) => {
          setCyberGuardianCert(record);
          if (onEarnXp) {
            onEarnXp(1000);
          }
        }}
      />

      {/* ViSEF Survey Modal */}
      <NationalScienceFairDemoModal
        isOpen={isSurveyModalOpen}
        onClose={() => setIsSurveyModalOpen(false)}
        onNavigateToMainUI={() => {
          setIsSurveyModalOpen(false);
        }}
      />
    </div>
  );
};
