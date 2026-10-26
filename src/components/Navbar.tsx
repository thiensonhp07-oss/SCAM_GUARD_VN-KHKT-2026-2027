import React, { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  Flame,
  Sparkles,
  User,
  Palette,
  Dna,
  Search,
  Bell,
  MessageSquare,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, UserAccount } from '../types';
import { GlobalSearchBar } from './GlobalSearchBar';
import brandLogo from '../assets/images/scamguard_logo_brand.png';

interface NavbarProps {
  activeTab: string;
  userProfile: UserProfile;
  currentUser: UserAccount | null;
  onSelectTab: (tab: any, subView?: string) => void;
  onOpenEmergency: () => void;
  onOpenAuth: () => void;
  onOpenTheme?: () => void;
  onOpenStreak?: () => void;
  onOpenScienceFairDemo?: () => void;
  onOpenNotifications?: () => void;
  onOpenChat?: () => void;
  onOpenDrawer?: () => void;
  onLanguageChange?: (lang: 'vi' | 'en') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  userProfile,
  currentUser,
  onSelectTab,
  onOpenEmergency,
  onOpenAuth,
  onOpenTheme,
  onOpenStreak,
  onOpenScienceFairDemo,
  onOpenNotifications,
  onOpenChat,
  onOpenDrawer,
  onLanguageChange,
}) => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const currentLang = userProfile.language || 'vi';

  const toggleLanguage = () => {
    const nextLang = currentLang === 'vi' ? 'en' : 'vi';
    if (onLanguageChange) {
      onLanguageChange(nextLang);
    }
  };
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-[#08111F]/95 border-b border-slate-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
      <div className="max-w-[1550px] mx-auto px-3.5 sm:px-6">
        <div className="flex items-center justify-between h-15 sm:h-16 gap-3">
          
          {/* Left: Mobile Drawer Trigger + Brand Identity */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
            {/* Hamburger button for Mobile & Tablet */}
            <button
              onClick={onOpenDrawer}
              className="lg:hidden p-2 rounded-lg bg-[#0C1525] hover:bg-[#101B2E] border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer flex items-center justify-center"
              title="Danh mục tất cả tính năng"
            >
              <Menu className="w-4 h-4 text-[#F5B82E]" />
            </button>

            <div
              onClick={() => onSelectTab('home')}
              className="flex items-center space-x-2.5 cursor-pointer group select-none shrink-0"
            >
              <div className="relative flex items-center justify-center">
                <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-[#0C1525] border border-[#2F8CFF]/40 flex items-center justify-center text-white shadow-md shadow-[#2F8CFF]/10 overflow-hidden">
                  <Shield className="w-4.5 h-4.5 text-[#F5B82E] fill-[#2F8CFF]/20 group-hover:scale-105 transition-transform" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#20D99A] rounded-full border-2 border-[#08111F]" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="text-sm font-black tracking-wider text-white group-hover:text-[#F5B82E] transition-colors font-mono">
                    ScamGuard
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#F5B82E]/15 text-[#F5B82E] border border-[#F5B82E]/40 font-mono">
                    VISEF
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 font-mono tracking-wider hidden sm:block">
                  AI SOC INTEL 2026
                </span>
              </div>
            </div>
          </div>

          {/* Middle: Global Search + System Status HUD Indicator (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-xl items-center gap-3">
            <div className="flex-1">
              <GlobalSearchBar onNavigate={onSelectTab} />
            </div>

            {/* System Status HUD */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0C1525] border border-slate-800 text-[10px] font-mono shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#00D9FF] animate-pulse" />
              <span className="text-slate-400">SOC STATUS:</span>
              <span className="text-[#20D99A] font-bold">NOMINAL</span>
              <span className="text-slate-600">·</span>
              <span className="text-[#F5B82E] font-bold">99.8% AI ACC</span>
            </div>
          </div>

          {/* Right Clean Action Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Mobile Search Toggle Button */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="p-2 rounded-lg bg-[#0C1525] border border-slate-800 text-slate-300 hover:text-white md:hidden transition cursor-pointer"
              title="Tìm kiếm"
            >
              <Search className="w-4 h-4 text-[#F5B82E]" />
            </button>
            
            {/* Notification Bell with Badge '5' */}
            <div className="relative">
              <button
                onClick={onOpenNotifications}
                className="p-2 rounded-lg bg-[#0C1525] border border-slate-800 text-slate-300 hover:text-white hover:border-[#2F8CFF]/50 transition cursor-pointer"
                title="Thông báo an ninh SOC"
              >
                <Bell className="w-4 h-4" />
              </button>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF3B55] text-white font-mono text-[9px] font-bold flex items-center justify-center border-2 border-[#08111F] pointer-events-none">
                5
              </span>
            </div>

            {/* Chat Messages Icon */}
            <button
              onClick={onOpenChat}
              className="p-2 rounded-lg bg-[#0C1525] border border-slate-800 text-slate-300 hover:text-white hover:border-[#2F8CFF]/50 transition cursor-pointer hidden sm:block"
              title="Trung tâm bạn bè & hiệp đồng"
            >
              <MessageSquare className="w-4 h-4 text-[#2F8CFF]" />
            </button>

            {/* Streak Flame Badge Button */}
            <button
              onClick={onOpenStreak}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F5B82E]/10 hover:bg-[#F5B82E]/20 border border-[#F5B82E]/40 text-[#F5B82E] font-mono font-bold text-xs transition cursor-pointer"
              title="Chuỗi ngày an toàn liên tục (Streak)"
            >
              <Flame className="w-3.5 h-3.5 text-[#F5B82E] fill-[#F5B82E]" />
              <span>{userProfile.streakDays || 3}d</span>
            </button>

            {/* Theme Toggle Icon */}
            <button
              onClick={onOpenTheme}
              className="p-2 rounded-lg bg-[#0C1525] border border-slate-800 text-slate-300 hover:text-white hover:border-[#F5B82E]/50 transition cursor-pointer hidden sm:block"
              title="Tùy biến giao diện"
            >
              <Moon className="w-4 h-4 text-[#F5B82E]" />
            </button>

            {/* Language Flag Badge */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0C1525] hover:bg-[#101B2E] border border-slate-800 hover:border-[#2F8CFF]/50 text-xs font-mono font-bold text-slate-300 transition cursor-pointer"
              title="Chuyển đổi Ngôn ngữ (VN / EN)"
            >
              <span className="text-xs">{currentLang === 'vi' ? '🇻🇳' : '🇬🇧'}</span>
              <span className="hidden sm:inline text-[11px]">{currentLang === 'vi' ? 'VN' : 'EN'}</span>
            </button>

            {/* User Profile Pill */}
            <div
              onClick={onOpenAuth}
              className="flex items-center space-x-2 p-1 sm:pr-2.5 rounded-lg bg-[#0C1525] hover:bg-[#101B2E] border border-slate-800 hover:border-[#2F8CFF]/50 cursor-pointer transition"
            >
              <div className="relative">
                <div className="w-7 h-7 rounded-md bg-[#101B2E] border border-[#2F8CFF]/40 flex items-center justify-center text-white font-mono font-bold text-xs">
                  {userProfile.name ? userProfile.name.charAt(0) : 'K'}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[#20D99A] rounded-full border border-[#08111F]" />
              </div>

              <div className="flex flex-col text-left hidden lg:block">
                <span className="text-xs font-bold text-white tracking-tight leading-none truncate max-w-[100px]">
                  {userProfile.name || 'Khách #5058'}
                </span>
                <span className="text-[9px] text-[#F5B82E] font-mono mt-0.5">
                  VỆ BINH SOC
                </span>
              </div>
            </div>

            {/* Emergency Alert Button (Danger Red #FF3B55) */}
            <button
              onClick={onOpenEmergency}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#FF3B55]/15 hover:bg-[#FF3B55]/25 text-[#FF3B55] hover:text-white border border-[#FF3B55]/50 font-mono font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-[0_0_12px_rgba(255,59,85,0.25)]"
              title="Phòng Tuyến Khẩn Cấp 24/7"
            >
              <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline uppercase tracking-wider text-[11px]">KHẨN CẤP</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Overlay Drawer */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden py-2.5 border-t border-slate-800 overflow-visible"
            >
              <GlobalSearchBar
                onNavigate={(t, s) => {
                  onSelectTab(t, s);
                  setIsMobileSearchOpen(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
