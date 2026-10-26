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
    <header className="sticky top-0 z-50 w-full bg-[#0B0F17] border-b border-[#283548]">
      <div className="max-w-[1550px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-4">
          
          {/* Left: Mobile Drawer Trigger + Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Hamburger button for Mobile & Tablet */}
            <button
              onClick={onOpenDrawer}
              className="lg:hidden p-1.5 rounded-lg bg-[#161F30] hover:bg-[#1E293B] border border-[#283548] text-slate-300 hover:text-white transition cursor-pointer flex items-center justify-center"
              title="Danh mục tính năng"
            >
              <Menu className="w-4 h-4 text-slate-300" />
            </button>

            <div
              onClick={() => onSelectTab('home')}
              className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-500">
                <Shield className="w-4.5 h-4.5 text-blue-500 fill-blue-500/20" />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-[#F8FAFC]">
                  ScamGuard
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  ENTERPRISE
                </span>
              </div>
            </div>
          </div>

          {/* Middle: Global Search + System Status HUD Indicator (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-xl items-center gap-4">
            <div className="flex-1">
              <GlobalSearchBar onNavigate={onSelectTab} />
            </div>

            {/* Minimalist Enterprise Status Indicator */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-md bg-[#161F30] border border-[#283548] text-xs text-slate-300 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-400">System:</span>
              <span className="text-emerald-400 font-medium">Operational</span>
            </div>
          </div>

          {/* Right Clean Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Mobile Search Toggle Button */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="p-1.5 rounded-lg bg-[#161F30] border border-[#283548] text-slate-300 hover:text-white md:hidden transition cursor-pointer"
              title="Tìm kiếm"
            >
              <Search className="w-4 h-4 text-slate-300" />
            </button>
            
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={onOpenNotifications}
                className="p-2 rounded-lg bg-[#161F30] hover:bg-[#1E293B] border border-[#283548] text-slate-400 hover:text-white transition cursor-pointer"
                title="Thông báo an ninh SOC"
              >
                <Bell className="w-4 h-4" />
              </button>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-500 text-white font-mono text-[9px] font-bold flex items-center justify-center pointer-events-none">
                5
              </span>
            </div>

            {/* Chat Messages Icon */}
            <button
              onClick={onOpenChat}
              className="p-2 rounded-lg bg-[#161F30] hover:bg-[#1E293B] border border-[#283548] text-slate-400 hover:text-white transition cursor-pointer hidden sm:block"
              title="Trung tâm cộng tác an ninh"
            >
              <MessageSquare className="w-4 h-4 text-slate-400" />
            </button>

            {/* Streak Flame Badge Button */}
            <button
              onClick={onOpenStreak}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-xs font-medium transition cursor-pointer"
              title="Chuỗi ngày an toàn liên tục"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{userProfile.streakDays || 3}d</span>
            </button>

            {/* Theme Toggle Icon */}
            <button
              onClick={onOpenTheme}
              className="p-2 rounded-lg bg-[#161F30] hover:bg-[#1E293B] border border-[#283548] text-slate-400 hover:text-white transition cursor-pointer hidden sm:block"
              title="Tùy biến giao diện"
            >
              <Moon className="w-4 h-4" />
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#161F30] hover:bg-[#1E293B] border border-[#283548] text-xs font-medium text-slate-300 transition cursor-pointer"
              title="Chuyển đổi Ngôn ngữ (VN / EN)"
            >
              <span>{currentLang === 'vi' ? 'VN' : 'EN'}</span>
            </button>

            {/* User Profile Pill */}
            <div
              onClick={onOpenAuth}
              className="flex items-center gap-2 p-1 sm:pr-2.5 rounded-lg bg-[#161F30] hover:bg-[#1E293B] border border-[#283548] cursor-pointer transition"
            >
              <div className="w-7 h-7 rounded-md bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-semibold text-xs">
                {userProfile.name ? userProfile.name.charAt(0) : 'S'}
              </div>

              <div className="flex flex-col text-left hidden lg:block">
                <span className="text-xs font-semibold text-[#F8FAFC] tracking-tight leading-none truncate max-w-[100px]">
                  {userProfile.name || 'SecOps Lead'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Enterprise User
                </span>
              </div>
            </div>

            {/* Emergency Action Button */}
            <button
              onClick={onOpenEmergency}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              title="Phòng Tuyến Khẩn Cấp 24/7"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Khẩn Cấp</span>
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
              className="md:hidden py-2 border-t border-[#283548] overflow-visible"
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
