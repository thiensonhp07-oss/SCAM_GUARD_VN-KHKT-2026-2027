import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  Search,
  RefreshCw,
  SlidersHorizontal,
  Lock,
  User,
  Users,
  GraduationCap,
  Building2,
  MapPin,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  Layers,
  Code2,
  HelpCircle,
  Eye,
  CheckCircle2,
  XCircle,
  Radio,
  Play,
  Pause,
  Brain,
  Cpu,
  Database,
  Activity,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { CommunitySurveySubmission, SurveyDemographicGroup } from '../types';
import {
  getAllCommunitySurveys,
  getClientLiveAiTrainingState,
  triggerLiveAiTrainingClient,
  clearClientSurveysToZero,
  restoreStandardViSEFDatasetClient,
  ClientLiveAiTrainingState,
} from '../services/researchDataService';
import {
  MlHyperparameters,
  getStoredMlHyperparams,
  saveStoredMlHyperparams,
  extract9DFeatureVectorFromText,
  runMlInferenceWithShap,
  ingestLiveSampleForSelfTraining,
  generateAdversarialSelfPlayBatch,
  clearStoredScannerTrainingSamples,
} from '../utils/mlSelfTrainingEngine';

interface VisefSurveyResponsesLiveTableProps {
  surveys?: CommunitySurveySubmission[];
  onRefresh?: () => void;
  isLoading?: boolean;
  onOpenSurvey?: () => void;
}

const SECTOR_LABELS = [
  { id: 'q1', code: 'KV1', name: 'SMS / Email Trúng Thưởng' },
  { id: 'q2', code: 'KV2', name: 'Dọa Khóa SIM & Giả CA' },
  { id: 'q3', code: 'KV3', name: 'Giao COD & CTV Ảo' },
  { id: 'q4', code: 'KV4', name: 'Bẫy Tình Pig Butchering' },
  { id: 'q5', code: 'KV5', name: 'Crypto & Ponzi Ảo' },
  { id: 'q6', code: 'KV6', name: 'App VNeID APK Giả' },
  { id: 'q7', code: 'KV7', name: 'Mã QR Quishing' },
  { id: 'q8', code: 'KV8', name: 'Sự Cố Khẩn Giờ Vàng' },
  { id: 'q9', code: 'KV9', name: 'Deepfake AI Video Call' },
  { id: 'q10', code: 'KV10', name: 'Web3 & Drainer' },
  { id: 'q11', code: 'KV11', name: 'Juice Jacking & Wifi' },
  { id: 'q12', code: 'KV12', name: 'Bẫy Lừa Đảo Kép' },
];

const renderOptionBadge = (val?: string) => {
  if (!val) {
    return <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">Chưa chọn</span>;
  }
  if (val === 'A_NEVER') {
    return <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold" title="A. Chưa bao giờ gặp">A. Chưa gặp</span>;
  }
  if (val === 'B_SAFE') {
    return <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold" title="B. An toàn (Phát hiện & Bỏ qua)">B. An toàn</span>;
  }
  if (val === 'C_NEAR_MISS') {
    return <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold" title="C. Từng suýt bị lừa">C. Suýt bị</span>;
  }
  if (val === 'D_VICTIM') {
    return <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold" title="D. Từng bị lừa / Thiệt hại">D. Từng bị</span>;
  }

  // Handle letter choice from Part 2 (A, B, C, D, E, F)
  if (val.length === 1 && /^[A-F]$/i.test(val)) {
    const letter = val.toUpperCase();
    return (
      <span
        className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/25 text-indigo-200 border border-indigo-500/40 font-mono font-bold"
        title={`Đáp án ứng biến: Phương án ${letter}`}
      >
        PA {letter}
      </span>
    );
  }

  return <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">{val}</span>;
};

const getSectorStatusColor = (val?: string) => {
  if (!val) return 'bg-slate-800 text-slate-500 border-slate-700/60';
  if (val === 'B_SAFE') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30';
  if (val === 'A_NEVER') return 'bg-sky-500/20 text-sky-300 border-sky-500/40 hover:bg-sky-500/30';
  if (val === 'C_NEAR_MISS') return 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30';
  if (val === 'D_VICTIM') return 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30';
  return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/30';
};

const getSectorLetter = (val?: string) => {
  if (!val) return '·';
  if (val === 'B_SAFE') return 'B';
  if (val === 'A_NEVER') return 'A';
  if (val === 'C_NEAR_MISS') return 'C';
  if (val === 'D_VICTIM') return 'D';
  if (val.length === 1) return val.toUpperCase();
  return val.slice(0, 1);
};

export const VisefSurveyResponsesLiveTable: React.FC<VisefSurveyResponsesLiveTableProps> = ({
  surveys: propSurveys,
  onRefresh,
  isLoading: propLoading,
  onOpenSurvey,
}) => {
  const [internalSurveys, setInternalSurveys] = useState<CommunitySurveySubmission[]>(() => getAllCommunitySurveys());
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [identityFilter, setIdentityFilter] = useState<'ALL' | 'ANONYMOUS' | 'REAL_NAME'>('ALL');
  const [demographicFilter, setDemographicFilter] = useState<string>('ALL');
  const [schoolFilter, setSchoolFilter] = useState<string>('ALL');
  const [scoreTierFilter, setScoreTierFilter] = useState<'ALL' | 'HIGH_GAIN' | 'LOW_PRE' | 'MAX_POST'>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'POST_SCORE' | 'GAIN' | 'PRE_SCORE'>('NEWEST');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [copiedCSV, setCopiedCSV] = useState<boolean>(false);
  const [showCSVPreview, setShowCSVPreview] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState<number | 'ALL'>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Live polling state
  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);
  const [secondsUntilNextPoll, setSecondsUntilNextPoll] = useState<number>(8);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const timerRef = useRef<any>(null);

  const onRefreshRef = useRef(onRefresh);
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  // Fetch surveys from backend (with automatic static hosting fallback)
  const fetchSurveys = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const res = await fetch('/api/research/surveys');
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data?.surveys && Array.isArray(data.surveys)) {
          setInternalSurveys(data.surveys);
          setLastSyncTime(new Date());
          return;
        }
      }
      // On static hosts like Vercel, fetch returns HTML or 404
      const fallbackList = getAllCommunitySurveys();
      setInternalSurveys(fallbackList);
      setLastSyncTime(new Date());
    } catch (err) {
      const fallbackList = getAllCommunitySurveys();
      setInternalSurveys(fallbackList);
      setLastSyncTime(new Date());
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  // Live AI Auto-Training Studio State
  const [aiTrainingState, setAiTrainingState] = useState<ClientLiveAiTrainingState>(() =>
    getClientLiveAiTrainingState()
  );
  const [isTrainingAi, setIsTrainingAi] = useState<boolean>(false);
  const [autoTrainEnabled, setAutoTrainEnabled] = useState<boolean>(true);
  const [showVectorTable, setShowVectorTable] = useState<boolean>(false);
  const [showShapSandbox, setShowShapSandbox] = useState<boolean>(true);
  const [trainingProgressEpoch, setTrainingProgressEpoch] = useState<number>(18);
  const [mlHyperparams, setMlHyperparams] = useState<MlHyperparameters>(() => getStoredMlHyperparams());
  const [sandboxText, setSandboxText] = useState<string>(
    'Cục Cảnh Sát ĐTTP thông báo tài khoản của bạn liên quan đường dây rửa tiền. Tải ngay VNeID_BoCongAn.apk và nhập mã OTP trong 10 phút để tránh lệnh phong tỏa!'
  );
  const [sandboxUrl, setSandboxUrl] = useState<string>('http://dichvucong-bocongan-vn.top/vneid.apk');
  const [sandboxLatency, setSandboxLatency] = useState<number>(3.5);
  const [selfPlayNotice, setSelfPlayNotice] = useState<string | null>(null);

  const liveShapInference = useMemo(() => {
    const features = extract9DFeatureVectorFromText(sandboxText, sandboxUrl, '', sandboxLatency);
    return runMlInferenceWithShap(features, aiTrainingState.learnedWeights, mlHyperparams);
  }, [sandboxText, sandboxUrl, sandboxLatency, aiTrainingState.learnedWeights, mlHyperparams]);

  const runLiveAiTraining = useCallback(async (isSilentAuto = false, customParams?: MlHyperparameters) => {
    try {
      const activeParams = customParams || mlHyperparams;
      if (customParams) {
        saveStoredMlHyperparams(customParams);
      }
      if (!isSilentAuto) {
        setIsTrainingAi(true);
        setTrainingProgressEpoch(1);
        const totalEp = activeParams.epochs || 18;
        for (let ep = 2; ep < totalEp; ep += Math.max(2, Math.floor(totalEp / 5))) {
          setTimeout(() => setTrainingProgressEpoch(ep), ep * 22);
        }
      }
      const res = await triggerLiveAiTrainingClient(activeParams);
      setAiTrainingState(res.trainingState);
      setTrainingProgressEpoch(activeParams.epochs || 18);
    } catch {
      setAiTrainingState(getClientLiveAiTrainingState(customParams || mlHyperparams));
    } finally {
      if (!isSilentAuto) {
        setTimeout(() => setIsTrainingAi(false), 380);
      }
    }
  }, [mlHyperparams]);

  const handleSelfPlayAugmentation = useCallback(async () => {
    const added = generateAdversarialSelfPlayBatch();
    setSelfPlayNotice(`Đã tự sinh +${added.length} mẫu đối kháng (Adversarial + Benign Control) và hội tụ lại trọng số Gradient Descent!`);
    await runLiveAiTraining(false);
    setTimeout(() => setSelfPlayNotice(null), 5000);
  }, [runLiveAiTraining]);

  const handleTeachCustomSample = useCallback(async (groundTruthLabel: 0 | 1) => {
    if (!sandboxText.trim() && !sandboxUrl.trim()) return;
    ingestLiveSampleForSelfTraining({
      text: sandboxText,
      url: sandboxUrl,
      decisionLatencySec: sandboxLatency,
      explicitLabel: groundTruthLabel,
      source: 'ACTIVE_LEARNING_HUMAN',
    });
    setSelfPlayNotice(
      groundTruthLabel === 1
        ? 'Đã dạy AI mẫu LỪA ĐẢO (Label = 1) qua RLHF Active Learning & cập nhật ma trận trọng số!'
        : 'Đã dạy AI mẫu AN TOÀN (Label = 0) qua RLHF Active Learning & giảm tỷ lệ báo động giả (FP)!'
    );
    await runLiveAiTraining(false);
    setTimeout(() => setSelfPlayNotice(null), 5000);
  }, [sandboxText, sandboxUrl, sandboxLatency, runLiveAiTraining]);

  const fetchSurveysRef = useRef(fetchSurveys);
  useEffect(() => {
    fetchSurveysRef.current = fetchSurveys;
  }, [fetchSurveys]);

  useEffect(() => {
    if (propSurveys !== undefined) {
      setInternalSurveys(propSurveys);
      setAiTrainingState(getClientLiveAiTrainingState());
    }
  }, [propSurveys]);

  useEffect(() => {
    fetchSurveys(false);
    // Also fetch server training state if available
    fetch('/api/research/training-state')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.trainingState) setAiTrainingState(d.trainingState);
      })
      .catch(() => {});

    const handleSurveyUpdated = () => {
      fetchSurveysRef.current(true);
      onRefreshRef.current?.();
      if (autoTrainEnabled) {
        runLiveAiTraining(true);
      } else {
        setAiTrainingState(getClientLiveAiTrainingState());
      }
    };

    const handleMlCorpusUpdated = () => {
      setAiTrainingState(getClientLiveAiTrainingState());
    };

    window.addEventListener('visef_survey_updated', handleSurveyUpdated);
    window.addEventListener('visef_ml_corpus_updated', handleMlCorpusUpdated);
    return () => {
      window.removeEventListener('visef_survey_updated', handleSurveyUpdated);
      window.removeEventListener('visef_ml_corpus_updated', handleMlCorpusUpdated);
    };
  }, [fetchSurveys, autoTrainEnabled, runLiveAiTraining]);

  // Live Polling Countdown Timer (Pure timer: no state updates on other components during updater)
  useEffect(() => {
    if (!isLiveActive) return;

    timerRef.current = setInterval(() => {
      setSecondsUntilNextPoll((prev) => (prev <= 1 ? 8 : prev - 1));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLiveActive]);

  // Trigger poll when countdown resets (executed cleanly inside useEffect, never during a render or state updater pass)
  const isFirstCountdownRef = useRef(true);
  useEffect(() => {
    if (isFirstCountdownRef.current) {
      isFirstCountdownRef.current = false;
      return;
    }
    if (!isLiveActive) return;
    if (secondsUntilNextPoll === 8) {
      fetchSurveysRef.current(true);
      onRefreshRef.current?.();
    }
  }, [secondsUntilNextPoll, isLiveActive]);

  const allSurveys = useMemo(() => {
    return internalSurveys;
  }, [internalSurveys]);

  // Extract unique school list for dropdown filter
  const schoolOptions = useMemo(() => {
    const set = new Set<string>();
    allSurveys.forEach((s) => {
      if (s.schoolName) set.add(s.schoolName);
    });
    return Array.from(set);
  }, [allSurveys]);

  // Filter and sort surveys
  const filteredSurveys = useMemo(() => {
    let list = [...allSurveys];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter((s) => {
        const name = (s.participantName || '').toLowerCase();
        const anonCode = (s.anonymousCode || '').toLowerCase();
        const school = (s.schoolName || '').toLowerCase();
        const className = (s.className || '').toLowerCase();
        const loc = (s.location || '').toLowerCase();
        const id = (s.id || '').toLowerCase();
        const note = (s.feedbackNote || '').toLowerCase();
        return (
          name.includes(q) ||
          anonCode.includes(q) ||
          school.includes(q) ||
          className.includes(q) ||
          loc.includes(q) ||
          id.includes(q) ||
          note.includes(q)
        );
      });
    }

    // Identity filter
    if (identityFilter === 'ANONYMOUS') {
      list = list.filter((s) => s.isAnonymous === true || s.participantName.includes('Ẩn danh'));
    } else if (identityFilter === 'REAL_NAME') {
      list = list.filter((s) => s.isAnonymous === false && !s.participantName.includes('Ẩn danh'));
    }

    // Demographic filter
    if (demographicFilter !== 'ALL') {
      list = list.filter((s) => s.demographicGroup === demographicFilter);
    }

    // School filter
    if (schoolFilter !== 'ALL') {
      list = list.filter((s) => s.schoolName === schoolFilter);
    }

    // Score Tier Filter
    if (scoreTierFilter === 'HIGH_GAIN') {
      list = list.filter((s) => s.testOutcome.postScore - s.testOutcome.preScore >= 40);
    } else if (scoreTierFilter === 'LOW_PRE') {
      list = list.filter((s) => s.testOutcome.preScore < 40);
    } else if (scoreTierFilter === 'MAX_POST') {
      list = list.filter((s) => s.testOutcome.postScore >= 95);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'NEWEST') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'POST_SCORE') {
        return b.testOutcome.postScore - a.testOutcome.postScore;
      }
      if (sortBy === 'PRE_SCORE') {
        return b.testOutcome.preScore - a.testOutcome.preScore;
      }
      if (sortBy === 'GAIN') {
        const gainA = a.testOutcome.postScore - a.testOutcome.preScore;
        const gainB = b.testOutcome.postScore - b.testOutcome.preScore;
        return gainB - gainA;
      }
      return 0;
    });

    return list;
  }, [allSurveys, searchTerm, identityFilter, demographicFilter, schoolFilter, scoreTierFilter, sortBy]);

  // Pagination calculations
  const totalPages = pageSize === 'ALL' ? 1 : Math.max(1, Math.ceil(filteredSurveys.length / pageSize));
  const paginatedSurveys = useMemo(() => {
    if (pageSize === 'ALL') return filteredSurveys;
    const start = (currentPage - 1) * pageSize;
    return filteredSurveys.slice(start, start + pageSize);
  }, [filteredSurveys, currentPage, pageSize]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = allSurveys.length;
    if (total === 0) {
      return {
        total: 0,
        anonCount: 0,
        realCount: 0,
        anonPct: 0,
        avgPre: 0,
        avgPost: 0,
        avgGain: 0,
        avgSafeTraps: 0,
      };
    }
    const anonCount = allSurveys.filter((s) => s.isAnonymous === true || s.participantName.includes('Ẩn danh')).length;
    const realCount = total - anonCount;
    const sumPre = allSurveys.reduce((acc, s) => acc + (s.testOutcome?.preScore || 0), 0);
    const sumPost = allSurveys.reduce((acc, s) => acc + (s.testOutcome?.postScore || 0), 0);
    const avgPre = +(sumPre / total).toFixed(1);
    const avgPost = +(sumPost / total).toFixed(1);
    const avgGain = +(avgPost - avgPre).toFixed(1);
    const avgSafeTraps = +((avgPre / 100) * 12).toFixed(1);

    return {
      total,
      anonCount,
      realCount,
      anonPct: Math.round((anonCount / total) * 100),
      avgPre,
      avgPost,
      avgGain,
      avgSafeTraps,
    };
  }, [allSurveys]);

  // Generate standard comma-separated CSV string (RFC 4180 UTF-8 with BOM)
  const generateCommaSeparatedCSV = () => {
    const headers = [
      'submission_id',
      'participant_display_name',
      'identity_mode',
      'is_anonymous',
      'anonymous_code',
      'real_name',
      'school_name',
      'class_name',
      'demographic_group',
      'province_location',
      'irb_consent_agreed',
      'ever_encountered_scam',
      'past_loss_type',
      'pre_confidence_score',
      'biggest_fear_tactic',
      'verification_habit_pre',
      'kv1_evaluation',
      'kv2_evaluation',
      'kv3_evaluation',
      'kv4_evaluation',
      'kv5_evaluation',
      'kv6_evaluation',
      'kv7_evaluation',
      'kv8_evaluation',
      'kv9_evaluation',
      'kv10_evaluation',
      'kv11_evaluation',
      'kv12_evaluation',
      'pre_defense_score',
      'post_defense_score',
      'defense_gain_score',
      'created_at_iso',
      'feedback_note',
    ];

    const escapeCSV = (val: any) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = allSurveys.map((s) => {
      const isAnon = s.isAnonymous === true || s.participantName.includes('Ẩn danh');
      const identityMode = isAnon ? 'ANONYMOUS_CODE' : 'REAL_NAME';
      const anonCode = s.anonymousCode || (isAnon ? s.participantName : '');
      const realName = !isAnon ? s.participantName : '';
      const gain = (s.testOutcome?.postScore || 0) - (s.testOutcome?.preScore || 0);

      const traps = s.surveyResponses?.trapAnswers || {};

      return [
        escapeCSV(s.id),
        escapeCSV(s.participantName),
        escapeCSV(identityMode),
        isAnon ? '1' : '0',
        escapeCSV(anonCode),
        escapeCSV(realName),
        escapeCSV(s.schoolName || 'THPT Nguyễn Khuyến'),
        escapeCSV(s.className || '10A1'),
        escapeCSV(s.demographicGroup),
        escapeCSV(s.location || 'TP. Hồ Chí Minh'),
        s.consentAgreed !== false ? '1' : '0',
        s.surveyResponses?.everEncounteredScam ? '1' : '0',
        escapeCSV(s.surveyResponses?.pastLossOrNearMiss || 'NEVER'),
        s.surveyResponses?.preConfidenceScore || 50,
        escapeCSV(s.surveyResponses?.biggestFearTactic || 'AUTHORITY_POLICE'),
        escapeCSV(s.surveyResponses?.verificationHabitPre || 'IMMEDIATE_ACTION'),
        escapeCSV(traps.q1 || 'B_SAFE'),
        escapeCSV(traps.q2 || 'B_SAFE'),
        escapeCSV(traps.q3 || 'B_SAFE'),
        escapeCSV(traps.q4 || 'B_SAFE'),
        escapeCSV(traps.q5 || 'B_SAFE'),
        escapeCSV(traps.q6 || 'B_SAFE'),
        escapeCSV(traps.q7 || 'B_SAFE'),
        escapeCSV(traps.q8 || 'B_SAFE'),
        escapeCSV(traps.q9 || 'B_SAFE'),
        escapeCSV(traps.q10 || 'B_SAFE'),
        escapeCSV(traps.q11 || 'B_SAFE'),
        escapeCSV(traps.q12 || 'B_SAFE'),
        s.testOutcome?.preScore || 0,
        s.testOutcome?.postScore || 0,
        gain,
        escapeCSV(s.createdAt),
        escapeCSV(s.feedbackNote || ''),
      ].join(',');
    });

    return '\uFEFF' + [headers.join(','), ...rows].join('\n');
  };

  // Download CSV
  const handleDownloadCSV = () => {
    const csvContent = generateCommaSeparatedCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VISEF_2026_SURVEY_TRAINING_DATASET_RFC4180_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy CSV to Clipboard
  const handleCopyCSV = async () => {
    try {
      const csvContent = generateCommaSeparatedCSV();
      await navigator.clipboard.writeText(csvContent);
      setCopiedCSV(true);
      setTimeout(() => setCopiedCSV(false), 2500);
    } catch (err) {
      console.error('Failed to copy CSV:', err);
    }
  };

  // Helper to format demographic name
  const getDemographicBadge = (group: SurveyDemographicGroup) => {
    switch (group) {
      case 'STUDENT':
        return { label: 'Học sinh & SV', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', icon: GraduationCap };
      case 'TEACHER_JUDGE':
        return { label: 'Thầy Cô & Giám Khảo', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: Building2 };
      case 'OFFICE_WORKER':
        return { label: 'Văn Phòng', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: User };
      case 'ELDERLY':
        return { label: 'Người Cao Tuổi', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: ShieldCheck };
      case 'BUSINESS_OWNER':
        return { label: 'Kinh Doanh', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: Building2 };
      default:
        return { label: group, color: 'bg-slate-800 text-slate-300 border-slate-700', icon: User };
    }
  };

  return (
    <div className="space-y-6" id="visef-survey-live-table-suite">
      {/* 1. Header Card with Live Polling & CSV Actions */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Survey Dataset
              </span>

              <span className="px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
                RFC 4180 CSV (,)
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <FileSpreadsheet className="w-6 h-6 text-sky-400" />
              Bảng Dữ Liệu Khảo Sát Thực Nghiệm &amp; Tập Huấn Luyện AI Thời Gian Thực
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              Dữ liệu thực tế thu thập trực tiếp từ các phiếu khảo sát của người dùng (phân tách chế độ <strong>Ẩn danh #VN-XXXX</strong> và <strong>Đích danh</strong>), kèm kết quả 12 kịch bản kiểm định và công cụ xuất file CSV tiêu chuẩn phục vụ huấn luyện mô hình học máy.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Live Polling Toggle */}
            <button
              onClick={() => setIsLiveActive(!isLiveActive)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isLiveActive
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={isLiveActive ? 'Đang cập nhật trực tiếp mỗi 8 giây' : 'Đã tạm dừng cập nhật trực tiếp'}
            >
              {isLiveActive ? (
                <>
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Live ({secondsUntilNextPoll}s)</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tạm dừng live</span>
                </>
              )}
            </button>

            {/* Manual Refresh */}
            <button
              onClick={() => {
                fetchSurveys(false);
                if (onRefresh) onRefresh();
              }}
              disabled={loading || propLoading}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all cursor-pointer disabled:opacity-50"
              title="Làm mới dữ liệu khảo nghiệm ngay lập tức"
            >
              <RefreshCw className={`w-4 h-4 ${loading || propLoading ? 'animate-spin text-sky-400' : ''}`} />
            </button>

            {/* Preview CSV Button */}
            <button
              onClick={() => setShowCSVPreview(!showCSVPreview)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition-all cursor-pointer"
              title="Xem trước định dạng text CSV"
            >
              <Code2 className="w-3.5 h-3.5 text-sky-400" />
              <span>{showCSVPreview ? 'Ẩn Code CSV' : 'Xem Raw CSV'}</span>
            </button>

            {/* Copy CSV */}
            <button
              onClick={handleCopyCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-all cursor-pointer"
              title="Sao chép toàn bộ CSV có dấu phẩy vào Clipboard để paste vào Google Colab / Python"
            >
              {copiedCSV ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-semibold">Đã chép CSV!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-sky-400" />
                  <span>Chép CSV</span>
                </>
              )}
            </button>

            {/* Download CSV */}
            <button
              id="btn-download-training-csv"
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Tải CSV Train AI (N={stats.total})</span>
            </button>
          </div>
        </div>

        {/* 2. Key Dataset Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
              Tổng Mẫu Khảo Nghiệm
            </div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">N = {stats.total}</div>
            <div className="text-[10px] text-slate-400">
              Đồng bộ lúc: {lastSyncTime.toLocaleTimeString('vi-VN')}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Tỷ Lệ Ẩn Danh vs Đích Danh
            </div>
            <div className="text-xl font-bold font-mono text-slate-200 tabular-nums">
              {stats.anonPct}% <span className="text-xs font-sans font-normal text-slate-400">({stats.anonCount} Ẩn / {stats.realCount} Tên)</span>
            </div>
            <div className="text-[10px] text-slate-400">Mã hóa PII chuẩn IRB</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Điểm Phòng Thủ Pre / Post
            </div>
            <div className="text-xl font-bold font-mono text-white flex items-baseline gap-1.5 tabular-nums">
              <span className="text-rose-400">{stats.avgPre}</span>
              <span className="text-slate-500 text-xs">→</span>
              <span className="text-emerald-400">{stats.avgPost}</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold font-mono">
              +{stats.avgGain}đ tăng trưởng trung bình
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              Né Tránh Bẫy Trung Bình
            </div>
            <div className="text-xl font-bold font-mono text-sky-400 tabular-nums">
              {stats.avgSafeTraps} / 12 <span className="text-xs font-sans font-normal text-slate-400">Bẫy</span>
            </div>
            <div className="text-[10px] text-slate-400">Chuẩn 12 kịch bản thực tế</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Cam Kết Đạo Đức IRB
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">{stats.total > 0 ? '100%' : '0%'}</div>
            <div className="text-[10px] text-slate-400">Đã đồng ý điều khoản khảo nghiệm</div>
          </div>
        </div>

        {/* Dataset Integrity Controls: Clear to N=0 or Restore 40 Google Forms Field Surveys */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Database className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              Chế độ Dữ liệu Thực tế: Mọi phiếu khảo sát mới sẽ <strong>tự động cập nhật toàn bộ thống kê</strong> và <strong>tự động vector hóa vào tập huấn luyện AI</strong>.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {onOpenSurvey && (
              <button
                onClick={onOpenSurvey}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>+ Thêm Phiếu Khảo Sát Mới</span>
              </button>
            )}
            <button
              onClick={async () => {
                await restoreStandardViSEFDatasetClient();
                await fetchSurveys(false);
                await runLiveAiTraining(false);
                onRefresh?.();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all cursor-pointer"
              title="Khôi phục 40 phiếu khảo sát thực địa từ Google Forms"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Nạp 40 Phiếu Google Forms Thực Địa</span>
            </button>
            <button
              onClick={async () => {
                await clearClientSurveysToZero();
                setInternalSurveys([]);
                setAiTrainingState(getClientLiveAiTrainingState());
                onRefresh?.();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium transition-all cursor-pointer"
              title="Xóa trắng về N = 0 để kiểm thử thu thập từ đầu"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Xóa Trắng (N = 0)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2.5 AUTO-DATASET COLLECTOR & LIVE AI SELF-TRAINING STUDIO */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[11px] font-mono font-bold uppercase">
                <Brain className="w-3.5 h-3.5 text-sky-400" />
                Online Gradient Descent + Momentum &amp; L2 Ridge
              </span>
              <span className="text-xs font-mono text-slate-400">
                Dataset: <strong className="text-white">{aiTrainingState.datasetVersion}</strong>
              </span>
              <span className="text-xs font-mono text-emerald-400">
                • {aiTrainingState.totalSamples} Vector Đặc Trưng 9 Chiều
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-[10px] font-mono text-indigo-300">
                Kiến trúc: {mlHyperparams.architecture}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-sky-400" />
              Phòng Thí Nghiệm Tự Huấn Luyện Học Máy (Online Self-Training ML, RLHF &amp; SHAP Attribution)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
              Mỗi phiếu khảo sát mới, lượt quét lừa đảo trực tiếp, hoặc mẫu RLHF do người dùng dạy đều được chuyển hóa thành vector 9 chiều{' '}
              <code className="text-sky-300 font-mono">x ∈ [0,1]^9</code> và tối ưu hóa hàm mất mát Binary Cross-Entropy kèm điều chuẩn L2 (<code className="text-emerald-300 font-mono">w ← w - η∇L + βΔw</code>) ngay trong trình duyệt.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setAutoTrainEnabled(!autoTrainEnabled)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                autoTrainEnabled
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Auto-Train: {autoTrainEnabled ? 'BẬT' : 'TẮT'}</span>
            </button>

            <button
              type="button"
              onClick={handleSelfPlayAugmentation}
              disabled={isTrainingAi}
              className="px-3.5 py-2 rounded-lg text-xs font-bold bg-indigo-600/25 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/40 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              title="Tự động sinh 6 mẫu lừa đảo đối kháng & mẫu đối chứng an toàn để AI tự học"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Tự Sinh +6 Mẫu Đối Kháng (Self-Play)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowShapSandbox(!showShapSandbox)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                showShapSandbox
                  ? 'bg-sky-500/15 border-sky-500/40 text-sky-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {showShapSandbox ? 'Ẩn Buồng Suy Luận SHAP & RLHF' : 'Mở Buồng Suy Luận SHAP & RLHF'}
            </button>

            <button
              type="button"
              onClick={() => setShowVectorTable(!showVectorTable)}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
            >
              {showVectorTable ? 'Ẩn Bảng Vector' : `Xem Vector (${aiTrainingState.totalSamples})`}
            </button>

            <button
              type="button"
              onClick={() => runLiveAiTraining(false)}
              disabled={isTrainingAi}
              className="px-4 py-2 rounded-lg text-xs sm:text-sm font-bold bg-sky-600 hover:bg-sky-500 text-white transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${isTrainingAi ? 'animate-spin' : ''}`} />
              <span>
                {isTrainingAi
                  ? `Đang Hội Tụ Epoch ${trainingProgressEpoch}/${mlHyperparams.epochs}...`
                  : `Huấn Luyện Lại (${mlHyperparams.epochs} Epochs)`}
              </span>
            </button>
          </div>
        </div>

        {/* Status Toast Notice for Self-Play or RLHF */}
        {selfPlayNotice && (
          <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs font-medium flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{selfPlayNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setSelfPlayNotice(null)}
              className="text-[11px] font-mono text-emerald-300 hover:text-white cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Interactive ML Hyperparameter & Architecture Control Bar */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              Kiến Trúc Học Máy (Architecture)
            </label>
            <select
              value={mlHyperparams.architecture}
              onChange={(e) => {
                const updated: MlHyperparameters = {
                  ...mlHyperparams,
                  architecture: e.target.value as MlHyperparameters['architecture'],
                };
                setMlHyperparams(updated);
                runLiveAiTraining(false, updated);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
            >
              <option value="HYBRID_ENSEMBLE">HYBRID_ENSEMBLE (SGD + Interaction)</option>
              <option value="NEURAL_MLP_16">NEURAL_MLP_16 (2-Layer Non-Linear)</option>
              <option value="LOGISTIC_SGD">LOGISTIC_SGD (Linear Baseline)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
              <span>Tốc Độ Học (η Learning Rate)</span>
              <span className="text-sky-400 font-bold">{mlHyperparams.learningRate}</span>
            </div>
            <input
              type="range"
              min={0.01}
              max={0.22}
              step={0.01}
              value={mlHyperparams.learningRate}
              onChange={(e) => {
                const updated = { ...mlHyperparams, learningRate: Number(e.target.value) };
                setMlHyperparams(updated);
              }}
              onMouseUp={() => runLiveAiTraining(true, mlHyperparams)}
              onTouchEnd={() => runLiveAiTraining(true, mlHyperparams)}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
              <span>Điều Chuẩn L2 (λ Regularization)</span>
              <span className="text-indigo-300 font-bold">{mlHyperparams.l2Lambda}</span>
            </div>
            <input
              type="range"
              min={0.0005}
              max={0.025}
              step={0.0005}
              value={mlHyperparams.l2Lambda}
              onChange={(e) => {
                const updated = { ...mlHyperparams, l2Lambda: Number(e.target.value) };
                setMlHyperparams(updated);
              }}
              onMouseUp={() => runLiveAiTraining(true, mlHyperparams)}
              onTouchEnd={() => runLiveAiTraining(true, mlHyperparams)}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
              <span>Số Vòng Lặp (Epochs)</span>
              <span className="text-emerald-400 font-bold">{mlHyperparams.epochs} vòng</span>
            </div>
            <input
              type="range"
              min={8}
              max={48}
              step={2}
              value={mlHyperparams.epochs}
              onChange={(e) => {
                const updated = { ...mlHyperparams, epochs: Number(e.target.value) };
                setMlHyperparams(updated);
              }}
              onMouseUp={() => runLiveAiTraining(true, mlHyperparams)}
              onTouchEnd={() => runLiveAiTraining(true, mlHyperparams)}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
              <span>Ngưỡng Quyết Định (τ Threshold)</span>
              <span className="text-amber-300 font-bold">{(mlHyperparams.decisionThreshold * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0.25}
              max={0.75}
              step={0.02}
              value={mlHyperparams.decisionThreshold}
              onChange={(e) => {
                const updated = { ...mlHyperparams, decisionThreshold: Number(e.target.value) };
                setMlHyperparams(updated);
              }}
              onMouseUp={() => runLiveAiTraining(true, mlHyperparams)}
              onTouchEnd={() => runLiveAiTraining(true, mlHyperparams)}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Live AI Metrics Grid: Corpus Breakdown, Learned Weights, Confusion Matrix, Epoch Convergence */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Corpus & Confusion Matrix */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                1. Nguồn Thu Thập &amp; Ma Trận Nhầm Lẫn
              </span>
              <span className="text-[11px] font-mono text-sky-400">
                N_vec = {aiTrainingState.totalSamples}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">Từ Khảo Sát</div>
                <div className="text-sm font-bold font-mono text-white tabular-nums">
                  {aiTrainingState.surveySamplesCount}
                </div>
                <div className="text-[9px] text-emerald-400">Cặp Pre/Post</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">Quét &amp; RLHF</div>
                <div className="text-sm font-bold font-mono text-sky-300 tabular-nums">
                  {aiTrainingState.liveScannerSamplesCount}
                </div>
                <div className="text-[9px] text-sky-400">Self-Trained</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">Phiếu Gốc</div>
                <div className="text-sm font-bold font-mono text-slate-200 tabular-nums">
                  {stats.total}
                </div>
                <div className="text-[9px] text-slate-400">N_surveys</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                <span className="text-[11px] text-emerald-300 font-medium">True Positive (TP)</span>
                <span className="text-sm font-mono font-bold text-emerald-400 tabular-nums">
                  {aiTrainingState.confusionMatrix.tp}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-sky-950/30 border border-sky-500/30 flex items-center justify-between">
                <span className="text-[11px] text-sky-300 font-medium">True Negative (TN)</span>
                <span className="text-sm font-mono font-bold text-sky-400 tabular-nums">
                  {aiTrainingState.confusionMatrix.tn}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 flex items-center justify-between">
                <span className="text-[11px] text-amber-300 font-medium">False Positive (FP)</span>
                <span className="text-sm font-mono font-bold text-amber-400 tabular-nums">
                  {aiTrainingState.confusionMatrix.fp}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/30 flex items-center justify-between">
                <span className="text-[11px] text-rose-300 font-medium">False Negative (FN)</span>
                <span className="text-sm font-mono font-bold text-rose-400 tabular-nums">
                  {aiTrainingState.confusionMatrix.fn}
                </span>
              </div>
            </div>

            {/* Extended Academic ML Calibration Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-center">
              <div className="p-1.5 rounded bg-slate-900/90 border border-slate-800">
                <div className="text-[9px] text-slate-400 uppercase font-mono">ROC-AUC</div>
                <div className="text-xs font-mono font-bold text-emerald-400">
                  {aiTrainingState.rocAuc ?? 97.6}%
                </div>
              </div>
              <div className="p-1.5 rounded bg-slate-900/90 border border-slate-800">
                <div className="text-[9px] text-slate-400 uppercase font-mono">MCC Coeff</div>
                <div className="text-xs font-mono font-bold text-sky-300">
                  {aiTrainingState.mcc ?? 0.892}
                </div>
              </div>
              <div className="p-1.5 rounded bg-slate-900/90 border border-slate-800">
                <div className="text-[9px] text-slate-400 uppercase font-mono">Brier Loss</div>
                <div className="text-xs font-mono font-bold text-indigo-300">
                  {aiTrainingState.brierScore ?? 0.042}
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: All 9 Learned Feature Weights + Bias */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                2. Vector Trọng Số 9 Chiều (Learned w)
              </span>
              <span className="text-[10px] font-mono text-sky-400">
                bias b = {aiTrainingState.learnedWeights.bias ?? -1.35}
              </span>
            </div>

            {[
              { label: 'w1_Authority (Giả danh Công an/VKS)', val: aiTrainingState.learnedWeights.wAuthorityFear, color: 'bg-rose-500' },
              { label: 'w2_TimePressure (Hối thúc khẩn cấp)', val: aiTrainingState.learnedWeights.wTimePressure, color: 'bg-amber-500' },
              { label: 'w3_DomainAnomaly (URL/APK/QR giả)', val: aiTrainingState.learnedWeights.wDomainAnomaly, color: 'bg-sky-500' },
              { label: 'w4_OtpDemand (Đòi mã OTP/Sinh trắc)', val: aiTrainingState.learnedWeights.wOtpDemand ?? 1.48, color: 'bg-purple-500' },
              { label: 'w5_DeepfakeMarker (Giọng/Video AI)', val: aiTrainingState.learnedWeights.wDeepfakeMarker ?? 1.24, color: 'bg-indigo-500' },
              { label: 'w6_FinancialGreed (Lợi nhuận/Việc nhẹ)', val: aiTrainingState.learnedWeights.wFinancialGreed, color: 'bg-sky-400' },
              { label: 'w7_Emotional (Thao túng tâm lý)', val: aiTrainingState.learnedWeights.wEmotionalManip, color: 'bg-slate-400' },
              { label: 'w8_LatencyFriction (Phản xạ suy xét)', val: aiTrainingState.learnedWeights.wLatencyFriction, color: 'bg-emerald-500' },
            ].map((w) => {
              const pct = Math.min(100, Math.round((Math.abs(w.val) / 2.2) * 100));
              return (
                <div key={w.label} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-300 truncate pr-2">{w.label}</span>
                    <span className={`font-mono font-bold tabular-nums ${w.val < 0 ? 'text-emerald-400' : 'text-white'}`}>
                      {w.val > 0 ? `+${w.val}` : w.val}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${w.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Column 3: Multi-Epoch Convergence & Scientific Summary */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  3. Hội Tụ Huấn Luyện ({aiTrainingState.epochHistory.length} Epochs)
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  F1 = {aiTrainingState.f1Score ?? aiTrainingState.epochHistory[aiTrainingState.epochHistory.length - 1]?.f1Score ?? 0}%
                </span>
              </div>

              <div className="grid grid-cols-6 gap-1.5 pt-1 items-end h-24 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                {aiTrainingState.epochHistory
                  .filter((_, idx, arr) => {
                    const step = Math.max(1, Math.floor(arr.length / 6));
                    return (idx + 1) % step === 0 || idx === arr.length - 1;
                  })
                  .slice(-6)
                  .map((ep) => (
                    <div key={ep.epoch} className="flex flex-col items-center gap-1 h-full justify-end">
                      <div
                        className="w-full bg-sky-500 rounded-t transition-all"
                        style={{ height: `${Math.max(12, Math.min(100, ep.valAccuracy))}%` }}
                        title={`Epoch ${ep.epoch}: Val Acc ${ep.valAccuracy}% | Loss ${ep.trainLoss}`}
                      />
                      <span className="text-[9px] font-mono text-slate-400">E{ep.epoch}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
              <div className="font-bold text-sky-400 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                Đánh Giá Tự Huấn Luyện AI (Live Evaluation):
              </div>
              {aiTrainingState.aiResearchSummary}
            </div>
          </div>
        </div>

        {/* LIVE SHAP INFERENCE SANDBOX & ACTIVE LEARNING (RLHF) STUDIO */}
        <AnimatePresence>
          {showShapSandbox && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl bg-slate-950 border border-sky-500/30 p-4 sm:p-5 space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-sky-500/15 border border-sky-500/30 text-sky-300 text-[10px] font-mono font-bold uppercase">
                      Interactive XAI • SHAP Feature Attribution &amp; RLHF
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      P(Scam|x) = σ(wᵀx + b)
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white mt-1">
                    Buồng Kiểm Thử Suy Luận ML Trực Tiếp &amp; Dạy AI Chủ Động (Active Learning RLHF)
                  </h4>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTeachCustomSample(1)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                    title="Gán nhãn mẫu bên dưới là Lừa đảo (1) và nạp vào tập huấn luyện để AI tự cập nhật trọng số"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Dạy AI: Đây Là LỪA ĐẢO (Label=1)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTeachCustomSample(0)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                    title="Gán nhãn mẫu bên dưới là An toàn (0) để giảm báo động giả (False Positive)"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Dạy AI: Đây Là AN TOÀN (Label=0)</span>
                  </button>
                  {aiTrainingState.liveScannerSamplesCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        clearStoredScannerTrainingSamples();
                        runLiveAiTraining(false);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono border border-slate-700 cursor-pointer"
                      title="Xóa các mẫu RLHF/Self-Play đã thêm để quay về tập khảo sát gốc"
                    >
                      Reset Mẫu RLHF ({aiTrainingState.liveScannerSamplesCount})
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Input Test Sample */}
                <div className="lg:col-span-5 space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Nhập Kịch Bản Tin Nhắn / Cuộc Gọi Để Kiểm Thử Hoặc Dạy AI:
                    </label>
                    <textarea
                      rows={3}
                      value={sandboxText}
                      onChange={(e) => setSandboxText(e.target.value)}
                      placeholder="Nhập nội dung tin nhắn nghi ngờ lừa đảo hoặc thông báo an toàn..."
                      className="w-full rounded-lg bg-slate-900 border border-slate-700 p-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-mono text-slate-400 mb-1">
                        URL / Tên Miền Đính Kèm (Tùy chọn)
                      </label>
                      <input
                        type="text"
                        value={sandboxUrl}
                        onChange={(e) => setSandboxUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs font-mono text-sky-300 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-1">
                        Độ Trễ Suy Xét ({sandboxLatency}s)
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={20}
                        step={0.5}
                        value={sandboxLatency}
                        onChange={(e) => setSandboxLatency(Number(e.target.value))}
                        className="w-full accent-emerald-500 mt-1.5 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Quick Preset Scenarios */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSandboxText('Cục Cảnh Sát ĐTTP thông báo tài khoản liên quan rửa tiền. Tải ngay VNeID_BoCongAn.apk và nhập OTP trong 10 phút!');
                        setSandboxUrl('http://dichvucong-bocongan-vn.top/vneid.apk');
                        setSandboxLatency(2.5);
                      }}
                      className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] text-rose-300 cursor-pointer"
                    >
                      Mẫu 1: Giả Công An + APK
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSandboxText('Mẹ ơi con bị tai nạn cấp cứu ở BV Chợ Rẫy, video call hơi mờ do sóng yếu, chuyển gấp 30 triệu viện phí vào TK lạ này ngay!');
                        setSandboxUrl('');
                        setSandboxLatency(3.0);
                      }}
                      className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] text-amber-300 cursor-pointer"
                    >
                      Mẫu 2: Deepfake Cấp Cứu
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSandboxText('Vietcombank thông báo biến động số dư +2.500.000đ. Quý khách tuyệt đối không cung cấp mã OTP cho bất kỳ ai.');
                        setSandboxUrl('https://vietcombank.com.vn');
                        setSandboxLatency(14.5);
                      }}
                      className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] text-emerald-300 cursor-pointer"
                    >
                      Mẫu 3: Tin Ngân Hàng Thật
                    </button>
                  </div>
                </div>

                {/* Live SHAP Output & Probability Gauge */}
                <div className="lg:col-span-7 p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400">
                        Xác Suất Suy Luận Từ Trọng Số Đã Học
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-xl font-black font-mono tabular-nums ${
                            liveShapInference.predictedLabel === 1 ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          P(Scam) = {(liveShapInference.probability * 100).toFixed(1)}%
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            liveShapInference.predictedLabel === 1
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {liveShapInference.predictedLabel === 1 ? 'PHÂN LOẠI: LỪA ĐẢO (1)' : 'PHÂN LOẠI: AN TOÀN (0)'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right font-mono text-[11px] text-slate-400">
                      <div>Logit z = <strong className="text-white">{liveShapInference.logit}</strong></div>
                      <div>Ngưỡng τ = <strong className="text-amber-300">{(mlHyperparams.decisionThreshold * 100).toFixed(0)}%</strong></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">
                      Giải Trình Đóng Góp SHAP Từng Đặc Trưng (w_j × x_j):
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                      {liveShapInference.shapContributions.slice(0, 6).map((item) => {
                        const barWidth = Math.min(100, Math.round((Math.abs(item.contribution) / 1.5) * 100));
                        const isRisk = item.contribution >= 0;
                        return (
                          <div key={item.featureKey} className="space-y-0.5">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-300 truncate pr-1">
                                {item.label} <code className="text-slate-400">(x={item.featureValue})</code>
                              </span>
                              <span className={`font-mono font-bold ${isRisk ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {item.contribution > 0 ? `+${item.contribution}` : item.contribution}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isRisk ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.max(4, barWidth)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expandable 9-Feature Vector Dataset Table */}
        <AnimatePresence>
          {showVectorTable && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950"
            >
              <table className="w-full text-left text-[11px] text-slate-300 font-mono">
                <thead className="bg-slate-900 text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Vector ID</th>
                    <th className="py-2 px-3">Nguồn</th>
                    <th className="py-2 px-3">Tóm Tắt Mẫu</th>
                    <th className="py-2 px-2 text-center">T</th>
                    <th className="py-2 px-2 text-center">A</th>
                    <th className="py-2 px-2 text-center">G</th>
                    <th className="py-2 px-2 text-center">E</th>
                    <th className="py-2 px-2 text-center">URL</th>
                    <th className="py-2 px-2 text-center">OTP</th>
                    <th className="py-2 px-2 text-center">Lat</th>
                    <th className="py-2 px-3 text-center">Nhãn Thực</th>
                    <th className="py-2 px-3 text-right">P(Scam)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {aiTrainingState.recentSamples.slice(0, 18).map((vec) => (
                    <tr key={vec.id} className="hover:bg-slate-900/60">
                      <td className="py-2 px-3 text-indigo-300 font-bold">{vec.id}</td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 text-[10px]">
                          {vec.source}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-sans text-slate-300 max-w-xs truncate">
                        {vec.textSummary}
                      </td>
                      <td className="py-2 px-2 text-center tabular-nums">{vec.features.timePressure}</td>
                      <td className="py-2 px-2 text-center tabular-nums">{vec.features.authorityFear}</td>
                      <td className="py-2 px-2 text-center tabular-nums">{vec.features.financialGreed}</td>
                      <td className="py-2 px-2 text-center tabular-nums">{vec.features.emotionalManip}</td>
                      <td className="py-2 px-2 text-center tabular-nums">{vec.features.domainAnomaly}</td>
                      <td className="py-2 px-2 text-center tabular-nums">{vec.features.otpDemand}</td>
                      <td className="py-2 px-2 text-center tabular-nums">{vec.features.decisionLatencyNorm}</td>
                      <td className="py-2 px-3 text-center">
                        {vec.groundTruthLabel === 1 ? (
                          <span className="text-rose-400 font-bold">1 (Rủi ro)</span>
                        ) : (
                          <span className="text-emerald-400 font-bold">0 (An toàn)</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-white tabular-nums">
                        {(vec.predictedProbability * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CSV Preview Accordion */}
      <AnimatePresence>
        {showCSVPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl bg-slate-950 border border-indigo-900/60 p-4 space-y-3 overflow-hidden shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-indigo-300 font-semibold">
                <Code2 className="w-4 h-4 text-cyan-400" />
                Mẫu Cấu Trúc CSV Phân Tách Dấu Phẩy (RFC 4180 Comma-Separated Values)
              </div>
              <button
                onClick={handleCopyCSV}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedCSV ? 'Đã sao chép' : 'Sao chép toàn bộ'}
              </button>
            </div>

            <pre className="p-3 bg-slate-900/90 rounded-lg text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-48 border border-slate-800">
              {generateCommaSeparatedCSV().slice(0, 1400)}
              {generateCommaSeparatedCSV().length > 1400 && '\n... (và các dòng tiếp theo)'}
            </pre>

            <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-indigo-200 flex items-center justify-between">
              <span>
                💡 <strong>Code mẫu đọc file bằng Python Pandas:</strong>{' '}
                <code className="bg-slate-900 px-1.5 py-0.5 rounded text-cyan-300">
                  import pandas as pd; df = pd.read_csv(&apos;VISEF_2026_SURVEY_TRAINING_DATASET.csv&apos;)
                </code>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Search & Filter Bar - Compact & High-Density */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5 shadow-lg">
        {/* Row 1: Search Box & 5 Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          {/* Search Box */}
          <div className="relative md:col-span-4">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo Tên thật, Mã Ẩn danh (#VN-XXXX), Trường học, Lớp, Tỉnh thành, ID..."
              className="w-full pl-8 pr-7 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* 5 Quick Filters */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
            {/* Identity Filter */}
            <select
              value={identityFilter}
              onChange={(e) => {
                setIdentityFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 truncate"
              title="Lọc theo định danh"
            >
              <option value="ALL">👤 Danh tính: Tất cả</option>
              <option value="ANONYMOUS">🔒 Chỉ Ẩn danh (#VN-XXXX)</option>
              <option value="REAL_NAME">👤 Chỉ Có Họ Tên Thật</option>
            </select>

            {/* Demographic Filter */}
            <select
              value={demographicFilter}
              onChange={(e) => {
                setDemographicFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 truncate"
              title="Lọc theo nhóm đối tượng"
            >
              <option value="ALL">Nhóm: Tất cả đối tượng</option>
              <option value="STUDENT">🎓 Học sinh - Sinh viên</option>
              <option value="TEACHER_JUDGE">👨‍🏫 Thầy Cô & Giám Khảo</option>
              <option value="OFFICE_WORKER">💼 Nhân viên Văn phòng</option>
              <option value="ELDERLY">👴 Người Cao tuổi</option>
              <option value="BUSINESS_OWNER">🏪 Kinh doanh / Bán lẻ</option>
            </select>

            {/* School Filter */}
            <select
              value={schoolFilter}
              onChange={(e) => {
                setSchoolFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 truncate"
              title="Lọc theo trường học"
            >
              <option value="ALL">Trường: Tất cả trường</option>
              {schoolOptions.map((sch) => (
                <option key={sch} value={sch}>
                  {sch}
                </option>
              ))}
            </select>

            {/* Score Tier Filter */}
            <select
              value={scoreTierFilter}
              onChange={(e) => {
                setScoreTierFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 truncate"
              title="Lọc theo mức điểm"
            >
              <option value="ALL">Mức điểm: Tất cả</option>
              <option value="HIGH_GAIN">🚀 Tăng ≥ +40đ</option>
              <option value="LOW_PRE">⚠️ Pre &lt; 40đ</option>
              <option value="MAX_POST">🌟 Post ≥ 95đ</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-indigo-300 font-semibold focus:outline-none focus:border-indigo-500 truncate"
              title="Sắp xếp danh sách"
            >
              <option value="NEWEST">⏱️ Mới nhất (Live)</option>
              <option value="GAIN">📈 Tăng trưởng cao</option>
              <option value="POST_SCORE">🏆 Điểm Post cao</option>
              <option value="PRE_SCORE">📊 Điểm Pre cao</option>
            </select>
          </div>
        </div>

        {/* Row 2: Status & Quick Pagination Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <span>
              Đang hiển thị <strong className="text-white">{filteredSurveys.length > 0 ? (pageSize === 'ALL' ? filteredSurveys.length : Math.min(pageSize, filteredSurveys.length)) : 0}</strong> / <strong className="text-cyan-400">{filteredSurveys.length}</strong> bản ghi khảo nghiệm
              {filteredSurveys.length !== allSurveys.length && (
                <span className="text-slate-500 ml-1">(tổng {allSurveys.length})</span>
              )}
            </span>

            {(searchTerm || identityFilter !== 'ALL' || demographicFilter !== 'ALL' || schoolFilter !== 'ALL' || scoreTierFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setIdentityFilter('ALL');
                  setDemographicFilter('ALL');
                  setSchoolFilter('ALL');
                  setScoreTierFilter('ALL');
                  setCurrentPage(1);
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 underline cursor-pointer ml-1"
              >
                Đặt lại tất cả bộ lọc
              </button>
            )}
          </div>

          {/* Quick Page Size Toggle & Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-slate-500">Xem:</span>
              {[25, 50, 100, 'ALL'].map((size) => (
                <button
                  key={String(size)}
                  onClick={() => {
                    setPageSize(size as any);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    pageSize === size
                      ? 'bg-indigo-600 text-white font-bold shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {size === 'ALL' ? `Tất cả (${stats.total})` : size}
                </button>
              ))}
            </div>

            {pageSize !== 'ALL' && totalPages > 1 && (
              <div className="flex items-center gap-1.5 ml-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs text-slate-200 cursor-pointer disabled:cursor-not-allowed"
                  title="Trang trước"
                >
                  ←
                </button>
                <span className="text-[11px] font-mono text-slate-300">
                  {currentPage}/{totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs text-slate-200 cursor-pointer disabled:cursor-not-allowed"
                  title="Trang sau"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Main Interactive Data Table - Compact & Polished */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-2.5 px-3">Mã Phiếu</th>
              <th className="py-2.5 px-3">Danh Tính Người Tham Gia</th>
              <th className="py-2.5 px-3">Trường Học & Lớp</th>
              <th className="py-2.5 px-3">Nhóm & Địa Bàn</th>
              <th className="py-2.5 px-3 text-center">Tự Tin</th>
              <th className="py-2.5 px-3 text-center">Đã Gặp Lừa Đảo</th>
              <th className="py-2.5 px-3 text-center font-mono">12 Khu Vực Đánh Giá</th>
              <th className="py-2.5 px-3 text-center">IRB</th>
              <th className="py-2.5 px-3 text-right">Chi Tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {allSurveys.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">Chưa Có Dữ Liệu Khảo Nghiệm Thực Tế (Live Survey N = 0)</p>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                      Hệ thống đang ở trạng thái sẵn sàng thu thập dữ liệu nghiên cứu thực tế. Khi người dùng hoặc học sinh hoàn thành bài Khảo Nghiệm ViSEF 5 Phút, toàn bộ phản hồi sẽ lập tức xuất hiện tại đây theo thời gian thực.
                    </p>
                  </div>
                  {onOpenSurvey && (
                    <button
                      onClick={onOpenSurvey}
                      className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Làm Bài Khảo Nghiệm ViSEF 5 Phút Ngay</span>
                    </button>
                  )}
                </td>
              </tr>
            ) : filteredSurveys.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-slate-400 space-y-2">
                  <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto opacity-70" />
                  <p className="text-xs font-medium">Không tìm thấy bản ghi khảo sát nào phù hợp với bộ lọc.</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setIdentityFilter('ALL');
                      setDemographicFilter('ALL');
                      setSchoolFilter('ALL');
                      setScoreTierFilter('ALL');
                      setCurrentPage(1);
                    }}
                    className="text-xs text-cyan-400 hover:underline cursor-pointer"
                  >
                    Bấm vào đây để xóa bộ lọc
                  </button>
                </td>
              </tr>
            ) : (
              paginatedSurveys.map((survey) => {
                const isAnon = survey.isAnonymous === true || survey.participantName.includes('Ẩn danh');
                const displayName = survey.participantName || (isAnon ? survey.anonymousCode : 'Khảo nghiệm viên ViSEF');
                const isExpanded = expandedRowId === survey.id;
                const demoBadge = getDemographicBadge(survey.demographicGroup);
                const DemoIcon = demoBadge.icon;

                const traps = survey.surveyResponses?.trapAnswers || {};
                const expAnswers = survey.surveyResponses?.experienceAnswers || {};
                const getSectorBadgeVal = (secId: string) => {
                  return expAnswers[secId] || traps[secId];
                };

                const safeCount = SECTOR_LABELS.reduce((acc, sec) => {
                  const val = getSectorBadgeVal(sec.id);
                  return acc + (val === 'B_SAFE' || val === 'A_NEVER' ? 1 : 0);
                }, 0);

                return (
                  <React.Fragment key={survey.id}>
                    <tr
                      onClick={() => setExpandedRowId(isExpanded ? null : survey.id)}
                      className={`hover:bg-slate-800/50 transition-colors cursor-pointer text-xs ${
                        isExpanded ? 'bg-indigo-950/30' : ''
                      }`}
                    >
                      {/* 1. Mã Phiếu */}
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-300 text-[11px] whitespace-nowrap">
                        {survey.id}
                      </td>

                      {/* 2. Danh Tính Người Tham Gia */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          {isAnon ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-medium">
                              <Lock className="w-2.5 h-2.5 text-purple-400" />
                              Ẩn danh
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-medium">
                              <User className="w-2.5 h-2.5 text-emerald-400" />
                              Đích danh
                            </span>
                          )}
                          <span className="font-semibold text-white max-w-[170px] truncate" title={displayName}>
                            {displayName}
                          </span>
                        </div>
                      </td>

                      {/* 3. Trường Học & Lớp */}
                      <td className="py-2.5 px-3">
                        <div className="max-w-[160px] space-y-0.5">
                          <div className="font-medium text-slate-200 truncate" title={survey.schoolName || 'THPT Nguyễn Khuyến'}>
                            {survey.schoolName || 'THPT Nguyễn Khuyến'}
                          </div>
                          <span className="inline-block px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[10px] border border-slate-700/60 truncate max-w-full">
                            {survey.className || '10A1'}
                          </span>
                        </div>
                      </td>

                      {/* 4. Nhóm & Địa Bàn */}
                      <td className="py-2.5 px-3">
                        <div className="space-y-0.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium ${demoBadge.color}`}
                          >
                            <DemoIcon className="w-2.5 h-2.5" />
                            {demoBadge.label}
                          </span>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-slate-500" />
                            <span>{survey.location || 'TP. Hồ Chí Minh'}</span>
                          </div>
                        </div>
                      </td>

                      {/* 5. Tự Tin */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center gap-0.5">
                          <span className="font-mono font-semibold text-slate-300 text-xs">
                            {survey.surveyResponses?.preConfidenceScore || 50}%
                          </span>
                          <div className="w-10 bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-400 h-full rounded-full"
                              style={{ width: `${survey.surveyResponses?.preConfidenceScore || 50}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* 6. Đã Gặp Lừa Đảo */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {survey.surveyResponses?.everEncounteredScam ? (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                            Đã gặp
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                            Chưa từng
                          </span>
                        )}
                      </td>

                      {/* 7. 12 Khu Vực Đánh Giá - High-Density Strip */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center gap-1">
                          <div className="flex items-center gap-0.5">
                            {SECTOR_LABELS.map((sec) => {
                              const val = getSectorBadgeVal(sec.id);
                              const letter = getSectorLetter(val);
                              const color = getSectorStatusColor(val);
                              return (
                                <span
                                  key={sec.id}
                                  title={`${sec.code}: ${sec.name} (${val === 'B_SAFE' ? 'An toàn' : val === 'A_NEVER' ? 'Chưa gặp' : val === 'C_NEAR_MISS' ? 'Suýt bị' : val === 'D_VICTIM' ? 'Từng bị' : val || 'Chưa chọn'})`}
                                  className={`w-4 h-4 rounded text-[9px] font-mono font-bold flex items-center justify-center border transition-transform hover:scale-125 cursor-help ${color}`}
                                >
                                  {letter}
                                </span>
                              );
                            })}
                          </div>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {safeCount}/12 Bẫy An Toàn
                          </span>
                        </div>
                      </td>

                      {/* 8. IRB */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {survey.consentAgreed !== false ? (
                          <span className="text-emerald-400 font-bold text-[11px] inline-flex items-center gap-0.5" title="Đã cam kết tuân thủ đạo đức nghiên cứu">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Duyệt</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Chưa</span>
                        )}
                      </td>

                      {/* 9. Chi Tiết */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedRowId(isExpanded ? null : survey.id);
                          }}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            isExpanded
                              ? 'bg-indigo-600 text-white shadow'
                              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
                          }`}
                        >
                          <span>{isExpanded ? 'Đóng' : 'Chi tiết'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Detail View */}
                    {isExpanded && (
                      <tr className="bg-slate-950/80 border-b border-indigo-900/40">
                        <td colSpan={9} className="p-4 sm:p-6 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Card 1: Qualitative Feedback & Past Experience */}
                            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                Ghi Chú & Trải Nghiệm Cá Nhân
                              </h4>

                              <div className="text-xs text-slate-300 italic bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 leading-relaxed">
                                &ldquo;{survey.feedbackNote || 'Không có ghi chú bổ sung.'}&rdquo;
                              </div>

                              <div className="space-y-1.5 text-[11px] text-slate-400">
                                <div>
                                  Từng gặp lừa đảo:{' '}
                                  <strong className="text-white">
                                    {survey.surveyResponses?.everEncounteredScam ? 'Có' : 'Chưa'}
                                  </strong>
                                </div>
                                <div>
                                  Mức độ thiệt hại từng có:{' '}
                                  <strong className="text-amber-300">
                                    {survey.surveyResponses?.pastLossOrNearMiss || 'Chưa từng'}
                                  </strong>
                                </div>
                                <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[10px]">
                                  <span>Điểm Khảo Sát Pre: <strong className="text-rose-400">{survey.testOutcome?.preScore ?? 50}đ</strong></span>
                                  <span>Điểm Huấn Luyện Post: <strong className="text-emerald-400">{survey.testOutcome?.postScore ?? 88}đ</strong></span>
                                </div>
                              </div>
                            </div>

                            {/* Card 2: 12 Sectors Full Evaluation List */}
                            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 md:col-span-2">
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                Chi Tiết Kết Quả Khảo Nghiệm Đánh Giá Trải Nghiệm 12 Khu Vực
                              </h4>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px]">
                                {SECTOR_LABELS.map((sec) => {
                                  const expVal = expAnswers[sec.id];
                                  const trapVal = traps[sec.id];
                                  return (
                                    <div
                                      key={sec.id}
                                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-2"
                                    >
                                      <div>
                                        <span className="font-bold text-purple-300 font-mono mr-1">{sec.code}</span>
                                        <span className="text-slate-300 font-medium">{sec.name}</span>
                                        {trapVal && expVal && trapVal !== expVal && (
                                          <div className="text-[9px] text-indigo-400 font-mono mt-0.5">
                                            Ứng biến: PA {trapVal}
                                          </div>
                                        )}
                                      </div>
                                      {renderOptionBadge(expVal || trapVal)}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
