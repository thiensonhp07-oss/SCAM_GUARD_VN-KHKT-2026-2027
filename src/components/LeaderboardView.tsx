import React, { useState } from 'react';
import {
  Trophy,
  Globe,
  MapPin,
  Award,
  Flame,
  Sparkles,
  Star,
  Heart,
  UserPlus,
  UserCheck,
  MessageSquare,
  Users,
  Gift,
  LogIn,
} from 'lucide-react';
import { UserProfile, UserAccount, SocialPost, ReactionType, FriendUser } from '../types';
import { playSuccessChime } from '../utils/audioEffects';
import { handleAvatarError } from '../utils/avatarFallback';
import { SocialFeedView } from './SocialFeedView';
import { SocialGrowthSuite } from './SocialGrowthSuite';

interface LeaderboardViewProps {
  currentUserProfile: UserProfile;
  currentUser?: UserAccount | null;
  realUsers?: UserProfile[];
  onOpenAuth?: () => void;
  posts?: SocialPost[];
  onAddPost?: (newPost: SocialPost) => void;
  onReactPost?: (postId: string, reaction: ReactionType) => void;
  onAddComment?: (postId: string, commentText: string) => void;
  onSharePost?: (postId: string) => void;
  onToggleFollowUser?: (userId: string) => void;
  friends?: FriendUser[];
  onEarnXp?: (xp: number) => void;
}

interface LeaderboardUser {
  rank: number;
  name: string;
  xp: number;
  tier: 'Tập Sự' | 'Báo Động Đỏ' | 'Dân Chơi Không Bẫy' | 'Hiệp Sĩ An Ninh Mạng';
  streak: number;
  avatar: string;
  isCurrentUser?: boolean;
  followers?: number;
  likes?: number;
  shares?: number;
  socialBadge?: string;
  isFollowing?: boolean;
  userId?: string;
}

const HIEP_SI_RANKS = [
  { level: 1, name: 'Tập Sự', minXp: 0, maxXp: 500, badge: '🔰', color: 'text-slate-400 bg-slate-800/80 border-slate-700' },
  { level: 2, name: 'Báo Động Đỏ', minXp: 501, maxXp: 2000, badge: '🚨', color: 'text-amber-400 bg-amber-950/80 border-amber-500/50' },
  { level: 3, name: 'Dân Chơi Không Bẫy', minXp: 2001, maxXp: 5000, badge: '🛡️', color: 'text-cyan-300 bg-cyan-950/80 border-cyan-500/50' },
  { level: 4, name: 'Hiệp Sĩ An Ninh Mạng', minXp: 5001, maxXp: 99999, badge: '⚔️', color: 'text-purple-300 bg-purple-950/80 border-purple-500/50' },
];

function getTierForXp(xp: number): 'Tập Sự' | 'Báo Động Đỏ' | 'Dân Chơi Không Bẫy' | 'Hiệp Sĩ An Ninh Mạng' {
  if (xp >= 5001) return 'Hiệp Sĩ An Ninh Mạng';
  if (xp >= 2001) return 'Dân Chơi Không Bẫy';
  if (xp >= 501) return 'Báo Động Đỏ';
  return 'Tập Sự';
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  currentUserProfile,
  currentUser = null,
  realUsers = [],
  onOpenAuth,
  posts = [],
  onAddPost,
  onReactPost,
  onAddComment,
  onSharePost,
  onToggleFollowUser,
  onEarnXp,
}) => {
  const [tab, setTab] = useState<'national' | 'global' | 'social' | 'growth'>('national');
  const [followedIds, setFollowedIds] = useState<Record<string, boolean>>({});

  // Build 100% real user list from Cloud Firestore users collection (and current logged-in user if not yet synced)
  const mergedRealProfiles: UserProfile[] = React.useMemo(() => {
    const map = new Map<string, UserProfile>();
    realUsers.forEach((u) => {
      if (u && u.id) {
        map.set(u.id, u);
      }
    });
    if (currentUser && currentUser.id) {
      map.set(currentUser.id, {
        ...currentUser.profile,
        id: currentUser.id,
        name: currentUser.name || currentUserProfile.name,
        avatarUrl: currentUser.avatarUrl || currentUserProfile.avatarUrl,
        xp: currentUserProfile.xp ?? currentUser.profile.xp ?? 0,
        streakDays: currentUserProfile.streakDays ?? currentUser.profile.streakDays ?? 0,
        overallScore: currentUserProfile.overallScore ?? currentUser.profile.overallScore ?? 0,
      });
    }
    return Array.from(map.values()).sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0));
  }, [realUsers, currentUser, currentUserProfile]);

  const list: LeaderboardUser[] = React.useMemo(() => {
    return mergedRealProfiles.map((u, idx) => {
      const xpVal = u.xp ?? 0;
      const uid = u.id || `user_${idx}`;
      return {
        rank: idx + 1,
        userId: uid,
        name: u.name || u.username || 'Tài khoản Vệ Binh',
        xp: xpVal,
        tier: getTierForXp(xpVal),
        streak: u.streakDays ?? 0,
        avatar:
          u.avatarUrl ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        isCurrentUser: Boolean(currentUser && u.id === currentUser.id),
        followers: followedIds[uid] ? 1 : 0,
        likes: posts
          .filter((p) => p.userId === uid)
          .reduce(
            (acc, p) =>
              acc +
              p.reactions.like +
              p.reactions.love +
              p.reactions.shield +
              p.reactions.warning +
              p.reactions.haha,
            0
          ),
        shares: posts.filter((p) => p.userId === uid).reduce((acc, p) => acc + p.sharesCount, 0),
        socialBadge: '🛡️ Tài Khoản Xác Thực',
        isFollowing: Boolean(followedIds[uid]),
      };
    });
  }, [mergedRealProfiles, currentUser, followedIds, posts]);

  const handleToggleFollow = (rankOrId: number | string) => {
    const key = String(rankOrId);
    if (onToggleFollowUser) {
      onToggleFollowUser(key);
    }
    playSuccessChime();
    setFollowedIds((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const currentXp = currentUser ? currentUserProfile.xp ?? 0 : 0;
  let currentRankTier = HIEP_SI_RANKS[0];
  if (currentXp >= 5001) currentRankTier = HIEP_SI_RANKS[3];
  else if (currentXp >= 2001) currentRankTier = HIEP_SI_RANKS[2];
  else if (currentXp >= 501) currentRankTier = HIEP_SI_RANKS[1];

  const myEntryInList = currentUser ? list.find((u) => u.userId === currentUser.id) : undefined;

  const top1 = list[0];
  const top2 = list[1];
  const top3 = list[2];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="cyber-card-neon p-6 sm:p-8 rounded-3xl border-2 border-cyan-500/50 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="glow-orb-cyan -top-10 -left-10 opacity-60" />
        <div className="glow-orb-pink -bottom-10 -right-10 opacity-50" />

        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center text-amber-400 shadow-[0_0_25px_rgba(255,230,0,0.3)] flex-shrink-0">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full cyber-badge-gold text-[10px] font-extrabold uppercase mb-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>BẢNG XẾP HẠNG TÀI KHOẢN THẬT ({list.length} THÀNH VIÊN)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white text-glow-gold">Hiệp Sĩ An Ninh Mạng</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
              Dữ liệu trực tiếp 100% từ các tài khoản thật đăng nhập trên Cloud Firestore (Không sử dụng NPC ảo).
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-cyan-500/40 shrink-0 relative z-10 shadow-lg flex-wrap gap-1">
          <button
            onClick={() => setTab('national')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              tab === 'national' ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Việt Nam ({list.length})</span>
          </button>
          <button
            onClick={() => setTab('global')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              tab === 'global' ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Toàn Cầu ({list.length})</span>
          </button>
          <button
            onClick={() => setTab('social')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              tab === 'social' ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 text-white shadow-md font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-pink-300" />
            <span>🌐 Mạng Xã Hội ({posts.length})</span>
          </button>
          <button
            onClick={() => setTab('growth')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              tab === 'growth' ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-md font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-amber-300" />
            <span>👨‍👩‍👧‍👦 Gia Đình & Certificate</span>
          </button>
        </div>
      </div>

      {/* VIEW 1 & 2: LEADERBOARD TABLES (national / global) */}
      {(tab === 'national' || tab === 'global') && (
        <div className="space-y-6">
          {/* TOP 3 PODIUM WIDGET (Only shown when at least 3 real accounts exist) */}
          {top1 && top2 && top3 && (
            <div className="cyber-card-neon p-6 sm:p-8 rounded-3xl border-2 border-cyan-500/40 relative overflow-hidden bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 shadow-2xl">
              <div className="grid grid-cols-3 gap-2 sm:gap-6 items-end justify-center pt-6 pb-2 relative z-10">
                {/* RANK 2 */}
                <div className="flex flex-col items-center group">
                  <div className="relative mb-3 flex flex-col items-center">
                    <span className="text-xl sm:text-2xl mb-1">🥈</span>
                    <img
                      src={top2.avatar}
                      alt={top2.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => handleAvatarError(e, top2.name)}
                      className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl border-2 sm:border-4 border-slate-300 object-cover"
                    />
                    <p className="text-xs sm:text-sm font-black text-white mt-3 text-center line-clamp-1">
                      {top2.name}
                    </p>
                    <p className="text-[10px] sm:text-xs font-extrabold text-slate-300 mt-0.5">
                      {top2.xp.toLocaleString()} XP
                    </p>
                  </div>
                </div>

                {/* RANK 1 */}
                <div className="flex flex-col items-center group -mt-6">
                  <div className="relative mb-3 flex flex-col items-center">
                    <span className="text-2xl sm:text-3xl mb-1">👑</span>
                    <img
                      src={top1.avatar}
                      alt={top1.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => handleAvatarError(e, top1.name)}
                      className="w-18 h-18 sm:w-24 sm:h-24 rounded-2xl border-3 sm:border-4 border-amber-400 object-cover"
                    />
                    <p className="text-sm sm:text-base font-black text-amber-300 mt-3 text-center line-clamp-1">
                      {top1.name}
                    </p>
                    <p className="text-xs sm:text-sm font-black text-amber-400 mt-0.5">
                      {top1.xp.toLocaleString()} XP
                    </p>
                  </div>
                </div>

                {/* RANK 3 */}
                <div className="flex flex-col items-center group">
                  <div className="relative mb-3 flex flex-col items-center">
                    <span className="text-xl sm:text-2xl mb-1">🥉</span>
                    <img
                      src={top3.avatar}
                      alt={top3.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => handleAvatarError(e, top3.name)}
                      className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl border-2 sm:border-4 border-amber-700 object-cover"
                    />
                    <p className="text-xs sm:text-sm font-black text-white mt-3 text-center line-clamp-1">
                      {top3.name}
                    </p>
                    <p className="text-[10px] sm:text-xs font-extrabold text-amber-500 mt-0.5">
                      {top3.xp.toLocaleString()} XP
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4 Rank Progression Map */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center space-x-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span>Hệ Thống Bậc Rank "Hiệp Sĩ Số":</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {HIEP_SI_RANKS.map((r) => {
                const isCurrent = currentUser && currentRankTier.name === r.name;
                return (
                  <div
                    key={r.name}
                    className={`p-3.5 rounded-2xl border text-center space-y-1.5 transition-all ${r.color} ${
                      isCurrent ? 'ring-2 ring-cyan-400 scale-105 shadow-xl' : 'opacity-80'
                    }`}
                  >
                    <div className="text-2xl">{r.badge}</div>
                    <p className="text-xs font-black text-white">{r.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{r.minXp} - {r.maxXp} XP</p>
                    {isCurrent && (
                      <span className="inline-block text-[9px] font-black px-2 py-0.5 rounded bg-cyan-500 text-slate-950 uppercase">
                        CẤP BẬC HIỆN TẠI
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current User Row Card */}
          {myEntryInList && (
            <div className="p-4 rounded-3xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-indigo-950/80 border-2 border-cyan-500/60 shadow-xl flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-9 h-9 rounded-full bg-cyan-500 text-slate-950 font-black flex items-center justify-center text-xs">
                  #{myEntryInList.rank}
                </div>
                <img
                  src={myEntryInList.avatar}
                  alt={myEntryInList.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => handleAvatarError(e, myEntryInList.name)}
                  className="w-11 h-11 rounded-2xl border-2 border-cyan-400 object-cover"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-black text-white">{myEntryInList.name} (Bạn)</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      {currentRankTier.badge} {myEntryInList.tier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Streak: {myEntryInList.streak} Ngày An Toàn 🔥</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-amber-400">{myEntryInList.xp} XP</p>
                <p className="text-[10px] text-slate-400">Tài khoản thật trên Firestore</p>
              </div>
            </div>
          )}

          {/* Leaderboard Table or Empty State */}
          <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden bg-slate-900/90 shadow-xl">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Hạng & Tên Tài Khoản Thật ({list.length})</span>
              <span>Cấp Bậc & XP</span>
            </div>

            {list.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                  <Users className="w-8 h-8" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-base font-black text-white">
                    Đang tải danh sách thành viên từ Cloud Firestore...
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Bảng xếp hạng chỉ hiển thị những người dùng thật đã xác thực trên hệ thống Cloud Firestore.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {list.map((u) => (
                  <div
                    key={u.userId || u.rank}
                    className={`flex items-center justify-between px-6 py-4 transition-colors ${
                      u.isCurrentUser ? 'bg-cyan-950/30' : u.rank <= 3 ? 'bg-slate-900/80' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center ${
                          u.rank === 1
                            ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/30'
                            : u.rank === 2
                            ? 'bg-slate-300 text-slate-950'
                            : u.rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {u.rank}
                      </div>
                      <img
                        src={u.avatar}
                        alt={u.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => handleAvatarError(e, u.name)}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-bold text-white">
                            {u.name} {u.isCurrentUser ? '(Bạn)' : ''}
                          </p>
                        </div>
                        <p className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                          <span className="flex items-center space-x-1">
                            <Flame className="w-3.5 h-3.5 text-amber-400 inline" />
                            <span>{u.streak}d Streak</span>
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-cyan-300 border border-slate-700 mb-1">
                        {u.tier}
                      </span>
                      <p className="text-sm font-black text-amber-400">{u.xp} XP</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: FULL SOCIAL NETWORK FEED VIEW */}
      {tab === 'social' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <SocialFeedView
              currentUserProfile={currentUserProfile}
              currentUser={currentUser}
              onOpenAuth={onOpenAuth}
              posts={posts}
              onAddPost={onAddPost}
              onReactPost={onReactPost}
              onAddComment={onAddComment}
              onSharePost={onSharePost}
              onToggleFollowUser={onToggleFollowUser}
            />
          </div>

          {/* Right Sidebar Widget: Real Registered Accounts */}
          <div className="lg:col-span-4 space-y-4">
            <div className="cartoon-card p-5 bg-slate-900/90 border-slate-800 space-y-4 shadow-xl sticky top-20">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-black text-white font-mono uppercase tracking-wider flex items-center space-x-2">
                  <Award className="w-4 h-4 text-pink-400" />
                  <span>THÀNH VIÊN THẬT ({list.length})</span>
                </h3>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">FIRESTORE</span>
              </div>

              {list.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-xs font-bold text-slate-300">Chưa có tài khoản nào đăng nhập</p>
                  <p className="text-[11px] text-slate-500">
                    Khi có người dùng đăng nhập thật, danh sách thành viên sẽ hiển thị tại đây.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {list.map((user) => (
                    <div key={user.userId || user.rank} className="p-3 bg-slate-950/80 rounded-2xl border border-slate-850 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => handleAvatarError(e, user.name)}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                        />
                        <div>
                          <p className="font-bold text-white text-[11px] truncate max-w-[110px]">{user.name}</p>
                          <p className="text-[9px] text-pink-400 font-mono font-bold flex items-center space-x-1">
                            <Heart className="w-2.5 h-2.5 text-pink-400 fill-pink-400" />
                            <span>{user.likes || 0} Tương tác</span>
                          </p>
                        </div>
                      </div>

                      {!user.isCurrentUser && (
                        <button
                          onClick={() => handleToggleFollow(user.userId || user.rank)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                            user.isFollowing
                              ? 'bg-slate-800 text-slate-300 border border-slate-700'
                              : 'bg-cyan-500 text-slate-950 font-black'
                          }`}
                        >
                          {user.isFollowing ? <UserCheck className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                          <span>{user.isFollowing ? 'Theo dõi' : 'Follow'}</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: FAMILY CIRCLE & REFERRAL & DNA SUITE */}
      {tab === 'growth' && (
        <SocialGrowthSuite
          userProfile={currentUserProfile}
          currentUser={currentUser}
          onOpenAuth={onOpenAuth}
          onEarnXp={onEarnXp || (() => {})}
          posts={posts}
          onAddPost={onAddPost}
          onReactPost={onReactPost}
          onAddComment={onAddComment}
          onSharePost={onSharePost}
          onToggleFollowUser={onToggleFollowUser}
        />
      )}
    </div>
  );
};
