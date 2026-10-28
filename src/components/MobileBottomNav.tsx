import React from 'react';
import { LayoutDashboard, Compass, Swords, Dna, Search, Menu } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onSelectTab: (tab: any) => void;
  onOpenEmergency: () => void;
  onOpenDrawer?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenDrawer,
}) => {
  const tabs = [
    { id: 'home', label: 'Chỉ huy', icon: LayoutDashboard },
    { id: 'check', label: 'Giám định', icon: Search },
    { id: 'scamdna', label: 'Scam DNA', icon: Dna },
    { id: 'train', label: 'Thao trường', icon: Swords },
    { id: 'roadmap', label: 'Lộ trình', icon: Compass },
    { id: 'all_drawer', label: 'Danh mục', icon: Menu, isDrawer: true },
  ];

  return (
    <nav
      aria-label="Điều hướng di động"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 pt-1.5 pb-safe shadow-[0_-4px_20px_-6px_rgba(15,23,42,0.06)]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.isDrawer ? false : activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.isDrawer) {
                  if (onOpenDrawer) onOpenDrawer();
                } else {
                  onSelectTab(tab.id);
                }
              }}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[48px] py-1 px-1.5 rounded-xl text-[10px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'text-sky-700 font-semibold bg-sky-50 border border-sky-200/70'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
              <span className="truncate max-w-[60px] text-center">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
