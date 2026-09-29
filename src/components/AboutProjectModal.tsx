import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  GraduationCap,
  User,
  Award,
  BookOpen,
  Code2,
  Sparkles,
  X,
  CheckCircle2,
  School,
} from 'lucide-react';

interface AboutProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreResearch?: () => void;
}

export const AboutProjectModal: React.FC<AboutProjectModalProps> = ({
  isOpen,
  onClose,
  onExploreResearch,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/85 backdrop-blur-xl animate-fadeIn">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-4xl bg-slate-900/95 border border-cyan-500/30 rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.18)] overflow-hidden my-auto"
        >
          {/* Top Cyber Accent Line */}
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-600" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all cursor-pointer shadow-lg"
            title="Đóng (ESC)"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-4 sm:p-8 space-y-6">
            {/* ========================================================= */}
            {/* HERO BANNER SECTION (CLEAN TYPOGRAPHY, NO SIDE LOGOS)     */}
            {/* ========================================================= */}
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 border border-cyan-500/30 p-6 sm:p-10 shadow-inner overflow-hidden text-center">
              {/* Background ambient light effects */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 right-1/2 translate-x-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-4 max-w-3xl mx-auto">
                {/* Department & School Header */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-bold tracking-wider uppercase shadow-sm">
                  <School className="w-4 h-4 text-cyan-400" />
                  <span>Sở GD&ĐT TP. Hồ Chí Minh · THPT NGUYỄN KHUYẾN</span>
                </div>

                {/* Main Grand Project Title */}
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-[0_2px_15px_rgba(6,182,212,0.3)] font-sans">
                  <span className="bg-gradient-to-r from-cyan-400 via-indigo-200 to-purple-400 bg-clip-text text-transparent">
                    SCAM GUARD VN
                  </span>
                </h1>

                {/* Scientific Project Subtitle */}
                <p className="text-sm sm:text-base md:text-lg text-slate-200 font-semibold leading-relaxed max-w-2xl mx-auto drop-shadow-sm">
                  Nền tảng học thích ứng kết hợp trí tuệ nhân tạo và mô hình hóa hành vi nhằm nâng cao năng lực phòng vệ lừa đảo trực tuyến cho học sinh THPT
                </p>

                {/* Author & Supervisor Metadata Bar */}
                <div className="pt-3 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <span className="px-3.5 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Hoàng Thiên Sơn (11A2)</span>
                  </span>
                  <span className="text-slate-600 hidden sm:inline">·</span>
                  <span className="px-3.5 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                    <span>GVHD: Bùi Thị Thanh Nhàn</span>
                  </span>
                  <span className="text-slate-600 hidden sm:inline">·</span>
                  <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span>NCKH cấp THPT</span>
                  </span>
                  <span className="text-slate-600 hidden sm:inline">·</span>
                  <span className="px-3.5 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Hệ thống phần mềm</span>
                  </span>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* DETAIL CARDS: HIGHLIGHTS & ARCHITECTURE                   */}
            {/* ========================================================= */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h4>Đột Phá Công Nghệ</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Tích hợp vector đặc trưng tâm lý 6 chiều (Scam DNA Vector) và thuật toán đề xuất thích ứng, tự động cá nhân hóa bài tập theo từng điểm yếu nhận thức của học sinh.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <h4>Đa Phương Thức AI</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Mô phỏng chân thực 12 phân khu không gian mạng: Deepfake AI Voice/Video, Quishing mã QR, SMS Brandname giả mạo BTS và thủ đoạn giả danh cơ quan pháp luật.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <h4>Thực Chứng Khoa Học</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Thiết kế thử nghiệm đối chứng ngẫu nhiên RCT 3 nhóm, kiểm định phi tham số Wilcoxon & Mann-Whitney U chứng minh hiệu quả giảm 83.2% tỷ lệ sập bẫy lừa đảo.
                </p>
              </div>
            </div>

            {/* ========================================================= */}
            {/* FOOTER ACTIONS                                            */}
            {/* ========================================================= */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Cuộc thi Nghiên cứu Khoa học Kỹ thuật (ViSEF 2026)</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {onExploreResearch && (
                  <button
                    onClick={() => {
                      onClose();
                      onExploreResearch();
                    }}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-600/30 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Xem Trung Tâm Nghiên Cứu ViSEF</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer border border-slate-700"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
