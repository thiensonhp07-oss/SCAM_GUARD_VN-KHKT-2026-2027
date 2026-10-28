import React from 'react';
import {
  Flame,
  Sparkles,
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
  realUsers?: UserProfile[];
  onNavigate: (tab: any, subView?: string) => void;
  onOpenAuth: () => void;
  onOpenStreak?: () => void;
}

export const DuolingoRightSidebar: React.FC<DuolingoRightSidebarProps> = ({
  userProfile,
  currentUser,
  realUsers = [],
  onNavigate,
  onOpenStreak,
}) => {
  const top3 = [...realUsers]
    .sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0))
    .slice(0, 3);

  return (
    <aside className="hidden lg:flex flex-col w-80 bg-white/95 border-l border-sky-200/90 shadow-[-2px_0_20px_-4px_rgba(2,132,199,0.05)] p-5 sticky top-0 h-screen select-none space-y-5 overflow-y-auto">
      {/* 1. Top Metrics Bar (Streak & XP) */}
      <div className="flex items-center justify-between bg-gradient-to-b from-white to-[#F6FAFE] border border-sky-200/90 p-2 rounded-2xl shadow-xs">
        <button
          onClick={onOpenStreak}
          className="flex items-center space-x-2 text-amber-700 hover:text-amber-800 font-bold text-xs p-1.5 hover:bg-amber-50 rounded-xl transition-all cursor-pointer flex-1 justify-center bg-amber-50/80 border border-amber-200/90 shadow-2xs"
          title="Chuỗi ngày rèn luyện liên tục - Bấm để xem chi tiết"
        >
          <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
          <span className="font-mono text-xs font-bold">{userProfile.streakDays ?? 0} Ngày Chuỗi</span>
        </button>

        <button
          onClick={() => onNavigate('leaderboard')}
          className="flex items-center space-x-1 text-sky-700 hover:text-sky-800 font-bold text-xs p-1.5 hover:bg-sky-50 rounded-xl transition-all cursor-pointer ml-2 px-3 border border-sky-200/90 bg-sky-50/60 shadow-2xs"
          title="Cột mốc kinh nghiệm XP"
        >
          <Award className="w-3.5 h-3.5 text-sky-600" />
          <span className="font-mono">{userProfile.xp ?? 0} XP</span>
        </button>
      </div>

      {/* 2. Leaderboard Card */}
      <div
        onClick={() => onNavigate('leaderboard')}
        className="rounded-2xl border border-sky-200/90 bg-gradient-to-b from-white to-[#F6FAFE] p-4 space-y-3 cursor-pointer hover:border-sky-400 transition-all shadow-xs group relative overflow-hidden border-t-2 border-t-amber-400"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-900 font-mono uppercase group-hover:text-amber-600 transition-colors">
              Bảng Xếp Hạng Vệ Binh
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            {realUsers.length} THÀNH VIÊN
          </span>
        </div>

        <div className="flex items-center justify-between bg-slate-50/90 p-2.5 rounded-xl border border-sky-100">
          {top3.length === 0 ? (
            <span className="text-[11px] text-slate-500 font-medium">Chưa có ai đăng nhập</span>
          ) : (
            <div className="flex items-center -space-x-2">
              {top3.map((u, idx) => (
                <img
                  key={u.id || idx}
                  src={
                    u.avatarUrl ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
                  }
                  alt={u.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => handleAvatarError(e, u.name)}
                  className="w-7 h-7 rounded-full border-2 border-amber-400 object-cover shadow-2xs"
                  title={`#${idx + 1} ${u.name} (${u.xp ?? 0} XP)`}
                />
              ))}
            </div>
          )}
          <div className="text-right">
            <span className="text-[9px] uppercase font-mono font-semibold text-slate-500 block">Điểm Của Bạn</span>
            <span className="text-xs font-mono font-bold text-sky-700">{userProfile.xp ?? 0} XP</span>
          </div>
        </div>
      </div>

      {/* 3. Daily Quests Card */}
      <div
        onClick={() => onNavigate('quests')}
        className="rounded-2xl border border-sky-200/90 bg-gradient-to-b from-white to-[#F6FAFE] p-4 space-y-3 cursor-pointer hover:border-sky-400 transition-all shadow-xs group border-t-2 border-t-sky-500"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-slate-900 uppercase group-hover:text-sky-600 transition-colors">
            Nhiệm Vụ Hằng Ngày
          </h3>
          <span className="text-[10px] font-mono font-bold text-sky-600 hover:underline">XEM TẤT CẢ</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center space-x-1.5 font-mono text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Kiếm 10 XP hôm nay</span>
            </span>
            <span className="font-mono text-amber-700 font-bold text-xs">
              {Math.min(10, userProfile.xp ?? 0)} / 10
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, ((userProfile.xp ?? 0) / 10) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Auth / Profile Card */}
      {!currentUser ? (
        <div className="bg-gradient-to-b from-white to-[#F6FAFE] rounded-2xl border border-sky-200/90 p-4 space-y-3 shadow-xs border-t-2 border-t-sky-500">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
              Đồng Bộ Tiến Trình
            </h3>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
            Lưu chuỗi ngày an toàn, điểm SDI và chứng nhận VISEF lên đám mây bảo mật.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onNavigate('profile')}
              className="w-full py-2 px-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] uppercase tracking-wider shadow-xs transition cursor-pointer text-center font-mono"
            >
              TẠO HỒ SƠ
            </button>
            <button
              onClick={() => onNavigate('profile')}
              className="w-full py-2 px-2.5 rounded-xl bg-white hover:bg-sky-50 text-slate-700 border border-sky-200/90 font-bold text-[11px] uppercase tracking-wider transition cursor-pointer text-center font-mono shadow-2xs"
            >
              ĐĂNG NHẬP
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => onNavigate('profile')}
          className="bg-gradient-to-b from-white to-[#F6FAFE] rounded-2xl border border-sky-200/90 p-3.5 space-y-2 shadow-xs cursor-pointer hover:border-sky-400 transition-all border-t-2 border-t-sky-500"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold border border-sky-200">
              <User className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate font-mono">{currentUser.name || currentUser.username}</p>
              <p className="text-[10px] text-emerald-600 font-mono font-bold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                <span>Đã Đồng Bộ Cloud</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Utility Footer Links */}
      <div className="pt-2 text-[10px] text-slate-500 space-y-1.5 font-mono">
        <div className="flex flex-wrap gap-x-2.5 gap-y-1 font-medium text-[10px]">
          <button onClick={() => onNavigate('learn')} className="hover:text-sky-700 transition-colors cursor-pointer">GIỚI THIỆU</button>
          <button onClick={() => onNavigate('train', 'arena')} className="hover:text-sky-700 transition-colors cursor-pointer">ĐẤU TRƯỜNG</button>
          <button onClick={() => onNavigate('more')} className="hover:text-sky-700 transition-colors cursor-pointer">CÔNG CỤ</button>
        </div>
        <p className="text-[10px] text-slate-400">ScamGuard Cyber Intelligence Platform © 2026</p>
      </div>
    </aside>
  );
};
