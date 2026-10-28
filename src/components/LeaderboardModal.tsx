import React, { useState } from 'react';
import { Trophy, Globe, MapPin, Flame, Users } from 'lucide-react';
import { UserProfile, UserAccount } from '../types';
import { handleAvatarError } from '../utils/avatarFallback';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserProfile: UserProfile;
  currentUser?: UserAccount | null;
  realUsers?: UserProfile[];
}

interface LeaderboardUser {
  rank: number;
  name: string;
  xp: number;
  tier: string;
  streak: number;
  avatar: string;
  isCurrentUser?: boolean;
}

function getTierName(xp: number): string {
  if (xp >= 5001) return 'Hiệp Sĩ An Ninh Mạng';
  if (xp >= 2001) return 'Dân Chơi Không Bẫy';
  if (xp >= 501) return 'Báo Động Đỏ';
  return 'Tập Sự';
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentUserProfile,
  currentUser = null,
  realUsers = [],
}) => {
  const [tab, setTab] = useState<'national' | 'global'>('national');

  if (!isOpen) return null;

  const mergedUsers: UserProfile[] = (() => {
    const map = new Map<string, UserProfile>();
    realUsers.forEach((u) => {
      if (u && u.id) map.set(u.id, u);
    });
    if (currentUser && currentUser.id) {
      map.set(currentUser.id, {
        ...currentUser.profile,
        id: currentUser.id,
        name: currentUser.name || currentUserProfile.name,
        avatarUrl: currentUser.avatarUrl || currentUserProfile.avatarUrl,
        xp: currentUserProfile.xp ?? currentUser.profile.xp ?? 0,
        streakDays: currentUserProfile.streakDays ?? currentUser.profile.streakDays ?? 0,
      });
    }
    return Array.from(map.values()).sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0));
  })();

  const list: LeaderboardUser[] = mergedUsers.map((u, idx) => ({
    rank: idx + 1,
    name: u.name || u.username || 'Tài khoản Vệ Binh',
    xp: u.xp ?? 0,
    tier: getTierName(u.xp ?? 0),
    streak: u.streakDays ?? 0,
    avatar:
      u.avatarUrl ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    isCurrentUser: Boolean(currentUser && u.id === currentUser.id),
  }));

  const myEntry = list.find((u) => u.isCurrentUser);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="card-tactile w-full max-w-lg p-6 sm:p-8 space-y-6 bg-slate-900 border border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Bảng Xếp Hạng Vệ Binh ({list.length})</h2>
              <p className="text-xs text-slate-400">100% Tài khoản thật trên Cloud Firestore</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setTab('national')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              tab === 'national'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Việt Nam ({list.length})</span>
          </button>
          <button
            onClick={() => setTab('global')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              tab === 'global'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Toàn Cầu ({list.length})</span>
          </button>
        </div>

        {/* User Rank Card */}
        {myEntry ? (
          <div className="bg-gradient-to-r from-cyan-950/60 to-slate-950 border border-cyan-500/40 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 font-black flex items-center justify-center text-sm border border-cyan-500/40">
                #{myEntry.rank}
              </div>
              <img
                src={myEntry.avatar}
                alt="Avatar"
                referrerPolicy="no-referrer"
                onError={(e) => handleAvatarError(e, myEntry.name)}
                className="w-10 h-10 rounded-full object-cover border border-cyan-500/60"
              />
              <div>
                <div className="font-bold text-white text-sm">{myEntry.name} (Bạn)</div>
                <div className="text-xs text-cyan-400 font-medium">{myEntry.tier}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-base font-black text-cyan-300">{myEntry.xp} XP</div>
              <div className="text-xs text-amber-400 font-bold flex items-center justify-end space-x-1">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                <span>{myEntry.streak} ngày</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-center">
            Bạn chưa đăng nhập tài khoản thật trên hệ thống.
          </div>
        )}

        {/* List or Empty State */}
        {list.length === 0 ? (
          <div className="py-10 text-center space-y-3 bg-slate-950/60 rounded-2xl border border-slate-800 p-6">
            <Users className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-bold text-white">Chưa có tài khoản thật nào đăng nhập (0 thành viên)</p>
            <p className="text-xs text-slate-400">
              Bảng xếp hạng hoàn toàn trống khi chưa có người dùng đăng nhập qua Firebase Auth.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {list.map((u) => (
              <div
                key={u.rank}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                  u.rank === 1
                    ? 'bg-amber-950/30 border-amber-500/50'
                    : u.rank === 2
                    ? 'bg-slate-900 border-slate-700'
                    : u.rank === 3
                    ? 'bg-amber-950/20 border-amber-800/40'
                    : 'bg-slate-950/60 border-slate-800/80'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full font-black flex items-center justify-center text-xs ${
                      u.rank === 1
                        ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                        : u.rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : u.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {u.rank === 1 ? '👑' : `#${u.rank}`}
                  </div>
                  <img
                    src={u.avatar}
                    alt={u.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => handleAvatarError(e, u.name)}
                    className="w-9 h-9 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <h4 className="font-bold text-white text-xs sm:text-sm">
                      {u.name} {u.isCurrentUser ? '(Bạn)' : ''}
                    </h4>
                    <p className="text-[11px] text-slate-400">{u.tier}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-cyan-400">{u.xp} XP</div>
                  <div className="text-[11px] text-amber-400 font-bold flex items-center justify-end space-x-1">
                    <Flame className="w-3 h-3 fill-amber-400" />
                    <span>{u.streak}d</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full btn-tactile btn-tactile-cyan py-3 text-sm font-bold"
          >
            Đã Hiểu & Quay Lại Hành Trình
          </button>
        </div>
      </div>
    </div>
  );
};
