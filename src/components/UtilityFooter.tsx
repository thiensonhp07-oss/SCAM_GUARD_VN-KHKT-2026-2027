import React, { useState } from 'react';
import { Shield, Lock, Info, Users, FileText, PhoneCall, X } from 'lucide-react';

export const UtilityFooter: React.FC = () => {
  const [modalContent, setModalContent] = useState<{ title: string; desc: string; icon: any } | null>(null);

  const openFooterModal = (title: string, desc: string, icon: any) => {
    setModalContent({ title, desc, icon });
  };

  return (
    <footer className="w-full bg-slate-950/90 border-t border-slate-900/80 py-8 px-4 sm:px-6 lg:px-8 mt-16 text-slate-500 text-xs select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-semibold text-slate-400 tracking-wide">SCAMGUARD VIETNAM AI DEFENSE</p>
            <p className="text-[11px] text-slate-600">Nền tảng trí tuệ nhân tạo phòng chống lừa đảo trực tuyến toàn dân.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-medium text-slate-500">
          <button
            onClick={() => openFooterModal(
              'Giới Thiệu Về ScamGuard Vietnam',
              'ScamGuard Vietnam là giải pháp trí tuệ nhân tạo (AI) toàn diện hỗ trợ cộng đồng nhận biết, phát giác và chủ động phòng ngừa các kịch bản lừa đảo không gian mạng. Dự án được nghiên cứu và phát triển nhằm bảo vệ cộng đồng, đặc biệt là nhóm đối tượng cao niên và học sinh.',
              Info
            )}
            className="hover:text-slate-300 transition-colors cursor-pointer"
          >
            Giới thiệu
          </button>

          <button
            onClick={() => openFooterModal(
              'Nhà Đầu Tư & Đối Tác Đồng Hành',
              'Đồng hành bởi các chuyên gia an ninh mạng, các đơn vị nghiên cứu AI hàng đầu, Liên minh An toàn Thông tin Quốc gia và cộng đồng công nghệ Việt Nam. Nền tảng hoạt động phi lợi nhuận vì sự an toàn số của mọi gia đình.',
              Users
            )}
            className="hover:text-slate-300 transition-colors cursor-pointer"
          >
            Nhà đầu tư & Đối tác
          </button>

          <button
            onClick={() => openFooterModal(
              'Điều Khoản Bảo Mật & Privacy-by-Design',
              'Mọi dữ liệu tài liệu, ảnh chụp, đường dẫn và tin nhắn nghi vấn do người dùng gửi giám định đều được tự động khử nhận dạng (PII Redaction), mã hóa đầu cuối (End-to-End Encryption) và tự động hủy sau khi hoàn tất phiên phân tích. Chúng tôi không bao giờ lưu trữ thông tin nhạy cảm của bạn.',
              FileText
            )}
            className="hover:text-slate-300 transition-colors cursor-pointer"
          >
            Điều khoản bảo mật
          </button>

          <button
            onClick={() => openFooterModal(
              'Kênh Báo Cáo Sự Cố & Khẩn Cấp',
              'Khi phát hiện hành vi lừa đảo hoặc bị chiếm đoạt tài sản qua mạng, hãy ngay lập tức gọi Hotline Khẩn Cấp Công An Việt Nam: 113 | Tổng đài Cảnh Báo Tin Nhắn Rác (Bộ TTTT): 156 | Hoặc liên hệ trực tiếp đường dây nóng hỗ trợ ngân hàng chủ quản.',
              PhoneCall
            )}
            className="hover:text-slate-300 transition-colors cursor-pointer"
          >
            Báo cáo sự cố
          </button>
        </div>

        <div className="text-[11px] text-slate-600 text-center md:text-right">
          <p>© 2026 ScamGuard AI. All rights reserved.</p>
          <p className="flex items-center justify-center md:justify-end space-x-1 mt-0.5">
            <Lock className="w-3 h-3 text-slate-600" />
            <span>Mã hóa End-to-End an toàn</span>
          </p>
        </div>
      </div>

      {/* Interactive Modal Popup */}
      {modalContent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <modalContent.icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">{modalContent.title}</h3>
              </div>
              <button
                onClick={() => setModalContent(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{modalContent.desc}</p>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setModalContent(null)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Đã Hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

