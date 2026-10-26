import React from 'react';
import {
  Home,
  Dna,
  Swords,
  Search,
  Trophy,
  Gift,
  User,
  MoreHorizontal,
  Shield,
  Sparkles,
  FlaskConical,
  LayoutDashboard,
  Headphones,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { motion } from 'motion/react';
import { MascotOwl } from './MascotOwl';
import brandLogo from '../assets/images/scamguard_logo_brand.png';

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
  const tacticalItems = [
    { id: 'home', label: 'BẢNG CHỈ HUY INTEL', icon: LayoutDashboard, sub: undefined },
    { id: 'roadmap', label: 'LỘ TRÌNH HUẤN LUYỆN', icon: Compass, sub: undefined },
    { id: 'scamdna', label: 'CẤU TRÚC SCAM DNA', icon: Dna, sub: undefined },
    { id: 'check', label: 'GIÁM ĐỊNH AI THỰC', icon: Search, sub: undefined },
    { id: 'research', label: 'NGHIÊN CỨU VISEF', icon: FlaskConical, sub: undefined },
  ] as const;

  const personalItems = [
    { id: 'quests', label: 'NHIỆM VỤ TÁC CHIẾN', icon: Gift, sub: undefined },
    { id: 'leaderboard', label: 'BẢNG XẾP HẠNG SOC', icon: Trophy, sub: undefined },
    { id: 'train', label: 'ĐẤU TRƯỜNG PHẢN XẠ', icon: Swords, sub: 'arena' },
    { id: 'profile', label: 'HỒ SƠ VỆ BINH', icon: User, sub: undefined },
    { id: 'more', label: 'TIỆN ÍCH AN NINH', icon: MoreHorizontal, sub: undefined },
  ] as const;

  const renderNavButton = (item: typeof tacticalItems[number] | typeof personalItems[number]) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    const isDashboard = item.id === 'home';

    return (
      <motion.button
        key={item.id}
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelectTab(item.id as any, item.sub)}
        className={`relative w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs tracking-wider transition-all cursor-pointer font-mono ${
          isDashboard && isActive
            ? 'bg-[#101b2e] text-white border-l-2 border-l-[#F5B82E] border border-blue-500/30 shadow-[0_4px_16px_rgba(47,140,255,0.18)]'
            : isActive
            ? 'bg-[#101b2e] text-[#F5B82E] border-l-2 border-l-[#2F8CFF] border border-slate-800/80 shadow-sm'
            : 'text-slate-400 hover:text-slate-100 hover:bg-[#0c1525] border border-transparent'
        }`}
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          <Icon
            className={`w-4 h-4 shrink-0 transition-transform ${
              isActive ? (isDashboard ? 'text-[#F5B82E]' : 'text-[#2F8CFF]') : 'text-slate-500 group-hover:text-slate-300'
            }`}
          />
          <span className="text-[11px] font-bold tracking-wide truncate">{item.label}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isActive && (
            <span className={`w-1.5 h-1.5 rounded-full ${isDashboard ? 'bg-[#F5B82E]' : 'bg-[#00D9FF]'} animate-pulse`} />
          )}
          <ChevronRight className={`w-3 h-3 ${isActive ? 'text-slate-300' : 'text-slate-700'}`} />
        </div>
      </motion.button>
    );
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#08111F] border-r border-slate-800/70 p-3.5 sticky top-0 h-screen select-none justify-between backdrop-blur-2xl z-40 overflow-y-auto shadow-[8px_0_30px_rgba(0,0,0,0.6)]">
      <div className="space-y-4">
        {/* Brand Identity matching cyber sports analytics theme */}
        <div
          onClick={() => onSelectTab('home')}
          className="flex items-center space-x-3 px-2 py-1.5 cursor-pointer group rounded-xl hover:bg-[#0c1525] transition"
        >
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2F8CFF]/20 via-[#0c1525] to-[#F5B82E]/20 border border-[#2F8CFF]/40 flex items-center justify-center text-white shadow-md shadow-[#2F8CFF]/10 overflow-hidden">
              <Shield className="w-5 h-5 text-[#F5B82E] fill-[#2F8CFF]/30 group-hover:scale-105 transition-transform" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#20D99A] rounded-full border-2 border-[#08111F]" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-wider text-white group-hover:text-[#F5B82E] transition-colors font-mono">
                ScamGuard
              </span>
              <span className="text-[9px] font-black font-mono text-[#F5B82E] bg-[#F5B82E]/15 border border-[#F5B82E]/40 px-1 py-0.2 rounded">
                INTEL
              </span>
            </div>
            <span className="text-[9px] text-[#2F8CFF] font-mono tracking-widest uppercase truncate">
              VISEF SOC PROTOCOL #2026
            </span>
          </div>
        </div>

        {/* System SOC Status Bar */}
        <div className="p-2.5 rounded-lg bg-[#0c1525] border border-slate-800 text-[10px] font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00D9FF] animate-pulse" />
            <span className="text-slate-300 font-semibold uppercase">DEFENSE STATUS</span>
          </div>
          <span className="text-[#20D99A] font-bold">ONLINE · 99.8%</span>
        </div>

        {/* Primary Action Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onSelectTab('home')}
          className={`w-full py-2.5 px-3 rounded-lg font-mono text-xs uppercase tracking-wider flex items-center justify-between cursor-pointer transition shadow-md ${
            activeTab === 'home'
              ? 'bg-[#101b2e] text-white border border-[#2F8CFF]/60 shadow-[0_0_15px_rgba(47,140,255,0.2)]'
              : 'bg-[#0c1525] text-slate-300 border border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-3.5 h-3.5 text-[#F5B82E]" />
            <span className="font-bold">BẢNG CHỈ HUY</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#2F8CFF]/20 text-[#00D9FF] font-bold">LIVE</span>
        </motion.button>

        {/* Navigation Categories */}
        <div className="space-y-3.5 pt-0.5">
          {/* Category 1 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              <span>TRUNG TÂM PHÂN TÍCH</span>
              <span className="text-slate-600">5 MOD</span>
            </div>
            <nav className="space-y-0.5">
              {tacticalItems.map(renderNavButton)}
            </nav>
          </div>

          <div className="border-t border-slate-800/60 my-1" />

          {/* Category 2 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              <span>HUẤN LUYỆN & XẾP HẠNG</span>
              <span className="text-slate-600">5 MOD</span>
            </div>
            <nav className="space-y-0.5">
              {personalItems.map(renderNavButton)}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Emergency Help Widget */}
      <div className="pt-3 border-t border-slate-800/70">
        <div
          onClick={onOpenEmergency}
          className="p-2.5 rounded-xl bg-[#0c1525] hover:bg-[#101b2e] border border-slate-800/80 hover:border-[#FF3B55]/50 flex items-center space-x-2.5 cursor-pointer transition shadow-sm group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#FF3B55]/10 border border-[#FF3B55]/30 flex items-center justify-center text-[#FF3B55] group-hover:scale-105 transition-transform shrink-0">
            <Headphones className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200 group-hover:text-white transition font-mono truncate">Phòng Tuyến Khẩn Cấp</p>
            <p className="text-[10px] text-slate-500 truncate font-mono">Quy trình SOS 24/7</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
