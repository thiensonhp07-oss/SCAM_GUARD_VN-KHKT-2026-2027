import React from 'react';
import {
  X,
  LayoutDashboard,
  Compass,
  Dna,
  Swords,
  Search,
  FlaskConical,
  Gift,
  Trophy,
  User,
  MoreHorizontal,
  Shield,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  Flame,
  GraduationCap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, UserAccount } from '../types';

interface MobileDrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  userProfile: UserProfile;
  currentUser?: UserAccount | null;
  onSelectTab: (tab: any, subView?: string) => void;
  onOpenEmergency: () => void;
  onOpenStreak?: () => void;
  onOpenTheme?: () => void;
  onOpenAuth?: () => void;
  onOpenScienceFairDemo?: () => void;
  onOpenAboutProject?: () => void;
}

export const MobileDrawerMenu: React.FC<MobileDrawerMenuProps> = ({
  isOpen,
  onClose,
  activeTab,
  userProfile,
  currentUser,
  onSelectTab,
  onOpenEmergency,
  onOpenStreak,
  onOpenScienceFairDemo,
  onOpenAboutProject,
}) => {
  const tacticalItems = [
    {
      id: 'home',
      label: 'Trung Tâm Chỉ Huy SOC',
      desc: 'Tổng quan chỉ số an ninh & telemetry ViSEF',
      icon: LayoutDashboard,
      color: 'text-sky-600 bg-sky-50 border-sky-200',
      tag: 'CHÍNH',
      sub: undefined,
    },
    {
      id: 'roadmap',
      label: 'Lộ Trình Huấn Luyện',
      desc: 'Snake Path qua 12 khu vực phòng tuyến',
      icon: Compass,
      color: 'text-sky-600 bg-sky-50 border-sky-200',
      tag: '12 TRẠM',
      sub: undefined,
    },
    {
      id: 'scamdna',
      label: 'Scam DNA & Cấu Trúc Gen',
      desc: 'Bản đồ cấu trúc gen thao túng tâm lý',
      icon: Dna,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      tag: 'AI GEN',
      sub: undefined,
    },
    {
      id: 'check',
      label: 'Giám Định AI Đa Tầng',
      desc: 'Quét link độc, hóa đơn giả, bóc tách PII',
      icon: Search,
      color: 'text-sky-600 bg-sky-50 border-sky-200',
      tag: 'QUÉT AI',
      sub: undefined,
    },
    {
      id: 'research',
      label: 'Nghiên Cứu ViSEF 2026',
      desc: 'Báo cáo khoa học, thống kê & IRB Protocol',
      icon: FlaskConical,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      tag: 'KHOA HỌC',
      sub: undefined,
    },
  ] as const;

  const personalItems = [
    {
      id: 'quests',
      label: 'Nhiệm Vụ & Rương Báu',
      desc: 'Thử thách an ninh hàng ngày nhận XP',
      icon: Gift,
      color: 'text-sky-600 bg-sky-50 border-sky-200',
      tag: 'HÀNG NGÀY',
      sub: undefined,
    },
    {
      id: 'leaderboard',
      label: 'Bảng Xếp Hạng Vệ Binh',
      desc: 'Đua top phòng thủ với biệt đội an ninh',
      icon: Trophy,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      tag: 'XẾP HẠNG',
      sub: undefined,
    },
    {
      id: 'train',
      label: 'Đấu Trường Phòng Thủ',
      desc: 'Thực chiến 12 kịch bản bẫy mô phỏng',
      icon: Swords,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      tag: '12 BẪY',
      sub: 'arena',
    },
    {
      id: 'profile',
      label: 'Hồ Sơ & Thống Kê',
      desc: 'Quản lý tài khoản, danh bạ tin cậy & thành tích',
      icon: User,
      color: 'text-sky-600 bg-sky-50 border-sky-200',
      tag: 'CÁ NHÂN',
      sub: undefined,
    },
    {
      id: 'more',
      label: 'Kho Tiện Ích Tác Chiến',
      desc: 'Radar lừa đảo, Khiên WiFi, Giám sát màn hình',
      icon: MoreHorizontal,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      tag: 'TIỆN ÍCH',
      sub: undefined,
    },
  ] as const;

  const handleItemClick = (id: string, sub?: string) => {
    onSelectTab(id, sub);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
          />

          {/* Drawer Sidebar Sheet */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="relative w-[85%] max-w-[380px] bg-white border-r border-slate-200 h-full flex flex-col justify-between shadow-2xl z-50 overflow-hidden"
          >
            {/* Header Section with User Badge */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center text-white shadow-sm">
                    <Shield className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-950 tracking-tight">
                      ScamGuard <span className="text-sky-600 font-mono text-xs">VN</span>
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      ACTIVE CYBER DEFENSE
                    </span>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                  title="Đóng menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Compact Card */}
              <div
                onClick={() => {
                  onSelectTab('profile');
                  onClose();
                }}
                className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-sky-300 transition shadow-2xs"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 font-bold text-xs">
                    {(currentUser?.name || userProfile.name || 'V').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{currentUser?.name || userProfile.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 mt-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenStreak) {
                            onClose();
                            onOpenStreak();
                          }
                        }}
                        className="flex items-center gap-1 text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200 font-bold transition cursor-pointer"
                      >
                        <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {userProfile.streakDays ?? 0} ngày chuỗi
                      </button>
                      <span>•</span>
                      <span className="text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 font-bold">
                        {userProfile.xp ?? 0} XP
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              {/* Subtle 'Giới thiệu' Quick Link */}
              {onOpenAboutProject && (
                <button
                  onClick={() => {
                    onOpenAboutProject();
                    onClose();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-sky-200 text-slate-700 font-medium text-xs flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                    <span>Giới thiệu</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}

              {/* ViSEF 5-Minute Evaluation Quick Link */}
              {onOpenScienceFairDemo && (
                <button
                  onClick={() => {
                    onOpenScienceFairDemo();
                    onClose();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-sky-50 border border-sky-200 hover:border-sky-300 text-sky-800 font-semibold text-xs flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                    <span>Khảo Nghiệm ViSEF (5 Phút)</span>
                  </div>
                  <span className="text-[10px] font-mono text-sky-700 font-bold bg-white border border-sky-200 px-1.5 py-0.5 rounded">
                    LIVE
                  </span>
                </button>
              )}
            </div>

            {/* Scrollable Navigation Items */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
              {/* Category 1: TÁC CHIẾN */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-400 px-2 tracking-wider uppercase block">
                  QUẢN LÝ TÁC CHIẾN ({tacticalItems.length})
                </span>
                <div className="space-y-1">
                  {tacticalItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item.id, item.sub)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          isActive
                            ? 'bg-sky-50 border border-sky-200 text-slate-950 shadow-2xs'
                            : 'bg-white hover:bg-slate-50 border border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${item.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold leading-tight text-slate-900 flex items-center gap-1.5">
                              <span>{item.label}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 line-clamp-1">
                              {item.desc}
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                          {item.tag}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category 2: NHIỆM VỤ & CÁ NHÂN */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-mono font-bold text-slate-400 px-2 tracking-wider uppercase block">
                  HUẤN LUYỆN &amp; NHIỆM VỤ ({personalItems.length})
                </span>
                <div className="space-y-1">
                  {personalItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item.id, item.sub)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          isActive
                            ? 'bg-sky-50 border border-sky-200 text-slate-950 shadow-2xs'
                            : 'bg-white hover:bg-slate-50 border border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${item.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold leading-tight text-slate-900 flex items-center gap-1.5">
                              <span>{item.label}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 line-clamp-1">
                              {item.desc}
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                          {item.tag}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50/70 space-y-2">
              <button
                onClick={() => {
                  onOpenEmergency();
                  onClose();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>BÁO CÁO KHẨN CẤP (SOS)</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 px-1">
                <span>ScamGuard v3.4 ViSEF</span>
                <span className="font-mono text-sky-600">TLS 1.3 · Zero-Trust</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
