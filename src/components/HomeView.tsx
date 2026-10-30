import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Swords,
  ChevronRight,
  Gift,
  PhoneCall,
  Compass,
  Activity,
  Dna,
  LayoutDashboard,
  FlaskConical,
  ArrowUpRight,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import { UserProfile, UserAccount, FriendUser, DailyQuest } from '../types';
import { RoadmapSnakePath } from './RoadmapSnakePath';
import { LeaderboardModal } from './LeaderboardModal';
import { MascotOwl } from './MascotOwl';
import { ExecutiveDashboardView } from './ExecutiveDashboardView';
import { useTranslation } from '../i18n/LanguageContext';

interface HomeViewProps {
  userProfile: UserProfile;
  currentUser?: UserAccount | null;
  realUsers?: UserProfile[];
  overallScore?: number;
  friendsList?: FriendUser[];
  dailyQuests?: DailyQuest[];
  onNavigate: (tab: any, subView?: string) => void;
  onOpenEmergency: () => void;
  onOpenFamilySchool: () => void;
  onOpenTrustedContacts: () => void;
  onOpenAuth?: () => void;
  onOpenFriends?: () => void;
  onOpenQuests?: () => void;
  onOpenCallSim?: () => void;
  onStartFriendDuel?: (friend: FriendUser) => void;
  onEarnXp?: (amount: number) => void;
  onOpenScienceFairDemo?: () => void;
  onOpenAboutProject?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  userProfile,
  currentUser,
  realUsers = [],
  overallScore = 0,
  dailyQuests = [],
  onNavigate,
  onOpenEmergency,
  onOpenQuests,
  onOpenCallSim,
  onEarnXp,
  onOpenScienceFairDemo,
  onOpenAboutProject,
}) => {
  const { t, language } = useTranslation();
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'EXECUTIVE_DASHBOARD' | 'ROADMAP_TRAINING'>('EXECUTIVE_DASHBOARD');

  useEffect(() => {
    const handleOpenRoadmap = () => {
      setViewMode('ROADMAP_TRAINING');
    };
    window.addEventListener('scamguard_open_roadmap', handleOpenRoadmap);
    return () => {
      window.removeEventListener('scamguard_open_roadmap', handleOpenRoadmap);
    };
  }, []);

  const completedQuestsCount = dailyQuests.filter((q) => q.completed).length;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative">
      {/* Workspace Mode Bar (Interactive Segmented Controls) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sky-200/80">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-900">ScamGuard Threat Defense Platform</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>{language === 'en' ? 'AI Dual-Engine Forensics v3.4' : 'Chuẩn giám định AI Dual-Engine v3.4'}</span>
          {onOpenAboutProject && (
            <>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <button
                type="button"
                onClick={onOpenAboutProject}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50/80 hover:bg-sky-100/80 text-sky-700 border border-sky-200/80 font-medium transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-sky-500 shrink-0" />
                <span>{language === 'en' ? 'About' : 'Giới thiệu'}</span>
              </button>
            </>
          )}
        </div>

        {/* Clean Interactive Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/90 border border-sky-200/80 rounded-xl text-xs shrink-0 self-start sm:self-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('EXECUTIVE_DASHBOARD')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              viewMode === 'EXECUTIVE_DASHBOARD'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>{t('ws_home')}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('ROADMAP_TRAINING')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              viewMode === 'ROADMAP_TRAINING'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{t('ws_roadmap')}</span>
          </button>
        </div>
      </div>

      {viewMode === 'EXECUTIVE_DASHBOARD' ? (
        <ExecutiveDashboardView
          userProfile={userProfile}
          currentUser={currentUser}
          overallScore={overallScore}
          onNavigate={onNavigate}
          onOpenEmergency={onOpenEmergency}
          onOpenScienceFairDemo={onOpenScienceFairDemo}
          onSwitchToRoadmap={() => setViewMode('ROADMAP_TRAINING')}
        />
      ) : (
        <div className="space-y-8">
          {/* 1. Enterprise Training Readiness Hero */}
          <div className="bg-gradient-to-b from-white to-[#F6FAFE] border border-sky-200/90 rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(2,132,199,0.06)] border-t-2 border-t-sky-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded border border-sky-200/80">Chương Trình Đào Tạo Nhận Thức An Ninh</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span>12 Phân khu mô phỏng</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="font-mono tabular-nums text-slate-600">Mô hình Mã hóa kép + Feynman (98% lưu giữ)</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Lộ Trình Huấn Luyện Phản Xạ & Khắc Sâu Trí Nhớ Vĩnh Cửu
                </h1>

                <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
                  Điểm phòng vệ cá nhân hiện tại đạt <strong className="text-sky-700 font-mono tabular-nums">{overallScore}/100</strong>. Trải nghiệm 12 phân khu với Khẩu quyết vần điệu 3 giây, Bàn giải phẫu X-Ray, Thẻ lật Leitner và phương pháp Feynman dạy lại cho người thân để nhớ 100% mãi mãi.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('check')}
                    className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
                  >
                    <Search className="w-4 h-4" />
                    <span>Giám Định Tin Nhắn & URL</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('train', 'arena')}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-sky-50 text-slate-700 text-xs font-semibold border border-sky-200/90 flex items-center gap-2 transition cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
                  >
                    <Swords className="w-4 h-4 text-sky-600" />
                    <span>Vào Thao Trường Mô Phỏng</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('learn')}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-sky-50 text-slate-700 text-xs font-semibold border border-sky-200/90 flex items-center gap-2 transition cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
                  >
                    <FlaskConical className="w-4 h-4 text-slate-500" />
                    <span>Cẩm Nang Phương Pháp Nhớ 100%</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-4 flex justify-center items-center">
                <MascotOwl
                  size="lg"
                  variant="hero-popout"
                  state={overallScore < 70 || userProfile.streakDays === 0 ? 'alert' : 'safe'}
                />
              </div>
            </div>
          </div>

          {/* 2. Full-Width Pedagogical Roadmap & Memory Mastery Workspace */}
          <div id="roadmap-path-section" className="space-y-4">
            <RoadmapSnakePath
              userProfile={userProfile}
              onNavigate={onNavigate}
              onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
              onEarnXp={onEarnXp}
              onOpenSurvey={onOpenScienceFairDemo}
            />
          </div>

          {/* 3. Three-Column Personnel Telemetry & Operations Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Personnel Telemetry Summary */}
            <div className="bg-gradient-to-b from-white to-[#F6FAFE] border border-sky-200/90 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-[0_4px_20px_-4px_rgba(2,132,199,0.06)] border-t-2 border-t-sky-500">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase font-mono">
                    Chỉ Số Năng Lực Cá Nhân
                  </h3>
                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    Chuẩn toàn quốc: 63.5/100
                  </span>
                </div>

                <div className="grid grid-cols-3 divide-x divide-sky-100 text-left">
                  <div className="pr-3">
                    <span className="text-[11px] text-slate-500 block">Điểm SDI</span>
                    <p className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                      {overallScore}/100
                    </p>
                    <span className="text-[11px] text-emerald-600 font-semibold">
                      {currentUser ? '✓ Đã xác thực' : 'Khách vãng lai'}
                    </span>
                  </div>

                  <div className="px-3">
                    <span className="text-[11px] text-slate-500 block">Chuỗi duy trì</span>
                    <p className="text-xl font-bold text-amber-600 font-mono tabular-nums mt-1">
                      {userProfile.streakDays ?? 0} ngày
                    </p>
                    <span className="text-[11px] text-slate-500">Liên tục</span>
                  </div>

                  <div className="pl-3">
                    <span className="text-[11px] text-slate-500 block">Điểm tích lũy</span>
                    <p className="text-xl font-bold text-sky-700 font-mono tabular-nums mt-1">
                      {userProfile.xp ?? 0} XP
                    </p>
                    <span className="text-[11px] text-slate-500">{realUsers.length} thành viên</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-sky-100 flex items-center justify-between">
                <div className="text-xs text-slate-600 flex items-center gap-2">
                  <Dna className="w-4 h-4 text-sky-600" />
                  <span>Hồ sơ 10 trục phản xạ Scam DNA</span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('scamdna')}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <span>Xem chi tiết</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Daily Training Quota */}
            <div className="bg-gradient-to-b from-white to-[#F6FAFE] border border-sky-200/90 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-[0_4px_20px_-4px_rgba(2,132,199,0.06)] border-t-2 border-t-sky-500">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase font-mono">
                    <Gift className="w-4 h-4 text-sky-600" />
                    <span>Chỉ Tiêu Huấn Luyện Hôm Nay</span>
                  </div>
                  <span className="text-xs font-mono tabular-nums font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    {completedQuestsCount} / 3 hoàn thành
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Hoàn thành bài tập phân tích tình huống và kiểm tra liên kết đáng ngờ để duy trì năng lực phòng vệ.
                </p>

                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                  <div
                    className="bg-sky-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(completedQuestsCount / 3) * 100}%` }}
                  />
                </div>
              </div>

              {onOpenQuests && (
                <button
                  type="button"
                  onClick={onOpenQuests}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-sky-50 text-slate-700 text-xs font-semibold border border-sky-200/80 transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap shadow-2xs"
                >
                  <span>Mở Danh Sách Chỉ Tiêu</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Direct Forensic & Simulation Tools */}
            <div className="bg-gradient-to-b from-white to-[#F6FAFE] border border-sky-200/90 rounded-2xl p-5 space-y-3 shadow-[0_4px_20px_-4px_rgba(2,132,199,0.06)] border-t-2 border-t-sky-500">
              <h3 className="text-xs font-bold text-slate-900 uppercase font-mono">
                Công Cụ Tác Chiến Trực Tiếp
              </h3>

              <div className="divide-y divide-sky-100">
                <button
                  type="button"
                  onClick={() => onNavigate('check')}
                  className="w-full py-3 flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-sky-700 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <Search className="w-4 h-4 text-sky-600" />
                    <span>Giám Định Tin Nhắn, URL & Hóa Đơn</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 transition-colors" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('train', 'arena')}
                  className="w-full py-3 flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-sky-700 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <Swords className="w-4 h-4 text-sky-600" />
                    <span>Thao Trường Mô Phỏng Kịch Bản</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 transition-colors" />
                </button>

                {onOpenCallSim && (
                  <button
                    type="button"
                    onClick={onOpenCallSim}
                    className="w-full py-3 flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-rose-600 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <PhoneCall className="w-4 h-4 text-rose-500" />
                      <span>Giả Lập Cuộc Gọi Deepfake AI</span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentUserProfile={userProfile}
        currentUser={currentUser}
        realUsers={realUsers}
      />
    </div>
  );
};
