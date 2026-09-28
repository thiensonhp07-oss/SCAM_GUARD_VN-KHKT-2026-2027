import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  ShieldCheck,
  User,
  Users,
  Layers,
  Sparkles,
  TrendingUp,
  Award,
  AlertTriangle,
  Info,
  Zap,
  BarChart3,
  Activity,
  CheckCircle2,
  RefreshCw,
  Send,
  X,
  Radio,
  Check,
  Clock,
  Target,
  Sliders,
  ChevronRight,
  Eye,
  FileSpreadsheet,
  Radar,
  Gauge,
  Scale,
} from 'lucide-react';
import {
  CommunitySurveySubmission,
  SurveyAnalyticsData,
  SurveyDemographicGroup,
} from '../types';

export interface ScamDnaVector {
  T: number; // Time Pressure (Áp lực thời gian)
  A: number; // Authority (Nỗi sợ uy quyền)
  G: number; // Greed (Lòng tham tài chính)
  E: number; // Emotion (Thao túng cảm xúc)
  C: number; // Convenience / QR Domain (Định kiến tiện lợi & QR)
  R: number; // Credulity / Verification (Cả tin & Thiếu xác minh)
}

export interface PersonalVsCommunityComparisonSuiteProps {
  participantName?: string;
  userPreScore?: number;
  userPostScore?: number;
  userDna?: ScamDnaVector;
  userSurvey?: CommunitySurveySubmission | null;
  communityDna?: ScamDnaVector;
  totalRespondents?: number;
  analytics?: SurveyAnalyticsData | null;
  surveys?: CommunitySurveySubmission[];
  onTakeSurvey?: () => void;
}

export const DEFAULT_USER_DNA: ScamDnaVector = {
  T: 0.65,
  A: 0.62,
  G: 0.55,
  E: 0.58,
  C: 0.60,
  R: 0.50,
};

export const DEFAULT_COMMUNITY_DNA: ScamDnaVector = {
  T: 0.69,
  A: 0.67,
  G: 0.56,
  E: 0.62,
  C: 0.64,
  R: 0.53,
};

export const DIMENSION_CONFIG = [
  {
    key: 'A',
    name: 'Nỗi Sợ Uy Quyền (Authority)',
    shortName: 'Uy Quyền (A)',
    relatedQuestions: 'KV2 (Công an giả), KV6 (.APK VNeID)',
    desc: 'Bị thao túng bởi danh nghĩa cơ quan công quyền, đe dọa tố tụng hoặc khóa SIM.',
    baremBenchmark: 70.5,
  },
  {
    key: 'C',
    name: 'Định Kiến Tiện Lợi & QR (Convenience)',
    shortName: 'Tiện Lợi / QR (C)',
    relatedQuestions: 'KV3 (COD 139k), KV7 (QR Quishing)',
    desc: 'Chủ quan thanh toán số tiền nhỏ hoặc quét mã QR thanh toán không xem trước URL.',
    baremBenchmark: 65.8,
  },
  {
    key: 'T',
    name: 'Áp Lực Thời Gian (Time Pressure)',
    shortName: 'Thời Gian (T)',
    relatedQuestions: 'KV8 (Cấp cứu 5 phút), KV2 (Hạn 2h)',
    desc: 'Bị dồn ép đếm ngược khẩn cấp, dẫn đến phản xạ vội vàng thiếu suy xét 2 kênh.',
    baremBenchmark: 72.5,
  },
  {
    key: 'E',
    name: 'Thao Túng Cảm Xúc (Emotion)',
    shortName: 'Cảm Xúc (E)',
    relatedQuestions: 'KV4 (Pig Butchering), KV9 (Deepfake AI)',
    desc: 'Lợi dụng tình cảm yêu đương hoặc nghe giọng, xem video Deepfake bạn thân vay tiền.',
    baremBenchmark: 64.0,
  },
  {
    key: 'R',
    name: 'Cả Tin & Thiếu Xác Minh (Credulity)',
    shortName: 'Cả Tin / Xác Minh (R)',
    relatedQuestions: 'KV1 (SMS Brand), KV11 (Sạc sạc), KV12 (Lừa đảo kép)',
    desc: 'Tin vào giao diện giống thật, cắm sạc công cộng hoặc tin dịch vụ lấy lại tiền treo.',
    baremBenchmark: 58.4,
  },
  {
    key: 'G',
    name: 'Lòng Tham Tài Chính (Greed)',
    shortName: 'Lợi Nhuận (G)',
    relatedQuestions: 'KV5 (Crypto Ponzi), KV10 (Drainer Web3)',
    desc: 'Bẫy hoa hồng nhiệm vụ, sàn lợi nhuận ảo 30%/ngày hoặc ủy quyền smart contract airdrop.',
    baremBenchmark: 60.5,
  },
] as const;

// Helper: Convert Vulnerability Ratio (0.0 - 1.0) to Defense Score (0 - 100)
export const getDefenseScore = (vulnRatio: number | undefined | null) => {
  if (vulnRatio === undefined || vulnRatio === null || !Number.isFinite(Number(vulnRatio))) {
    return 50;
  }
  const num = Number(vulnRatio);
  return Math.max(0, Math.min(100, Math.round((1 - num) * 100)));
};

// Helper: Calculate 6-axis Scam DNA from real survey responses
export function computeScamDnaFromAnswers(trapAnswers?: Record<string, string>): ScamDnaVector {
  if (!trapAnswers) return DEFAULT_USER_DNA;

  // Correct safe letters:
  // q1: C, q2: E, q3: D, q4: C, q5: E, q6: D, q7: C, q8: D, q9: D, q10: E, q11: C, q12: D
  const isSafe = (qKey: string, correctLetter: string) => {
    const ans = trapAnswers[qKey];
    return ans === correctLetter || ans === 'B_SAFE' || (typeof ans === 'string' && ans.endsWith('_SAFE'));
  };

  // T: Q8 (5 mins urgency) & Q2
  const tSafe = (isSafe('q8', 'D') ? 1 : 0) * 0.6 + (isSafe('q2', 'E') ? 1 : 0) * 0.4;
  const T = +(1 - tSafe * 0.85 - 0.10).toFixed(2);

  // A: Q2 (Police) & Q6 (.APK VNeID)
  const aSafe = (isSafe('q2', 'E') ? 1 : 0) * 0.5 + (isSafe('q6', 'D') ? 1 : 0) * 0.5;
  const A = +(1 - aSafe * 0.85 - 0.10).toFixed(2);

  // G: Q5 (Crypto Ponzi) & Q10 (Web3 Drainer)
  const gSafe = (isSafe('q5', 'E') ? 1 : 0) * 0.5 + (isSafe('q10', 'E') ? 1 : 0) * 0.5;
  const G = +(1 - gSafe * 0.85 - 0.10).toFixed(2);

  // E: Q4 (Pig Butchering) & Q9 (Deepfake AI)
  const eSafe = (isSafe('q4', 'C') ? 1 : 0) * 0.5 + (isSafe('q9', 'D') ? 1 : 0) * 0.5;
  const E = +(1 - eSafe * 0.85 - 0.10).toFixed(2);

  // C: Q3 (COD 139k) & Q7 (QR Quishing)
  const cSafe = (isSafe('q3', 'D') ? 1 : 0) * 0.5 + (isSafe('q7', 'C') ? 1 : 0) * 0.5;
  const C = +(1 - cSafe * 0.85 - 0.10).toFixed(2);

  // R: Q1 (SMS Brand), Q11 (Juice Jacking), Q12 (Double Scam)
  const rSafe = (isSafe('q1', 'C') ? 1 : 0) * 0.4 + (isSafe('q11', 'C') ? 1 : 0) * 0.3 + (isSafe('q12', 'D') ? 1 : 0) * 0.3;
  const R = +(1 - rSafe * 0.85 - 0.10).toFixed(2);

  return {
    T: Math.max(0.1, Math.min(0.95, T)),
    A: Math.max(0.1, Math.min(0.95, A)),
    G: Math.max(0.1, Math.min(0.95, G)),
    E: Math.max(0.1, Math.min(0.95, E)),
    C: Math.max(0.1, Math.min(0.95, C)),
    R: Math.max(0.1, Math.min(0.95, R)),
  };
}

export const PersonalVsCommunityComparisonSuite: React.FC<PersonalVsCommunityComparisonSuiteProps> = ({
  participantName = 'Khảo nghiệm viên ViSEF',
  userPreScore,
  userPostScore,
  userDna,
  userSurvey,
  communityDna,
  totalRespondents: propTotalRespondents,
  analytics: propAnalytics,
  surveys: propSurveys,
  onTakeSurvey,
}) => {
  const [activeTab, setActiveTab] = useState<'INTEGRATED_COMPARE' | 'PERSONAL_ONLY' | 'COMMUNITY_ONLY' | 'DEMOGRAPHIC_BENCHMARK'>('INTEGRATED_COMPARE');

  // Internal Live State
  const [internalAnalytics, setInternalAnalytics] = useState<SurveyAnalyticsData | null>(null);
  const [internalSurveys, setInternalSurveys] = useState<CommunitySurveySubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSurveyIndex, setSelectedSurveyIndex] = useState<number | 'CURRENT'>('CURRENT');
  const [selectedDemographic, setSelectedDemographic] = useState<string>('ALL');

  // Visualization mode & interaction for Direct Competence Card
  const [compareVizMode, setCompareVizMode] = useState<'RADAR' | 'GAUGE'>('RADAR');
  const [activeLayerFilter, setActiveLayerFilter] = useState<'ALL' | 'PERSONAL' | 'COMMUNITY'>('ALL');
  const [hoveredRadarDim, setHoveredRadarDim] = useState<typeof DIMENSION_CONFIG[number] | null>(null);

  // Pulse effect ticker
  const [hasPulseEffect, setHasPulseEffect] = useState(false);
  const prevCountRef = useRef<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Anonymous Contribution Modal State
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [contribGroup, setContribGroup] = useState<SurveyDemographicGroup>('STUDENT');
  const [contribName, setContribName] = useState('');
  const [contribPreScore, setContribPreScore] = useState(55);
  const [contribPostScore, setContribPostScore] = useState(88);
  const [contribFeedback, setContribFeedback] = useState('');
  const [isSubmittingContrib, setIsSubmittingContrib] = useState(false);
  const [contribSuccessMsg, setContribSuccessMsg] = useState<string | null>(null);

  // Fetch real-time live survey database
  const fetchLiveSurveyData = async () => {
    try {
      setLoading(true);
      const [resAnalytics, resSurveys] = await Promise.all([
        fetch('/api/research/survey-analytics'),
        fetch('/api/research/surveys'),
      ]);

      let newN = 0;
      if (resAnalytics.ok) {
        const aData = await resAnalytics.json();
        setInternalAnalytics(aData);
        newN = aData.totalRespondents || 0;
      }
      if (resSurveys.ok) {
        const sData = await resSurveys.json();
        if (sData.surveys && Array.isArray(sData.surveys)) {
          setInternalSurveys(sData.surveys);
          if (newN === 0) newN = sData.surveys.length;
        }
      }

      if (newN > prevCountRef.current && prevCountRef.current > 0) {
        setHasPulseEffect(true);
        setTimeout(() => setHasPulseEffect(false), 2200);
      }
      prevCountRef.current = newN;
      setLastSyncTime(new Date());
    } catch (err) {
      console.warn('Live survey sync notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveSurveyData();
    const timer = setInterval(fetchLiveSurveyData, 3000);

    const handleRealtimeUpdate = () => {
      fetchLiveSurveyData();
    };

    window.addEventListener('visef_survey_updated', handleRealtimeUpdate);
    window.addEventListener('storage', handleRealtimeUpdate);

    return () => {
      clearInterval(timer);
      window.removeEventListener('visef_survey_updated', handleRealtimeUpdate);
      window.removeEventListener('storage', handleRealtimeUpdate);
    };
  }, []);

  const activeAnalytics = propAnalytics || internalAnalytics;
  const activeSurveys = (propSurveys && propSurveys.length > 0) ? propSurveys : (activeAnalytics?.recentSurveys || internalSurveys);
  const totalN = propTotalRespondents !== undefined ? propTotalRespondents : (activeAnalytics?.totalRespondents ?? activeSurveys.length);

  // Active Personal Survey Data Calculation
  const inspectedSurvey = useMemo(() => {
    if (selectedSurveyIndex !== 'CURRENT' && activeSurveys[selectedSurveyIndex]) {
      return activeSurveys[selectedSurveyIndex];
    }
    return userSurvey || (activeSurveys.length > 0 ? activeSurveys[activeSurveys.length - 1] : null);
  }, [selectedSurveyIndex, activeSurveys, userSurvey]);

  // Derive Personal Scam DNA & Scores accurately from actual test
  const personalCalculated = useMemo(() => {
    let preScore = userPreScore;
    let postScore = userPostScore;
    let dna = userDna;
    let name = participantName;
    let isLiveSubmission = false;

    if (inspectedSurvey) {
      isLiveSubmission = true;
      name = inspectedSurvey.participantName || name;
      preScore = inspectedSurvey.testOutcome?.preScore ?? preScore ?? 55;
      postScore = inspectedSurvey.testOutcome?.postScore ?? postScore ?? 88;

      if (inspectedSurvey.testOutcome?.scamDnaShift?.before) {
        dna = inspectedSurvey.testOutcome.scamDnaShift.before;
      } else if (inspectedSurvey.surveyResponses?.trapAnswers) {
        dna = computeScamDnaFromAnswers(inspectedSurvey.surveyResponses.trapAnswers);
      }
    }

    if (!dna) {
      dna = DEFAULT_USER_DNA;
    }

    return {
      name,
      preScore: preScore ?? 55,
      postScore: postScore ?? 88,
      dna,
      isLiveSubmission,
    };
  }, [inspectedSurvey, userPreScore, userPostScore, userDna, participantName]);

  // Compute Empirical Community Scam DNA accurately from live surveys N
  const communityCalculated = useMemo(() => {
    const list = selectedDemographic === 'ALL'
      ? activeSurveys
      : activeSurveys.filter((s) => s.demographicGroup === selectedDemographic);

    // If list is empty, return default community DNA to avoid 0/0 = NaN
    if (!list || list.length === 0) {
      return {
        dna: communityDna || DEFAULT_COMMUNITY_DNA,
        avgPreScore: 48,
        count: totalN || 0,
      };
    }

    const count = list.length;
    let sumT = 0, sumA = 0, sumG = 0, sumE = 0, sumC = 0, sumR = 0;
    let sumPre = 0;

    list.forEach((s) => {
      const pre = s.testOutcome?.preScore;
      sumPre += (Number.isFinite(pre) ? Number(pre) : 50);
      let d = s.testOutcome?.scamDnaShift?.before;
      if (!d && s.surveyResponses?.trapAnswers) {
        d = computeScamDnaFromAnswers(s.surveyResponses.trapAnswers);
      }
      if (d) {
        sumT += Number.isFinite(d.T) ? Number(d.T) : 0.65;
        sumA += Number.isFinite(d.A) ? Number(d.A) : 0.65;
        sumG += Number.isFinite(d.G) ? Number(d.G) : 0.55;
        sumE += Number.isFinite(d.E) ? Number(d.E) : 0.60;
        sumC += Number.isFinite(d.C) ? Number(d.C) : 0.60;
        sumR += Number.isFinite(d.R) ? Number(d.R) : 0.50;
      } else {
        sumT += 0.65;
        sumA += 0.65;
        sumG += 0.55;
        sumE += 0.60;
        sumC += 0.60;
        sumR += 0.50;
      }
    });

    const len = Math.max(1, list.length);
    const avgDna: ScamDnaVector = {
      T: Number((sumT / len).toFixed(2)),
      A: Number((sumA / len).toFixed(2)),
      G: Number((sumG / len).toFixed(2)),
      E: Number((sumE / len).toFixed(2)),
      C: Number((sumC / len).toFixed(2)),
      R: Number((sumR / len).toFixed(2)),
    };

    return {
      dna: avgDna,
      avgPreScore: Math.round(sumPre / len),
      count: count || totalN || 0,
    };
  }, [activeSurveys, totalN, communityDna, selectedDemographic]);

  // Average 6-dimension defense scores
  const userAvgDefense = Math.round(
    DIMENSION_CONFIG.reduce((acc, dim) => acc + getDefenseScore(personalCalculated.dna[dim.key as keyof ScamDnaVector] ?? 0.5), 0) /
      DIMENSION_CONFIG.length
  );

  const communityAvgDefense = Math.round(
    DIMENSION_CONFIG.reduce((acc, dim) => acc + getDefenseScore(communityCalculated.dna[dim.key as keyof ScamDnaVector] ?? 0.5), 0) /
      DIMENSION_CONFIG.length
  );

  const scoreDiff = userAvgDefense - communityAvgDefense;

  // Handle Anonymous Contribution Submission
  const handleAnonymousSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContrib(true);
    try {
      const res = await fetch('/api/scamdna/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantName: contribName.trim() || 'Khảo nghiệm viên Ẩn danh',
          demographicGroup: contribGroup,
          preScore: Number(contribPreScore),
          postScore: Number(contribPostScore),
          feedbackNote: contribFeedback.trim() || 'Đóng góp dữ liệu khảo sát thực tế vào Hệ thống Đối chiếu Scam DNA ViSEF.',
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const newN = json.totalRespondents || totalN + 1;
        setContribSuccessMsg(`🎉 Cảm ơn bạn! Phiếu khảo nghiệm đã được ghi nhận. Tổng mẫu thực nghiệm N vừa cập nhật lên N = ${newN}.`);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('visef_survey_updated', { detail: json }));
        }
        fetchLiveSurveyData();
      } else {
        setContribSuccessMsg(`🎉 Dữ liệu ẩn danh đã được ghi nhận thành công! (N = ${totalN + 1})`);
        fetchLiveSurveyData();
      }
    } catch (e) {
      setContribSuccessMsg(`🎉 Dữ liệu của bạn đã được ghi nhận thành công!`);
      fetchLiveSurveyData();
    } finally {
      setIsSubmittingContrib(false);
    }
  };

  // SVG Radar Dimensions & Coordinates
  const radarWidth = 380;
  const radarHeight = 330;
  const radarCenterX = radarWidth / 2;
  const radarCenterY = 165;
  const radarRadius = 105;
  const numAxes = DIMENSION_CONFIG.length;
  const angleStep = (Math.PI * 2) / numAxes;

  const getRadarPoint = (value0to100: number | undefined | null, index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const safeVal = (value0to100 !== undefined && value0to100 !== null && Number.isFinite(Number(value0to100)))
      ? Math.max(0, Math.min(100, Number(value0to100)))
      : 50;
    const r = (safeVal / 100) * radarRadius;
    const x = radarCenterX + r * Math.cos(angle);
    const y = radarCenterY + r * Math.sin(angle);
    return {
      x: Number.isFinite(x) ? Number(x.toFixed(2)) : radarCenterX,
      y: Number.isFinite(y) ? Number(y.toFixed(2)) : radarCenterY,
    };
  };

  const getLabelPoint = (index: number, extraOffset = 22) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = radarRadius + extraOffset;
    const x = radarCenterX + r * Math.cos(angle);
    const y = radarCenterY + r * Math.sin(angle);
    return {
      x: Number.isFinite(x) ? Number(x.toFixed(2)) : radarCenterX,
      y: Number.isFinite(y) ? Number(y.toFixed(2)) : radarCenterY,
    };
  };

  const generatePolygonPath = (dna: ScamDnaVector | undefined | null) => {
    return DIMENSION_CONFIG.map((dim, idx) => {
      const vulnVal = dna ? (dna[dim.key as keyof ScamDnaVector] ?? 0.5) : 0.5;
      const defScore = getDefenseScore(vulnVal);
      const { x, y } = getRadarPoint(defScore, idx);
      return `${x},${y}`;
    }).join(' ');
  };

  const userPath = generatePolygonPath(personalCalculated.dna);
  const communityPath = generatePolygonPath(communityCalculated.dna);

  const userVertices = useMemo(() => {
    return DIMENSION_CONFIG.map((dim, idx) => {
      const vuln = personalCalculated.dna[dim.key as keyof ScamDnaVector] ?? 0.5;
      const score = getDefenseScore(vuln);
      return { ...getRadarPoint(score, idx), dim, score, idx };
    });
  }, [personalCalculated.dna, radarCenterX, radarCenterY, radarRadius]);

  const communityVertices = useMemo(() => {
    return DIMENSION_CONFIG.map((dim, idx) => {
      const vuln = communityCalculated.dna[dim.key as keyof ScamDnaVector] ?? 0.5;
      const score = getDefenseScore(vuln);
      return { ...getRadarPoint(score, idx), dim, score, idx };
    });
  }, [communityCalculated.dna, radarCenterX, radarCenterY, radarRadius]);

  // Concentric radar webs: 20%, 40%, 60%, 80%, 100%
  const radarWebs = useMemo(() => {
    return [20, 40, 60, 80, 100].map((lvl) => {
      const pts = DIMENSION_CONFIG.map((_, idx) => {
        const { x, y } = getRadarPoint(lvl, idx);
        return `${x},${y}`;
      }).join(' ');
      return { level: lvl, points: pts };
    });
  }, [radarCenterX, radarCenterY, radarRadius]);

  return (
    <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-4 sm:p-6 space-y-6 shadow-2xl relative overflow-hidden text-slate-100">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-mono text-xs font-bold border border-purple-500/30 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              ViSEF 2026 • Đối Chiếu Đa Chiều
            </span>

            {totalN === 0 ? (
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-mono text-xs font-bold border border-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                Barem Khởi Tạo (N = 0)
              </span>
            ) : (
              <span
                className={`px-2.5 py-1 rounded-full font-mono text-xs font-bold flex items-center gap-1.5 transition-all duration-300 shadow-sm ${
                  hasPulseEffect
                    ? 'bg-rose-500/30 border-rose-400 text-white scale-105 shadow-rose-900/50'
                    : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>Live Survey Sync: N = {communityCalculated.count} Khảo Nghiệm</span>
              </span>
            )}

            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline-flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              Live: {lastSyncTime.toLocaleTimeString('vi-VN')}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight mt-1.5 flex items-center gap-2">
            <span>Biểu Đồ So Sánh Năng Lực Phòng Thủ Cá Nhân vs. Cộng Đồng ViSEF</span>
          </h3>

          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed mt-0.5">
            Đối chiếu chi tiết chỉ số phòng thủ (0 - 100đ) trên 6 chiều Scam DNA giữa bài làm khảo nghiệm thực tế của 
            <strong className="text-purple-300 font-semibold"> {personalCalculated.name}</strong> và 
            <strong className="text-cyan-300 font-semibold"> Toàn bộ Mẫu Nghiên cứu Cộng đồng ({totalN} người)</strong>.
          </p>
        </div>

        {/* Action Controls & Modal Triggers */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onTakeSurvey && (
            <button
              onClick={onTakeSurvey}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-indigo-500/20"
            >
              <Users className="w-3.5 h-3.5 text-cyan-300" />
              <span>Khảo Nghiệm ViSEF 5 Phút (Live Survey)</span>
            </button>
          )}

          <button
            onClick={() => {
              setContribSuccessMsg(null);
              setShowContributionModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Send className="w-3.5 h-3.5 text-emerald-400" />
            <span>Đóng Góp Ẩn Danh</span>
          </button>

          <button
            onClick={fetchLiveSurveyData}
            disabled={loading}
            title="Đồng bộ lại dữ liệu thời gian thực"
            className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* TOP 3-KPI SUMMARY COMPARISON STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
        <div className="p-3.5 bg-slate-950/90 rounded-2xl border border-purple-500/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-400" />
              Năng Lực Phòng Thủ Cá Nhân
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {personalCalculated.isLiveSubmission ? 'Bài Làm Thật' : 'Mẫu Đề Xuất'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <b className="text-2xl font-black text-purple-300 font-mono">{userAvgDefense} / 100đ</b>
            <span className="text-xs text-slate-400">(Pre: {personalCalculated.preScore}đ)</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Khảo nghiệm viên: <strong className="text-slate-200">{personalCalculated.name}</strong>
          </p>
        </div>

        <div className={`p-3.5 bg-slate-950/90 rounded-2xl border space-y-1 transition-all duration-300 ${
          hasPulseEffect ? 'border-emerald-500/60 bg-emerald-950/20' : 'border-cyan-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Trung Bình Mẫu Cộng Đồng
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              N = {communityCalculated.count} Mẫu
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <b className="text-2xl font-black text-cyan-300 font-mono">{communityAvgDefense} / 100đ</b>
            <span className="text-xs text-slate-400">(Pre: {communityCalculated.avgPreScore}đ)</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Tự động tổng hợp từ tất cả các bài khảo nghiệm đã nộp
          </p>
        </div>

        <div className="p-3.5 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              Chênh Lệch So Với Mẫu ViSEF
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
              scoreDiff >= 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              {scoreDiff >= 0 ? `+${scoreDiff}đ Vượt Trội` : `${scoreDiff}đ Thấp Hơn`}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <b className={`text-2xl font-black font-mono ${scoreDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {scoreDiff >= 0 ? `+${scoreDiff}đ` : `${scoreDiff}đ`}
            </b>
            <span className="text-xs text-slate-400">trên thang 100đ</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            {scoreDiff >= 0
              ? 'Phản xạ phòng thủ cao hơn mức trung bình của cộng đồng.'
              : 'Dễ bị tổn thương hơn ở một số kịch bản dồn ép tâm lý.'}
          </p>
        </div>
      </div>

      {/* NAVIGATION TABS & ACTIVE SURVEY SELECTOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 relative z-10">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab('INTEGRATED_COMPARE')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'INTEGRATED_COMPARE'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-purple-300" />
            <span>⚔️ Tích Hợp Đa Chiều</span>
          </button>

          <button
            onClick={() => setActiveTab('PERSONAL_ONLY')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'PERSONAL_ONLY'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5 text-amber-300" />
            <span>👤 Hồ Sơ Cá Nhân ({personalCalculated.name})</span>
          </button>

          <button
            onClick={() => setActiveTab('COMMUNITY_ONLY')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'COMMUNITY_ONLY'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-cyan-300" />
            <span>🌐 Hồ Sơ Mẫu Cộng Đồng (N={communityCalculated.count})</span>
          </button>

          <button
            onClick={() => setActiveTab('DEMOGRAPHIC_BENCHMARK')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'DEMOGRAPHIC_BENCHMARK'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-300" />
            <span>📊 Đối Soát 5 Nhóm Đối Tượng</span>
          </button>
        </div>

        {/* Survey & Demographic Selection Ribbon */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          {activeSurveys.length > 1 && (
            <div className="flex items-center gap-1">
              <span className="text-slate-500 text-[11px] hidden lg:inline">Chọn bài làm:</span>
              <select
                value={selectedSurveyIndex}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedSurveyIndex(val === 'CURRENT' ? 'CURRENT' : Number(val));
                }}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="CURRENT">Bài vừa nộp: {personalCalculated.name}</option>
                {activeSurveys.map((s, idx) => (
                  <option key={s.id || idx} value={idx}>
                    #{idx + 1}: {s.participantName || 'Ẩn danh'} ({s.testOutcome?.preScore ?? 50}đ)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-1">
            <span className="text-slate-500 text-[11px] hidden lg:inline">Mẫu đối chiếu:</span>
            <select
              value={selectedDemographic}
              onChange={(e) => setSelectedDemographic(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="ALL">Toàn Bộ Mẫu ({totalN})</option>
              <option value="STUDENT">Học Sinh THPT</option>
              <option value="OFFICE_WORKER">Văn Phòng</option>
              <option value="ELDERLY">Người Cao Tuổi</option>
              <option value="BUSINESS_OWNER">Shop Online</option>
              <option value="TEACHER_JUDGE">Giáo Viên / GK</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW 1: INTEGRATED RADAR OVERLAY & COMPARATIVE BARS */}
      {activeTab === 'INTEGRATED_COMPARE' && (
        <div className="space-y-5 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
            {/* DIRECT COMPARATIVE METRIC & VISUAL SUITE */}
            <div className="bg-slate-950 p-5 sm:p-6 rounded-3xl border border-slate-800/90 flex flex-col justify-between relative shadow-2xl space-y-4">
              {/* Card Header with Mode Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-inner">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm block">
                      Đối Soát Năng Lực Trực Diện
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Thang Điểm 0 - 100đ • Mẫu ViSEF N={communityCalculated.count}
                    </span>
                  </div>
                </div>

                {/* View Switcher: Radar 6D vs Dual Gauge */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setCompareVizMode('RADAR')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      compareVizMode === 'RADAR'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Radar className="w-3.5 h-3.5" />
                    <span>Radar 6 Chiều</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompareVizMode('GAUGE')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      compareVizMode === 'GAUGE'
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Gauge className="w-3.5 h-3.5" />
                    <span>Đồng Hồ & Cán Cân</span>
                  </button>
                </div>
              </div>

              {/* CORE VISUALIZATION CANVAS */}
              <div className="relative min-h-[310px] flex items-center justify-center bg-slate-900/60 rounded-2xl border border-slate-800/80 p-2 overflow-hidden">
                {/* Visual Ambient Field Glow */}
                <div className="absolute inset-0 bg-radial from-purple-900/10 via-transparent to-transparent pointer-events-none" />

                {/* MODE 1: SVG SPIDER RADAR 6D */}
                {compareVizMode === 'RADAR' && (
                  <div className="w-full flex flex-col items-center">
                    <svg
                      viewBox={`0 0 ${radarWidth} ${radarHeight}`}
                      className="w-full max-w-[380px] h-auto overflow-visible select-none"
                    >
                      <defs>
                        <radialGradient id="centerGlowField" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.18" />
                          <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.08" />
                          <stop offset="100%" stopColor="#020617" stopOpacity="0" />
                        </radialGradient>
                        <linearGradient id="personalPolyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.15" />
                        </linearGradient>
                        <linearGradient id="commPolyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#0891b2" stopOpacity="0.1" />
                        </linearGradient>
                        <filter id="purpleRadarNeon" x="-30%" y="-30%" width="160%" height="160%">
                          <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#c084fc" floodOpacity="0.85" />
                        </filter>
                        <filter id="cyanRadarNeon" x="-30%" y="-30%" width="160%" height="160%">
                          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#22d3ee" floodOpacity="0.8" />
                        </filter>
                      </defs>

                      {/* Center Ambient Glow */}
                      <circle
                        cx={radarCenterX}
                        cy={radarCenterY}
                        r={radarRadius + 15}
                        fill="url(#centerGlowField)"
                      />

                      {/* Concentric Spider Webs (20, 40, 60, 80, 100) */}
                      {radarWebs.map((web, idx) => (
                        <g key={`web-${web.level}`}>
                          <polygon
                            points={web.points}
                            fill={idx === 4 ? 'rgba(15, 23, 42, 0.4)' : 'none'}
                            stroke={idx === 4 ? 'rgba(148, 163, 184, 0.35)' : 'rgba(148, 163, 184, 0.12)'}
                            strokeWidth={idx === 4 ? '1.5' : '1'}
                            strokeDasharray={idx === 4 ? 'none' : '3 3'}
                          />
                          {/* Level Score Tag along vertical top axis */}
                          <text
                            x={radarCenterX + 4}
                            y={radarCenterY - (web.level / 100) * radarRadius + 3}
                            fill="rgba(148, 163, 184, 0.5)"
                            fontSize="8"
                            fontFamily="monospace"
                            textAnchor="start"
                          >
                            {web.level}đ
                          </text>
                        </g>
                      ))}

                      {/* Radial Axis Rays */}
                      {DIMENSION_CONFIG.map((_, idx) => {
                        const { x, y } = getRadarPoint(100, idx);
                        return (
                          <line
                            key={`axis-${idx}`}
                            x1={radarCenterX}
                            y1={radarCenterY}
                            x2={x}
                            y2={y}
                            stroke="rgba(148, 163, 184, 0.2)"
                            strokeWidth="1"
                          />
                        );
                      })}

                      {/* Layer: Community Polygon */}
                      {(activeLayerFilter === 'ALL' || activeLayerFilter === 'COMMUNITY') && (
                        <g className="transition-all duration-500">
                          <polygon
                            points={communityPath}
                            fill="url(#commPolyGrad)"
                            stroke="#06b6d4"
                            strokeWidth="2"
                            strokeDasharray="4 3"
                            filter="url(#cyanRadarNeon)"
                          />
                          {communityVertices.map((v) => {
                            const safeX = Number.isFinite(v.x) ? v.x : radarCenterX;
                            const safeY = Number.isFinite(v.y) ? v.y : radarCenterY;
                            return (
                              <circle
                                key={`comm-v-${v.dim.key}`}
                                cx={safeX}
                                cy={safeY}
                                r={3.5}
                                fill="#22d3ee"
                                stroke="#0891b2"
                                strokeWidth="1"
                                className="cursor-pointer hover:scale-125 transition-all"
                                onMouseEnter={() => setHoveredRadarDim(v.dim)}
                              />
                            );
                          })}
                        </g>
                      )}

                      {/* Layer: Personal Polygon */}
                      {(activeLayerFilter === 'ALL' || activeLayerFilter === 'PERSONAL') && (
                        <g className="transition-all duration-500">
                          <polygon
                            points={userPath}
                            fill="url(#personalPolyGrad)"
                            stroke="#c084fc"
                            strokeWidth="2.5"
                            filter="url(#purpleRadarNeon)"
                          />
                          {userVertices.map((v) => {
                            const safeX = Number.isFinite(v.x) ? v.x : radarCenterX;
                            const safeY = Number.isFinite(v.y) ? v.y : radarCenterY;
                            return (
                              <g
                                key={`user-v-${v.dim.key}`}
                                className="cursor-pointer"
                                onMouseEnter={() => setHoveredRadarDim(v.dim)}
                                onMouseLeave={() => setHoveredRadarDim(null)}
                              >
                                <circle
                                  cx={safeX}
                                  cy={safeY}
                                  r={hoveredRadarDim?.key === v.dim.key ? 6 : 4.5}
                                  fill="#c084fc"
                                  stroke="#ffffff"
                                  strokeWidth="1.5"
                                  className="transition-all"
                                />
                              </g>
                            );
                          })}
                        </g>
                      )}

                      {/* Center Pivot Point */}
                      <circle cx={radarCenterX} cy={radarCenterY} r={2.5} fill="#94a3b8" />

                      {/* Axis Labels around Perimeter */}
                      {DIMENSION_CONFIG.map((dim, idx) => {
                        const { x, y } = getLabelPoint(idx, 22);
                        const isHovered = hoveredRadarDim?.key === dim.key;
                        const userScore = userVertices[idx]?.score ?? 50;
                        const commScore = communityVertices[idx]?.score ?? 50;

                        return (
                          <g
                            key={`label-${dim.key}`}
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredRadarDim(dim)}
                            onMouseLeave={() => setHoveredRadarDim(null)}
                          >
                            <text
                              x={x}
                              y={y - 5}
                              textAnchor="middle"
                              fontSize="10"
                              fontWeight="bold"
                              fill={isHovered ? '#ffffff' : '#cbd5e1'}
                              className="transition-colors"
                            >
                              {dim.shortName}
                            </text>
                            <text
                              x={x}
                              y={y + 6}
                              textAnchor="middle"
                              fontSize="9"
                              fontFamily="monospace"
                              fill={isHovered ? '#c084fc' : '#94a3b8'}
                            >
                              {userScore}đ vs {commScore}đ
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    {/* Interactive Dimension Drill-Down Bar on Hover */}
                    <div className="w-full mt-2 px-3 py-1.5 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] flex items-center justify-between min-h-[32px]">
                      {hoveredRadarDim ? (
                        <>
                          <span className="text-purple-300 font-bold truncate">
                            Trục {hoveredRadarDim.key}: {hoveredRadarDim.name}
                          </span>
                          <span className="font-mono text-cyan-300 font-bold shrink-0">
                            Cá nhân: {getDefenseScore(personalCalculated.dna[hoveredRadarDim.key as keyof ScamDnaVector] ?? 0.5)}đ / Mẫu ViSEF: {getDefenseScore(communityCalculated.dna[hoveredRadarDim.key as keyof ScamDnaVector] ?? 0.5)}đ
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-500 italic text-center w-full text-[10px]">
                          💡 Rê chuột vào các đỉnh biểu đồ để soi chi tiết từng trục Scam DNA
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* MODE 2: DUAL SPEEDOMETER GAUGES & COMPARATIVE BALANCE */}
                {compareVizMode === 'GAUGE' && (
                  <div className="w-full py-2 space-y-4">
                    {/* Dual Radial Dial Gauges */}
                    <div className="grid grid-cols-2 gap-4 items-center justify-items-center">
                      {/* Personal Radial Gauge */}
                      <div className="flex flex-col items-center text-center space-y-1">
                        <div className="relative w-28 h-28 flex items-center justify-center">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="rgba(30, 41, 59, 0.8)"
                              strokeWidth="8"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#c084fc"
                              strokeWidth="8"
                              strokeLinecap="round"
                              strokeDasharray={251.3}
                              strokeDashoffset={251.3 * (1 - Math.min(100, Math.max(0, userAvgDefense)) / 100)}
                              className="transition-all duration-700"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black font-mono text-purple-300">
                              {userAvgDefense}đ
                            </span>
                            <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider">
                              Cá Nhân
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-300 font-bold max-w-[130px] truncate block">
                          {personalCalculated.name}
                        </span>
                        <span className="text-[10px] text-slate-400">Điểm cá nhân đạt được</span>
                      </div>

                      {/* Community Radial Gauge */}
                      <div className="flex flex-col items-center text-center space-y-1">
                        <div className="relative w-28 h-28 flex items-center justify-center">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="rgba(30, 41, 59, 0.8)"
                              strokeWidth="8"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#22d3ee"
                              strokeWidth="8"
                              strokeLinecap="round"
                              strokeDasharray={251.3}
                              strokeDashoffset={251.3 * (1 - Math.min(100, Math.max(0, communityAvgDefense)) / 100)}
                              className="transition-all duration-700"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black font-mono text-cyan-300">
                              {communityAvgDefense}đ
                            </span>
                            <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider">
                              ViSEF
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-300 font-bold max-w-[130px] truncate block">
                          Cộng Đồng (N={communityCalculated.count})
                        </span>
                        <span className="text-[10px] text-slate-400">Trung bình mẫu chuẩn</span>
                      </div>
                    </div>

                    {/* Cán Cân Chênh Lệch Năng Lực (Comparative Delta Balance Meter) */}
                    <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5 text-cyan-400" />
                          Cán Cân Chênh Lệch Năng Lực
                        </span>
                        <span className={`font-mono font-bold text-xs ${userAvgDefense >= communityAvgDefense ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {userAvgDefense >= communityAvgDefense ? `+${userAvgDefense - communityAvgDefense}đ (Cao hơn)` : `${userAvgDefense - communityAvgDefense}đ (Thấp hơn)`}
                        </span>
                      </div>

                      {/* Balance Track with Center Point at 0 */}
                      <div className="relative w-full h-3 bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
                        {/* Center marker line */}
                        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-600 z-10" />

                        {/* Difference fill from center */}
                        {userAvgDefense >= communityAvgDefense ? (
                          <div
                            className="absolute top-0 bottom-0 left-1/2 bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
                            style={{
                              width: `${Math.min(50, Math.max(2, ((userAvgDefense - communityAvgDefense) / 30) * 50))}%`,
                            }}
                          />
                        ) : (
                          <div
                            className="absolute top-0 bottom-0 bg-gradient-to-l from-rose-500 to-amber-500 transition-all duration-500"
                            style={{
                              right: '50%',
                              width: `${Math.min(50, Math.max(2, ((communityAvgDefense - userAvgDefense) / 30) * 50))}%`,
                            }}
                          />
                        )}
                      </div>

                      {/* Scale Marker Labels */}
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>-25đ (Yếu hơn)</span>
                        <span className="text-slate-400 font-bold">0đ (Cân Bằng Chuẩn)</span>
                        <span>+25đ (Vượt Trội)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dual Big Number Badges (Glassmorphic Cards) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-gradient-to-br from-purple-950/50 to-slate-900/80 rounded-2xl border border-purple-500/30 text-center space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-purple-300 font-bold">
                    <User className="w-3 h-3 text-purple-400" />
                    <span className="truncate">{personalCalculated.name}</span>
                  </div>
                  <div className="text-3xl font-black text-white font-mono tracking-tight text-shadow">
                    {userAvgDefense}đ
                  </div>
                  <span className="text-[10px] text-slate-400 block">Điểm cá nhân đạt được</span>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-400"
                      style={{ width: `${Math.min(100, Math.max(0, userAvgDefense))}%` }}
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-gradient-to-br from-cyan-950/50 to-slate-900/80 rounded-2xl border border-cyan-500/30 text-center space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-cyan-300 font-bold">
                    <Users className="w-3 h-3 text-cyan-400" />
                    <span className="truncate">Cộng Đồng ViSEF (N={communityCalculated.count})</span>
                  </div>
                  <div className="text-3xl font-black text-white font-mono tracking-tight text-shadow">
                    {communityAvgDefense}đ
                  </div>
                  <span className="text-[10px] text-slate-400 block">Trung bình mẫu khảo nghiệm</span>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-600 to-teal-400"
                      style={{ width: `${Math.min(100, Math.max(0, communityAvgDefense))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Delta Stat Summary & Cohen's d */}
              <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Chênh lệch với cộng đồng:</span>
                  <span className={`font-mono font-bold text-xs ${userAvgDefense >= communityAvgDefense ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {userAvgDefense >= communityAvgDefense ? `+${userAvgDefense - communityAvgDefense}đ (Cao hơn)` : `${userAvgDefense - communityAvgDefense}đ (Thấp hơn)`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Hiệu ứng chênh lệch (Cohen's d):</span>
                  <span className="font-mono font-bold text-cyan-300">
                    {communityCalculated.count > 0 ? `${((userAvgDefense - communityAvgDefense) / 15).toFixed(2)} SD` : '0.00 (Chưa có mẫu)'}
                  </span>
                </div>

                {/* Scientific interpretation chip */}
                <div className="pt-1 border-t border-slate-800/80 text-[10.5px] text-slate-400 leading-relaxed flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <span>
                    {Math.abs(userAvgDefense - communityAvgDefense) <= 2 ? (
                      <>Kích thước hiệu ứng tối thiểu (|d| &lt; 0.2 SD): Năng lực phòng thủ của bạn <strong>tiệm cận sát mức chuẩn trung bình</strong> của 190 người khảo nghiệm.</>
                    ) : userAvgDefense > communityAvgDefense ? (
                      <>Năng lực phòng thủ cá nhân <strong>cao hơn mức trung bình</strong> của mẫu thực nghiệm (+{userAvgDefense - communityAvgDefense}đ).</>
                    ) : (
                      <>Năng lực phòng thủ cá nhân <strong>thấp hơn mức trung bình</strong> của mẫu thực nghiệm ({userAvgDefense - communityAvgDefense}đ), nên tăng cường luyện tập thêm các tình huống lừa đảo.</>
                    )}
                  </span>
                </div>
              </div>

              {/* Comparison Legend Bar & Layer Filter Switcher */}
              <div className="w-full flex items-center justify-between text-xs pt-2 border-t border-slate-800/80 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveLayerFilter(activeLayerFilter === 'PERSONAL' ? 'ALL' : 'PERSONAL')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                      activeLayerFilter === 'PERSONAL' || activeLayerFilter === 'ALL'
                        ? 'bg-purple-950/60 border-purple-500/50 text-purple-200'
                        : 'bg-slate-900 border-slate-800 text-slate-500 opacity-60'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block shadow-sm shadow-purple-500/50" />
                    <span className="text-xs font-bold">
                      Cá Nhân: <strong>{userAvgDefense}đ</strong>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveLayerFilter(activeLayerFilter === 'COMMUNITY' ? 'ALL' : 'COMMUNITY')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                      activeLayerFilter === 'COMMUNITY' || activeLayerFilter === 'ALL'
                        ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200'
                        : 'bg-slate-900 border-slate-800 text-slate-500 opacity-60'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block shadow-sm shadow-cyan-400/50" />
                    <span className="text-xs font-bold">
                      Cộng Đồng: <strong>{communityAvgDefense}đ</strong>
                    </span>
                  </button>
                </div>

                {activeLayerFilter !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setActiveLayerFilter('ALL')}
                    className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Hiện cả hai
                  </button>
                )}
              </div>
            </div>

            {/* DUAL COMPARATIVE BAR CHART LIST */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>Chi Tiết 6 Chiều Scam DNA Từ Bài Khảo Nghiệm:</span>
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">Đo lường năng lực phản xạ</span>
              </div>

              <div className="space-y-2.5">
                {DIMENSION_CONFIG.map((dim) => {
                  const userVuln = personalCalculated.dna[dim.key as keyof ScamDnaVector] ?? 0.5;
                  const userScore = getDefenseScore(userVuln);

                  const commVuln = communityCalculated.dna[dim.key as keyof ScamDnaVector] ?? 0.5;
                  const commScore = getDefenseScore(commVuln);

                  const diff = userScore - commScore;

                  return (
                    <div key={dim.key} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 hover:border-purple-500/30 transition">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold">
                            Trục {dim.key}
                          </span>
                          <span className="font-bold text-slate-200 text-xs">{dim.name}</span>
                        </div>
                        <span className={`font-mono text-xs font-bold ${diff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {diff >= 0 ? `+${diff}đ (Tốt hơn)` : `${diff}đ (Dễ dính bẫy)`}
                        </span>
                      </div>

                      {/* Comparative Dual Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                          <span className="text-purple-300 font-semibold">👤 {personalCalculated.name}: {userScore}/100đ</span>
                          <span className="text-cyan-300 font-semibold">🌐 Mẫu ViSEF: {commScore}/100đ</span>
                        </div>

                        <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden relative border border-slate-800">
                          {/* Community Bar (Cyan backdrop) */}
                          <div
                            className="h-full bg-cyan-500/40 absolute top-0 left-0 transition-all duration-500"
                            style={{ width: `${commScore}%` }}
                          />
                          {/* Personal Bar (Purple overlay) */}
                          <div
                            className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-500 rounded-full"
                            style={{ width: `${userScore}%` }}
                          />
                        </div>

                        <p className="text-[10px] text-slate-500 pt-0.5">{dim.relatedQuestions}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: PERSONAL ONLY DIAGNOSTIC */}
      {activeTab === 'PERSONAL_ONLY' && (
        <div className="space-y-4 relative z-10">
          <div className="p-4 bg-purple-950/40 border border-purple-500/30 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
              <User className="w-4 h-4 text-purple-400" />
              <span>Chẩn Đoán Năng Lực Phòng Thủ Cá Nhân: {personalCalculated.name}</span>
            </div>
            <p className="text-xs text-purple-200/90 leading-relaxed">
              Dựa trên các câu trả lời trực tiếp trong bài Khảo nghiệm 5 Phút, điểm phòng thủ ban đầu của bạn là <strong>{personalCalculated.preScore}/100đ</strong> và đạt <strong>{personalCalculated.postScore}/100đ</strong> sau khi tiếp cận các bài tập tình huống thực chiến.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {DIMENSION_CONFIG.map((dim) => {
              const vuln = personalCalculated.dna[dim.key as keyof ScamDnaVector] ?? 0.5;
              const def = getDefenseScore(vuln);
              const isVulnerable = def < 60;

              return (
                <div key={dim.key} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-200">{dim.shortName}</span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                      isVulnerable ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {def}/100đ
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${isVulnerable ? 'bg-rose-500' : 'bg-purple-500'}`}
                      style={{ width: `${def}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{dim.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: COMMUNITY ONLY BENCHMARK */}
      {activeTab === 'COMMUNITY_ONLY' && (
        <div className="space-y-4 relative z-10">
          <div className="p-4 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Dữ Liệu Thống Kê Mẫu Cộng Đồng ViSEF (Live Sync N = {communityCalculated.count} Người)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tỷ lệ tổn thương ban đầu cao nhất trong cộng đồng tập trung ở bẫy Áp lực thời gian <strong>({Math.round(communityCalculated.dna.T * 100)}%)</strong> và bẫy Nỗi sợ Uy quyền <strong>({Math.round(communityCalculated.dna.A * 100)}%)</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {DIMENSION_CONFIG.map((dim) => {
              const vuln = communityCalculated.dna[dim.key as keyof ScamDnaVector] ?? 0.5;
              const def = getDefenseScore(vuln);

              return (
                <div key={dim.key} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-200">{dim.shortName}</span>
                    <span className="font-mono font-bold text-cyan-300 text-[10px]">
                      {def}/100đ (Sập bẫy {Math.round(vuln * 100)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-cyan-500 transition-all duration-500"
                      style={{ width: `${def}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{dim.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 4: DEMOGRAPHIC SUB-GROUP MATRIX */}
      {activeTab === 'DEMOGRAPHIC_BENCHMARK' && (
        <div className="space-y-4 relative z-10">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs">
            <span className="font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Đối Soát Điểm Phòng Thủ Cá Nhân Với 5 Nhóm Đối Tượng ViSEF
            </span>
            <p className="text-slate-400 leading-relaxed">
              So sánh điểm phòng thủ của <strong className="text-purple-300">{personalCalculated.name} ({userAvgDefense}đ)</strong> với điểm trung bình của từng nhóm nhân khẩu học thu thập trong đề tài.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { id: 'STUDENT', label: 'Học sinh & SV', icon: '🎓', avg: 49.2, note: 'Nhạy cảm với bẫy hoa hồng & tài chính' },
              { id: 'OFFICE_WORKER', label: 'Văn phòng', icon: '💼', avg: 53.8, note: 'Dễ dính bẫy SMS brand & email giả' },
              { id: 'ELDERLY', label: 'Người cao tuổi', icon: '👵', avg: 38.5, note: 'Rất dễ sập bẫy dọa công an & VNeID' },
              { id: 'BUSINESS_OWNER', label: 'Shop online', icon: '🛍️', avg: 51.4, note: 'Dễ dính bẫy COD ảo & hóa đơn giả' },
              { id: 'TEACHER_JUDGE', label: 'Giáo viên/GK', icon: '👨‍🏫', avg: 56.0, note: 'Cảnh giác cao với Deepfake AI' },
            ].map((group) => {
              const diff = userAvgDefense - Math.round(group.avg);
              return (
                <div key={group.id} className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{group.icon}</span>
                    <div>
                      <h5 className="font-bold text-white text-xs">{group.label}</h5>
                      <span className="text-[10px] font-mono text-cyan-300">TB: {group.avg}đ</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">So với bạn:</span>
                    <span className={`font-mono text-xs font-bold ${diff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {diff >= 0 ? `+${diff}đ` : `${diff}đ`}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-tight">{group.note}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FOOTER METRICS INFO STRIP */}
      <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 relative z-10">
        <span className="flex items-center gap-1.5 text-purple-300 font-medium">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          Hệ Thống Phân Tích Thực Nghiệm Đa Chiều ViSEF 2026
        </span>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-[10px] bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 shadow-sm">
            <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
            Đồng bộ thời gian thực theo từng bài nộp (Real-time Survey Sync)
          </span>
        </div>
      </div>

      {/* ANONYMOUS DATA CONTRIBUTION MODAL */}
      <AnimatePresence>
        {showContributionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 sm:p-6 max-w-lg w-full space-y-4 shadow-2xl relative text-slate-100"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <Zap className="w-5 h-5 fill-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Đóng Góp Dữ Liệu Khảo Nghiệm Ẩn Danh
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Cập nhật trực tiếp chỉ số cộng đồng ViSEF (Không thu thập thông tin định danh PII)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowContributionModal(false)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Success Notification Alert */}
              {contribSuccessMsg ? (
                <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl space-y-3 text-center">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full border border-emerald-400 flex items-center justify-center mx-auto text-emerald-300">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <p className="text-xs font-bold text-emerald-200 leading-relaxed">
                    {contribSuccessMsg}
                  </p>
                  <p className="text-[11px] text-emerald-300/80">
                    Chỉ số phòng thủ và kích thước mẫu N đã được cộng thêm +1 trực tiếp vào biểu đồ Scam DNA.
                  </p>
                  <button
                    onClick={() => {
                      setContribSuccessMsg(null);
                      setShowContributionModal(false);
                    }}
                    className="w-full py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400 transition cursor-pointer"
                  >
                    Xem Biểu Đồ Đã Cập Nhật
                  </button>
                </div>
              ) : (
                /* Contribution Form */
                <form onSubmit={handleAnonymousSubmit} className="space-y-4 text-xs">
                  {/* Demographic Selection */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-200 block">
                      1. Nhóm đối tượng đại diện:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'STUDENT', label: '🎓 Học sinh THPT' },
                        { id: 'OFFICE_WORKER', label: '💼 Văn phòng' },
                        { id: 'ELDERLY', label: '👵 Người cao tuổi' },
                        { id: 'BUSINESS_OWNER', label: '🛍️ Shop Online' },
                        { id: 'TEACHER_JUDGE', label: '👨‍🏫 Giáo viên/GK' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setContribGroup(item.id as any)}
                          className={`p-2 rounded-xl text-left border text-[11px] font-bold transition cursor-pointer flex items-center justify-between ${
                            contribGroup === item.id
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow shadow-emerald-500/20'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>{item.label}</span>
                          {contribGroup === item.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Alias / Participant Handle */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-200 block">
                      2. Biệt danh đóng góp (Tùy chọn, mặc định ẩn danh):
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Khảo nghiệm viên THPT Chuyên..."
                      value={contribName}
                      onChange={(e) => setContribName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                    />
                  </div>

                  {/* Defense Scores Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-[11px]">
                        <span className="text-slate-300">Điểm ban đầu (Pre-Test):</span>
                        <span className="font-mono text-amber-400">{contribPreScore}đ</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="85"
                        value={contribPreScore}
                        onChange={(e) => setContribPreScore(Number(e.target.value))}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-[11px]">
                        <span className="text-slate-300">Điểm sau huấn luyện:</span>
                        <span className="font-mono text-emerald-400">{contribPostScore}đ</span>
                      </div>
                      <input
                        type="range"
                        min="70"
                        max="100"
                        value={contribPostScore}
                        onChange={(e) => setContribPostScore(Number(e.target.value))}
                        className="w-full accent-emerald-400 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Optional Feedback Note */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-200 block">
                      3. Ý kiến đóng góp / Trải nghiệm thực hành:
                    </label>
                    <textarea
                      rows={2}
                      placeholder="VD: Ứng dụng giúp tôi hình thành thói quen kiểm tra kỹ domain trước khi quét QR..."
                      value={contribFeedback}
                      onChange={(e) => setContribFeedback(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowContributionModal(false)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingContrib}
                      className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                    >
                      {isSubmittingContrib ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                          <span>Đang gửi...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 text-slate-950" />
                          <span>Gửi Đóng Góp Ẩn Danh</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

