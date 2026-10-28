import React, { useState, useEffect } from 'react';
import {
  User,
  Users,
  Award,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  BarChart3,
  RefreshCw,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { PostAppCertificationRecord } from '../types';
import { computePrePostComparisonAnalysis } from '../services/researchDataService';

interface PrePostComparisonSectionProps {
  onOpenExamModal?: () => void;
}

export const PrePostIndividualAndCommunityComparisonSection: React.FC<
  PrePostComparisonSectionProps
> = ({ onOpenExamModal }) => {
  const [userCert, setUserCert] = useState<PostAppCertificationRecord | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const localCertStr = localStorage.getItem('visef_post_app_certifications');
        if (localCertStr) {
          const list: PostAppCertificationRecord[] = JSON.parse(localCertStr);
          if (Array.isArray(list) && list.length > 0) {
            return list[0];
          }
        }
      } catch {
        // ignore
      }
    }
    return null;
  });

  // Initialize with real baseline data immediately so it NEVER shows 0 on Vercel or offline
  const [data, setData] = useState<any>(() => computePrePostComparisonAnalysis(userCert));
  const [loading, setLoading] = useState(false);

  const fetchComparisonData = async () => {
    try {
      setLoading(true);

      // Check localStorage for the user's latest certificate exam
      let latestUserCert: PostAppCertificationRecord | null = null;
      if (typeof window !== 'undefined') {
        try {
          const localCertStr = localStorage.getItem('visef_post_app_certifications');
          if (localCertStr) {
            const list: PostAppCertificationRecord[] = JSON.parse(localCertStr);
            if (Array.isArray(list) && list.length > 0) {
              latestUserCert = list[0];
              setUserCert(latestUserCert);
            }
          }
        } catch {
          // ignore
        }
      }

      // Always compute client-side baseline first
      const localComputed = computePrePostComparisonAnalysis(latestUserCert);

      // Attempt server sync if backend API is reachable
      try {
        const res = await fetch('/api/research/pre-post-comparison');
        if (res.ok) {
          const json = await res.json();
          if (json && json.community && json.community.totalEvaluated > 0) {
            setData(json);
            return;
          }
        }
      } catch {
        // Offline or Vercel static serverless fallback
      }

      // If server returned 0 or failed, fallback to local computed analysis
      setData(localComputed);
    } catch (e) {
      console.warn('Could not fetch comparison, using client computation', e);
      setData(computePrePostComparisonAnalysis(userCert));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparisonData();

    const handleUpdate = () => {
      fetchComparisonData();
    };

    window.addEventListener('visef_post_cert_updated', handleUpdate);
    window.addEventListener('visef_survey_updated', handleUpdate);

    return () => {
      window.removeEventListener('visef_post_cert_updated', handleUpdate);
      window.removeEventListener('visef_survey_updated', handleUpdate);
    };
  }, []);

  // Compute values strictly from real dataset and user certification
  const hasRealUserCert = !!userCert;
  const communityData = data?.community;
  const communityTotal = communityData?.totalEvaluated ?? 0;
  const communityPre = communityData?.avgPreScore ?? 0;
  const communityPost = communityData?.avgPostScore ?? 0;
  const communityDelta = communityData?.avgDeltaScore ?? 0;
  const passRate = communityData?.overallPassRate ?? 0;
  const totalEvaluated = communityTotal;
  const studentGain = communityData?.demographicGains?.STUDENT ?? 0;

  const individualPre = userCert?.preAppScore ?? (data?.individual?.preScore ?? communityPre);
  const individualPost = userCert?.postAppScore ?? (data?.individual?.postScore ?? communityPost);
  const individualDelta = +(individualPost - individualPre).toFixed(1);
  const individualDeltaPct =
    individualPre > 0
      ? +(((individualPost - individualPre) / Math.max(1, individualPre)) * 100).toFixed(1)
      : 0;

  const domainList = communityData?.domainTransformations || [];

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950 text-sky-400 border border-slate-800 uppercase tracking-widest">
                ViSEF Pre vs. Post Comparative Research
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Đánh giá định lượng từ Dataset (N = {communityTotal})
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-1.5">
              Đối Chiếu Trước & Sau Can Thiệp: Hồ Sơ Cá Nhân vs. Tập Mẫu Cộng Đồng
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
              Phân tích tương quan giữa kết quả sát hạch thực tế của cá nhân với phân phối điểm của toàn bộ tập mẫu khảo sát ViSEF (N = {communityTotal}).
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            {onOpenExamModal && (
              <button
                type="button"
                onClick={onOpenExamModal}
                className="px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>{hasRealUserCert ? 'Thi Lại / Cập Nhật Điểm Sát Hạch' : 'Thực Hiện Bài Sát Hạch Cá Nhân'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={fetchComparisonData}
              className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
              title="Đồng bộ lại dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. DUAL PILLARS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PILLAR 1: CÁ NHÂN */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-sky-400">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-sky-400 uppercase font-bold tracking-wider">
                    PHÂN TÍCH CÁ NHÂN
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    Hồ Sơ Đo Lường Cá Nhân
                  </h4>
                </div>
              </div>

              {hasRealUserCert ? (
                <span className="px-2.5 py-1 rounded text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>HỒ SƠ SÁT HẠCH THỰC TẾ</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded text-[11px] font-mono font-semibold bg-slate-950 text-slate-300 border border-slate-800 flex items-center space-x-1">
                  <span>BẢN GHI GẦN NHẤT TRONG TẬP MẪU</span>
                </span>
              )}
            </div>

            {/* PRE VS POST SCORE VISUAL */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">Chênh lệch Trước / Sau:</span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {individualDelta >= 0 ? `+${individualDelta}` : individualDelta} điểm ({individualDeltaPct > 0 ? `+${individualDeltaPct}%` : '0%'})
                </span>
              </div>

              {/* DUAL BARS */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-rose-400 font-semibold">Điểm khảo sát đầu vào (Pre-Score):</span>
                    <span className="text-rose-400 font-bold">{individualPre}/100</span>
                  </div>
                  <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, individualPre)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-emerald-400 font-semibold">Điểm đánh giá đầu ra (Post-Score):</span>
                    <span className="text-emerald-400 font-bold">{individualPost}/100</span>
                  </div>
                  <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, individualPost)}%` }}
                    />
                  </div>
                </div>
              </div>

              {!hasRealUserCert && onOpenExamModal && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onOpenExamModal}
                    className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-300 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-sky-400" />
                    <span>Thực hiện bài sát hạch 20 câu để ghi nhận hồ sơ cá nhân</span>
                    <ArrowRight className="w-3.5 h-3.5 text-sky-300" />
                  </button>
                </div>
              )}
            </div>

            {/* ACCURACY BY DIFFICULTY */}
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-slate-300 font-mono flex items-center justify-between">
                <span>Phân bố độ chính xác theo mức độ câu hỏi:</span>
                <span className="text-[11px] text-slate-500">Thang đánh giá chuẩn hóa</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Mức Cơ Bản</div>
                  <div className="text-base font-bold text-emerald-400">
                    {data?.individual?.accuracyByDifficulty?.easy ?? 0}%
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Mức Trung Bình</div>
                  <div className="text-base font-bold text-sky-400">
                    {data?.individual?.accuracyByDifficulty?.medium ?? 0}%
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Mức Nâng Cao</div>
                  <div className="text-base font-bold text-amber-400">
                    {data?.individual?.accuracyByDifficulty?.hard ?? 0}%
                  </div>
                </div>
              </div>
            </div>

            {/* PERCENTILE CALLOUT */}
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center space-x-3 text-xs text-slate-300">
              <div>
                Tương quan với tập mẫu (N = {communityTotal}): Điểm sau can thiệp đạt{' '}
                <strong className="font-mono text-white">{individualPost}/100</strong> so với trung bình cộng đồng{' '}
                <strong className="font-mono text-sky-300">{communityPost}/100</strong> (Chênh lệch:{' '}
                <span className="font-mono text-emerald-400">
                  {individualPost - communityPost >= 0
                    ? `+${(individualPost - communityPost).toFixed(1)}`
                    : (individualPost - communityPost).toFixed(1)}{' '}
                  điểm
                </span>
                ).
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>
              Mã định danh:{' '}
              <strong className="text-slate-300">
                {userCert?.anonymousCode || data?.individual?.participantName || 'Chưa định danh'}
              </strong>
            </span>
            <span>
              Mã hồ sơ:{' '}
              <strong className="text-sky-400">
                {userCert?.certificateCode || 'DATASET-RECORD'}
              </strong>
            </span>
          </div>
        </div>

        {/* PILLAR 2: CỘNG ĐỒNG VISEF */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                    THỐNG KÊ TẬP MẪU
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    Toàn Bộ Tập Dữ Liệu Khảo Sát
                  </h4>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded text-[11px] font-mono font-semibold bg-slate-950 text-emerald-400 border border-slate-800">
                N = {communityTotal} MẪU
              </span>
            </div>

            {/* COMMUNITY AGGREGATES */}
            <div className="grid grid-cols-3 gap-3 font-mono tabular-nums">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">Trung Bình Pre</div>
                <div className="text-lg font-bold text-rose-400">{communityPre}đ</div>
                <div className="text-[10px] text-slate-500">Trước can thiệp</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">Trung Bình Post</div>
                <div className="text-lg font-bold text-emerald-400">{communityPost}đ</div>
                <div className="text-[10px] text-slate-500">Sau can thiệp</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">Biên Độ Δ</div>
                <div className="text-lg font-bold text-sky-400">+{communityDelta}đ</div>
                <div className="text-[10px] text-slate-500">Đạt chuẩn: {passRate}%</div>
              </div>
            </div>

            {/* STATISTICAL SIGNIFICANCE (ISEF / VISEF STANDARD) */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-mono font-semibold text-slate-300 flex items-center justify-between">
                <span>Kiểm định Paired Samples t-test:</span>
                <span className="text-emerald-400 font-bold">
                  {totalEvaluated >= 2 && communityData?.pValue !== undefined
                    ? communityData.pValue < 0.001
                      ? 'p < 0.001 (***)'
                      : `p = ${communityData.pValue.toFixed(4)}`
                    : 'Cần N ≥ 2'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-1">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Kích thước hiệu ứng (Cohen&apos;s d):</div>
                  <div className="text-sm font-bold text-sky-400">
                    d = {totalEvaluated >= 2 ? (communityData?.cohensD ?? 0) : '0.00'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Tính trực tiếp từ phương sai mẫu
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Giá trị thống kê t:</div>
                  <div className="text-sm font-bold text-emerald-400">
                    t({communityData?.df ?? Math.max(0, totalEvaluated - 1)}) ={' '}
                    {totalEvaluated >= 2 ? (communityData?.tStatistic ?? 0) : '0.00'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Bậc tự do df = {communityData?.df ?? Math.max(0, totalEvaluated - 1)}
                  </div>
                </div>
              </div>
            </div>

            {/* DEMOGRAPHIC SHIFT SUMMARY */}
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Biên độ cải thiện trung bình nhóm Học sinh / Sinh viên:
              </div>
              <div className="grid grid-cols-1 gap-2 text-[11px] font-mono">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300 font-sans">Nhóm STUDENT trong tập dữ liệu khảo sát:</span>
                  <strong className="text-emerald-400 text-sm">
                    +{studentGain} điểm
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>Ngưỡng đạt chuẩn: Điểm đầu ra ≥ 70/100</span>
            <span className="text-emerald-400 font-semibold">Tỷ lệ đạt: {passRate}%</span>
          </div>
        </div>
      </div>

      {/* 3. 6 CORE DEFENSE DOMAINS TRANSFORMATION (COMPUTED FROM REAL SCAM DNA VECTORS) */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h4 className="text-base font-bold text-white flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              <span>Phân Tích 6 Chiều Lỗ Hổng Nhận Thức (Scam DNA Vector Shift)</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Tổng hợp trực tiếp từ vector chuyển dịch trước/sau của N = {communityTotal} mẫu khảo sát thực tế.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
              <span className="text-slate-300">Tỷ lệ tổn thương Trước học</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
              <span className="text-slate-300">Tỷ lệ tổn thương Sau học</span>
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {domainList.map((item: any, idx: number) => (
            <div key={idx} className="space-y-2 p-3.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                <span className="font-semibold text-slate-200">
                  {idx + 1}. {item.domainName}
                </span>
                <span className="font-mono text-emerald-400 font-semibold">
                  Giảm {item.gainPct}% mức độ dễ tổn thương
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* PRE BAR */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>Trước can thiệp (Pre):</span>
                    <span className="text-rose-400 font-semibold">{item.preVulnerabilityPct}%</span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${Math.min(100, item.preVulnerabilityPct)}%` }}
                    />
                  </div>
                </div>

                {/* POST BAR */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>Sau can thiệp (Post):</span>
                    <span className="text-emerald-400 font-semibold">{item.postVulnerabilityPct}%</span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, item.postVulnerabilityPct)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
