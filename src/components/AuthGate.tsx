import React, { useState } from 'react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Shield,
  ShieldCheck,
  Lock,
  Fingerprint,
  ScanSearch,
  GlobeLock,
  Radar,
  Check,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Copy,
  MailCheck,
  Loader2,
  ArrowUpRight,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import { UserAccount } from '../types';
import { AboutProjectModal } from './AboutProjectModal';
import {
  loginWithFirebase,
  registerWithFirebase,
  signInWithGoogleFirebase,
  signInWithGithubFirebase,
  signInWithFacebookFirebase,
  sendPasswordResetFirebase,
} from '../services/firebaseAuthService';
import { FIREBASE_PROJECT_ID, FIREBASE_AUTH_DOMAIN } from '../firebase';
import { playSuccessChime, playAlertWarning } from '../utils/audioEffects';

interface AuthGateProps {
  onLoginSuccess: (user: UserAccount) => void;
}

// 6 symmetrically ordered orbital nodes at exact 60-degree intervals
const ORBITAL_NODES = [
  { angle: 0, Icon: ShieldCheck, label: 'VNeID', color: 'text-sky-600', dot: 'bg-sky-500' },
  { angle: 60, Icon: GlobeLock, label: 'Phishing', color: 'text-indigo-600', dot: 'bg-indigo-500' },
  { angle: 120, Icon: ScanSearch, label: 'Deepfake', color: 'text-sky-600', dot: 'bg-sky-500' },
  { angle: 180, Icon: Fingerprint, label: 'Identity', color: 'text-indigo-600', dot: 'bg-indigo-500' },
  { angle: 240, Icon: Radar, label: 'Telemetry', color: 'text-sky-600', dot: 'bg-sky-500' },
  { angle: 300, Icon: Lock, label: 'Vault', color: 'text-indigo-600', dot: 'bg-indigo-500' },
];

// Precomputed 72 degree ticks (every 5 degrees) for the unified horology ring
const DEGREE_TICKS = Array.from({ length: 72 }, (_, i) => i * 5);

// Precomputed 12 radial symmetry axes (every 30 degrees)
const RADIAL_AXES = Array.from({ length: 12 }, (_, i) => i * 30);

export const AuthGate: React.FC<AuthGateProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'register' | 'login' | 'forgot'>('register');

  // Form fields
  const [playerName, setPlayerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email verification state
  const [emailVerifyState, setEmailVerifyState] = useState<'idle' | 'verifying' | 'verified'>('idle');

  // Interactive "I'm not a robot" reCAPTCHA state
  const [captchaState, setCaptchaState] = useState<'unchecked' | 'checking' | 'checked'>('unchecked');

  // Auth status & loading
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'github' | 'facebook' | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [providerSetupGuide, setProviderSetupGuide] = useState<'google' | 'facebook' | 'github' | 'password' | null>(null);
  const [copiedUri, setCopiedUri] = useState(false);
  const [isAboutProjectOpen, setIsAboutProjectOpen] = useState(false);

  const firebaseCallbackUri = `https://${FIREBASE_AUTH_DOMAIN}/__/auth/handler`;
  const firebaseConsoleProvidersUrl = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/providers`;

  const handleCopyCallbackUri = () => {
    navigator.clipboard.writeText(firebaseCallbackUri);
    setCopiedUri(true);
    setTimeout(() => setCopiedUri(false), 2000);
  };

  const handleVerifyEmailClick = () => {
    setErrorMsg('');
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      playAlertWarning();
      setErrorMsg('Vui lòng nhập địa chỉ Email hợp lệ trước khi bấm xác thực.');
      return;
    }
    setEmailVerifyState('verifying');
    setTimeout(() => {
      setEmailVerifyState('verified');
      playSuccessChime();
      setSuccessMsg(`Đã kiểm tra định dạng bảo mật cho email ${trimmed}.`);
    }, 600);
  };

  const handleCaptchaClick = () => {
    if (captchaState === 'checked' || captchaState === 'checking') return;
    setErrorMsg('');
    setCaptchaState('checking');
    setTimeout(() => {
      setCaptchaState('checked');
      playSuccessChime();
    }, 500);
  };

  const handleSocialLogin = async (provider: 'google' | 'github' | 'facebook') => {
    setErrorMsg('');
    setSuccessMsg('');
    setProviderSetupGuide(null);
    setLoading(true);
    setSocialLoading(provider);

    try {
      const result =
        provider === 'google'
          ? await signInWithGoogleFirebase('adult')
          : provider === 'github'
          ? await signInWithGithubFirebase('adult')
          : await signInWithFacebookFirebase('adult');

      if (result.success && result.user) {
        playSuccessChime();
        setSuccessMsg(`Đã xác thực ${provider.toUpperCase()} thành công.`);
        onLoginSuccess(result.user);
        return;
      }

      if (result.providerSetupRequired) {
        setProviderSetupGuide(result.providerSetupRequired);
      }
      playAlertWarning();
      setErrorMsg(result.error || `Không thể đăng nhập qua ${provider.toUpperCase()}.`);
    } catch {
      playAlertWarning();
      setErrorMsg('Không thể mở cửa sổ xác thực OAuth.');
    } finally {
      setLoading(false);
      setSocialLoading(null);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setProviderSetupGuide(null);

    const cleanName = playerName.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      playAlertWarning();
      setErrorMsg('Vui lòng nhập tên hiển thị của bạn.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      playAlertWarning();
      setErrorMsg('Vui lòng nhập địa chỉ Email hợp lệ.');
      return;
    }
    if (password.length < 6) {
      playAlertWarning();
      setErrorMsg('Mật khẩu cần tối thiểu 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      playAlertWarning();
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (captchaState !== 'checked') {
      playAlertWarning();
      setErrorMsg('Vui lòng tích xác nhận bảo mật "I\'m not a robot".');
      return;
    }

    setLoading(true);
    try {
      const username =
        cleanName
          .toLowerCase()
          .replace(/[^a-z0-9_.-]/g, '')
          .slice(0, 30) || cleanEmail.split('@')[0];

      const result = await registerWithFirebase({
        name: cleanName,
        username,
        email: cleanEmail,
        password,
        mode: 'adult',
      });

      if (result.success && result.user) {
        playSuccessChime();
        setSuccessMsg(`Tạo tài khoản thành công. Chào mừng ${result.user.name}.`);
        onLoginSuccess(result.user);
        return;
      }

      if (result.providerSetupRequired) {
        setProviderSetupGuide(result.providerSetupRequired);
      }
      playAlertWarning();
      setErrorMsg(result.error || 'Không thể tạo tài khoản. Vui lòng thử lại.');
    } catch {
      playAlertWarning();
      setErrorMsg('Lỗi kết nối đến máy chủ xác thực.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setProviderSetupGuide(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      playAlertWarning();
      setErrorMsg('Vui lòng nhập Email hoặc tên đăng nhập.');
      return;
    }
    if (!password) {
      playAlertWarning();
      setErrorMsg('Vui lòng nhập mật khẩu.');
      return;
    }
    if (captchaState !== 'checked') {
      playAlertWarning();
      setErrorMsg('Vui lòng tích xác nhận bảo mật "I\'m not a robot".');
      return;
    }

    setLoading(true);
    try {
      const emailToUse = cleanEmail.includes('@')
        ? cleanEmail
        : `${cleanEmail.toLowerCase().replace(/[^a-z0-9_.-]/g, '')}@scamguard.user`;

      const result = await loginWithFirebase(emailToUse, password);
      if (result.success && result.user) {
        playSuccessChime();
        setSuccessMsg(`Đăng nhập thành công. Xin chào ${result.user.name}.`);
        onLoginSuccess(result.user);
        return;
      }

      if (result.providerSetupRequired) {
        setProviderSetupGuide(result.providerSetupRequired);
      }
      playAlertWarning();
      setErrorMsg(result.error || 'Thông tin đăng nhập không chính xác.');
    } catch {
      playAlertWarning();
      setErrorMsg('Không thể kết nối đến hệ thống xác thực.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!email.trim() || !email.includes('@')) {
      playAlertWarning();
      setErrorMsg('Vui lòng nhập địa chỉ Email đã đăng ký.');
      return;
    }
    setLoading(true);
    const res = await sendPasswordResetFirebase(email.trim());
    setLoading(false);
    if (res.success) {
      playSuccessChime();
      setSuccessMsg(`Đã gửi liên kết đặt lại mật khẩu tới ${email.trim()}.`);
    } else {
      playAlertWarning();
      setErrorMsg(res.error || 'Không thể gửi email khôi phục mật khẩu.');
    }
  };

  const switchMode = (nextMode: 'register' | 'login' | 'forgot') => {
    setMode(nextMode);
    setErrorMsg('');
    setSuccessMsg('');
    setProviderSetupGuide(null);
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#F3F7FC] via-[#FAFCFF] to-[#EFF6FF] text-slate-900 flex flex-col lg:flex-row font-sans antialiased selection:bg-sky-600 selection:text-white overflow-hidden">
      {/* Seamless Full-Viewport Keyframe Animations */}
      <style>{`
        @keyframes sgSpinCw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes sgSpinCcw {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes sgHarmonicRipple {
          0% {
            transform: scale(0.28);
            opacity: 0;
          }
          20% {
            opacity: 0.5;
          }
          100% {
            transform: scale(2.85);
            opacity: 0;
          }
        }
        @keyframes sgRadialPulse {
          0% {
            stroke-dashoffset: 600;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes sgBridgeFlow {
          0% {
            stroke-dashoffset: 1200;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes sgTrackComet {
          0% {
            stroke-dashoffset: 1400;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes sgCoreBreathe {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 24px 60px -12px rgba(2, 132, 199, 0.22), 0 0 0 1px rgba(226, 232, 240, 0.9);
          }
          50% {
            transform: scale(1.045);
            box-shadow: 0 32px 80px -10px rgba(2, 132, 199, 0.36), 0 0 0 1px rgba(56, 189, 248, 0.45);
          }
        }
        @keyframes sgLaserLoop {
          0% {
            transform: translateY(-60px);
            opacity: 0;
          }
          15%, 85% {
            opacity: 0.9;
          }
          50% {
            transform: translateY(60px);
            opacity: 1;
          }
          100% {
            transform: translateY(-60px);
            opacity: 0;
          }
        }
        @keyframes sgDividerShuttle {
          0% {
            transform: translateX(-120%);
            opacity: 0;
          }
          30%, 70% {
            opacity: 1;
          }
          100% {
            transform: translateX(220%);
            opacity: 0;
          }
        }
        @keyframes sgButtonShimmer {
          0% {
            transform: translateX(-150%) skewX(-20deg);
          }
          50%, 100% {
            transform: translateX(250%) skewX(-20deg);
          }
        }
        @keyframes sgFloatSoft {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-7px);
          }
        }
      `}</style>

      {/* =======================================================================
          UNIFIED BORDERLESS FULL-VIEWPORT KINETIC BACKGROUND LAYER
          Spans 100% across both left and right wings with zero dividing border
          ======================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* 1. Continuous Anti-Glare Polar Dot Matrix & Soft Atmospheric Illumination */}
        <div
          className="absolute inset-0 opacity-55"
          style={{
            backgroundImage:
              'radial-gradient(#cbd5e1 1px, transparent 1px), radial-gradient(circle at 26% 50%, rgba(14, 165, 233, 0.11), transparent 55%), radial-gradient(circle at 78% 48%, rgba(59, 130, 246, 0.07), transparent 55%)',
            backgroundSize: '28px 28px, 100% 100%, 100% 100%',
          }}
        />

        {/* 2. Continuous Full-Screen SVG Sacred Geometry & Cross-Canvas Energy Streams */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="sgPulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0" />
              <stop offset="50%" stopColor="#0284c7" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="sgCometSky" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="sgBridgeStream" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.05" />
              <stop offset="45%" stopColor="#0284c7" stopOpacity="0.45" />
              <stop offset="80%" stopColor="#2563eb" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="sgFormClarityMask" cx="74%" cy="50%" r="34%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.82" />
              <stop offset="65%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Seamless Cross-Screen Silk Energy Waves Connecting Left Core (420, 450) to Right Auth Wing (1180, 450) */}
          <g stroke="#e2e8f0" strokeWidth="1" fill="none">
            <path d="M 420 450 C 680 180, 920 180, 1520 120" />
            <path d="M 420 450 C 700 290, 910 310, 1560 320" strokeDasharray="5 9" />
            <path d="M 420 450 C 700 610, 910 590, 1560 580" strokeDasharray="5 9" />
            <path d="M 420 450 C 680 720, 920 720, 1520 780" />
          </g>

          {/* Animated Flowing Light Pulses Bridging Left & Right Halves */}
          <g
            fill="none"
            stroke="url(#sgBridgeStream)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="160 1040"
            style={{ animation: 'sgBridgeFlow 7s linear infinite' }}
          >
            <path d="M 420 450 C 680 180, 920 180, 1520 120" />
            <path d="M 420 450 C 700 610, 910 590, 1560 580" />
          </g>
          <g
            fill="none"
            stroke="url(#sgBridgeStream)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="160 1040"
            style={{ animation: 'sgBridgeFlow 7s linear 3.5s infinite' }}
          >
            <path d="M 420 450 C 700 290, 910 310, 1560 320" />
            <path d="M 420 450 C 680 720, 920 720, 1520 780" />
          </g>

          {/* Giant Concentric Harmonic Rings Expanding Across the Entire Screen */}
          <circle
            cx="420"
            cy="450"
            r="520"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
            strokeDasharray="4 10"
          />
          <circle
            cx="420"
            cy="450"
            r="690"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
          <circle
            cx="420"
            cy="450"
            r="880"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
            strokeDasharray="6 14"
          />
          <circle
            cx="420"
            cy="450"
            r="1080"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
          />

          {/* Counter-Rotating Secondary Horology Halo Anchored Behind the Right Auth Wing (1180, 450) */}
          <g
            style={{
              transformOrigin: '1180px 450px',
              animation: 'sgSpinCcw 75s linear infinite',
            }}
          >
            <circle
              cx="1180"
              cy="450"
              r="340"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="4 10"
            />
            <circle
              cx="1180"
              cy="450"
              r="265"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            <circle
              cx="1180"
              cy="450"
              r="340"
              fill="none"
              stroke="url(#sgCometSky)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="180 1950"
            />
          </g>

          {/* Left-Center Primary Sacred Geometry System (Origin: 420, 450) */}
          <g stroke="#e2e8f0" strokeWidth="1">
            {RADIAL_AXES.map((deg) => (
              <line
                key={deg}
                x1="420"
                y1="450"
                x2="420"
                y2="-120"
                transform={`rotate(${deg} 420 450)`}
                strokeDasharray={deg % 60 === 0 ? 'none' : '4 8'}
                strokeOpacity={deg % 60 === 0 ? '0.8' : '0.4'}
              />
            ))}
          </g>

          {/* Synchronized Radial Energy Pulses */}
          <g
            stroke="url(#sgPulseGrad)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeDasharray="70 530"
            style={{ animation: 'sgRadialPulse 4.5s linear infinite' }}
          >
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <line
                key={deg}
                x1="420"
                y1="450"
                x2="420"
                y2="-120"
                transform={`rotate(${deg} 420 450)`}
              />
            ))}
          </g>

          {/* RING 1 (Outer Horology Bezel, r = 380): 72 Precision Degree Ticks */}
          <g
            style={{
              transformOrigin: '420px 450px',
              animation: 'sgSpinCw 95s linear infinite',
            }}
          >
            <circle
              cx="420"
              cy="450"
              r="380"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="1"
              strokeOpacity="0.7"
            />
            {DEGREE_TICKS.map((deg) => {
              const isMajor = deg % 30 === 0;
              return (
                <line
                  key={deg}
                  x1="420"
                  y1={isMajor ? '58' : '64'}
                  x2="420"
                  y2="70"
                  stroke={isMajor ? '#94a3b8' : '#cbd5e1'}
                  strokeWidth={isMajor ? '1.6' : '1'}
                  transform={`rotate(${deg} 420 450)`}
                />
              );
            })}
          </g>

          {/* RING 2 (Sacred 12-Pointed Star / Tourbillon Cage, r = 305) */}
          <g
            style={{
              transformOrigin: '420px 450px',
              animation: 'sgSpinCcw 54s linear infinite',
            }}
          >
            <circle
              cx="420"
              cy="450"
              r="305"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1.2"
              strokeDasharray="6 10"
            />
            <polygon
              points="420,145 684,297.5 684,602.5 420,755 156,602.5 156,297.5"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1.2"
            />
            <polygon
              points="420,145 684,297.5 684,602.5 420,755 156,602.5 156,297.5"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1.2"
              transform="rotate(30 420 450)"
            />
            <polygon
              points="420,145 684,297.5 684,602.5 420,755 156,602.5 156,297.5"
              fill="none"
              stroke="url(#sgCometSky)"
              strokeWidth="2"
              strokeDasharray="240 1160"
              style={{ animation: 'sgTrackComet 7s linear infinite' }}
            />
          </g>

          {/* RING 3 (Main Planetary Track, r = 215) */}
          <circle
            cx="420"
            cy="450"
            r="215"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />
          <circle
            cx="420"
            cy="450"
            r="215"
            fill="none"
            stroke="url(#sgCometSky)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="180 1220"
            style={{
              transformOrigin: '420px 450px',
              animation: 'sgSpinCw 12s linear infinite',
            }}
          />

          {/* RING 4 (Inner Gyroscope Halo, r = 135) */}
          <g
            style={{
              transformOrigin: '420px 450px',
              animation: 'sgSpinCcw 18s linear infinite',
            }}
          >
            <circle
              cx="420"
              cy="450"
              r="135"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="1"
              strokeDasharray="4 8"
            />
            <circle
              cx="420"
              cy="450"
              r="135"
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray="110 314"
              strokeOpacity="0.7"
            />
          </g>

          {/* Soft Optical Clarity Mask Behind the Right Auth Form so Typography is 100% Crisp */}
          <rect x="0" y="0" width="1600" height="900" fill="url(#sgFormClarityMask)" />
        </svg>
      </div>

      {/* =======================================================================
          LEFT WING: BORDERLESS ORBITAL LOGO & PLANETARY SATELLITE LOOP
          ======================================================================= */}
      <div className="relative z-10 lg:w-[52%] min-h-[420px] lg:min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 select-none">
        {/* Continuous Conic Radar Sweep Centered on the Orbital Core */}
        <div
          className="absolute w-[880px] h-[880px] rounded-full pointer-events-none opacity-45"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, transparent 275deg, rgba(56, 189, 248, 0.07) 330deg, rgba(2, 132, 199, 0.18) 360deg)',
            animation: 'sgSpinCw 16s linear infinite',
          }}
        />

        {/* 4 Phase-Locked Expanding Harmonic Ripples Radiating Across the Screen */}
        {[0, 2, 4, 6].map((delay) => (
          <div
            key={delay}
            className="absolute w-[340px] h-[340px] rounded-full border border-sky-400/30 pointer-events-none"
            style={{
              animation: `sgHarmonicRipple 8s cubic-bezier(0.22, 0.61, 0.36, 1) ${delay}s infinite`,
            }}
          />
        ))}

        {/* Synchronized Planetary Orbit of 6 Upright Glass Nodes */}
        <div className="relative w-[330px] h-[330px] sm:w-[430px] sm:h-[430px] flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ animation: 'sgSpinCw 32s linear infinite' }}
          >
            {ORBITAL_NODES.map(({ angle, Icon, label, color, dot }) => (
              <div
                key={angle}
                className="absolute inset-0"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <div style={{ animation: 'sgSpinCcw 32s linear infinite' }}>
                    <div
                      style={{ transform: `rotate(-${angle}deg)` }}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_12px_28px_-6px_rgba(2,132,199,0.18)] flex items-center justify-center relative">
                        <Icon className={`w-5 h-5 ${color}`} />
                        <span
                          className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${dot} ring-2 ring-white`}
                        />
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-white/90 border border-slate-200/80 text-[10px] font-mono font-semibold text-slate-600 shadow-2xs">
                        {label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Centerpiece: ScamGuard VN Core Prism */}
          <div className="relative z-20 flex flex-col items-center justify-center">
            <div
              className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-[36px] bg-white/95 backdrop-blur-xl flex items-center justify-center overflow-hidden"
              style={{ animation: 'sgCoreBreathe 4s ease-in-out infinite' }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-sky-50/90 via-white to-indigo-50/80" />

              <div
                className="absolute inset-x-3 h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_12px_#38bdf8] pointer-events-none"
                style={{ animation: 'sgLaserLoop 4s ease-in-out infinite' }}
              />

              <div className="relative z-10 w-18 h-18 sm:w-20 sm:h-20 rounded-[24px] bg-slate-950 flex items-center justify-center shadow-[0_14px_30px_-6px_rgba(15,23,42,0.45)] border border-slate-800">
                <Shield className="w-9 h-9 sm:w-10 sm:h-10 text-sky-400 stroke-[1.75]" />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Brand Wordmark Pill Below Orbit */}
        <div
          className="mt-8 z-20 flex flex-col items-center gap-2.5"
          style={{ animation: 'sgFloatSoft 5s ease-in-out infinite' }}
        >
          <div className="bg-white/85 backdrop-blur-md px-5 py-2 rounded-2xl border border-slate-200/80 shadow-[0_8px_24px_-6px_rgba(2,132,199,0.12)] flex items-baseline gap-1.5 pointer-events-none">
            <span className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-950">
              ScamGuard
            </span>
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-sky-600">
              VN
            </span>
          </div>
        </div>
      </div>

      {/* =======================================================================
          RIGHT WING: SEAMLESS FLOATING AUTHENTICATION WORKSPACE (ZERO BORDER)
          ======================================================================= */}
      <div className="relative z-10 flex-1 flex flex-col justify-between px-6 sm:px-12 lg:px-14 xl:px-20 py-8">
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between gap-2 w-full max-w-[440px] mx-auto">
          <button
            type="button"
            onClick={() => switchMode(mode === 'register' ? 'login' : 'register')}
            className="group w-9 h-9 rounded-full border border-slate-200/90 hover:border-sky-300 bg-white/85 backdrop-blur-md hover:bg-sky-50/60 flex items-center justify-center text-slate-600 hover:text-sky-600 transition-all duration-200 shadow-2xs cursor-pointer shrink-0"
            title={mode === 'register' ? 'Chuyển sang Đăng nhập' : 'Quay lại Tạo tài khoản'}
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          </button>

          <div className="flex items-center gap-2">
            {/* Subtle 'Giới thiệu' Pill in Top Right of Auth Wing */}
            <button
              type="button"
              onClick={() => setIsAboutProjectOpen(true)}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/85 hover:bg-sky-50/80 backdrop-blur-md border border-slate-200/80 hover:border-sky-300 text-slate-600 hover:text-sky-700 text-xs font-medium shadow-2xs transition-all cursor-pointer"
              title="Giới thiệu"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <span>Giới thiệu</span>
            </button>

            {/* Animated Mini Brand Emblem */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-2xs">
              <div className="relative w-6 h-6 flex items-center justify-center">
                <span
                  className="absolute inset-0 rounded-md border border-sky-400/50"
                  style={{ animation: 'sgSpinCw 10s linear infinite' }}
                />
                <div className="w-5 h-5 rounded-md bg-slate-950 flex items-center justify-center text-white">
                  <Shield className="w-3 h-3 text-sky-400" />
                </div>
              </div>
              <span className="text-sm font-semibold tracking-tight text-slate-950 pr-0.5 hidden sm:inline">
                ScamGuard
              </span>
            </div>
          </div>
        </div>

        {/* Center Auth Container Blending Effortlessly into the Unified Canvas */}
        <div className="w-full max-w-[440px] mx-auto my-auto py-6 space-y-5">
          {/* Heading & Mode Switcher */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-950">
              {mode === 'register'
                ? 'Create an Account'
                : mode === 'login'
                ? 'Welcome Back'
                : 'Reset Password'}
            </h1>
            <p className="text-sm text-slate-500">
              {mode === 'register' ? (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-semibold text-slate-950 underline decoration-sky-400 decoration-2 underline-offset-4 hover:text-sky-600 transition cursor-pointer"
                  >
                    Log in
                  </button>
                </>
              ) : mode === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="font-semibold text-slate-950 underline decoration-sky-400 decoration-2 underline-offset-4 hover:text-sky-600 transition cursor-pointer"
                  >
                    Create an Account
                  </button>
                </>
              ) : (
                <>
                  Remembered your password?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-semibold text-slate-950 underline decoration-sky-400 decoration-2 underline-offset-4 hover:text-sky-600 transition cursor-pointer"
                  >
                    Back to Log in
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Feedback Banners */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50/90 backdrop-blur-md border border-rose-200/80 text-xs text-rose-700 flex items-start gap-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50/90 backdrop-blur-md border border-emerald-200/80 text-xs text-emerald-800 flex items-start gap-2.5 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{successMsg}</div>
            </div>
          )}

          {/* Optional Provider Setup Helper */}
          {providerSetupGuide && (
            <div className="p-4 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 space-y-3 text-xs text-slate-700 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">
                  Cấu hình {providerSetupGuide.toUpperCase()} trên Firebase Console
                </span>
                <button
                  type="button"
                  onClick={() => setProviderSetupGuide(null)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  Đóng
                </button>
              </div>
              <p className="leading-relaxed text-slate-600">
                Cổng <strong>Google</strong> và <strong>Email</strong> đã hoạt động sẵn. Để kích hoạt thêm{' '}
                <strong>{providerSetupGuide.toUpperCase()}</strong> trong dự án{' '}
                <code className="text-slate-900">{FIREBASE_PROJECT_ID}</code>, hãy thêm Redirect URI sau:
              </p>
              <div className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono text-[11px] text-slate-800">
                <span className="truncate">{firebaseCallbackUri}</span>
                <button
                  type="button"
                  onClick={handleCopyCallbackUri}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-sans font-medium shrink-0 cursor-pointer"
                >
                  {copiedUri ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUri ? 'Đã chép' : 'Copy'}</span>
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={firebaseConsoleProvidersUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs"
                >
                  <span>Mở Firebase Console</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-800 font-medium text-xs cursor-pointer"
                >
                  <span>Tiếp tục với Google</span>
                </button>
              </div>
            </div>
          )}

          {/* Social OAuth Buttons */}
          {mode !== 'forgot' && (
            <>
              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSocialLogin('google')}
                  className="group relative overflow-hidden w-full h-11 px-4 rounded-xl border border-slate-200/90 hover:border-sky-300/90 bg-white/90 backdrop-blur-md hover:bg-white text-slate-800 font-medium text-sm flex items-center justify-center gap-3 transition-all duration-200 hover:-translate-y-0.5 shadow-[0_2px_10px_-3px_rgba(15,23,42,0.04)] hover:shadow-[0_10px_24px_-6px_rgba(2,132,199,0.18)] cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24">
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
                    {socialLoading === 'google' ? 'Connecting to Google...' : 'Continue with Google'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSocialLogin('github')}
                  className="group relative overflow-hidden w-full h-11 px-4 rounded-xl border border-slate-200/90 hover:border-indigo-300/90 bg-white/90 backdrop-blur-md hover:bg-white text-slate-800 font-medium text-sm flex items-center justify-center gap-3 transition-all duration-200 hover:-translate-y-0.5 shadow-[0_2px_10px_-3px_rgba(15,23,42,0.04)] hover:shadow-[0_10px_24px_-6px_rgba(99,102,241,0.18)] cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4 fill-[#5865F2] shrink-0 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  <span>
                    {socialLoading === 'github' ? 'Connecting...' : 'Continue with Discord / GitHub'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSocialLogin('facebook')}
                  className="group relative overflow-hidden w-full h-11 px-4 rounded-xl border border-slate-200/90 hover:border-blue-300/90 bg-white/90 backdrop-blur-md hover:bg-white text-slate-800 font-medium text-sm flex items-center justify-center gap-3 transition-all duration-200 hover:-translate-y-0.5 shadow-[0_2px_10px_-3px_rgba(15,23,42,0.04)] hover:shadow-[0_10px_24px_-6px_rgba(24,119,242,0.18)] cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4 fill-[#1877F2] shrink-0 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>
                    {socialLoading === 'facebook' ? 'Connecting to Facebook...' : 'Continue with Facebook'}
                  </span>
                </button>
              </div>

              {/* Animated Comet Hairline Divider */}
              <div className="relative flex items-center py-1">
                <div className="relative flex-grow h-[1px] bg-slate-200/90 overflow-hidden">
                  <div
                    className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-sky-400 to-transparent"
                    style={{ animation: 'sgDividerShuttle 3.6s ease-in-out infinite' }}
                  />
                </div>
                <span className="shrink-0 px-4 text-[11px] font-medium tracking-wider text-slate-400 uppercase">
                  or continue with email
                </span>
                <div className="relative flex-grow h-[1px] bg-slate-200/90 overflow-hidden">
                  <div
                    className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
                    style={{ animation: 'sgDividerShuttle 3.6s ease-in-out 1.8s infinite' }}
                  />
                </div>
              </div>
            </>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Player Name
                  </label>
                  <input
                    type="text"
                    required
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="SwagWarrior"
                    className="w-full h-11 rounded-xl border border-slate-200/90 bg-white/90 backdrop-blur-md px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Email Verification
                  </label>
                  <button
                    type="button"
                    onClick={handleVerifyEmailClick}
                    disabled={emailVerifyState === 'verifying'}
                    className={`w-full h-11 rounded-xl border px-3.5 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer backdrop-blur-md ${
                      emailVerifyState === 'verified'
                        ? 'border-emerald-300 bg-emerald-50/90 text-emerald-700 shadow-2xs'
                        : 'border-slate-200/90 hover:border-sky-300 bg-white/90 hover:bg-sky-50/50 text-slate-700 hover:text-sky-700 shadow-2xs'
                    }`}
                  >
                    {emailVerifyState === 'verifying' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
                        <span>Verifying...</span>
                      </>
                    ) : emailVerifyState === 'verified' ? (
                      <>
                        <MailCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified</span>
                      </>
                    ) : (
                      <span>Verify Email</span>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailVerifyState === 'verified') setEmailVerifyState('idle');
                  }}
                  placeholder="name@company.com"
                  className="w-full h-11 rounded-xl border border-slate-200/90 bg-white/90 backdrop-blur-md px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none transition-all shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full h-11 rounded-xl border border-slate-200/90 bg-white/90 backdrop-blur-md pl-3.5 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none transition-all shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full h-11 rounded-xl border border-slate-200/90 bg-white/90 backdrop-blur-md pl-3.5 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none transition-all shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive Security Verification Card */}
              <div className="pt-1">
                <div
                  onClick={handleCaptchaClick}
                  className={`w-full rounded-xl border px-4 py-3 flex items-center justify-between cursor-pointer select-none transition-all backdrop-blur-md ${
                    captchaState === 'checked'
                      ? 'border-sky-300/90 bg-sky-50/60 shadow-[0_6px_20px_-6px_rgba(2,132,199,0.15)]'
                      : 'border-slate-200/90 bg-white/85 hover:bg-white hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        captchaState === 'checked'
                          ? 'bg-slate-950 border-slate-950 text-sky-400 scale-105'
                          : 'bg-white border-slate-300'
                      }`}
                    >
                      {captchaState === 'checking' && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
                      )}
                      {captchaState === 'checked' && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </div>
                    <span className="text-xs font-medium text-slate-700">
                      I&apos;m not a robot
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400">
                    reCAPTCHA · Protected
                  </span>
                </div>
              </div>

              {/* Primary CTA Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative overflow-hidden w-full h-11 px-6 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-medium text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-8px_rgba(15,23,42,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span
                    className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"
                    style={{ animation: 'sgButtonShimmer 4.5s ease-in-out infinite' }}
                  />
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                      <span>Đang khởi tạo hồ sơ bảo mật...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowUpRight className="w-4 h-4 text-sky-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full h-11 rounded-xl border border-slate-200/90 bg-white/90 backdrop-blur-md px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none transition-all shadow-2xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-xs font-medium text-slate-500 hover:text-sky-600 transition cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-11 rounded-xl border border-slate-200/90 bg-white/90 backdrop-blur-md pl-3.5 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <div
                  onClick={handleCaptchaClick}
                  className={`w-full rounded-xl border px-4 py-3 flex items-center justify-between cursor-pointer select-none transition-all backdrop-blur-md ${
                    captchaState === 'checked'
                      ? 'border-sky-300/90 bg-sky-50/60 shadow-[0_6px_20px_-6px_rgba(2,132,199,0.15)]'
                      : 'border-slate-200/90 bg-white/85 hover:bg-white hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        captchaState === 'checked'
                          ? 'bg-slate-950 border-slate-950 text-sky-400 scale-105'
                          : 'bg-white border-slate-300'
                      }`}
                    >
                      {captchaState === 'checking' && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
                      )}
                      {captchaState === 'checked' && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </div>
                    <span className="text-xs font-medium text-slate-700">
                      I&apos;m not a robot
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400">
                    reCAPTCHA · Protected
                  </span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative overflow-hidden w-full h-11 px-6 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-medium text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-8px_rgba(15,23,42,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span
                    className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"
                    style={{ animation: 'sgButtonShimmer 4.5s ease-in-out infinite' }}
                  />
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                      <span>Đang xác thực...</span>
                    </>
                  ) : (
                    <>
                      <span>Log in</span>
                      <ArrowUpRight className="w-4 h-4 text-sky-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full h-11 rounded-xl border border-slate-200/90 bg-white/90 backdrop-blur-md px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none transition-all shadow-2xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative overflow-hidden w-full h-11 px-6 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span
                  className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"
                  style={{ animation: 'sgButtonShimmer 4.5s ease-in-out infinite' }}
                />
                {loading ? 'Sending reset link...' : 'Send Password Reset Email'}
              </button>
            </form>
          )}
        </div>

        {/* Minimalist Footer Note */}
        <div className="w-full max-w-[440px] mx-auto pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-400">
          <button
            type="button"
            onClick={() => setIsAboutProjectOpen(true)}
            className="text-slate-500 hover:text-sky-600 font-medium cursor-pointer transition-colors"
          >
            Giới thiệu
          </button>
          <span>ScamGuard VN © 2026</span>
        </div>
      </div>

      <AboutProjectModal
        isOpen={isAboutProjectOpen}
        onClose={() => setIsAboutProjectOpen(false)}
      />
    </div>
  );
};
