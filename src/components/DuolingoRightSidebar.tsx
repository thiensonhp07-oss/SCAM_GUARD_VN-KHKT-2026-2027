import React from 'react';
import {
  Flame,
  Sparkles,
  Heart,
  Lock,
  Gift,
  Shield,
  Award,
  User,
  Trophy,
} from 'lucide-react';
import { UserProfile, UserAccount } from '../types';
import { handleAvatarError } from '../utils/avatarFallback';

interface DuolingoRightSidebarProps {
  userProfile: UserProfile;
  currentUser?: UserAccount | null;
  onNavigate: (tab: 'home' | 'train' | 'leaderboard' | 'quests' | 'store' | 'profile' | 'more') => void;
  onOpenAuth: () => void;
  onOpenStreak?: () => void;
}

export const DuolingoRightSidebar: React.FC<DuolingoRightSidebarProps> = ({
  userProfile,
  currentUser,
  onNavigate,
  onOpenAuth,
  onOpenStreak,
}) => {
  return (
    <aside className="hidden lg:flex flex-col w-80 bg-[#08111F] border-l border-slate-800/80 p-5 sticky top-0 h-screen select-none space-y-5 overflow-y-auto">
      {/* 1. Top Metrics Bar (Streak & XP) */}
      <div className="flex items-center justify-between bg-[#0C1525] border border-slate-800 p-2 rounded-xl shadow-sm">
        <button
          onClick={onOpenStreak}
          className="flex items-center space-x-2 text-[#F5B82E] hover:text-[#fbbf24] font-bold text-xs p-1.5 hover:bg-[#101B2E] rounded-lg transition-all cursor-pointer flex-1 justify-center bg-[#F5B82E]/10 border border-[#F5B82E]/30"
          title="Chuỗi ngày rèn luyện liên tục - Bấm để xem chi tiết"
        >
          <Flame className="w-4 h-4 fill-[#F5B82E] text-[#F5B82E]" />
          <span className="font-mono text-xs font-bold">{userProfile.streakDays || 1} Ngày Chuỗi</span>
        </button>

        <button
          onClick={() => onNavigate('leaderboard')}
          className="flex items-center space-x-1 text-[#2F8CFF] hover:text-[#00D9FF] font-bold text-xs p-1.5 hover:bg-[#101B2E] rounded-lg transition-all cursor-pointer ml-2 px-3 border border-slate-800"
          title="Cột mốc kinh nghiệm XP"
        >
          <Award className="w-3.5 h-3.5 text-[#2F8CFF]" />
          <span className="font-mono">{userProfile.xp || 1450} XP</span>
        </button>
      </div>

      {/* 2. Leaderboard Card (Navigates to standalone Leaderboard page) */}
      <div
        onClick={() => onNavigate('leaderboard')}
        className="rounded-xl border border-slate-800 bg-[#0C1525] p-4 space-y-3 cursor-pointer hover:border-[#2F8CFF]/60 transition-all shadow-md group relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-[#F5B82E]" />
            <h3 className="text-xs font-bold text-white font-mono uppercase group-hover:text-[#F5B82E] transition-colors">
              Bảng Xếp Hạng Vệ Binh
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#F5B82E] bg-[#F5B82E]/15 px-2 py-0.5 rounded border border-[#F5B82E]/40">
            TOP 3
          </span>
        </div>

        {/* Top 3 Avatars Mini Widget Preview */}
        <div className="flex items-center justify-between bg-[#08111F] p-2.5 rounded-lg border border-slate-800/80">
          <div className="flex items-center -space-x-2">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
              alt="Top 1"
              referrerPolicy="no-referrer"
              onError={(e) => handleAvatarError(e, 'Hoàng Minh Tuấn')}
              className="w-7 h-7 rounded-full border-2 border-[#F5B82E] object-cover z-30"
              title="#1 Hoàng Minh Tuấn (8,850 XP)"
            />
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
              alt="Top 2"
              referrerPolicy="no-referrer"
              onError={(e) => handleAvatarError(e, 'Nguyễn Thị Mai')}
              className="w-6 h-6 rounded-full border-2 border-slate-400 object-cover z-20"
              title="#2 Nguyễn Thị Mai (7,640 XP)"
            />
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80"
              alt="Top 3"
              referrerPolicy="no-referrer"
              onError={(e) => handleAvatarError(e, 'Trần Văn Hùng')}
              className="w-5 h-5 rounded-full border-2 border-slate-600 object-cover z-10"
              title="#3 Trần Văn Hùng (6,150 XP)"
            />
          </div>
          <div className="text-right">
            <span className="text-[9px] uppercase font-mono font-medium text-slate-400 block">Vị Trí Của Bạn</span>
            <span className="text-xs font-mono font-bold text-[#00D9FF]">#8 • {userProfile.xp || 1250} XP</span>
          </div>
        </div>
      </div>

      {/* 3. Daily Quests Card (Navigates to Quests page) */}
      <div
        onClick={() => onNavigate('quests')}
        className="rounded-xl border border-slate-800 bg-[#0C1525] p-4 space-y-3 cursor-pointer hover:border-slate-700 transition-all shadow-md group"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-white uppercase group-hover:text-[#F5B82E] transition-colors">
            Nhiệm Vụ Hằng Ngày
          </h3>
          <span className="text-[10px] font-mono font-bold text-[#2F8CFF] hover:underline">XEM TẤT CẢ</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center space-x-1.5 font-mono text-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#F5B82E]" />
              <span>Kiếm 10 XP hôm nay</span>
            </span>
            <span className="font-mono text-[#F5B82E] font-bold text-xs">10 / 10</span>
          </div>
          <div className="w-full bg-[#08111F] h-2 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-[#F5B82E] rounded-full w-full" />
          </div>
        </div>
      </div>

      {/* 4. Auth / Profile Card */}
      {!currentUser ? (
        <div className="bg-[#0C1525] rounded-xl border border-slate-800 p-4 space-y-3 shadow-md">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-[#2F8CFF]" />
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Đồng Bộ Tiến Trình
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            Lưu chuỗi ngày an toàn, điểm SDI và chứng nhận VISEF lên đám mây bảo mật.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onNavigate('profile')}
              className="w-full py-2 px-2.5 rounded-lg bg-[#2F8CFF] hover:bg-[#2575dc] text-white font-bold text-[11px] uppercase tracking-wider shadow-sm transition cursor-pointer text-center font-mono"
            >
              TẠO HỒ SƠ
            </button>
            <button
              onClick={() => onNavigate('profile')}
              className="w-full py-2 px-2.5 rounded-lg bg-[#08111F] hover:bg-[#101B2E] text-slate-300 border border-slate-800 font-bold text-[11px] uppercase tracking-wider transition cursor-pointer text-center font-mono"
            >
              ĐĂNG NHẬP
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => onNavigate('profile')}
          className="bg-[#0C1525] rounded-xl border border-slate-800 p-3.5 space-y-2 shadow-md cursor-pointer hover:border-[#2F8CFF]/50 transition-all"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#2F8CFF]/15 text-[#2F8CFF] flex items-center justify-center font-bold border border-[#2F8CFF]/30">
              <User className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate font-mono">{currentUser.name || currentUser.username}</p>
              <p className="text-[10px] text-[#20D99A] font-mono font-bold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#20D99A] animate-pulse inline-block" />
                <span>Đã Đồng Bộ Cloud</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Utility Footer Links */}
      <div className="pt-2 text-[10px] text-slate-500 space-y-1.5 font-mono">
        <div className="flex flex-wrap gap-x-2.5 gap-y-1 font-medium text-[10px]">
          <button onClick={() => onNavigate('learn')} className="hover:text-slate-300 transition-colors cursor-pointer">GIỚI THIỆU</button>
          <button onClick={() => onNavigate('train', 'arena')} className="hover:text-slate-300 transition-colors cursor-pointer">ĐẤU TRƯỜNG</button>
          <button onClick={() => onNavigate('more')} className="hover:text-slate-300 transition-colors cursor-pointer">CÔNG CỤ</button>
        </div>
        <p className="text-[10px] text-slate-500">ScamGuard Cyber Intelligence Platform © 2026</p>
      </div>
    </aside>
  );
};
