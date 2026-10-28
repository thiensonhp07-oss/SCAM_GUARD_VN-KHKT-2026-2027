import React from 'react';
import { motion } from 'motion/react';
import { Scan, Copy, Check, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { AnalysisResult } from '../types';

interface ThreatAssessmentResultProps {
  result: AnalysisResult | null;
  loading: boolean;
  onCopy: () => void;
  copied: boolean;
}

export const ThreatAssessmentResult: React.FC<ThreatAssessmentResultProps> = ({
  result,
  loading,
  onCopy,
  copied,
}) => {
  const formattedDate = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const formattedTime = new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (loading) {
    return (
      <div className="bg-[#111827] rounded-xl p-8 border border-[#1E293B] text-center space-y-5 flex flex-col items-center justify-center min-h-[420px] relative overflow-hidden">
        <div className="scanner-laser" />
        <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin flex items-center justify-center" />
        <div className="space-y-1.5">
          <h4 className="text-sm font-semibold text-white">
            Đang thực thi phân tích pháp y
          </h4>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Hệ thống đang bóc tách thực thể dữ liệu, kiểm tra uy tín tên miền và đối chiếu mẫu thao túng tâm lý...
          </p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-[#111827] rounded-xl p-8 border border-[#1E293B] text-center min-h-[420px] flex flex-col items-center justify-center space-y-5">
        <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
          <Scan className="w-5 h-5" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-white">
            Báo Cáo Kết Quả Giám Định
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Nhập nội dung tin nhắn, đường dẫn URL hoặc tải lên ảnh chụp hóa đơn ở khung bên trái để bắt đầu phân tích.
          </p>
        </div>

        <div className="pt-4 border-t border-[#1E293B] w-full max-w-[260px] space-y-2 text-xs text-slate-400">
          <div className="flex items-center justify-between">
            <span>Trạng thái Engine</span>
            <span className="text-emerald-400 font-medium">Sẵn sàng</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Khử nhận dạng PII</span>
            <span className="text-blue-400 font-medium">Bật mặc định</span>
          </div>
        </div>
      </div>
    );
  }

  const isHighRisk = result.riskScore >= 70;
  const isMediumRisk = result.riskScore >= 40 && result.riskScore < 70;

  const riskBadgeClass = isHighRisk
    ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
    : isMediumRisk
    ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
    : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';

  const primaryThreat = result.threatClassification?.primaryThreat || (isHighRisk ? 'Cảnh báo lừa đảo' : 'Rủi ro thấp');
  const confidence = result.threatClassification?.confidence || 94;

  const showUrlIndicator = result.urlAnalysis || (result.threatBreakdown && result.threatBreakdown.maliciousUrl > 50);
  const showImpersonationIndicator = result.threatBreakdown && result.threatBreakdown.impersonation > 50;
  const showUrgencyIndicator = result.threatBreakdown && result.threatBreakdown.urgency > 50;
  const showCredentialIndicator = result.threatBreakdown && result.threatBreakdown.credentialHarvesting > 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#111827] rounded-xl p-6 space-y-6 border border-[#1E293B]"
    >
      {/* Assessment Header */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
        <div className="text-xs text-slate-400 flex items-center gap-2 font-mono tabular-nums">
          <span className="text-white font-semibold">#{result.assessmentId || 'SG-8F29A1'}</span>
          <span aria-hidden="true">·</span>
          <span>{formattedDate} {formattedTime}</span>
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 font-medium cursor-pointer transition-colors px-2.5 py-1 bg-[#090D16] rounded-lg border border-[#1E293B]"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
        </button>
      </div>

      {/* Main Verdict Summary */}
      <div className={`p-5 rounded-xl border space-y-4 ${riskBadgeClass}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold">
            {isHighRisk ? (
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            ) : isMediumRisk ? (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            )}
            <span>
              {isHighRisk ? 'Mức độ rủi ro: Cao' : isMediumRisk ? 'Mức độ rủi ro: Trung bình' : 'Mức độ rủi ro: Thấp'}
            </span>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-300">
            Độ tin cậy: {confidence}%
          </span>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div>
            <p className="text-sm font-bold text-white">{primaryThreat}</p>
            <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">{result.summary}</p>
          </div>
          <div className="text-right shrink-0 pl-4">
            <span className="text-3xl font-bold font-mono tabular-nums text-white">
              {result.riskScore}
            </span>
            <span className="text-xs font-mono text-slate-400">/100</span>
          </div>
        </div>

        {(showUrlIndicator || showImpersonationIndicator || showUrgencyIndicator || showCredentialIndicator) && (
          <div className="border-t border-white/10 pt-3 flex flex-wrap gap-2 text-xs text-slate-200">
            {showUrlIndicator && <span className="px-2 py-0.5 rounded bg-[#090D16]/70">URL đáng ngờ</span>}
            {showImpersonationIndicator && <span className="px-2 py-0.5 rounded bg-[#090D16]/70">Giả mạo tổ chức</span>}
            {showUrgencyIndicator && <span className="px-2 py-0.5 rounded bg-[#090D16]/70">Thúc giục khẩn cấp</span>}
            {showCredentialIndicator && <span className="px-2 py-0.5 rounded bg-[#090D16]/70">Thu thập thông tin nhạy cảm</span>}
          </div>
        )}
      </div>

      {/* Evidence Count Summary */}
      {result.evidenceFound && (
        <div className="grid grid-cols-3 divide-x divide-[#1E293B] border-t border-b border-[#1E293B] py-3 text-center text-xs">
          <div>
            <span className="text-[11px] text-slate-400 block">Nghiêm trọng</span>
            <span className="font-mono tabular-nums font-bold text-rose-400">
              {result.evidenceFound.filter((ev) => ev.severity === 'critical').length}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Mức cao</span>
            <span className="font-mono tabular-nums font-bold text-amber-400">
              {result.evidenceFound.filter((ev) => ev.severity === 'high').length}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Nghi vấn</span>
            <span className="font-mono tabular-nums font-bold text-blue-400">
              {result.evidenceFound.filter((ev) => ev.severity !== 'critical' && ev.severity !== 'high').length}
            </span>
          </div>
        </div>
      )}

      {/* Threat Breakdown Bars */}
      {result.threatBreakdown && (
        <div className="space-y-3.5">
          <h4 className="text-xs font-semibold text-slate-300">
            Phân Rã Trọng Số Rủi Ro
          </h4>

          <div className="space-y-3 text-xs">
            {[
              { label: 'Liên kết độc hại (Malicious URL)', val: result.threatBreakdown.maliciousUrl },
              { label: 'Mạo danh thương hiệu / tổ chức', val: result.threatBreakdown.impersonation },
              { label: 'Gây áp lực khẩn cấp', val: result.threatBreakdown.urgency },
              { label: 'Yêu cầu mật khẩu / OTP', val: result.threatBreakdown.credentialHarvesting },
              { label: 'Thao túng tâm lý xã hội', val: result.threatBreakdown.socialEngineering },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="font-mono tabular-nums font-semibold text-white">{item.val}%</span>
                </div>
                <div className="w-full bg-[#090D16] rounded-full h-1.5 overflow-hidden border border-[#1E293B]">
                  <div
                    className={`h-full rounded-full ${
                      item.val >= 75 ? 'bg-rose-500' : item.val >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${item.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
