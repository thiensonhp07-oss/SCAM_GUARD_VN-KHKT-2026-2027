import React, { useState, useEffect } from 'react';
import { UserAccount, ExperienceMode } from '../types';
import {
  Lock,
  User,
  Mail,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  AlertCircle,
  Users,
  Shield,
  ArrowRight,
  LogIn,
  UserPlus,
  Database,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Link2,
} from 'lucide-react';
import {
  loginWithFirebase,
  registerWithFirebase,
  signInWithGoogleFirebase,
  signInWithGithubFirebase,
  signInWithFacebookFirebase,
  linkAccountWithProvider,
  sendPasswordResetFirebase,
  syncUserProfileToFirestore,
  logoutFromFirebase,
} from '../services/firebaseAuthService';
import {
  FIREBASE_PROJECT_ID,
  FIRESTORE_DATABASE_ID,
  FIREBASE_AUTH_DOMAIN,
} from '../firebase';
import { playSuccessChime, playAlertWarning } from '../utils/audioEffects';
import { handleAvatarError } from '../utils/avatarFallback';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onLoginSuccess: (user: UserAccount) => void;
  onLogout: () => void;
}

const AVATAR_PRESETS = [
  { id: 'owl', label: 'CyberGuard AI', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face' },
  { id: 'shield', label: 'Vệ Binh Khiên', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face' },
  { id: 'senior', label: 'Cao Niên Minh Triết', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=face' },
  { id: 'student', label: 'Học Sinh Thế Hệ Số', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop&crop=face' },
];

export function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
}: AuthModalProps) {
  const [authTab, setAuthTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regMode, setRegMode] = useState<ExperienceMode>('adult');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0].url);

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [activeSocialLoading, setActiveSocialLoading] = useState<'google' | 'facebook' | 'github' | null>(null);
  const [syncingFirestore, setSyncingFirestore] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [providerSetupGuide, setProviderSetupGuide] = useState<'google' | 'facebook' | 'github' | 'password' | null>(null);
  const [copiedUri, setCopiedUri] = useState(false);

  const firebaseCallbackUri = `https://${FIREBASE_AUTH_DOMAIN}/__/auth/handler`;
  const firebaseConsoleProvidersUrl = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/providers`;

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setProviderSetupGuide(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyCallbackUri = () => {
    navigator.clipboard.writeText(firebaseCallbackUri);
    setCopiedUri(true);
    setTimeout(() => setCopiedUri(false), 2000);
  };

  // Password strength calculator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Chưa nhập', color: 'bg-slate-700', width: '0%' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Yếu (Tối thiểu 6 ký tự)', color: 'bg-rose-500', width: '25%' };
    if (score <= 3) return { score: 2, label: 'Khá an toàn', color: 'bg-amber-500', width: '65%' };
    return { score: 3, label: 'Rất mạnh', color: 'bg-emerald-500', width: '100%' };
  };

  const strength = getPasswordStrength(regPassword);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setProviderSetupGuide(null);
    setLoading(true);

    try {
      let emailToUse = loginIdentifier.trim();
      if (!emailToUse.includes('@')) {
        emailToUse = `${loginIdentifier.toLowerCase().replace(/[^a-z0-9_.-]/g, '')}@scamguard.user`;
      }

      const result = await loginWithFirebase(emailToUse, loginPassword);
      if (result.success && result.user) {
        setSuccessMsg(`Đã xác thực Firebase & tải Database thành công! Xin chào ${result.user.name}.`);
        localStorage.setItem('scamguard_token', result.user.token);
        playSuccessChime();
        setTimeout(() => {
          onLoginSuccess(result.user!);
          onClose();
        }, 600);
        return;
      }

      if (result.providerSetupRequired) {
        setProviderSetupGuide(result.providerSetupRequired);
      }
      playAlertWarning();
      setErrorMsg(result.error || 'Email hoặc mật khẩu không chính xác.');
    } catch {
      playAlertWarning();
      setErrorMsg('Không thể kết nối đến máy chủ xác thực Firebase.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setProviderSetupGuide(null);

    if (regPassword.length < 6) {
      playAlertWarning();
      setErrorMsg('Mật khẩu Firebase cần tối thiểu 6 ký tự.');
      return;
    }

    setLoading(true);

    try {
      const emailToUse =
        regEmail.trim() ||
        `${regUsername.toLowerCase().replace(/[^a-z0-9_.-]/g, '')}@scamguard.user`;

      const result = await registerWithFirebase({
        name: regName.trim(),
        username: regUsername.trim() || emailToUse.split('@')[0],
        email: emailToUse,
        password: regPassword,
        mode: regMode,
        avatarUrl: selectedAvatar,
      });

      if (result.success && result.user) {
        setSuccessMsg(
          `Khởi tạo tài khoản Firebase & Database Cloud Firestore (users/${result.user.id.slice(0, 8)}...) thành công!`
        );
        localStorage.setItem('scamguard_token', result.user.token);
        playSuccessChime();
        setTimeout(() => {
          onLoginSuccess(result.user!);
          onClose();
        }, 700);
        return;
      }

      if (result.providerSetupRequired) {
        setProviderSetupGuide(result.providerSetupRequired);
      }
      playAlertWarning();
      setErrorMsg(result.error || 'Đăng ký tài khoản không thành công.');
    } catch {
      playAlertWarning();
      setErrorMsg('Lỗi kết nối khi đăng ký tài khoản Firebase.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setErrorMsg('');
    setLoading(true);

    const res = await sendPasswordResetFirebase(forgotEmail);
    setLoading(false);
    if (res.success) {
      setForgotSent(true);
      playSuccessChime();
    } else {
      playAlertWarning();
      setErrorMsg(res.error || 'Không thể gửi email khôi phục.');
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'facebook' | 'github') => {
    setErrorMsg('');
    setSuccessMsg('');
    setProviderSetupGuide(null);
    setLoading(true);
    setActiveSocialLoading(provider);

    try {
      let result;
      if (provider === 'google') {
        result = await signInWithGoogleFirebase(regMode);
      } else if (provider === 'github') {
        result = await signInWithGithubFirebase(regMode);
      } else {
        result = await signInWithFacebookFirebase(regMode);
      }

      if (result.success && result.user) {
        setSuccessMsg(
          `Đã xác thực ${provider.toUpperCase()} & đồng bộ Cloud Firestore (users/${result.user.id.slice(0, 8)}...)!`
        );
        localStorage.setItem('scamguard_token', result.user.token);
        playSuccessChime();
        setTimeout(() => {
          onLoginSuccess(result.user!);
          onClose();
        }, 600);
        return;
      }

      if (result.providerSetupRequired) {
        setProviderSetupGuide(result.providerSetupRequired);
      }
      playAlertWarning();
      setErrorMsg(result.error || `Đăng nhập ${provider.toUpperCase()} không thành công.`);
    } catch {
      playAlertWarning();
      setErrorMsg('Không thể mở cổng xác thực OAuth Firebase.');
    } finally {
      setLoading(false);
      setActiveSocialLoading(null);
    }
  };

  const handleLinkProvider = async (provider: 'google' | 'facebook' | 'github') => {
    setErrorMsg('');
    setSuccessMsg('');
    setProviderSetupGuide(null);
    setLoading(true);
    setActiveSocialLoading(provider);

    try {
      const result = await linkAccountWithProvider(provider);
      if (result.success && result.user) {
        setSuccessMsg(`Đã liên kết thành công tài khoản ${provider.toUpperCase()} vào cùng Database của bạn!`);
        playSuccessChime();
        onLoginSuccess(result.user);
      } else {
        if (result.providerSetupRequired) {
          setProviderSetupGuide(result.providerSetupRequired);
        }
        playAlertWarning();
        setErrorMsg(result.error || `Không thể liên kết ${provider.toUpperCase()}.`);
      }
    } finally {
      setLoading(false);
      setActiveSocialLoading(null);
    }
  };

  const handleForceCloudSync = async () => {
    if (!currentUser) return;
    setSyncingFirestore(true);
    setErrorMsg('');
    setSuccessMsg('');
    const ok = await syncUserProfileToFirestore(currentUser.id, currentUser.profile);
    setSyncingFirestore(false);
    if (ok) {
      playSuccessChime();
      setSuccessMsg('Đã đồng bộ toàn bộ hồ sơ & tiến độ học tập lên Cloud Firestore thành công!');
    } else {
      playAlertWarning();
      setErrorMsg('Chỉ tài khoản đăng nhập Firebase thực tế mới có thể đồng bộ trực tiếp lên Cloud Firestore.');
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
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="auth-modal-container"
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400 font-semibold shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">
                  {currentUser ? 'Hồ Sơ & Database Vệ Binh' : 'Xác Thực Firebase & Tạo Database'}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
                  Firebase Cloud
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Đăng nhập Google, Facebook, GitHub thực tế — Tự động khởi tạo & đồng bộ Firestore Database
              </p>
            </div>
          </div>
          <button
            id="close-auth-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Error / Success alerts */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-950/50 border border-rose-800/70 rounded-2xl text-xs text-rose-200 flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-950/50 border border-emerald-800/70 rounded-2xl text-xs text-emerald-200 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" />
              <div className="flex-1 leading-relaxed">{successMsg}</div>
            </div>
          )}

          {/* Interactive Firebase Console Provider Setup Guide when Facebook / GitHub / Password needs 1-time toggle */}
          {providerSetupGuide && (
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-700/60 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-amber-300 uppercase tracking-wider">
                  Hướng dẫn bật cổng {providerSetupGuide.toUpperCase()} trên Firebase Console (30 giây)
                </span>
                <button
                  type="button"
                  onClick={() => setProviderSetupGuide(null)}
                  className="text-slate-400 hover:text-white text-[11px]"
                >
                  Đóng
                </button>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Cổng <strong>Google</strong> đã được bật sẵn tự động. Để bật thêm{' '}
                <strong>
                  {providerSetupGuide === 'facebook'
                    ? 'Facebook Login'
                    : providerSetupGuide === 'github'
                    ? 'GitHub OAuth'
                    : 'Email/Password'}
                </strong>{' '}
                trên dự án Firebase của bạn (<code>{FIREBASE_PROJECT_ID}</code>):
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                <li>
                  Mở trang quản trị <strong>Sign-in providers</strong> của Firebase Console bên dưới.
                </li>
                {providerSetupGuide === 'password' ? (
                  <li>
                    Chọn <strong>Email/Password</strong>, gạt nút <strong>Enable</strong> và bấm{' '}
                    <strong>Save</strong>.
                  </li>
                ) : (
                  <>
                    <li>
                      Chọn{' '}
                      <strong>
                        {providerSetupGuide === 'facebook' ? 'Facebook' : 'GitHub'}
                      </strong>
                      , gạt nút <strong>Enable</strong>, điền App ID / Client ID & Secret từ{' '}
                      {providerSetupGuide === 'facebook'
                        ? 'Facebook Developers (developers.facebook.com)'
                        : 'GitHub Developer Settings (github.com/settings/developers)'}
                      .
                    </li>
                    <li>
                      Dán địa chỉ <strong>OAuth Redirect URI</strong> chuẩn của Firebase dưới đây vào cài đặt ứng dụng {providerSetupGuide.toUpperCase()}:
                    </li>
                  </>
                )}
              </ol>

              {providerSetupGuide !== 'password' && (
                <div className="flex items-center justify-between gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-[11px] text-cyan-300">
                  <span className="truncate">{firebaseCallbackUri}</span>
                  <button
                    type="button"
                    onClick={handleCopyCallbackUri}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-sans font-bold shrink-0 cursor-pointer"
                  >
                    {copiedUri ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUri ? 'Đã chép' : 'Sao chép URI'}</span>
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={firebaseConsoleProvidersUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors"
                >
                  <span>Mở Firebase Auth Console</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                {providerSetupGuide !== 'google' && (
                  <button
                    type="button"
                    onClick={() => handleSocialAuth('google')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 font-bold text-xs cursor-pointer"
                  >
                    <span>Đăng nhập ngay bằng Google (Đã kích hoạt sẵn)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* User is logged in: Profile & Cloud Firestore Database Dashboard */}
          {currentUser ? (
            <div className="space-y-5">
              {/* User Identity Card */}
              <div className="flex items-center space-x-4 bg-slate-950/90 p-5 rounded-2xl border border-slate-800">
                <img
                  src={
                    currentUser.avatarUrl ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face'
                  }
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => handleAvatarError(e, currentUser.name)}
                  className="w-16 h-16 rounded-full object-cover border-2 border-cyan-400 shadow-md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-black text-white truncate">{currentUser.name}</h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 rounded uppercase">
                      {currentUser.provider}
                    </span>
                    {currentUser.profile.emailVerified && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
                        Đã xác minh OAuth
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {currentUser.email} · @{currentUser.username}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-300">
                    <span>
                      Điểm: <strong className="text-cyan-400">{currentUser.profile.overallScore ?? 0}/100</strong>
                    </span>
                    <span>
                      XP: <strong className="text-amber-400">{currentUser.profile.xp ?? 0}</strong>
                    </span>
                    <span>
                      Chuỗi: <strong className="text-emerald-400">{currentUser.profile.streakDays ?? 0} ngày</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Cloud Firestore Database Status Card */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      Database Người Dùng Cloud Firestore
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleForceCloudSync}
                    disabled={syncingFirestore}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingFirestore ? 'animate-spin' : ''}`} />
                    <span>{syncingFirestore ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-slate-400 block">Đường dẫn Document:</span>
                    <code className="text-cyan-300 font-mono break-all">users/{currentUser.id}</code>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-slate-400 block">Firestore Database ID:</span>
                    <code className="text-emerald-300 font-mono truncate block">
                      {FIRESTORE_DATABASE_ID}
                    </code>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-slate-400 block">Tiến độ Lộ trình đã lưu:</span>
                    <strong className="text-white">
                      {currentUser.profile.completedRoadmapNodes?.length || 0} bài học / trạm
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-slate-400 block">Trạng thái Khảo sát & Chứng chỉ:</span>
                    <strong className="text-white">
                      {currentUser.profile.hasCompletedSurvey ? 'Đã khảo sát' : 'Chưa khảo sát'} ·{' '}
                      {currentUser.profile.cyberGuardianCert ? 'Đã cấp Chứng chỉ' : 'Đang học'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Link Additional OAuth Providers to the Same User Database */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <Link2 className="w-4 h-4 text-cyan-400" />
                  <span>Liên kết thêm tài khoản mạng xã hội vào cùng Database này:</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    disabled={loading || isGoogleLinked}
                    onClick={() => handleLinkProvider('google')}
                    className={`py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      isGoogleLinked
                        ? 'bg-emerald-950/30 border-emerald-700/50 text-emerald-300 cursor-default'
                        : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200 cursor-pointer'
                    }`}
                  >
                    <span>Google</span>
                    {isGoogleLinked && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>

                  <button
                    type="button"
                    disabled={loading || isFacebookLinked}
                    onClick={() => handleLinkProvider('facebook')}
                    className={`py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      isFacebookLinked
                        ? 'bg-emerald-950/30 border-emerald-700/50 text-emerald-300 cursor-default'
                        : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200 cursor-pointer'
                    }`}
                  >
                    <span>Facebook</span>
                    {isFacebookLinked && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>

                  <button
                    type="button"
                    disabled={loading || isGithubLinked}
                    onClick={() => handleLinkProvider('github')}
                    className={`py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      isGithubLinked
                        ? 'bg-emerald-950/30 border-emerald-700/50 text-emerald-300 cursor-default'
                        : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200 cursor-pointer'
                    }`}
                  >
                    <span>GitHub</span>
                    {isGithubLinked && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  id="logout-btn"
                  onClick={async () => {
                    await logoutFromFirebase();
                    localStorage.removeItem('scamguard_token');
                    localStorage.removeItem('scamguard_user_id');
                    onLogout();
                    setAuthTab('login');
                  }}
                  className="px-4 py-2.5 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-900/40 rounded-xl transition-colors cursor-pointer"
                >
                  Đăng Xuất Tài Khoản
                </button>
                <button
                  onClick={onClose}
                  className="btn-tactile btn-tactile-slate px-6 py-2.5 text-xs font-bold"
                >
                  Đóng
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Primary 1-Click Real OAuth Sign-In / Sign-Up (Google, Facebook, GitHub) */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Đăng Nhập / Đăng Ký 1 Chạm (Tạo Database Tự Động)
                  </span>
                  <span className="text-[10px] font-semibold text-cyan-400">OAuth 2.0 Thực Tế</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    id="social-auth-google"
                    type="button"
                    onClick={() => handleSocialAuth('google')}
                    disabled={loading}
                    className="py-3 px-3.5 bg-white hover:bg-slate-100 text-slate-900 border border-white rounded-2xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 11.3 0 14s.7 5.3 1.9 7.7l3.7-2.9z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.8-2.5 1.3-4.3 1.3-3 0-5.5-2.4-6.4-5.2L1.9 16.1C3.7 19.8 7.5 23 12 23z"
                      />
                    </svg>
                    <span>
                      {activeSocialLoading === 'google' ? 'Đang mở Google...' : 'Google'}
                    </span>
                  </button>

                  <button
                    id="social-auth-facebook"
                    type="button"
                    onClick={() => handleSocialAuth('facebook')}
                    disabled={loading}
                    className="py-3 px-3.5 bg-[#1877F2] hover:bg-[#166FE5] text-white border border-[#1877F2] rounded-2xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>
                      {activeSocialLoading === 'facebook' ? 'Đang mở FB...' : 'Facebook'}
                    </span>
                  </button>

                  <button
                    id="social-auth-github"
                    type="button"
                    onClick={() => handleSocialAuth('github')}
                    disabled={loading}
                    className="py-3 px-3.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 rounded-2xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      />
                    </svg>
                    <span>
                      {activeSocialLoading === 'github' ? 'Đang mở GitHub...' : 'GitHub'}
                    </span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Khi đăng nhập lần đầu bằng <strong>Google</strong>, <strong>Facebook</strong> hoặc{' '}
                  <strong>GitHub</strong>, hệ thống tự động tạo hồ sơ người dùng riêng tại bảng{' '}
                  <code className="text-cyan-300">users/&#123;uid&#125;</code> trong Cloud Firestore.
                </p>
              </div>

              {/* Tab switchers for Email/Password or Demo Presets */}
              <div className="flex p-1.5 bg-slate-950 rounded-2xl border border-slate-800 gap-1">
                <button
                  id="tab-btn-login"
                  type="button"
                  onClick={() => {
                    setAuthTab('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    authTab === 'login'
                      ? 'bg-cyan-600 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Email Đăng Nhập</span>
                </button>
                <button
                  id="tab-btn-register"
                  type="button"
                  onClick={() => {
                    setAuthTab('register');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    authTab === 'register'
                      ? 'bg-cyan-600 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Đăng Ký Email</span>
                </button>
              </div>

              {/* TAB 1: LOGIN */}
              {authTab === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Địa chỉ Email hoặc Tên đăng nhập Firebase
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="login-username-input"
                        type="text"
                        required
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="Ví dụ: email@gmail.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-300">Mật khẩu</label>
                      <button
                        type="button"
                        onClick={() => setAuthTab('forgot')}
                        className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer"
                      >
                        Quên mật khẩu?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="login-password-input"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Nhập mật khẩu của bạn"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-300">
                    <input
                      type="checkbox"
                      id="remember-me-cb"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0"
                    />
                    <label htmlFor="remember-me-cb" className="cursor-pointer">
                      Duy trì phiên đăng nhập Firebase trên thiết bị này
                    </label>
                  </div>

                  <button
                    id="submit-login-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full btn-tactile btn-tactile-cyan py-3 text-xs sm:text-sm font-black flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-lg"
                  >
                    {loading ? (
                      <span>Đang xác thực với Firebase...</span>
                    ) : (
                      <>
                        <span>ĐĂNG NHẬP BẰNG EMAIL</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 2: REGISTER */}
              {authTab === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Họ và Tên Hiển Thị
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="register-name-input"
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Ví dụ: Nguyễn Văn An"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Tên Định Danh (Username)
                      </label>
                      <input
                        id="register-username-input"
                        type="text"
                        required
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        placeholder="vanan2026"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Chế Độ Trải Nghiệm
                      </label>
                      <select
                        id="register-mode-select"
                        value={regMode}
                        onChange={(e) => setRegMode(e.target.value as ExperienceMode)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="adult">Người Lớn (Toàn diện)</option>
                        <option value="senior">Người Cao Tuổi (Chữ lớn & trợ lý)</option>
                        <option value="teen">Sinh Viên / Thiếu Niên</option>
                        <option value="kids">Trẻ Em / Học Sinh</option>
                        <option value="family">Gia Đình Bảo Vệ</option>
                      </select>
                    </div>
                  </div>

                  {/* Avatar Picker */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Chọn Ảnh Đại Diện Hồ Sơ
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {AVATAR_PRESETS.map((av) => (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setSelectedAvatar(av.url)}
                          className={`p-2 rounded-2xl border text-center transition-all cursor-pointer ${
                            selectedAvatar === av.url
                              ? 'bg-cyan-950 border-cyan-400 ring-2 ring-cyan-400/40'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <img
                            src={av.url}
                            alt={av.label}
                            referrerPolicy="no-referrer"
                            onError={(e) => handleAvatarError(e, av.label)}
                            className="w-9 h-9 rounded-full object-cover mx-auto mb-1"
                          />
                          <span className="text-[10px] text-slate-300 font-bold block truncate">
                            {av.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Địa chỉ Email
                    </label>
                    <input
                      id="register-email-input"
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="vanan@gmail.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Mật Khẩu Bảo Mật (Tối thiểu 6 ký tự)
                    </label>
                    <input
                      id="register-password-input"
                      type="password"
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    {regPassword && (
                      <div className="mt-1.5 space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-400">Độ mạnh mật khẩu:</span>
                          <span
                            className={
                              strength.score === 3
                                ? 'text-emerald-400'
                                : strength.score === 2
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }
                          >
                            {strength.label}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${strength.color} transition-all duration-300`}
                            style={{ width: strength.width }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    id="submit-register-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full btn-tactile btn-tactile-cyan py-3 text-xs sm:text-sm font-black flex items-center justify-center space-x-2 disabled:opacity-50 mt-2 cursor-pointer shadow-lg"
                  >
                    {loading ? (
                      <span>Đang tạo tài khoản & Database Firestore...</span>
                    ) : (
                      <>
                        <span>ĐĂNG KÝ & TẠO DATABASE NGƯỜI DÙNG</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB: FORGOT PASSWORD */}
              {authTab === 'forgot' && (
                <div className="space-y-4">
                  {!forgotSent ? (
                    <form onSubmit={handleForgotSubmit} className="space-y-4">
                      <div className="text-center space-y-2">
                        <h3 className="text-base font-black text-white">Khôi Phục Mật Khẩu Firebase</h3>
                        <p className="text-xs text-slate-400">
                          Nhập địa chỉ email đã đăng ký để nhận đường dẫn đặt lại mật khẩu từ Firebase Auth:
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Email đã đăng ký
                        </label>
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="email@example.com"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-tactile btn-tactile-cyan py-3 text-xs font-bold cursor-pointer"
                      >
                        {loading ? 'Đang gửi yêu cầu...' : 'Gửi Email Đặt Lại Mật Khẩu'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setAuthTab('login')}
                        className="w-full text-center text-xs text-slate-400 hover:text-white pt-2 cursor-pointer"
                      >
                        Quay lại Đăng Nhập
                      </button>
                    </form>
                  ) : (
                    <div className="text-center space-y-4 py-4">
                      <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                      <h3 className="text-base font-black text-white">Đã gửi liên kết khôi phục!</h3>
                      <p className="text-xs text-slate-300 max-w-xs mx-auto">
                        Vui lòng kiểm tra hộp thư đến tại <strong>{forgotEmail}</strong> để hoàn tất đặt mật khẩu mới.
                      </p>
                      <button
                        onClick={() => {
                          setForgotSent(false);
                          setAuthTab('login');
                        }}
                        className="btn-tactile btn-tactile-slate px-6 py-2.5 text-xs font-bold"
                      >
                        Về Màn Hình Đăng Nhập
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
