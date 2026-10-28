import React, { useState, useEffect } from 'react';
import {
  Search,
  ShieldAlert,
  CheckCircle2,
  PlusCircle,
  AlertTriangle,
  FileText,
  Download,
  Copy,
  Check,
  Cpu,
  PhoneCall,
  Building2,
} from 'lucide-react';

export const BlacklistSearchTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [blacklistSearching, setBlacklistSearching] = useState(false);
  const [blacklistResult, setBlacklistResult] = useState<any | null>(null);
  const [recentList, setRecentList] = useState<any[]>([]);

  // Community report form states
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportType, setReportType] = useState<'phone' | 'stk' | 'url'>('phone');
  const [reportIdentifier, setReportIdentifier] = useState('');
  const [reportBank, setReportBank] = useState('');
  const [reportHolder, setReportHolder] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [reportSuccessMsg, setReportSuccessMsg] = useState('');
  const [reportErrorMsg, setReportErrorMsg] = useState('');

  // Official Cybercrime Dossier Generator (PA05 / C05) states
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [victimName, setVictimName] = useState('');
  const [victimPhone, setVictimPhone] = useState('');
  const [lossAmount, setLossAmount] = useState('Chưa chuyển tiền (Kịp thời phát hiện)');
  const [dossierLoading, setDossierLoading] = useState(false);
  const [dossierData, setDossierData] = useState<any | null>(null);
  const [copiedDossier, setCopiedDossier] = useState(false);

  const fetchBlacklistFeed = async () => {
    try {
      const res = await fetch('/api/blacklist/list');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items)) {
          setRecentList(data.items);
        }
      }
    } catch {
      // ignore offline
    }
  };

  useEffect(() => {
    fetchBlacklistFeed();
  }, []);

  const handleBlacklistSearch = async (e?: React.FormEvent, presetQuery?: string) => {
    if (e) e.preventDefault();
    const targetQ = (presetQuery ?? searchQuery).trim();
    if (!targetQ) return;
    if (presetQuery) setSearchQuery(presetQuery);

    setBlacklistSearching(true);
    setBlacklistResult(null);

    try {
      const res = await fetch(`/api/blacklist/search?query=${encodeURIComponent(targetQ)}`);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setBlacklistResult(data);
        return;
      }
      throw new Error('API non-JSON or offline');
    } catch {
      const cleanQ = targetQ.replace(/[^0-9a-zA-Z]/g, '');
      const found = recentList.find((k) => k.identifier.includes(cleanQ) || cleanQ.includes(k.identifier));
      if (found) {
        setBlacklistResult({ found: true, data: found });
      } else {
        setBlacklistResult({
          found: false,
          message: `Chưa có báo cáo vi phạm nào về [${cleanQ}] trong cơ sở dữ liệu NCSC & ScamGuard. Tuy nhiên bạn vẫn cần cẩn trọng xác minh độc lập trước khi giao dịch.`,
        });
      }
    } finally {
      setBlacklistSearching(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportIdentifier.trim()) {
      setReportErrorMsg('Vui lòng nhập số điện thoại, tên miền hoặc số tài khoản cần báo cáo!');
      return;
    }

    setReportSuccessMsg('');
    setReportErrorMsg('');

    try {
      const res = await fetch('/api/blacklist/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: reportType,
          identifier: reportIdentifier.trim(),
          bankName: reportType === 'stk' ? reportBank.trim() : undefined,
          accountHolder: reportType === 'stk' ? reportHolder.trim() : undefined,
          description: reportDesc.trim() || 'Mạo danh lừa đảo qua tin nhắn / cuộc gọi.',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReportSuccessMsg(
          '✓ Đã ghi nhận vào Cơ sở dữ liệu Cảnh báo Quốc gia! Bạn có thể bấm tra cứu ngay định danh vừa gửi.'
        );
        setReportIdentifier('');
        setReportBank('');
        setReportHolder('');
        setReportDesc('');
        fetchBlacklistFeed();
      } else {
        setReportErrorMsg(data.error || 'Đã có lỗi xảy ra.');
      }
    } catch {
      setReportErrorMsg('Không thể kết nối đến máy chủ.');
    }
  };

  const handleGenerateDossier = async (suspectId?: string, suspectDesc?: string, bankOrChannel?: string) => {
    setShowDossierModal(true);
    setDossierLoading(true);
    setDossierData(null);

    try {
      const res = await fetch('/api/forensics/dossier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          victimName: victimName.trim() || undefined,
          victimPhone: victimPhone.trim() || undefined,
          incidentType: 'Nghi vấn lừa đảo chiếm đoạt tài sản qua mạng viễn thông / Internet',
          suspectIdentifier: suspectId || searchQuery || 'Định danh nghi vấn',
          suspectBankOrChannel: bankOrChannel || 'Chuyển khoản ngân hàng / Điện thoại VoIP / Zalo',
          financialLossAmount: lossAmount,
          incidentSummary:
            suspectDesc ||
            blacklistResult?.data?.details ||
            blacklistResult?.aiAdvisory ||
            `Phát hiện đối tượng sử dụng định danh [${suspectId || searchQuery}] có hành vi thao túng tâm lý và yêu cầu giao dịch tài chính bất thường.`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDossierData(data);
      }
    } catch (err) {
      console.warn('Dossier generation error:', err);
    } finally {
      setDossierLoading(false);
    }
  };

  const handleDownloadDossier = () => {
    if (!dossierData?.formalReportText) return;
    const blob = new Blob([dossierData.formalReportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Don-Trinh-Bao-PA05-${dossierData.dossierCode || 'ScamGuard'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 bg-[#111827] p-6 rounded-xl border border-[#1E293B]">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-400" />
            <span>Cổng Tra Cứu Tín Nhiệm SĐT, Số Tài Khoản Ngân Hàng & Lập Hồ Sơ Tố Giác PA05</span>
          </h3>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            Đồng bộ NCSC + Đầu số 156 + Gemini AI
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Kiểm tra lịch sử tố cáo của số điện thoại lạ, số tài khoản ngân hàng trung gian nhận tiền lừa đảo (Mule Account) và khởi tạo tự động <strong className="text-slate-200">Đơn trình báo tội phạm công nghệ cao (Mẫu PA05/C05)</strong> chỉ với 1 cú nhấp chuột.
        </p>
      </div>

      {/* Quick Lookup Tags */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">Tra cứu mẫu thực tế:</span>
        {[
          { q: '02473022626', label: '🚨 02473022626 (Giả Công an)' },
          { q: '1028392109', label: '🏦 STK 1028392109 (VCB Rửa tiền)' },
          { q: '19038291029', label: '🏦 STK 19038291029 (TCB Nhiệm vụ)' },
          { q: '02899998888', label: '⚡ 02899998888 (Giả Điện lực EVN)' },
          { q: '156', label: '✓ Tổng đài Quốc gia 156' },
        ].map((item) => (
          <button
            key={item.q}
            type="button"
            onClick={() => handleBlacklistSearch(undefined, item.q)}
            className="px-2.5 py-1 rounded-md bg-[#090D16] hover:bg-[#1E293B] text-slate-300 border border-[#1E293B] font-mono text-[11px] cursor-pointer transition"
          >
            {item.label}
          </button>
        ))}
      </div>

      <form onSubmit={(e) => handleBlacklistSearch(e)} className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Nhập Số điện thoại (024..., 098...) hoặc Số tài khoản ngân hàng cần kiểm tra..."
          className="flex-1 bg-[#090D16] border border-[#1E293B] focus:border-blue-500 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none font-mono"
        />
        <button
          type="submit"
          disabled={blacklistSearching || !searchQuery.trim()}
          className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {blacklistSearching ? (
            <>
              <Cpu className="w-4 h-4 animate-spin" />
              <span>Đang tra cứu...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Tra cứu Danh sách đen</span>
            </>
          )}
        </button>
      </form>

      {/* Search Result Display */}
      {blacklistResult && (
        <div
          className={`p-5 rounded-xl border space-y-3.5 ${
            blacklistResult.found
              ? 'bg-rose-950/20 border-rose-500/30'
              : blacklistResult.isOfficial
              ? 'bg-emerald-950/20 border-emerald-500/30'
              : 'bg-[#090D16] border-[#1E293B]'
          }`}
        >
          {blacklistResult.found ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-500/20 pb-3">
                <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/40 font-mono">
                  {blacklistResult.data.riskLevel === 'EXTREME'
                    ? '🚨 CẢNH BÁO ĐỎ: NGUY HIỂM CỰC ĐỘ'
                    : '⚠️ ĐÃ BỊ TỐ CÁO LỪA ĐẢO'}
                </span>
                <span className="text-xs text-slate-400 font-mono tabular-nums">
                  Số đơn phản ánh: <strong className="text-rose-400">{blacklistResult.data.reportsCount}</strong> · Cập nhật:{' '}
                  {blacklistResult.data.lastReported}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#090D16] border border-[#1E293B]">
                  <span className="text-slate-400 block text-[11px]">Định danh vi phạm:</span>
                  <span className="text-sm font-bold font-mono text-white">{blacklistResult.data.identifier}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#090D16] border border-[#1E293B]">
                  <span className="text-slate-400 block text-[11px]">Ngân hàng / Phân loại:</span>
                  <span className="text-xs font-bold text-amber-300">
                    {blacklistResult.data.bankName
                      ? `${blacklistResult.data.bankName} ${blacklistResult.data.accountHolder ? `- ${blacklistResult.data.accountHolder}` : ''}`
                      : 'Thuê bao Điện thoại / Đầu số VoIP'}
                  </span>
                </div>
              </div>

              {Array.isArray(blacklistResult.data.tags) && (
                <div className="flex flex-wrap gap-1.5">
                  {blacklistResult.data.tags.map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs text-slate-200 leading-relaxed bg-[#090D16] p-3.5 rounded-lg border border-[#1E293B]">
                {blacklistResult.data.description || blacklistResult.data.details}
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    handleGenerateDossier(
                      blacklistResult.data.identifier,
                      blacklistResult.data.details,
                      blacklistResult.data.bankName || 'Điện thoại / Zalo'
                    )
                  }
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer transition"
                >
                  <FileText className="w-4 h-4" />
                  <span>Lập Đơn Trình Báo Công An (Mẫu PA05) & Hướng Dẫn Phong Tỏa</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-white">
                    {blacklistResult.carrierOrType || 'Kết quả kiểm tra cơ sở dữ liệu'}
                  </p>
                  <p className="text-slate-300 leading-relaxed">{blacklistResult.message}</p>
                </div>
              </div>

              {blacklistResult.aiAdvisory && (
                <div className="p-3 rounded-lg bg-[#111827] border border-blue-500/30 text-slate-200 leading-relaxed">
                  <strong className="text-blue-400 block mb-0.5">Khuyến cáo Pháp y từ Gemini AI:</strong>
                  {blacklistResult.aiAdvisory}
                </div>
              )}

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => handleGenerateDossier(searchQuery)}
                  className="px-3.5 py-2 rounded-lg bg-[#111827] hover:bg-[#1E293B] text-slate-200 border border-[#1E293B] font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Soạn Hồ sơ Trình báo PA05 cho định danh này</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Official PA05 / C05 Cybercrime Dossier Generator Panel */}
      {showDossierModal && (
        <div className="p-5 rounded-xl bg-[#090D16] border border-blue-500/40 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Hồ Sơ Tố Giác Tội Phạm Công Nghệ Cao (Mẫu Chuẩn PA05 / Công An Phường)</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Tự động trích xuất căn cứ pháp lý (Điều 174 & Điều 290 BLHS) và quy trình phong tỏa tài khoản trong 24h vàng.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDossierModal(false)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Đóng ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <input
              type="text"
              value={victimName}
              onChange={(e) => setVictimName(e.target.value)}
              placeholder="Họ tên người trình báo (tùy chọn)..."
              className="bg-[#111827] border border-[#1E293B] rounded-lg px-3 py-2 text-white"
            />
            <input
              type="text"
              value={victimPhone}
              onChange={(e) => setVictimPhone(e.target.value)}
              placeholder="SĐT liên hệ của bạn..."
              className="bg-[#111827] border border-[#1E293B] rounded-lg px-3 py-2 text-white font-mono"
            />
            <input
              type="text"
              value={lossAmount}
              onChange={(e) => setLossAmount(e.target.value)}
              placeholder="Số tiền thiệt hại (VD: 25.000.000đ)..."
              className="bg-[#111827] border border-[#1E293B] rounded-lg px-3 py-2 text-white"
            />
          </div>

          <button
            type="button"
            onClick={() => handleGenerateDossier(searchQuery)}
            disabled={dossierLoading}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer"
          >
            {dossierLoading ? 'Đang soạn thảo văn bản pháp lý với Gemini AI...' : 'Cập nhật thông tin vào Đơn trình báo'}
          </button>

          {dossierData && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 space-y-1.5">
                <p className="font-bold text-amber-300">⚡ Quy trình Khẩn cấp trong "24 Giờ Vàng":</p>
                <ul className="list-decimal list-inside text-slate-200 space-y-1 leading-relaxed">
                  {dossierData.urgentGoldenHourSteps?.map((s: string, idx: number) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">
                    Văn bản Đơn trình báo (Mã hồ sơ: {dossierData.dossierCode}):
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(dossierData.formalReportText);
                        setCopiedDossier(true);
                        setTimeout(() => setCopiedDossier(false), 2000);
                      }}
                      className="px-2.5 py-1 rounded bg-[#111827] border border-[#1E293B] text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedDossier ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedDossier ? 'Đã sao chép' : 'Sao chép đơn'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadDossier}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải Đơn (.TXT)</span>
                    </button>
                  </div>
                </div>
                <pre className="p-4 rounded-lg bg-[#111827] border border-[#1E293B] text-slate-200 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                  {dossierData.formalReportText}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Live Directory Table of Reported Scammers */}
      {recentList.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[#1E293B]">
          <p className="text-xs font-semibold text-slate-300">
            Danh sách các định danh nguy hiểm mới cập nhật ({recentList.length} hồ sơ):
          </p>
          <div className="overflow-x-auto border border-[#1E293B] rounded-lg bg-[#090D16]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1E293B] text-slate-400 text-[11px]">
                  <th className="py-2.5 px-3">Định danh</th>
                  <th className="py-2.5 px-3">Phân loại / Ngân hàng</th>
                  <th className="py-2.5 px-3">Thủ đoạn ghi nhận</th>
                  <th className="py-2.5 px-3 text-right">Báo cáo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {recentList.slice(0, 6).map((item, idx) => (
                  <tr
                    key={idx}
                    onClick={() => handleBlacklistSearch(undefined, item.identifier)}
                    className="hover:bg-[#111827] cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-rose-400 whitespace-nowrap">
                      {item.identifier}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                      {item.bankName ? (
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-amber-400" />
                          {item.bankName}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <PhoneCall className="w-3 h-3 text-blue-400" />
                          Điện thoại / VoIP
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 truncate max-w-[260px]">
                      {item.tags?.join(', ') || item.details}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-200 font-semibold">
                      {item.reportsCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Crowd-sourcing Report Form Toggle */}
      <div className="pt-2 border-t border-[#1E293B]">
        <button
          type="button"
          onClick={() => setShowReportForm(!showReportForm)}
          className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>
            {showReportForm ? 'Thu gọn biểu mẫu tố giác' : 'Đóng góp Báo cáo SĐT / Số tài khoản lừa đảo mới'}
          </span>
        </button>

        {showReportForm && (
          <form
            onSubmit={handleReportSubmit}
            className="mt-3 space-y-3 p-4 bg-[#090D16] rounded-xl border border-[#1E293B] text-xs"
          >
            <p className="text-xs font-bold text-white">
              Báo Cáo Định Danh Lừa Đảo Mới Lên Cổng Cảnh Báo:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="bg-[#111827] border border-[#1E293B] rounded-lg p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="phone">Số điện thoại lừa đảo</option>
                <option value="stk">Số tài khoản ngân hàng nhận tiền</option>
                <option value="url">Tên miền / Website giả mạo</option>
              </select>
              <input
                type="text"
                value={reportIdentifier}
                onChange={(e) => setReportIdentifier(e.target.value)}
                placeholder={
                  reportType === 'stk' ? 'Nhập số tài khoản...' : reportType === 'url' ? 'Nhập tên miền...' : 'Nhập số điện thoại...'
                }
                className="bg-[#111827] border border-[#1E293B] rounded-lg p-2.5 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
            {reportType === 'stk' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  value={reportBank}
                  onChange={(e) => setReportBank(e.target.value)}
                  placeholder="Tên ngân hàng (VD: Vietcombank, MB Bank)..."
                  className="bg-[#111827] border border-[#1E293B] rounded-lg p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={reportHolder}
                  onChange={(e) => setReportHolder(e.target.value)}
                  placeholder="Tên chủ tài khoản hiển thị (VD: NGUYEN VAN A)..."
                  className="bg-[#111827] border border-[#1E293B] rounded-lg p-2.5 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}
            <textarea
              rows={2}
              value={reportDesc}
              onChange={(e) => setReportDesc(e.target.value)}
              placeholder="Mô tả cụ thể kịch bản lừa đảo của đối tượng..."
              className="w-full bg-[#111827] border border-[#1E293B] rounded-lg p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
            />

            {reportErrorMsg && (
              <div className="p-2.5 bg-rose-950/80 rounded-lg border border-rose-800 text-rose-300 flex items-start gap-1.5 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400 mt-0.5" />
                <span>{reportErrorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs cursor-pointer transition"
            >
              Gửi Báo Cáo Xác Minh Pháp Y
            </button>
            {reportSuccessMsg && <p className="text-xs text-emerald-400 font-semibold">{reportSuccessMsg}</p>}
          </form>
        )}
      </div>
    </div>
  );
};
