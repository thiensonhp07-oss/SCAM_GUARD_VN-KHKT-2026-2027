import React from 'react';
import {
  Flame,
  Sparkles,
  X,
  Shield,
  CheckCircle2,
  Calendar,
  Gift,
  ArrowRight,
  ShieldCheck,
  Zap,
  Award,
  Users,
} from 'lucide-react';
import { playSuccessChime, playRewardTrophy } from '../utils/audioEffects';
import { useTranslation } from '../i18n/LanguageContext';

interface MetricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: 'home' | 'train' | 'leaderboard' | 'quests' | 'store' | 'profile' | 'more' | 'roadmap') => void;
}

interface StreakModalProps extends MetricModalProps {
  streakDays: number;
  gems?: number;
  onBuyFreeze?: () => void;
  hasFreeze?: boolean;
  onOpenFriends?: () => void;
  onCheckInStreak?: () => void;
}

export const StreakModal: React.FC<StreakModalProps> = ({
  isOpen,
  onClose,
  streakDays,
  gems = 0,
  onBuyFreeze,
  hasFreeze = false,
  onNavigate,
  onOpenFriends,
  onCheckInStreak,
}) => {
  const { language } = useTranslation();
  if (!isOpen) return null;

  const isEn = language === 'en';

  // Calculate current day of week: Monday=0, Tuesday=1, ... Sunday=6
  const now = new Date();
  const currentDayIndex = (now.getDay() + 6) % 7; // 0 for Mon, 6 for Sun
  const todayStr = now.toISOString().split('T')[0];
  const isTodayCompleted =
    typeof window !== 'undefined' &&
    localStorage.getItem('scamguard_streak_last_date') === todayStr;

  // Compute how many days are active this week
  const activeDaysThisWeekCount = Math.min(
    7,
    Math.max(1, isTodayCompleted ? currentDayIndex + 1 : currentDayIndex)
  );

  const weekDayLabels = isEn
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  const weekDays = weekDayLabels.map((label, idx) => {
    const active = idx < currentDayIndex || (idx === currentDayIndex && isTodayCompleted);
    const isToday = idx === currentDayIndex;
    return {
      label,
      active,
      isToday,
    };
  });

  const progressPercent = Math.min(
    100,
    Math.max(14, Math.round((activeDaysThisWeekCount / 7) * 100))
  );

  const milestones = [
    { days: 3, title: isEn ? 'Steady Recruit' : 'Tân Binh Bền Bỉ', reward: '+50 XP', icon: '🥉' },
    { days: 7, title: isEn ? 'Golden Week Guardian' : 'Vệ Binh Tuần Lễ Vàng', reward: '+100 XP', icon: '🥈' },
    { days: 14, title: isEn ? 'Steel Reflexes' : 'Phản Xạ Thép', reward: '+250 XP', icon: '🥇' },
    { days: 30, title: isEn ? 'Security Legend' : 'Huyền Thoại An Ninh', reward: '+500 XP', icon: '👑' },
  ];

  const handleInteractiveCheckIn = () => {
    if (onCheckInStreak) {
      onCheckInStreak();
    } else {
      localStorage.setItem('scamguard_streak_last_date', todayStr);
      localStorage.setItem('scamguard_streak_days', (streakDays + 1).toString());
      playRewardTrophy();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 text-left max-h-[92vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          title={isEn ? 'Close' : 'Đóng'}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold uppercase tracking-wider font-mono">
            <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>{isEn ? 'Cyber Defense Streak' : 'Chuỗi Rèn Luyện Phòng Thủ'}</span>
          </span>
          {isTodayCompleted && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>{isEn ? 'Completed Today' : 'Đã điểm danh'}</span>
            </span>
          )}
        </div>

        {/* Title + Subtitle + Flame Graphic Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
                {streakDays}
              </h2>
              <span className="text-xl sm:text-2xl font-bold text-amber-600">
                {isEn ? 'Days Streak' : 'Ngày Chuỗi'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isEn
                ? 'Practice daily cybersecurity reflexes to build permanent cognitive resilience!'
                : 'Duy trì phản xạ an ninh mạng mỗi ngày để bảo vệ chính bạn và người thân trước mọi bẫy lừa đảo!'}
            </p>
          </div>

          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center shadow-sm shrink-0">
            <Flame className="w-10 h-10 text-amber-500 fill-amber-500 animate-pulse" />
          </div>
        </div>

        {/* Interactive Check-in / Claim CTA */}
        {!isTodayCompleted ? (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white space-y-2.5 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider font-mono text-amber-100 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-yellow-300" />
                <span>{isEn ? 'Daily Check-in Available' : 'Điểm danh hôm nay để giữ chuỗi'}</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-white/20 text-white font-mono text-[11px] font-bold">
                +25 XP
              </span>
            </div>
            <p className="text-xs text-amber-50 leading-snug">
              {isEn
                ? 'Check in now to extend your defense streak and claim 25 bonus experience points!'
                : 'Bấm nút dưới đây để xác nhận rèn luyện hôm nay, kéo dài chuỗi ngày an toàn và nhận ngay 25 XP!'}
            </p>
            <button
              type="button"
              onClick={handleInteractiveCheckIn}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-amber-50 text-amber-900 font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{isEn ? 'Check In & Extend Streak (+25 XP)' : 'Điểm Danh Bảo Vệ Chuỗi Ngay (+25 XP)'}</span>
            </button>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-xs leading-snug">
              <p className="font-bold">
                {isEn ? 'Great job! Today’s streak is locked in.' : 'Tuyệt vời! Bạn đã bảo vệ chuỗi ngày hôm nay thành công.'}
              </p>
              <p className="text-emerald-700 text-[11px]">
                {isEn
                  ? 'Return tomorrow to continue your streak and earn milestone rewards.'
                  : 'Hãy quay lại vào ngày mai để tiếp tục nâng cao chuỗi phòng thủ nhé.'}
              </p>
            </div>
          </div>
        )}

        {/* Weekly Calendar Progress Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold px-1 text-slate-500 font-mono">
            <span>{isEn ? 'Weekly Habit Cadence' : 'Lịch Trình Điểm Danh Tuần'}</span>
            <span className="text-amber-700 font-semibold tabular-nums">
              {activeDaysThisWeekCount} / 7 {isEn ? 'days' : 'ngày'} ({progressPercent}%)
            </span>
          </div>

          {/* Daily Status Icons Grid */}
          <div className="grid grid-cols-7 gap-1.5 text-center py-1">
            {weekDays.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span
                  className={`text-[11px] font-bold font-mono ${
                    d.isToday
                      ? 'text-sky-700 font-extrabold'
                      : d.active
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {d.label}
                </span>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    d.active
                      ? 'bg-amber-500 text-white shadow-xs font-bold'
                      : d.isToday
                      ? 'bg-white border-2 border-dashed border-amber-400 text-amber-600 animate-pulse shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-300'
                  }`}
                >
                  {d.active ? (
                    <Flame className="w-4 h-4 fill-white text-white" />
                  ) : d.isToday ? (
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <span className="text-xs text-slate-300 font-bold">•</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar Track */}
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Streak Freeze & Protection Status */}
        <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900">
                {isEn ? 'Streak Freeze Protection' : 'Khiên Băng Bảo Toàn Chuỗi'}
              </p>
              <p className="text-slate-600 text-[11px]">
                {hasFreeze
                  ? isEn
                    ? 'Active: Protects your streak if you miss 1 day.'
                    : 'Đang bật: Bảo toàn chuỗi ngày nếu lỡ bận 1 ngày.'
                  : isEn
                  ? 'Inactive: Equip a freeze shield to protect against busy days.'
                  : 'Chưa kích hoạt: Trang bị khiên để không bị mất chuỗi khi bận.'}
              </p>
            </div>
          </div>

          {onBuyFreeze && (
            <button
              type="button"
              onClick={onBuyFreeze}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                hasFreeze
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-sky-600 hover:bg-sky-500 text-white shadow-xs'
              }`}
            >
              {hasFreeze
                ? isEn ? 'Equipped' : 'Đã Có Khiên'
                : isEn ? 'Equip Shield' : 'Bật Khiên'}
            </button>
          )}
        </div>

        {/* Milestones Horizontal List */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
            {isEn ? 'Milestone Rewards' : 'Cột Mốc Thăng Hạng Chuỗi'}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {milestones.map((m) => {
              const achieved = streakDays >= m.days;
              return (
                <div
                  key={m.days}
                  className={`p-3 rounded-xl border text-center space-y-1 transition ${
                    achieved
                      ? 'bg-amber-50/80 border-amber-300 text-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="text-lg">{m.icon}</div>
                  <div className="font-bold font-mono text-[11px]">
                    {m.days} {isEn ? 'Days' : 'Ngày'}
                  </div>
                  <div className="text-[10px] text-slate-600 leading-tight truncate">
                    {m.title}
                  </div>
                  <div className={`text-[10px] font-mono font-bold ${achieved ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {achieved ? '✓ ' + (isEn ? 'Claimed' : 'Đã đạt') : m.reward}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Action Navigation */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigate('roadmap');
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
          >
            <span>{isEn ? 'Continue Training Roadmap' : 'Vào Lộ Trình Huấn Luyện'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {onOpenFriends && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFriends();
              }}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>{isEn ? 'Friends Streak' : 'Đua Streak Bạn Bè'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const GemsModal: React.FC<any> = () => null;
export const HeartsModal: React.FC<any> = () => null;

interface StreakCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  oldStreak: number;
  newStreak: number;
}

export const StreakCelebrationModal: React.FC<StreakCelebrationModalProps> = ({
  isOpen,
  onClose,
  newStreak,
}) => {
  const { language } = useTranslation();
  if (!isOpen) return null;

  const isEn = language === 'en';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 animate-scale-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Giant Flaming Pulsing Emblem */}
        <div className="relative w-24 h-24 mx-auto rounded-3xl bg-amber-50 border-2 border-amber-300 p-2 flex items-center justify-center shadow-lg">
          <Flame className="w-14 h-14 text-amber-500 fill-amber-500 animate-pulse" />
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-sm whitespace-nowrap">
            +1 {isEn ? 'DAY STREAK' : 'NGÀY CHUỖI'}
          </div>
        </div>

        {/* Fiery Title & Increment Count */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-amber-600">
            {isEn ? 'DEFENSE REFLEX EXTENDED' : 'CHUỖI PHẢN XẠ ĐÃ ĐƯỢC BẢO VỆ'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
            {newStreak} {isEn ? 'DAYS!' : 'NGÀY!'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
            {isEn
              ? 'You have maintained your vigilance and lengthened your continuous cybersecurity streak!'
              : 'Bạn đã hoàn thành rèn luyện hôm nay và duy trì phản xạ an ninh mạng liên tục!'}
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{isEn ? 'Cognitive Defense Habit' : 'Thói Quen Vệ Binh An Toàn'}</span>
            </span>
            <span className="text-amber-700 font-mono font-bold">
              {newStreak} {isEn ? 'Days' : 'Ngày'}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all duration-700" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Confirm Claim Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wide shadow-sm cursor-pointer flex items-center justify-center gap-2 transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isEn ? 'CLAIM & CONTINUE' : 'NHẬN THÀNH TÍCH & TIẾP TỤC'}</span>
        </button>
      </div>
    </div>
  );
};
