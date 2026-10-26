import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Dna,
  Search,
  FlaskConical,
  Gift,
  Trophy,
  Swords,
  User,
  MoreHorizontal,
  Shield,
  Headphones,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'motion/react';

interface DuolingoSidebarProps {
  activeTab: string;
  onSelectTab: (
    tab: any,
    subView?: string
  ) => void;
  onOpenEmergency?: () => void;
}

export const DuolingoSidebar: React.FC<DuolingoSidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenEmergency,
}) => {
  const detectionItems = [
    { id: 'home', label: 'Bảng Chỉ Huy SOC', icon: LayoutDashboard, sub: undefined },
    { id: 'roadmap', label: 'Lộ Trình Huấn Luyện', icon: Compass, sub: undefined },
    { id: 'scamdna', label: 'Cấu Trúc Scam DNA', icon: Dna, sub: undefined },
    { id: 'check', label: 'Giám Định AI Thực Chiến', icon: Search, sub: undefined },
    { id: 'research', label: 'Nghiên Cứu ViSEF', icon: FlaskConical, sub: undefined },
  ] as const;

  const operationItems = [
    { id: 'quests', label: 'Nhiệm Vụ Tác Chiến', icon: Gift, sub: undefined },
    { id: 'leaderboard', label: 'Bảng Xếp Hạng SOC', icon: Trophy, sub: undefined },
    { id: 'train', label: 'Đấu Trường Phản Xạ', icon: Swords, sub: 'arena' },
    { id: 'profile', label: 'Hồ Sơ Vệ Binh', icon: User, sub: undefined },
    { id: 'more', label: 'Tiện Ích An Ninh', icon: MoreHorizontal, sub: undefined },
  ] as const;

  const renderNavButton = (item: typeof detectionItems[number] | typeof operationItems[number]) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <button
        key={item.id}
        onClick={() => onSelectTab(item.id as any, item.sub)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
          isActive
            ? 'bg-[#161F30] text-[#F8FAFC] font-semibold border-l-2 border-l-blue-500 border border-[#283548]'
            : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#161F30]/60 border border-transparent'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon
            className={`w-5 h-5 shrink-0 transition-colors ${
              isActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-200'
            }`}
          />
          <span className="truncate">{item.label}</span>
        </div>

        {isActive && (
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
        )}
      </button>
    );
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#0B0F17] border-r border-[#283548] p-3.5 sticky top-0 h-screen select-none justify-between z-40 overflow-y-auto">
      <div className="space-y-4">
        {/* Brand Header */}
        <div
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-3 px-2 py-2 cursor-pointer group rounded-lg hover:bg-[#161F30] transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-500 shrink-0">
            <Shield className="w-5 h-5 text-blue-500 fill-blue-500/20" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-[#F8FAFC]">
                ScamGuard
              </span>
              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                PRO
              </span>
            </div>
            <span className="text-[11px] text-slate-400 truncate">
              Enterprise Cyber Platform
            </span>
          </div>
        </div>

        {/* Minimal System Status Pill */}
        <div className="p-2.5 rounded-lg bg-[#161F30] border border-[#283548] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-300 font-medium">Defense Engine</span>
          </div>
          <span className="text-emerald-400 font-mono text-[11px] font-semibold">ONLINE</span>
        </div>

        {/* Navigation Categories */}
        <div className="space-y-4 pt-1">
          {/* Category 1 */}
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Detection & Intelligence
            </div>
            <nav className="space-y-0.5">
              {detectionItems.map(renderNavButton)}
            </nav>
          </div>

          <div className="border-t border-[#283548]" />

          {/* Category 2 */}
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Training & Operations
            </div>
            <nav className="space-y-0.5">
              {operationItems.map(renderNavButton)}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Emergency Help Widget */}
      <div className="pt-3 border-t border-[#283548]">
        <div
          onClick={onOpenEmergency}
          className="p-2.5 rounded-lg bg-[#161F30] hover:bg-[#1E293B] border border-[#283548] hover:border-rose-500/40 flex items-center gap-3 cursor-pointer transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <Headphones className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#F8FAFC] truncate">Phòng Tuyến Khẩn Cấp</p>
            <p className="text-[11px] text-slate-400 truncate">Quy trình SOS 24/7</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
