import React, { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  Menu,
  Search,
  ChevronRight,
  ShieldCheck,
  Flame,
  Globe,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, UserAccount } from '../types';
import { GlobalSearchBar } from './GlobalSearchBar';
import { useTranslation } from '../i18n/LanguageContext';

interface NavbarProps {
  activeTab: string;
  userProfile: UserProfile;
  currentUser: UserAccount | null;
  onSelectTab: (tab: any, subView?: string) => void;
  onOpenEmergency: () => void;
  onLogout?: () => void;
  onOpenTheme?: () => void;
  onOpenStreak?: () => void;
  onOpenScienceFairDemo?: () => void;
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
  onLogout,
  onOpenStreak,
  onOpenDrawer,
  onLanguageChange,
}) => {
  const { t, language } = useTranslation();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const currentLang = language || userProfile.language || 'vi';

  const todayStr = new Date().toISOString().split('T')[0];
  const isTodayCompleted =
    typeof window !== 'undefined' &&
    localStorage.getItem('scamguard_streak_last_date') === todayStr;

  const workspaceTitleKey = `ws_${activeTab}` as any;
  const activeWorkspaceTitle = t(workspaceTitleKey) || 'SOC Command Center';

  const toggleLanguage = () => {
    const nextLang = currentLang === 'vi' ? 'en' : 'vi';
    if (onLanguageChange) {
      onLanguageChange(nextLang);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-sky-200/90 border-t-2 border-t-sky-500 shadow-[0_4px_20px_-2px_rgba(2,132,199,0.06)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-3 sm:gap-6">
          {/* Zone 1: Mobile Menu Trigger + Contextual Breadcrumb Trail */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 shrink-0">
            <button
              type="button"
              onClick={onOpenDrawer}
              className="lg:hidden p-2 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 text-slate-600 hover:text-sky-600 transition cursor-pointer flex items-center justify-center"
              title={currentLang === 'en' ? 'System Navigation Menu' : 'Danh mục hệ thống'}
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Mobile Brand Wordmark */}
            <button
              type="button"
              onClick={() => onSelectTab('home')}
              className="lg:hidden flex items-center gap-2 text-left cursor-pointer whitespace-nowrap shrink-0"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-950 flex items-center justify-center text-white shadow-xs">
                <Shield className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <span className="text-sm font-semibold tracking-tight text-slate-950">ScamGuard</span>
            </button>

            {/* Desktop Contextual Breadcrumb */}
            <nav aria-label="Breadcrumb" className="hidden lg:flex items-center gap-2 text-xs whitespace-nowrap">
              <button
                type="button"
                onClick={() => onSelectTab('home')}
                className="text-slate-500 hover:text-sky-600 transition-colors font-medium cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                <span>ScamGuard Security</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span className="text-slate-900 font-semibold">{activeWorkspaceTitle}</span>
            </nav>
          </div>

          {/* Zone 2: Global Threat & Module Search (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md items-center">
            <GlobalSearchBar onNavigate={onSelectTab} />
          </div>

          {/* Zone 3: Streamlined Security Controls, Streak Badge & Language Toggle */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Mobile Search Button */}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="p-2 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 text-slate-600 hover:text-sky-600 md:hidden transition cursor-pointer"
              title={currentLang === 'en' ? 'Search threats & modules' : 'Tìm kiếm'}
            >
              <Search className="w-4 h-4" />
            </button>

            {/* DEDICATED STREAK BOX / WIDGET */}
            <button
              type="button"
              onClick={onOpenStreak}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-50/90 hover:bg-amber-100/90 border border-amber-200/90 hover:border-amber-300 text-amber-900 transition-all cursor-pointer shadow-2xs group shrink-0"
              title={
                currentLang === 'en'
                  ? `Daily Streak: ${userProfile.streakDays ?? 0} days (${isTodayCompleted ? 'Completed today' : 'Click to check in'})`
                  : `Chuỗi bảo vệ an ninh: ${userProfile.streakDays ?? 0} ngày (${isTodayCompleted ? 'Đã điểm danh hôm nay' : 'Bấm để điểm danh nhận XP'})`
              }
            >
              <div className="w-5 h-5 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500 group-hover:scale-115 transition-transform" />
              </div>
              <div className="flex items-center gap-1">
                <span className="font-mono font-bold text-xs sm:text-sm text-amber-950 tabular-nums">
                  {userProfile.streakDays ?? 0}
                </span>
                <span className="text-[11px] font-semibold text-amber-800 hidden xs:inline">
                  {currentLang === 'en' ? 'Days' : 'Ngày'}
                </span>
              </div>
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isTodayCompleted
                    ? 'bg-emerald-500 ring-2 ring-emerald-200'
                    : 'bg-amber-500 animate-ping'
                }`}
                title={
                  isTodayCompleted
                    ? t('nav_streak_today_done')
                    : t('nav_streak_need_checkin')
                }
              />
            </button>

            {/* INTERACTIVE LANGUAGE SWITCHER BUTTON (VI <-> EN) */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-slate-700 hover:text-sky-700 text-xs font-bold transition cursor-pointer shadow-2xs shrink-0 select-none group"
              title={
                currentLang === 'vi'
                  ? 'Switch to English (Click to toggle)'
                  : 'Chuyển sang Tiếng Việt (Bấm để chuyển)'
              }
            >
              <Globe className="w-3.5 h-3.5 text-sky-600 group-hover:rotate-45 transition-transform" />
              <span className="font-mono text-[11px] font-extrabold tracking-tight">
                {currentLang === 'vi' ? 'VI' : 'EN'}
              </span>
            </button>

            {/* Authenticated User Profile Badge */}
            <button
              type="button"
              onClick={() => onSelectTab('profile')}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200 hover:border-sky-200 text-xs font-medium text-slate-700 hover:text-slate-950 transition cursor-pointer whitespace-nowrap shrink-0"
              title={currentLang === 'en' ? 'User Profile & Security Settings' : 'Hồ sơ cá nhân & Cài đặt'}
            >
              <span className="w-5 h-5 rounded-md bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 font-bold text-[11px]">
                {(currentUser?.name || userProfile.name || 'V').charAt(0).toUpperCase()}
              </span>
              <span className="hidden sm:inline truncate max-w-[120px] font-semibold">
                {currentUser?.name || userProfile.name}
              </span>
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="hidden sm:inline-flex px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-xs font-medium text-slate-600 hover:text-rose-600 transition cursor-pointer whitespace-nowrap shrink-0"
                title={currentLang === 'en' ? 'Sign out of current account' : 'Đăng xuất tài khoản'}
              >
                {t('nav_logout')}
              </button>
            )}

            {/* Primary Action: Emergency SOS / Quick Scan */}
            <button
              type="button"
              onClick={onOpenEmergency}
              className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer whitespace-nowrap shrink-0"
              title={currentLang === 'en' ? 'Emergency 24/7 Hotline & Freeze Protocol' : 'Quy trình ứng cứu khẩn cấp 24/7'}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{t('nav_emergency_btn')}</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Drawer */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden py-2.5 border-t border-slate-200 overflow-visible"
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
