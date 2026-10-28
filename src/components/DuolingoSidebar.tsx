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
  PhoneCall,
  ArrowUpRight,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

interface DuolingoSidebarProps {
  activeTab: string;
  onSelectTab: (tab: any, subView?: string) => void;
  onOpenEmergency?: () => void;
}

export const DuolingoSidebar: React.FC<DuolingoSidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenEmergency,
}) => {
  const { t } = useTranslation();

  const intelligenceItems = [
    { id: 'home', label: t('ws_home'), icon: LayoutDashboard, sub: undefined },
    { id: 'check', label: t('ws_check'), icon: Search, sub: undefined },
    { id: 'scamdna', label: t('ws_scamdna'), icon: Dna, sub: undefined },
    { id: 'research', label: t('ws_research'), icon: FlaskConical, sub: undefined },
  ] as const;

  const trainingItems = [
    { id: 'roadmap', label: t('ws_roadmap'), icon: Compass, sub: undefined },
    { id: 'train', label: t('ws_train'), icon: Swords, sub: 'arena' },
    { id: 'quests', label: t('ws_quests'), icon: Gift, sub: undefined },
    { id: 'leaderboard', label: t('ws_leaderboard'), icon: Trophy, sub: undefined },
  ] as const;

  const governanceItems = [
    { id: 'more', label: t('ws_more'), icon: MoreHorizontal, sub: undefined },
    { id: 'profile', label: t('ws_profile'), icon: User, sub: undefined },
  ] as const;

  const renderNavButton = (
    item:
      | (typeof intelligenceItems)[number]
      | (typeof trainingItems)[number]
      | (typeof governanceItems)[number]
  ) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <button
        key={item.id}
        onClick={() => onSelectTab(item.id as any, item.sub)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] transition-all duration-150 cursor-pointer text-left whitespace-nowrap ${
          isActive
            ? 'bg-gradient-to-r from-sky-50 via-sky-50/60 to-white text-sky-800 font-bold border-l-4 border-l-sky-600 border-y border-r border-sky-200/90 shadow-[0_2px_10px_-2px_rgba(2,132,199,0.12)]'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/90 border border-transparent font-medium'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon
            className={`w-4 h-4 shrink-0 transition-colors ${
              isActive ? 'text-sky-600' : 'text-slate-400'
            }`}
          />
          <span className="truncate">{item.label}</span>
        </div>
        {isActive && (
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
        )}
      </button>
    );
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white/95 border-r border-sky-200/80 px-3.5 py-4 sticky top-0 h-screen select-none justify-between z-40 overflow-y-auto shrink-0 shadow-[2px_0_20px_-4px_rgba(2,132,199,0.05)]">
      <div className="space-y-6">
        {/* Brand Wordmark Synchronized with AuthGate */}
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className="w-full flex items-center justify-between px-3 py-2 cursor-pointer rounded-xl bg-gradient-to-r from-sky-50/70 via-blue-50/30 to-transparent hover:from-sky-100/70 transition-all text-left border border-sky-100 hover:border-sky-300 shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-xl bg-slate-950 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Shield className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[15px] font-semibold tracking-tight text-slate-950 whitespace-nowrap">
                ScamGuard
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-600">
                VN
              </span>
            </div>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-300 font-bold">
            SOC
          </span>
        </button>

        {/* Navigation Groups */}
        <div className="space-y-5">
          {/* Group 1: Threat Intelligence */}
          <div className="space-y-1.5">
            <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {t('side_grp_intel')}
            </div>
            <nav className="space-y-0.5">
              {intelligenceItems.map(renderNavButton)}
            </nav>
          </div>

          <div className="border-t border-slate-100" />

          {/* Group 2: Training & Simulation */}
          <div className="space-y-1.5">
            <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {t('side_grp_train')}
            </div>
            <nav className="space-y-0.5">
              {trainingItems.map(renderNavButton)}
            </nav>
          </div>

          <div className="border-t border-slate-100" />

          {/* Group 3: Utilities & Governance */}
          <div className="space-y-1.5">
            <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {t('side_grp_gov')}
            </div>
            <nav className="space-y-0.5">
              {governanceItems.map(renderNavButton)}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Emergency Response Protocol */}
      <div className="pt-4 border-t border-slate-200/80 space-y-3">
        <button
          type="button"
          onClick={onOpenEmergency}
          className="w-full p-3 rounded-xl bg-rose-50/70 hover:bg-rose-50 border border-rose-200/80 hover:border-rose-300 flex items-center justify-between gap-2.5 cursor-pointer transition-all text-left group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 shadow-2xs">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{t('side_emergency_title')}</p>
              <p className="text-[11px] text-rose-600/90 truncate">{t('side_emergency_sub')}</p>
            </div>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-rose-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 transition-transform" />
        </button>

        <div className="px-2 flex items-center justify-between text-[10px] text-slate-400 font-mono tabular-nums">
          <span>TLS 1.3 · Zero-Trust</span>
          <span>IRB #2026-0092</span>
        </div>
      </div>
    </aside>
  );
};
