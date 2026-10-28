import React, { useState } from 'react';
import {
  BookOpen,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  PhoneCall,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldAlert,
  GraduationCap,
  Compass,
  Brain,
  Target,
} from 'lucide-react';
import { motion } from 'motion/react';
import { SCAM_TACTIC_TAXONOMY, TacticDefinition } from '../data/taxonomy';
import {
  SECTOR_MEMORY_BLUEPRINTS,
  PEDAGOGY_METHOD_PILLARS,
  PERMANENT_MEMORY_FLASHCARDS,
} from '../data/cyberPedagogyData';
import { ScamTactic } from '../types';

interface LearnViewProps {
  onNavigate?: (tab: string, subView?: string) => void;
  initialTactic?: ScamTactic | null;
}

export const LearnView: React.FC<LearnViewProps> = ({ onNavigate, initialTactic }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedTactic, setExpandedTactic] = useState<ScamTactic | null>(
    initialTactic || 'Authority'
  );
  const [activeLearnTab, setActiveLearnTab] = useState<
    'MEMORY_12_SECTORS' | 'PEDAGOGY_PYRAMID' | 'COUNTER_SCRIPTS' | 'PSYCHOLOGY_12'
  >('MEMORY_12_SECTORS');
  const [selectedSectorNum, setSelectedSectorNum] = useState<number>(1);
  const [flippedCardIds, setFlippedCardIds] = useState<string[]>([]);

  React.useEffect(() => {
    if (initialTactic) {
      setExpandedTactic(initialTactic);
      setActiveLearnTab('PSYCHOLOGY_12');
    }
  }, [initialTactic]);

  const goldenRules = [
    {
      step: '1. DỪNG LẠI 5 GIÂY (STOP)',
      desc: 'Khi nhận bất kỳ tin nhắn, cuộc gọi hoặc thông báo nào có tính chất giục giã, đe dọa hoặc tặng quà bất ngờ, hãy hít sâu 5 giây để vỏ não trước trán (tư duy logic) lấy lại quyền kiểm soát từ hạch hạnh nhân (cảm xúc).',
      mnemonic: 'Ai giục gấp — Lập tức phanh!',
    },
    {
      step: '2. ĐỌC NGƯỢC TÊN MIỀN (CHECK)',
      desc: 'Nhìn kỹ địa chỉ web từ phải sang trái ngay trước dấu gạch chéo "/" đầu tiên. Chính phủ Việt Nam độc quyền đuôi ".gov.vn", trường học dùng ".edu.vn". Tuyệt đối không bấm link đuôi .top, .xyz, .cc, .vip.',
      mnemonic: 'Đọc trước dấu "/" — Đuôi lạ bỏ qua!',
    },
    {
      step: '3. XÁC MINH KÊNH ĐỘC LẬP (VERIFY)',
      desc: 'Áp dụng quy tắc "Mặt sau thẻ": Luôn cúp máy và tự bấm số hotline in ở mặt sau thẻ ngân hàng hoặc gọi vào số SIM di động thường ngày của người thân.',
      mnemonic: 'Tắt chat mạng — Gọi số SIM!',
    },
    {
      step: '4. PHÁ VỠ CÔ LẬP & HỎI NGƯỜI THÂN (ASK)',
      desc: 'Kẻ lừa đảo luôn yêu cầu "Giữ bí mật, vào phòng riêng". Chỉ cần hỏi bố mẹ, thầy cô hoặc bạn thân ngay lúc đó, 99% kịch bản thao túng tâm lý sẽ sụp đổ tức thì.',
      mnemonic: 'Ai bắt giấu bố mẹ — Người đó là kẻ gian!',
    },
    {
      step: '5. KHÓA CHẶN OTP & MẬT KHẨU GIA ĐÌNH (SECURE)',
      desc: 'Không bao giờ đọc mã OTP, không cài file .APK ngoài chợ ứng dụng, và thống nhất một "Mật khẩu an toàn gia đình" để vạch trần mọi cuộc gọi Deepfake AI.',
      mnemonic: 'OTP giữ kín — Mật khẩu nhà luôn nhớ!',
    },
  ];

  const counterScripts = [
    {
      situation: 'Giả danh Công An / Viện Kiểm Sát dọa có lệnh bắt qua điện thoại hoặc Zalo',
      script:
        'Tôi xin phép dừng cuộc gọi tại đây. Mời cơ quan gửi giấy triệu tập bằng văn bản về Công an phường nơi tôi cư trú, tôi sẽ cùng gia đình đến làm việc trực tiếp tại trụ sở.',
      tip: 'Đập tan hoàn toàn đòn uy hiếp cô lập qua mạng và tuân thủ đúng quy trình pháp luật.',
    },
    {
      situation: 'Giả danh Ngân Hàng giục bấm link hủy giao dịch / cập nhật sinh trắc học trong 5 phút',
      script:
        'Tôi không bấm bất kỳ đường link nào qua tin nhắn. Tôi sẽ cúp máy ngay bây giờ và tự gọi vào số hotline in ở mặt sau thẻ ngân hàng của tôi để kiểm tra.',
      tip: 'Chặn đứng bẫy SMS Brandname giả mạo từ trạm phát sóng BTS lậu.',
    },
    {
      situation: 'Cuộc gọi Video 5 giây hoặc giọng nói khóc lóc báo tin người thân tai nạn cần viện phí',
      script:
        'Gia đình ta có quy tắc an toàn: hãy đọc đúng "Mật khẩu an toàn gia đình" trước, hoặc tôi sẽ cúp máy và gọi thẳng vào số SIM di động và giáo viên chủ nhiệm ngay bây giờ.',
      tip: 'Vạch trần công nghệ Deepfake AI giả khuôn mặt và giọng nói chỉ trong 3 giây.',
    },
    {
      situation: 'Mời làm cộng tác viên TikTok / Shopee / Telegram nạp tiền nhận hoa hồng 30%',
      script:
        'Đi làm là để nhận lương từ doanh nghiệp chứ không bao giờ phải nạp tiền túi trước. Tôi từ chối nạp tiền và dừng hợp tác ngay tại đây.',
      tip: 'Cắt đứt ngay từ đầu bẫy "nhiệm vụ ghép đơn" lợi dụng tâm lý tiếc chi phí chìm.',
    },
    {
      situation: 'Quảng cáo "Văn phòng Luật sư / Cục An Ninh Mạng nhận thu hồi tiền bị lừa đảo"',
      script:
        'Cơ quan Công an chỉ tiếp nhận đơn trình báo trực tiếp tại trụ sở và không bao giờ thu phí chạy phần mềm hoàn tiền qua Facebook. Tôi từ chối chuyển phí.',
      tip: 'Bảo vệ nạn nhân khỏi bẫy lừa đảo kép (lừa tập 2) sau khi vừa mất tiền.',
    },
  ];

  const officialChannels = [
    {
      name: 'Tổng đài 156 (Miễn phí 24/7)',
      org: 'Cục An toàn thông tin - Bộ Thông tin & Truyền thông',
      desc: 'Tiếp nhận phản ánh cuộc gọi rác, tin nhắn rác và dấu hiệu lừa đảo trực tuyến trên toàn quốc.',
      phone: '156',
    },
    {
      name: 'Cảnh sát phản ứng nhanh 113',
      org: 'Bộ Công an Việt Nam',
      desc: 'Hỗ trợ can thiệp khẩn cấp khi phát hiện đối tượng dàn cảnh, đe dọa tống tiền hoặc bắt cóc tâm lý trực tuyến.',
      phone: '113',
    },
    {
      name: 'Cổng Cảnh Báo An Toàn Thông Tin',
      org: 'Trung tâm Giám sát an toàn không gian mạng quốc gia (NCSC)',
      desc: 'Tra cứu website lừa đảo, báo cáo địa chỉ URL giả mạo và kiểm tra an toàn tên miền.',
      url: 'https://canhbao.ncsc.gov.vn',
    },
  ];

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const activeBlueprint =
    SECTOR_MEMORY_BLUEPRINTS[selectedSectorNum] || SECTOR_MEMORY_BLUEPRINTS[1];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="text-blue-400 font-semibold flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" />
              <span>Học Viện Sư Phạm & Tri Thức Phòng Thủ Số</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>Phương pháp Mã hóa kép + Feynman (Nhớ 100% trọn đời)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Cẩm Nang Kiến Thức, Khẩu Quyết 3 Giây & Phương Pháp Học Nhớ Mãi Mãi
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Hệ thống hóa toàn bộ 12 chủ điểm an toàn mạng thành các công thức vần điệu 3 giây, sơ đồ giải phẫu điểm mù não bộ và phương pháp giảng dạy chủ động giúp học sinh nhớ 100% không bao giờ quên.
          </p>
        </div>

        {onNavigate && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('roadmap')}
              className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Mở Lộ Trình 12 Phân Khu</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('train', 'arena')}
              className="px-4 py-2.5 rounded-lg bg-[#090D16] hover:bg-[#1E293B] text-slate-200 border border-[#1E293B] text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <Zap className="w-4 h-4 text-blue-400" />
              <span>Thực Hành Thao Trường</span>
            </button>
          </div>
        )}
      </div>

      {/* 4 Interactive Learning Mode Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            id: 'MEMORY_12_SECTORS',
            title: '1. Bộ 12 Khẩu Quyết Nhớ Vĩnh Cửu',
            desc: 'Công thức 3 giây & giải phẫu từng chủ đề',
            icon: Brain,
          },
          {
            id: 'PEDAGOGY_PYRAMID',
            title: '2. Phương Pháp Học & Dạy Nhớ 100%',
            desc: 'Mô hình 4 bước sư phạm & Thẻ lật Leitner',
            icon: GraduationCap,
          },
          {
            id: 'COUNTER_SCRIPTS',
            title: '3. 5 Quy Tắc Vàng & Câu Thoại Bẻ Bẫy',
            desc: 'Kịch bản nói thẳng cúp máy trong 5 giây',
            icon: ShieldCheck,
          },
          {
            id: 'PSYCHOLOGY_12',
            title: '4. Bách Khoa 12 Đòn Thao Túng Tâm Lý',
            desc: 'Giải mã cơ chế thao túng của tội phạm',
            icon: Target,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeLearnTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveLearnTab(tab.id as any)}
              className={`p-4 rounded-xl border text-left transition cursor-pointer flex items-start gap-3 ${
                active
                  ? 'bg-blue-600/15 border-blue-500 text-white'
                  : 'bg-[#111827] border-[#1E293B] text-slate-300 hover:border-slate-700'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#090D16] text-slate-400 border border-[#1E293B]'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{tab.title}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{tab.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* TAB 1: 12 SECTOR MEMORY BLUEPRINTS */}
      {activeLearnTab === 'MEMORY_12_SECTORS' && (
        <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-6 space-y-6">
          <div className="border-b border-[#1E293B] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono font-bold text-blue-400 uppercase block">
                MA TRẬN NEO TRÍ NHỚ 12 CHỦ ĐIỂM CỐT LÕI
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Chọn từng phân khu để xem Khẩu quyết 3 giây, Cơ chế não bộ và Đối chiếu Bẫy vs Thật
              </h2>
            </div>
            <span className="text-xs font-mono text-emerald-400">
              Đang xem: Phân khu {selectedSectorNum}/12
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {Object.values(SECTOR_MEMORY_BLUEPRINTS).map((bp) => {
              const isSelected = bp.sectorNumber === selectedSectorNum;
              return (
                <button
                  key={bp.sectorId}
                  type="button"
                  onClick={() => setSelectedSectorNum(bp.sectorNumber)}
                  className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 border-blue-400 text-white'
                      : 'bg-[#090D16] border-[#1E293B] text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold block opacity-80">
                    CHỦ ĐỀ #{bp.sectorNumber.toString().padStart(2, '0')}
                  </span>
                  <p className="text-xs font-semibold truncate mt-0.5">{bp.coreTheme}</p>
                </button>
              );
            })}
          </div>

          {/* Active Sector Memory Blueprint Detail */}
          <div className="p-6 rounded-xl bg-[#090D16] border border-[#1E293B] space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
              <div>
                <span className="text-xs font-mono font-semibold text-blue-400">
                  CHỦ ĐỀ #{activeBlueprint.sectorNumber.toString().padStart(2, '0')} · TÌNH HUỐNG THỰC TẾ HỌC ĐƯỜNG
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                  {activeBlueprint.coreTheme}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Bối cảnh thường gặp: {activeBlueprint.studentContext}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(activeBlueprint.mnemonicRhyme, 999)}
                className="px-3.5 py-2 rounded-lg bg-[#111827] hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-semibold border border-[#1E293B] flex items-center gap-1.5 transition cursor-pointer self-start"
              >
                {copiedIndex === 999 ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Đã sao chép khẩu quyết</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép khẩu quyết</span>
                  </>
                )}
              </button>
            </div>

            {/* Mnemonic Highlight */}
            <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/40 space-y-1">
              <span className="text-[10px] font-mono font-bold text-blue-400 uppercase block">
                🎵 KHẨU QUYẾT VẦN ĐIỆU 3 GIÂY (ĐỌC TO ĐỂ KHẮC SÂU 100%)
              </span>
              <p className="text-base sm:text-lg font-bold text-white">
                &ldquo;{activeBlueprint.mnemonicRhyme}&rdquo;
              </p>
            </div>

            {/* 3-Second Reflex Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] space-y-1.5">
                <span className="text-[11px] font-mono font-bold text-rose-400 uppercase block">
                  GIÂY THỨ 1 · PHANH NHẬN THỨC
                </span>
                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                  {activeBlueprint.threeSecondReflex.step1}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] space-y-1.5">
                <span className="text-[11px] font-mono font-bold text-amber-400 uppercase block">
                  GIÂY THỨ 2 · SOI ĐIỂM MÙ
                </span>
                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                  {activeBlueprint.threeSecondReflex.step2}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] space-y-1.5">
                <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase block">
                  GIÂY THỨ 3 · HÀNH ĐỘNG KHÓA CHẶN
                </span>
                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                  {activeBlueprint.threeSecondReflex.step3}
                </p>
              </div>
            </div>

            {/* Brain Mechanism & Side-by-Side Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] space-y-2 text-xs">
                <span className="text-[11px] font-mono font-bold text-purple-400 uppercase block">
                  🧠 CƠ CHẾ TẤN CÔNG NÃO BỘ ({activeBlueprint.brainMechanism.hijackTarget})
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {activeBlueprint.brainMechanism.whyStudentsFall}
                </p>
                <div className="p-3 rounded-lg bg-[#090D16] border border-[#1E293B] text-emerald-300">
                  <strong>Lá chắn tư duy: </strong>
                  {activeBlueprint.brainMechanism.cognitiveShield}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1.5">
                  <span className="text-[11px] font-mono font-bold text-rose-400 uppercase block">
                    ✗ DẤU HIỆU LỪA ĐẢO (100% BẪY)
                  </span>
                  <p className="text-slate-200 leading-relaxed">
                    {activeBlueprint.sideBySideComparison.trapSignal}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                  <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase block">
                    ✓ QUY TRÌNH CHÍNH THỐNG
                  </span>
                  <p className="text-slate-200 leading-relaxed">
                    {activeBlueprint.sideBySideComparison.authenticSignal}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs sm:text-sm text-amber-200">
              <strong className="text-amber-400">Chân lý nhớ suốt đời: </strong>
              {activeBlueprint.keyTakeawayForever}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PEDAGOGY PYRAMID & FLASHCARDS */}
      {activeLearnTab === 'PEDAGOGY_PYRAMID' && (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-6 space-y-6">
            <div className="border-b border-[#1E293B] pb-4 space-y-1">
              <span className="text-[11px] font-mono font-bold text-blue-400 uppercase block">
                PHƯƠNG PHÁP SƯ PHẠM AN NINH MẠNG HIỆN ĐẠI
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Tại Sao Học Sinh Học Lý Thuyết Suông Dễ Quên — Và Cách Thiết Kế Để Nhớ 100% Mãi Mãi
              </h2>
              <p className="text-xs text-slate-400">
                So sánh tỷ lệ lưu giữ trí nhớ sau 30 ngày giữa phương pháp đọc chép truyền thống (10%) và mô hình 4 bước Tiêm chủng tâm lý + Feynman (98%).
              </p>
            </div>

            {/* Active Learning Retention Bars */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-[#090D16] border border-[#1E293B] space-y-2">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">1. Đọc văn bản thụ động</span>
                  <span className="text-slate-400 font-bold">10% nhớ</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-500 w-[10%]" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Học sinh quên ngay khi gặp áp lực đếm ngược hoặc đe dọa.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#090D16] border border-[#1E293B] space-y-2">
                <div className="flex justify-between font-mono">
                  <span className="text-blue-400">2. Giải phẫu X-Ray + Vần điệu</span>
                  <span className="text-blue-400 font-bold">75% nhớ</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[75%]" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Não bộ ghi nhớ đồng thời hình ảnh trực quan và khẩu quyết có vần.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#090D16] border border-[#1E293B] space-y-2">
                <div className="flex justify-between font-mono">
                  <span className="text-amber-400">3. Nhập vai mô phỏng thực chiến</span>
                  <span className="text-amber-400 font-bold">90% nhớ</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[90%]" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Tự tay xử lý bẫy giả lập giúp hình thành phản xạ cơ bắp trong 3 giây.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#090D16] border border-emerald-500/40 space-y-2">
                <div className="flex justify-between font-mono">
                  <span className="text-emerald-400 font-bold">4. Dạy lại cho người thân (Feynman)</span>
                  <span className="text-emerald-400 font-bold">98% nhớ</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[98%]" />
                </div>
                <p className="text-[11px] text-slate-300">
                  Khi học sinh giảng lại cho bố mẹ/ông bà, kiến thức khắc sâu vĩnh viễn.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PEDAGOGY_METHOD_PILLARS.map((pillar) => (
                <div
                  key={pillar.id}
                  className="p-5 rounded-xl bg-[#090D16] border border-[#1E293B] space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-blue-400 font-bold">{pillar.stepNumber}</span>
                    <span className="text-emerald-400 font-bold">
                      Lưu giữ: {pillar.retentionRate}%
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{pillar.title}</h3>
                  <p className="text-slate-300 leading-relaxed">
                    <strong className="text-white">Hoạt động học sinh: </strong>
                    {pillar.studentActivity}
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    <strong className="text-white">Cách bày trí & Tổ chức lớp học: </strong>
                    {pillar.classroomArrangement}
                  </p>
                  <div className="p-2.5 rounded-lg bg-[#111827] border border-[#1E293B] text-amber-300">
                    <strong>Ví dụ: </strong>
                    {pillar.practicalExample}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Flashcards Preview */}
          <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">
              Bộ Thẻ Lật Ôn Tập Nhanh (Nhấp Vào Thẻ Để Lật Đáp Án)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PERMANENT_MEMORY_FLASHCARDS.map((card) => {
                const flipped = flippedCardIds.includes(card.id);
                return (
                  <div
                    key={card.id}
                    onClick={() =>
                      setFlippedCardIds((prev) =>
                        prev.includes(card.id)
                          ? prev.filter((i) => i !== card.id)
                          : [...prev, card.id]
                      )
                    }
                    className="p-4 rounded-xl bg-[#090D16] border border-[#1E293B] hover:border-blue-500/50 cursor-pointer space-y-2.5 transition"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-blue-400 font-bold">{card.category}</span>
                      <span className="text-slate-400">
                        {flipped ? 'Mặt sau (Đáp án)' : 'Mặt trước (Tình huống)'}
                      </span>
                    </div>
                    {!flipped ? (
                      <>
                        <p className="text-xs font-bold text-white leading-snug">
                          {card.frontTrigger}
                        </p>
                        <p className="text-xs font-mono text-slate-400">{card.frontScenario}</p>
                        <span className="text-[11px] text-blue-400 font-semibold block pt-1">
                          Nhấp để xem khẩu quyết 3 giây →
                        </span>
                      </>
                    ) : (
                      <>
                        <p className="text-xs font-bold text-emerald-400">
                          &ldquo;{card.backMnemonic}&rdquo;
                        </p>
                        <ul className="space-y-1 text-xs text-slate-200">
                          {card.backActionSteps.map((s, idx) => (
                            <li key={idx}>• {s}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 5 GOLDEN RULES & COUNTER SCRIPTS */}
      {activeLearnTab === 'COUNTER_SCRIPTS' && (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-6 space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  5 Quy Tắc Vàng Phòng Vệ Không Gian Mạng
                </h2>
                <p className="text-xs text-slate-400">
                  Khung phản xạ 5 bước giúp học sinh và gia đình khóa chặn mọi kịch bản lừa đảo
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goldenRules.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-[#090D16] border border-[#1E293B] space-y-2.5"
                >
                  <h3 className="text-sm font-bold text-white">{rule.step}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{rule.desc}</p>
                  <div className="pt-2 border-t border-[#1E293B] text-xs font-mono font-semibold text-blue-400">
                    Khẩu quyết: {rule.mnemonic}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-6 space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Bộ Câu Thoại Phản Kháng Nói Thẳng Bẻ Bẫy
                </h2>
                <p className="text-xs text-slate-400">
                  Đọc nguyên văn câu thoại dưới đây rồi cúp máy ngay để hóa giải 100% áp lực thao túng
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {counterScripts.map((cs, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-[#090D16] border border-[#1E293B] flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <span className="text-xs font-mono font-bold text-blue-400 uppercase block">
                      Tình huống: {cs.situation}
                    </span>
                    <p className="text-sm font-semibold text-white leading-relaxed">
                      &ldquo;{cs.script}&rdquo;
                    </p>
                    <span className="text-xs text-slate-400 block">
                      Cơ sở tâm lý & pháp lý: {cs.tip}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(cs.script, idx)}
                    className="px-4 py-2 rounded-lg bg-[#111827] hover:bg-blue-600 text-slate-200 hover:text-white font-semibold text-xs border border-[#1E293B] flex items-center space-x-1.5 transition cursor-pointer self-start md:self-center whitespace-nowrap"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Đã sao chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép câu thoại</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TAXONOMY OF 12 PSYCHOLOGICAL TACTICS */}
      {activeLearnTab === 'PSYCHOLOGY_12' && (
        <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-6 space-y-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Bách Khoa Giải Phẫu 12 Đòn Thao Túng Tâm Lý
              </h2>
              <p className="text-xs text-slate-400">
                Nhấp vào từng thủ thuật để xem cách tội phạm khai thác điểm mù tâm lý và biện pháp khắc chế
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.values(SCAM_TACTIC_TAXONOMY) as TacticDefinition[]).map((tacticDef) => {
              const isExpanded = expandedTactic === tacticDef.tactic;
              return (
                <div
                  key={tacticDef.tactic}
                  className="bg-[#090D16] rounded-xl border border-[#1E293B] p-4 space-y-3"
                >
                  <div
                    onClick={() => setExpandedTactic(isExpanded ? null : tacticDef.tactic)}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-mono font-bold text-purple-400">
                          {tacticDef.tactic}
                        </span>
                        <span className="text-slate-600">·</span>
                        <h3 className="text-sm font-bold text-white">{tacticDef.nameVi}</h3>
                      </div>
                      <p className="text-xs text-slate-400">{tacticDef.shortDescription}</p>
                    </div>
                    <button
                      type="button"
                      className="text-slate-500 hover:text-white p-1 cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="pt-3 border-t border-[#1E293B] space-y-3 text-xs">
                      <div>
                        <span className="font-bold text-slate-400 block mb-1">
                          Cách Kẻ Gian Khai Thác:
                        </span>
                        <p className="text-slate-300 leading-relaxed">
                          {tacticDef.howScammersExploit}
                        </p>
                      </div>

                      <div className="p-3 bg-[#111827] rounded-lg border border-[#1E293B] space-y-1.5">
                        <span className="font-bold text-emerald-400 flex items-center space-x-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Biện Pháp Phòng Thủ Chuẩn:</span>
                        </span>
                        <ul className="space-y-1 text-slate-300">
                          {tacticDef.counterMeasures.map((cm, idx) => (
                            <li key={idx} className="flex items-start space-x-1.5">
                              <span className="text-emerald-400 font-bold">•</span>
                              <span>{cm}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-lg space-y-1">
                        <span className="font-bold text-rose-300">
                          Ví Dụ Câu Thoại Kẻ Gian Hay Dùng:
                        </span>
                        {tacticDef.examplePhrases.map((phrase, idx) => (
                          <p key={idx} className="text-slate-300 italic font-mono text-[11px]">
                            &ldquo;{phrase}&rdquo;
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Official Reporting Channels Guide */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111827] rounded-xl p-6 space-y-5 border border-[#1E293B]"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Đường Dây Nóng & Kênh Báo Cáo Chính Thống Quốc Gia
            </h2>
            <p className="text-xs text-slate-400">
              Liên hệ ngay các đầu mối chính thống tại Việt Nam để phản ánh và ngăn chặn lừa đảo kịp thời
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {officialChannels.map((oc, idx) => (
            <div
              key={idx}
              className="p-5 bg-[#090D16] rounded-xl border border-[#1E293B] space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-white">{oc.name}</h3>
                <span className="text-[11px] font-semibold text-emerald-400 block">{oc.org}</span>
                <p className="text-xs text-slate-400 leading-relaxed">{oc.desc}</p>
              </div>

              {oc.phone ? (
                <a
                  href={`tel:${oc.phone}`}
                  className="mt-3 py-2 px-3 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 font-bold text-xs border border-emerald-500/40 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Gọi {oc.phone}</span>
                </a>
              ) : (
                <a
                  href={oc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 py-2 px-3 rounded-lg bg-blue-950/80 hover:bg-blue-900 text-blue-300 font-bold text-xs border border-blue-500/40 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Truy cập Cổng NCSC</span>
                </a>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
