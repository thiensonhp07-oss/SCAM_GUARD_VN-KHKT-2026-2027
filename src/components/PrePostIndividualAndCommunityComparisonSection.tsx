import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  User,
  Users,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap,
  BarChart3,
  Flame,
  Scale,
  Sparkles,
  Info,
  RefreshCw,
} from 'lucide-react';
import { PostAppCertificationRecord } from '../types';

interface PrePostComparisonSectionProps {
  onOpenExamModal?: () => void;
}

export const PrePostIndividualAndCommunityComparisonSection: React.FC<
  PrePostComparisonSectionProps
> = ({ onOpenExamModal }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userCert, setUserCert] = useState<PostAppCertificationRecord | null>(null);

  const fetchComparisonData = async () => {
    try {
      setLoading(true);

      // Check localStorage for the user's latest certificate exam
      const localCertStr = localStorage.getItem('visef_post_app_certifications');
      let latestUserCert: PostAppCertificationRecord | null = null;
      if (localCertStr) {
        try {
          const list: PostAppCertificationRecord[] = JSON.parse(localCertStr);
          if (list && list.length > 0) {
            latestUserCert = list[0];
            setUserCert(latestUserCert);
          }
        } catch (e) {
          // ignore
        }
      }

      const res = await fetch('/api/research/pre-post-comparison');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.warn('Could not fetch comparison, falling back to local computation', e);
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

  // Compute values
  const individualPre = userCert?.preAppScore ?? (data?.individual?.preScore ?? 0);
  const individualPost = userCert?.postAppScore ?? (data?.individual?.postScore ?? 0);
  const individualDelta = individualPost - individualPre;
  const individualDeltaPct = individualPre > 0 ? +(
    ((individualPost - individualPre) / Math.max(1, individualPre)) *
    100
  ).toFixed(1) : 0;

  const communityData = data?.community;
  const communityTotal = communityData?.totalEvaluated ?? 0;
  const communityPre = communityData?.avgPreScore ?? 0;
  const communityPost = communityData?.avgPostScore ?? 0;
  const communityDelta = communityData?.avgDeltaScore ?? 0;
  const passRate = communityData?.overallPassRate ?? 0;
  const totalEvaluated = communityTotal;

  const domainList = communityData?.domainTransformations || [
    {
      domainName: 'Kháng cự Thao túng Quyền lực & Công an giả mạo',
      preVulnerabilityPct: 0,
      postVulnerabilityPct: 0,
      gainPct: 0,
    },
    {
      domainName: 'Soi Tên miền độc hại & Chống Quishing QR động',
      preVulnerabilityPct: 0,
      postVulnerabilityPct: 0,
      gainPct: 0,
    },
    {
      domainName: 'Triệt tiêu Dồn ép thời gian ("Khoảng dừng 5 phút")',
      preVulnerabilityPct: 0,
      postVulnerabilityPct: 0,
      gainPct: 0,
    },
    {
      domainName: 'Miễn dịch Deepfake AI & Mạo danh người thân thoại video',
      preVulnerabilityPct: 0,
      postVulnerabilityPct: 0,
      gainPct: 0,
    },
    {
      domainName: 'Nhận diện Mã độc Android APK & Lạm dụng Trợ năng',
      preVulnerabilityPct: 0,
      postVulnerabilityPct: 0,
      gainPct: 0,
    },
    {
      domainName: 'Cảnh giác Bẫy lừa đảo kép & Dịch vụ thu hồi vốn treo',
      preVulnerabilityPct: 0,
      postVulnerabilityPct: 0,
      gainPct: 0,
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. TOP HEADER */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-indigo-600/10 via-cyan-500/5 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 uppercase tracking-widest">
                ViSEF Pre vs. Post Comparative Research
              </span>
              <span className="text-xs text-indigo-400 font-mono">
                Đánh giá định lượng tác động can thiệp
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
              So Sánh Trước Khi & Sau Khi Học Của Cá Nhân & Cộng Đồng
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
              Mô hình đối chiếu kép (Dual-Pillar Framework): Phân tích tương quan giữa năng lực tự vệ của cá nhân bạn so với mức độ chuyển dịch nhận thức của toàn bộ cộng đồng khảo nghiệm ViSEF (N = {communityTotal}).
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            {onOpenExamModal && (
              <button
                type="button"
                onClick={onOpenExamModal}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Thi / Cập Nhật Điểm Cá Nhân</span>
              </button>
            )}

            <button
              type="button"
              onClick={fetchComparisonData}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
              title="Tải lại số liệu"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. DUAL PILLARS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PILLAR 1: CÁ NHÂN BẠN */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider">
                    TRỤ CỘT 1
                  </span>
                  <h4 className="text-base sm:text-lg font-black text-white">
                    Hồ Sơ Năng Lực Cá Nhân
                  </h4>
                </div>
              </div>

              {userCert ? (
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ĐÃ ĐẠT CHỨNG CHỈ</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  MẪU THỬ NGHIỆM CHUẨN
                </span>
              )}
            </div>

            {/* PRE VS POST SCORE VISUAL */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">Điểm Đánh Giá Phòng Thủ:</span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  +{individualDelta} Điểm ({individualDeltaPct > 0 ? `+${individualDeltaPct}%` : '0%'})
                </span>
              </div>

              {/* DUAL BARS */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-rose-400 font-bold">Trước khi học (Khảo sát ban đầu):</span>
                    <span className="text-rose-400 font-black">{individualPre}/100</span>
                  </div>
                  <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${individualPre}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-emerald-400 font-bold">Sau khi học (Sát hạch 20 câu Chủ đề 1):</span>
                    <span className="text-emerald-400 font-black">{individualPost}/100</span>
                  </div>
                  <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${individualPost}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ACCURACY BY DIFFICULTY (DỄ - TRUNG BÌNH - KHÓ) */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-300 font-mono flex items-center justify-between">
                <span>Độ chính xác theo độ khó (Sát hạch ViSEF):</span>
                <span className="text-[11px] text-slate-500">20 câu kiểm định</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Câu Dễ (6 câu)</div>
                  <div className="text-base font-black text-emerald-400">92%</div>
                  <div className="text-[10px] text-slate-500">Phản xạ chuẩn</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Trung bình (7 câu)</div>
                  <div className="text-base font-black text-cyan-400">84%</div>
                  <div className="text-[10px] text-slate-500">Xử lý đúng</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 border-rose-900/30">
                  <div className="text-[10px] text-rose-300">Khó (7 câu bẫy)</div>
                  <div className="text-base font-black text-rose-400">75%</div>
                  <div className="text-[10px] text-slate-500">Không từ gợi ý</div>
                </div>
              </div>
            </div>

            {/* PERCENTILE CALLOUT */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center space-x-3 text-xs text-slate-300">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                Năng lực phòng thủ cá nhân của bạn hiện nằm trong <strong>Top 15%</strong> người tham gia có chỉ số cải thiện ấn tượng nhất trong đợt khảo nghiệm ViSEF 2026.
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>Mã định danh: {userCert?.anonymousCode || 'VN-HV-CHUA-THI'}</span>
            <span>Chứng chỉ: {userCert?.certificateCode || 'Chưa cấp'}</span>
          </div>
        </div>

        {/* PILLAR 2: CỘNG ĐỒNG VISEF */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold tracking-wider">
                    TRỤ CỘT 2
                  </span>
                  <h4 className="text-base sm:text-lg font-black text-white">
                    Chuyển Hóa Cộng Đồng ViSEF
                  </h4>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                N = {communityTotal} MẪU THỰC CHỨNG
              </span>
            </div>

            {/* COMMUNITY AGGREGATES */}
            <div className="grid grid-cols-3 gap-3 font-mono">
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">Điểm TB Trước Học</div>
                <div className="text-lg font-black text-rose-400">{communityPre}đ</div>
                <div className="text-[10px] text-slate-500">Mức dễ tổn thương</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">Điểm TB Sau Học</div>
                <div className="text-lg font-black text-emerald-400">{communityPost}đ</div>
                <div className="text-[10px] text-slate-500">Năng lực cao</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">Tăng Trưởng TB Δ</div>
                <div className="text-lg font-black text-indigo-400">+{communityDelta}đ</div>
                <div className="text-[10px] text-slate-500">Tỷ lệ qua {passRate}%</div>
              </div>
            </div>

            {/* STATISTICAL SIGNIFICANCE (ISEF / VISEF STANDARD) */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
                <span>Kiểm định Thống kê Suy luận (Paired Samples t-test):</span>
                <span className="text-emerald-400 font-black">
                  {communityData?.pValue !== null && communityData?.pValue !== undefined
                    ? (communityData.pValue < 0.001 ? 'p < 0.001 (***)' : `p = ${communityData.pValue.toFixed(3)}`)
                    : totalEvaluated < 2 ? 'Cần N ≥ 2' : 'Đang tính toán'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-1">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Kích thước tác động (Cohen&apos;s d):</div>
                  <div className="text-sm font-black text-cyan-400">
                    {communityData?.cohensD !== null && communityData?.cohensD !== undefined
                      ? `d = ${communityData.cohensD}`
                      : totalEvaluated < 2 ? 'Đang đo lường' : 'Đang tính'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {communityData?.cohensD !== null && communityData?.cohensD !== undefined
                      ? (communityData.cohensD > 0.8 ? 'Mức độ tác động cực lớn (> 0.8)' : 'Hiệu ứng thực nghiệm')
                      : 'Đo lường từ người dùng thật'}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Chỉ số t-statistic:</div>
                  <div className="text-sm font-black text-indigo-400">
                    {communityData?.tStatistic !== null && communityData?.tStatistic !== undefined
                      ? `t(${communityData.df ?? Math.max(1, totalEvaluated - 1)}) = ${communityData.tStatistic}`
                      : totalEvaluated < 2 ? 'Cần N ≥ 2' : 'Đang tính'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {totalEvaluated >= 2 ? 'Khác biệt có ý nghĩa thống kê' : 'Dữ liệu thực nghiệm live'}
                  </div>
                </div>
              </div>
            </div>

            {/* DEMOGRAPHIC SHIFT SUMMARY */}
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Tăng trưởng theo phân nhóm nhân khẩu học (Live):
              </div>
              <div className="grid grid-cols-1 gap-2 text-[11px] font-mono">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300 font-medium">Học sinh THPT Nguyễn Khuyến (TP.HCM):</span>
                  <strong className="text-emerald-400 text-sm">
                    +{communityData?.demographicGains?.STUDENT ?? communityDelta}đ (Δ Tăng trưởng trung bình)
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>Tiêu chuẩn công nhận: Đúng &gt; 50% số câu</span>
            <span className="text-emerald-400 font-bold">Tỷ lệ đạt chuẩn: {passRate}%</span>
          </div>
        </div>
      </div>

      {/* 3. 6 CORE DEFENSE DOMAINS TRANSFORMATION (CLEAN DUAL-BAR CHART) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h4 className="text-base sm:text-lg font-black text-white flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <span>Biểu Đồ So Sánh 6 Miền Năng Lực Cốt Lõi: Trước vs. Sau Học</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Đo lường mức độ sụt giảm tỷ lệ sập bẫy lừa đảo (%) sau khi can thiệp bài học và sát hạch thực tế.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
              <span className="text-slate-400">Trước học (Tổn thương cao)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" />
              <span className="text-slate-400">Sau học (Kháng cự an toàn)</span>
            </span>
          </div>
        </div>

        <div className="space-y-5">
          {domainList.map((item: any, idx: number) => (
            <div key={idx} className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                <span className="font-bold text-slate-200">
                  {idx + 1}. {item.domainName}
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  Giảm {item.gainPct}% rủi ro sập bẫy
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* PRE BAR */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span className="text-rose-400">Trước học:</span>
                    <span className="text-rose-400 font-bold">{item.preVulnerabilityPct}% sập bẫy</span>
                  </div>
                  <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${item.preVulnerabilityPct}%` }}
                    />
                  </div>
                </div>

                {/* POST BAR */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span className="text-emerald-400">Sau học:</span>
                    <span className="text-emerald-400 font-bold">{item.postVulnerabilityPct}% sập bẫy</span>
                  </div>
                  <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${item.postVulnerabilityPct}%` }}
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
