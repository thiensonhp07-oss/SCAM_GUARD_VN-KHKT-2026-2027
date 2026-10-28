import React, { useState } from 'react';
import {
  User,
  Shield,
  Flame,
  Sparkles,
  LogOut,
  Mail,
  CheckCircle2,
  Palette,
  Check,
  Sliders,
  Database,
  RefreshCw,
  Link2,
  AlertCircle,
} from 'lucide-react';
import { UserProfile, UserAccount } from '../types';
import { THEME_PRESETS, ThemePresetId, ThemeConfig, applyThemePreset } from '../utils/themeManager';
import {
  signInWithGoogleFirebase,
  signInWithFacebookFirebase,
  signInWithGithubFirebase,
  linkAccountWithProvider,
  syncUserProfileToFirestore,
  logoutFromFirebase,
} from '../services/firebaseAuthService';
import { FIRESTORE_DATABASE_ID, FIREBASE_PROJECT_ID } from '../firebase';
import { handleAvatarError } from '../utils/avatarFallback';
import { playSuccessChime, playAlertWarning } from '../utils/audioEffects';

interface ProfileViewProps {
  userProfile: UserProfile;
  currentUser: UserAccount | null;
  currentThemeConfig?: ThemeConfig;
  onOpenAuth: () => void;
  onLoginSuccess?: (user: UserAccount) => void;
  onLogout: () => void;
  onOpenTheme?: () => void;
  onUpdateThemeConfig?: (config: ThemeConfig) => void;
  onNavigate?: (tab: string, sub?: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  currentUser,
  currentThemeConfig,
  onOpenAuth,
  onLoginSuccess,
  onLogout,
  onOpenTheme,
  onUpdateThemeConfig,
  onNavigate,
}) => {
  const [syncing, setSyncing] = useState(false);
  const [authLoading, setAuthLoading] = useState<'google' | 'facebook' | 'github' | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleQuickOAuthLogin = async (provider: 'google' | 'facebook' | 'github') => {
    setStatusMessage(null);
    setAuthLoading(provider);
    try {
      const res =
        provider === 'google'
          ? await signInWithGoogleFirebase(userProfile.mode)
          : provider === 'facebook'
          ? await signInWithFacebookFirebase(userProfile.mode)
          : await signInWithGithubFirebase(userProfile.mode);

      if (res.success && res.user) {
        playSuccessChime();
        setStatusMessage({
          type: 'success',
          text: `Đã đăng nhập ${provider.toUpperCase()} & tạo/tải Database (users/${res.user.id.slice(0, 8)}...) thành công!`,
        });
        onLoginSuccess?.(res.user);
      } else {
        playAlertWarning();
        setStatusMessage({
          type: 'error',
          text: res.error || `Không thể đăng nhập qua ${provider.toUpperCase()}.`,
        });
        if (res.providerSetupRequired) {
          onOpenAuth();
        }
      }
    } finally {
      setAuthLoading(null);
    }
  };

  const handleLinkSocial = async (provider: 'google' | 'facebook' | 'github') => {
    setStatusMessage(null);
    setAuthLoading(provider);
    try {
      const res = await linkAccountWithProvider(provider);
      if (res.success && res.user) {
        playSuccessChime();
        setStatusMessage({
          type: 'success',
          text: `Đã liên kết tài khoản ${provider.toUpperCase()} vào cùng Database Cloud Firestore của bạn!`,
        });
        onLoginSuccess?.(res.user);
      } else {
        playAlertWarning();
        setStatusMessage({
          type: 'error',
          text: res.error || `Không thể liên kết tài khoản ${provider.toUpperCase()}.`,
        });
        if (res.providerSetupRequired) {
          onOpenAuth();
        }
      }
    } finally {
      setAuthLoading(null);
    }
  };

  const handleManualFirestoreSync = async () => {
    if (!currentUser) return;
    setSyncing(true);
    setStatusMessage(null);
    const ok = await syncUserProfileToFirestore(currentUser.id, userProfile);
    setSyncing(false);
    if (ok) {
      playSuccessChime();
      setStatusMessage({
        type: 'success',
        text: `Đã đồng bộ toàn bộ hồ sơ, điểm XP và tiến độ Lộ trình vào Cloud Firestore (users/${currentUser.id})!`,
      });
    } else {
      playAlertWarning();
      setStatusMessage({
        type: 'error',
        text: 'Vui lòng đăng nhập bằng tài khoản Firebase (Google / Facebook / GitHub / Email) để lưu lên Cloud Firestore.',
      });
    }
  };

  const linkedProviders = currentUser?.profile?.providersLinked || [];
  const isGoogleLinked =
    currentUser?.provider === 'google' || linkedProviders.some((p) => p.includes('google'));
  const isFacebookLinked =
    currentUser?.provider === 'facebook' || linkedProviders.some((p) => p.includes('facebook'));
  const isGithubLinked =
    currentUser?.provider === 'github' || linkedProviders.some((p) => p.includes('github'));

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 flex flex-col sm:flex-row items-center gap-6 shadow-xl">
        {currentUser?.avatarUrl || userProfile.avatarUrl ? (
          <img
            src={currentUser?.avatarUrl || userProfile.avatarUrl}
            alt={currentUser?.name || userProfile.name}
            referrerPolicy="no-referrer"
            onError={(e) => handleAvatarError(e, currentUser?.name || userProfile.name)}
            className="w-20 h-20 rounded-3xl object-cover border-2 border-cyan-400 shadow-xl shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-3xl bg-blue-500/20 border-2 border-blue-500/40 flex items-center justify-center text-blue-400 text-3xl font-black shadow-xl shrink-0">
            <User className="w-10 h-10" />
          </div>
        )}

        <div className="space-y-1.5 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-black text-white">
              {currentUser?.name || userProfile.name || 'Vệ Binh Khách'}
            </h1>
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                currentUser
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {currentUser ? `Đã Kết Nối Cloud Firestore (${currentUser.provider.toUpperCase()})` : 'Chế Độ Khách Cục Bộ'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {currentUser?.email ||
              'Đăng nhập bằng Google, Facebook hoặc GitHub thực tế để khởi tạo Database cá nhân trên Cloud Firestore.'}
          </p>
          {currentUser && (
            <p className="text-[11px] font-mono text-cyan-400">
              UID: {currentUser.id} · Dự án: {FIREBASE_PROJECT_ID}
            </p>
          )}
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-800 text-emerald-200'
              : 'bg-rose-950/50 border-rose-800 text-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate?.('progress', 'milestones')}
          className={`glass-card rounded-2xl p-4 border border-slate-800 bg-slate-900/90 text-center space-y-1 shadow-md transition-all ${
            onNavigate ? 'cursor-pointer hover:border-cyan-500/50 hover:bg-slate-850 group' : ''
          }`}
          title="Xem Cột Mốc Danh Dự & Huy Hiệu Điểm Số"
        >
          <Shield className="w-5 h-5 text-emerald-400 mx-auto group-hover:scale-110 transition-transform" />
          <div className="text-xl font-black text-white">{userProfile.overallScore ?? 0}%</div>
          <div className="text-[11px] text-slate-400 font-bold uppercase flex items-center justify-center gap-1">
            <span>Điểm Phòng Thủ</span>
            {onNavigate && <span className="text-[10px] text-cyan-400">→</span>}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 bg-slate-900/90 text-center space-y-1 shadow-md">
          <Flame className="w-5 h-5 text-amber-400 mx-auto fill-amber-400" />
          <div className="text-xl font-black text-amber-400 font-mono">{userProfile.streakDays ?? 0}</div>
          <div className="text-[11px] text-slate-400 font-bold uppercase">Chuỗi Ngày</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 bg-slate-900/90 text-center space-y-1 shadow-md">
          <Sparkles className="w-5 h-5 text-cyan-400 mx-auto fill-cyan-400" />
          <div className="text-xl font-black text-cyan-300 font-mono">{userProfile.xp ?? 0}</div>
          <div className="text-[11px] text-slate-400 font-bold uppercase">Điểm XP</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 bg-slate-900/90 text-center space-y-1 shadow-md">
          <CheckCircle2 className="w-5 h-5 text-purple-400 mx-auto" />
          <div className="text-xl font-black text-purple-300 font-mono">
            {(userProfile.completedRoadmapNodes?.length || 0) + (userProfile.completedScenarios?.length || 0)}
          </div>
          <div className="text-[11px] text-slate-400 font-bold uppercase">Bài & Kịch Bản Đã Lưu</div>
        </div>
      </div>

      {/* Firebase Auth & Cloud Firestore User Database Control Center */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 bg-slate-900/90 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                Xác Thực OAuth & Cơ Sở Dữ Liệu Người Dùng (Cloud Firestore)
              </h3>
              <p className="text-xs text-slate-400">
                Mỗi tài khoản Google, Facebook hoặc GitHub được cấp phát một bản ghi độc lập tại{' '}
                <code className="text-cyan-300">users/&#123;uid&#125;</code>
              </p>
            </div>
          </div>

          {currentUser && (
            <button
              onClick={handleManualFirestoreSync}
              disabled={syncing}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer self-start sm:self-auto disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Đang lưu Cloud...' : 'Đồng Bộ Lên Firestore'}</span>
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">Đường dẫn Document Firestore:</span>
              <p className="font-mono text-cyan-300 font-bold break-all">
                users/{currentUser?.id || userProfile.id}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">Database Instance ID:</span>
              <p className="font-mono text-emerald-300 font-bold truncate">{FIRESTORE_DATABASE_ID}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">Email & Trạng Thái Xác Thực:</span>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-bold text-white truncate">
                  {currentUser?.email || userProfile.email}
                </span>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">Đồng bộ lần cuối:</span>
              <p className="font-bold text-white">
                {userProfile.updatedAt
                  ? new Date(userProfile.updatedAt).toLocaleString('vi-VN')
                  : 'Vừa đồng bộ trực tiếp'}
              </p>
            </div>
          </div>

          {/* Multi-provider linking section */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Link2 className="w-4 h-4 text-cyan-400" />
              <span>Các tài khoản OAuth đã liên kết với Database này:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                disabled={Boolean(authLoading) || isGoogleLinked}
                onClick={() => handleLinkSocial('google')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  isGoogleLinked
                    ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300 cursor-default'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200 cursor-pointer'
                }`}
              >
                <span>{isGoogleLinked ? 'Google (Đã liên kết)' : '+ Liên kết Google'}</span>
                {isGoogleLinked && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>

              <button
                type="button"
                disabled={Boolean(authLoading) || isFacebookLinked}
                onClick={() => handleLinkSocial('facebook')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  isFacebookLinked
                    ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300 cursor-default'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200 cursor-pointer'
                }`}
              >
                <span>{isFacebookLinked ? 'Facebook (Đã liên kết)' : '+ Liên kết Facebook'}</span>
                {isFacebookLinked && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>

              <button
                type="button"
                disabled={Boolean(authLoading) || isGithubLinked}
                onClick={() => handleLinkSocial('github')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  isGithubLinked
                    ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300 cursor-default'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200 cursor-pointer'
                }`}
              >
                <span>{isGithubLinked ? 'GitHub (Đã liên kết)' : '+ Liên kết GitHub'}</span>
                {isGithubLinked && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            </div>
          </div>

          <button
            onClick={async () => {
              await logoutFromFirebase();
              onLogout();
            }}
            className="py-3 px-6 rounded-2xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 font-bold text-xs uppercase tracking-wider border border-rose-800 shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 w-full"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng Xuất Tài Khoản (Quay về trang Đăng Nhập)</span>
          </button>
        </div>
      </div>

      {/* Unified Anti-Glare Security Daylight Standard Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white space-y-3 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Chuẩn Giao Diện Security Daylight (Anti-Glare Edition)
              </h3>
              <p className="text-xs text-slate-500">
                Đồng bộ hoàn toàn nền trắng Alabaster dịu mắt (#F3F6FA) và sắc xanh dương an ninh (#0284C7) từ cổng xác thực đến trung tâm chỉ huy.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[11px] font-mono font-semibold text-sky-700 shrink-0">
            CỐ ĐỊNH · TỐI ƯU THỊ GIÁC
          </span>
        </div>
      </div>
    </div>
  );
};
