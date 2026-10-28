import React, { useState } from 'react';
import { Shield, Lock, Users, FileText, PhoneCall, X } from 'lucide-react';
import { AboutProjectModal } from './AboutProjectModal';

interface UtilityFooterProps {
  onNavigateToResearch?: () => void;
}

export const UtilityFooter: React.FC<UtilityFooterProps> = ({ onNavigateToResearch }) => {
  const [modalContent, setModalContent] = useState<{ title: string; desc: string; icon: any } | null>(null);
  const [isAboutProjectOpen, setIsAboutProjectOpen] = useState(false);

  const openFooterModal = (title: string, desc: string, icon: any) => {
    setModalContent({ title, desc, icon });
  };

  return (
    <footer className="w-full bg-[#090D16] border-t border-[#1E293B] py-6 px-4 sm:px-6 lg:px-8 mt-12 text-slate-500 text-xs select-none">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-300">ScamGuard Enterprise</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500">Hệ thống Giám định Pháp y & Phòng chống Lừa đảo Số</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-slate-400">
          <button
            type="button"
            onClick={() => setIsAboutProjectOpen(true)}
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            Giới thiệu dự án
          </button>

          <button
            type="button"
            onClick={() =>
              openFooterModal(
                'Đối Tác Chuyên Môn & Cố Vấn Khoa Học',
                'Đồng hành bởi các chuyên gia an ninh mạng, hội đồng đạo đức nghiên cứu IRB Protocol #2026-HCMC-0092 và cộng đồng an toàn thông tin tại Việt Nam.',
                Users
              )
            }
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            Đối tác & Cố vấn
          </button>

          <button
            type="button"
            onClick={() =>
              openFooterModal(
                'Chính Sách Quyền Riêng Tư (Privacy-by-Design)',
                'Mọi dữ liệu tài liệu, ảnh chụp biên lai, đường dẫn và tin nhắn gửi giám định đều được khử nhận dạng (PII Redaction) ngay trên thiết bị trước khi phân tích.',
                FileText
              )
            }
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            Chính sách bảo mật
          </button>

          <button
            type="button"
            onClick={() =>
              openFooterModal(
                'Tổng Đài Báo Cáo Sự Cố An Ninh Mạng',
                'Khi phát hiện hành vi lừa đảo hoặc bị chiếm đoạt tài sản qua mạng, vui lòng liên hệ ngay đường dây nóng Công an 113, Tổng đài phản ánh tin nhắn rác 156 hoặc ngân hàng chủ quản để phong tỏa giao dịch.',
                PhoneCall
              )
            }
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            Báo cáo sự cố
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap">
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          <span>© 2026 ScamGuard</span>
        </div>
      </div>

      <AboutProjectModal
        isOpen={isAboutProjectOpen}
        onClose={() => setIsAboutProjectOpen(false)}
        onExploreResearch={onNavigateToResearch}
      />

      {modalContent && (
        <div className="fixed inset-0 z-50 bg-[#090D16]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1E293B] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <modalContent.icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">{modalContent.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalContent(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-[#090D16] border border-[#1E293B] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{modalContent.desc}</p>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setModalContent(null)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
