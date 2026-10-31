/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DuolingoSidebar } from './components/DuolingoSidebar';
import { DuolingoRightSidebar } from './components/DuolingoRightSidebar';
import { HomeView } from './components/HomeView';
import { CheckScamView } from './components/CheckScamView';
import { TrainHubView } from './components/TrainHubView';
import { ProgressView } from './components/ProgressView';
import { LearnView } from './components/LearnView';
import { LeaderboardView } from './components/LeaderboardView';
import { DailyQuestsView } from './components/DailyQuestsView';
import { SupplyStoreView } from './components/SupplyStoreView';
import { ProfileView } from './components/ProfileView';
import { MoreToolsView } from './components/MoreToolsView';
import { EmergencyModal } from './components/EmergencyModal';
import { TrustedContactsModal } from './components/TrustedContactsModal';
import { FamilySchoolModal } from './components/FamilySchoolModal';
import { PrivacyCenterModal } from './components/PrivacyCenterModal';
import { AuthGate } from './components/AuthGate';
import { FriendsHubModal } from './components/FriendsHubModal';
import { FriendDuelModal } from './components/FriendDuelModal';
import { DailyQuestsModal } from './components/DailyQuestsModal';
import { LiveCallSimulatorModal } from './components/LiveCallSimulatorModal';
import { ScreenSentinelModal } from './components/ScreenSentinelModal';
import { ScamSpeechDecoderModal } from './components/ScamSpeechDecoderModal';
import { PublicWifiNfcShieldModal } from './components/PublicWifiNfcShieldModal';
import { LiveScamRadarModal } from './components/LiveScamRadarModal';
import { StreakModal, GemsModal, HeartsModal, StreakCelebrationModal } from './components/MetricsModals';
import { ThemeCustomizerModal } from './components/ThemeCustomizerModal';
import { UtilityFooter } from './components/UtilityFooter';
import { ResearchCenterView } from './components/ResearchCenterView';
import { ScamDnaView } from './components/ScamDnaView';
import { NationalScienceFairDemoModal } from './components/NationalScienceFairDemoModal';
import { RoadmapSnakePath } from './components/RoadmapSnakePath';
import { LeaderboardModal } from './components/LeaderboardModal';
import { NotificationsModal } from './components/NotificationsModal';
import { MobileDrawerMenu } from './components/MobileDrawerMenu';
import { AboutProjectModal } from './components/AboutProjectModal';
import { Compass } from 'lucide-react';
import {
  ExperienceMode,
  Language,
  ScamScenario,
  TrustedContact,
  UserProfile,
  UserAccount,
  FriendUser,
  DailyQuest,
  FriendActivityEvent,
  SocialPost,
  ReactionType,
  SocialComment,
  ScamTactic,
} from './types';
import { LanguageProvider } from './i18n/LanguageContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { INITIAL_FRIENDS, INITIAL_QUESTS, INITIAL_ACTIVITY_FEED, INITIAL_SOCIAL_POSTS } from './data/friendsData';
import { SCAM_SCENARIOS } from './data/scenarios';
import { playSuccessChime, playRewardTrophy } from './utils/audioEffects';
import { syncLiveSurveysWithServer } from './services/researchDataService';
import {
  subscribeToFirebaseAuth,
  subscribeToUserFirestoreDoc,
  subscribeToAllRealUsers,
  subscribeToRealSocialPosts,
  saveRealSocialPostToFirestore,
  syncUserProfileToFirestore,
  logoutFromFirebase,
} from './services/firebaseAuthService';
import {
  ThemeConfig,
  getStoredThemeConfig,
  applyThemeToDom,
  saveThemeConfig,
} from './utils/themeManager';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'home' | 'train' | 'check' | 'learn' | 'progress' | 'leaderboard' | 'quests' | 'store' | 'profile' | 'more' | 'research' | 'scamdna' | 'roadmap'
  >('home');
  const [trainSubTab, setTrainSubTab] = useState<'arena' | 'quishing' | 'deepfake' | 'drills'>('arena');
  const [progressSubTab, setProgressSubTab] = useState<string>('all');
  const [checkSubTab, setCheckSubTab] = useState<'smart_link' | 'fake_bill' | 'threat_intel' | 'blacklist' | 'pii_redact'>('smart_link');
  const [learnTactic, setLearnTactic] = useState<ScamTactic | null>(null);
  const [selectedQuishId, setSelectedQuishId] = useState<string | null>(null);
  const [selectedDeepfakeId, setSelectedDeepfakeId] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<ScamScenario | null>(null);

  // Theme & Appearance State
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(getStoredThemeConfig);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  useEffect(() => {
    applyThemeToDom(themeConfig);
  }, [themeConfig]);

  // Modals state
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isTrustedContactsOpen, setIsTrustedContactsOpen] = useState(false);
  const [isFamilySchoolOpen, setIsFamilySchoolOpen] = useState(false);
  const [isPrivacyCenterOpen, setIsPrivacyCenterOpen] = useState(false);

  // Social & Gamification Modals
  const [isFriendsHubOpen, setIsFriendsHubOpen] = useState(false);
  const [isDuelOpen, setIsDuelOpen] = useState(false);
  const [activeDuelFriend, setActiveDuelFriend] = useState<FriendUser | null>(null);
  const [isDailyQuestsOpen, setIsDailyQuestsOpen] = useState(false);
  const [isCallSimulatorOpen, setIsCallSimulatorOpen] = useState(false);
  const [isScreenSentinelOpen, setIsScreenSentinelOpen] = useState(false);
  const [isSpeechDecoderOpen, setIsSpeechDecoderOpen] = useState(false);
  const [isWifiShieldOpen, setIsWifiShieldOpen] = useState(false);
  const [isScamRadarOpen, setIsScamRadarOpen] = useState(false);
  const [isScienceFairDemoOpen, setIsScienceFairDemoOpen] = useState(false);
  const [isAboutProjectOpen, setIsAboutProjectOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Real Accounts & Social Data State from Cloud Firestore (0 when nobody has logged in)
  const [realUsers, setRealUsers] = useState<UserProfile[]>([]);
  const [friends, setFriends] = useState<FriendUser[]>(INITIAL_FRIENDS);
  const [activityFeed, setActivityFeed] = useState<FriendActivityEvent[]>(INITIAL_ACTIVITY_FEED);
  const [posts, setPosts] = useState<SocialPost[]>(INITIAL_SOCIAL_POSTS);
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>(INITIAL_QUESTS);
  const [chestsCount, setChestsCount] = useState(0);

  const handleAddPost = (newPost: SocialPost) => {
    setPosts((prev) => [newPost, ...prev]);
    saveRealSocialPostToFirestore(newPost);
    handleEarnXp(90);
  };

  const handleReactPost = (postId: string, reaction: ReactionType) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isSameReaction = p.myReaction === reaction;
          const prevReaction = p.myReaction;
          const newMyReaction = isSameReaction ? undefined : reaction;

          const newReactions = { ...p.reactions };
          if (prevReaction) {
            newReactions[prevReaction] = Math.max(0, newReactions[prevReaction] - 1);
          }
          if (!isSameReaction) {
            newReactions[reaction] = (newReactions[reaction] || 0) + 1;
          }

          const updated = {
            ...p,
            myReaction: newMyReaction,
            reactions: newReactions,
          };
          saveRealSocialPostToFirestore(updated);
          return updated;
        }
        return p;
      })
    );
  };

  const handleAddComment = (postId: string, commentText: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newComment: SocialComment = {
            id: `c_${Date.now()}`,
            userId: currentUser?.id || 'unauthenticated',
            userName: currentUser?.name || userProfile.name || 'Tài khoản Vệ Binh',
            userAvatar:
              currentUser?.avatarUrl ||
              userProfile.avatarUrl ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face',
            content: commentText,
            timestamp: new Date().toLocaleString('vi-VN'),
            likesCount: 0,
          };
          const updated = {
            ...p,
            commentsCount: (p.commentsCount || p.comments.length) + 1,
            comments: [newComment, ...p.comments],
          };
          saveRealSocialPostToFirestore(updated);
          return updated;
        }
        return p;
      })
    );
  };

  const handleSharePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const updated = {
            ...p,
            sharesCount: p.sharesCount + 1,
          };
          saveRealSocialPostToFirestore(updated);
          return updated;
        }
        return p;
      })
    );
    handleEarnXp(30);
  };

  const handleToggleFollowUser = (userId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.userId === userId) {
          const nextState = !p.isFollowing;
          const delta = nextState ? 1 : -1;
          return {
            ...p,
            isFollowing: nextState,
            followersCount: Math.max(0, p.followersCount + delta),
          };
        }
        return p;
      })
    );

    setFriends((prev) =>
      prev.map((f) => {
        if (f.id === userId) {
          const nextState = !f.isFollowing;
          const delta = nextState ? 1 : -1;
          return {
            ...f,
            isFollowing: nextState,
            followersCount: Math.max(0, (f.followersCount || 0) + delta),
          };
        }
        return f;
      })
    );
  };

  // Gamification Metrics State
  const [gems, setGems] = useState(0);
  const [lives, setLives] = useState(5);
  const [hasStreakFreeze, setHasStreakFreeze] = useState(false);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [isGemsModalOpen, setIsGemsModalOpen] = useState(false);
  const [isHeartsModalOpen, setIsHeartsModalOpen] = useState(false);
  const [isStreakCelebrationOpen, setIsStreakCelebrationOpen] = useState(false);
  const [prevStreakValue, setPrevStreakValue] = useState(0);

  const handleRefillLives = () => {
    if (gems >= 100 && lives < 5) {
      setGems((prev) => prev - 100);
      setLives(5);
    }
  };

  const handleBuyStreakFreeze = () => {
    if (gems >= 200 && !hasStreakFreeze) {
      setGems((prev) => prev - 200);
      setHasStreakFreeze(true);
    }
  };

  const handleExtendStreak = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastDate = localStorage.getItem('scamguard_streak_last_date');

    if (lastDate !== todayStr) {
      const oldVal = userProfile.streakDays || 0;
      const newVal = oldVal + 1;
      setPrevStreakValue(oldVal);
      setUserProfile((prev) => {
        const updated = {
          ...prev,
          streakDays: newVal,
          xp: (prev.xp ?? 0) + 25,
          overallScore: Math.min(100, (prev.overallScore ?? 0) + 1),
        };
        if (currentUser && currentUser.id && currentUser.id !== 'unauthenticated') {
          syncUserProfileToFirestore(currentUser.id, updated);
        }
        return updated;
      });
      localStorage.setItem('scamguard_streak_days', newVal.toString());
      localStorage.setItem('scamguard_streak_last_date', todayStr);
      setIsStreakCelebrationOpen(true);
      playRewardTrophy();
    }
  };

  // User & Auth State (Mandatory Sign Up / Sign In gate before entering the main web app)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  const createEmptyUnauthenticatedProfile = (): UserProfile => ({
    id: 'unauthenticated',
    name: 'Chưa đăng nhập',
    mode: 'adult',
    language: 'vi',
    overallScore: 0,
    xp: 0,
    gems: 0,
    streakDays: 0,
    completedScenarios: [],
    trustedContacts: [],
    createdAt: new Date().toISOString(),
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    localStorage.removeItem('scamguard_guest_profile');
    return createEmptyUnauthenticatedProfile();
  });

  // Subscribe to real users and real social posts from Cloud Firestore
  useEffect(() => {
    const unsubUsers = subscribeToAllRealUsers((users) => {
      setRealUsers(users);
    });
    const unsubPosts = subscribeToRealSocialPosts((livePosts) => {
      setPosts(livePosts);
    });
    return () => {
      unsubUsers();
      unsubPosts();
    };
  }, []);

  // Derive real friends list from real registered accounts in Firestore
  useEffect(() => {
    const mappedFriends: FriendUser[] = realUsers
      .filter((u) => !currentUser || u.id !== currentUser.id)
      .map((u) => ({
        id: u.id || 'user',
        friendCode: `SG-${(u.username || u.name || 'USER').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5)}-${(u.id || '000').slice(-3).toUpperCase()}`,
        name: u.name || u.username || 'Tài khoản Vệ Binh',
        username: u.username || (u.email ? u.email.split('@')[0] : 'vebinh'),
        avatarUrl:
          u.avatarUrl ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face',
        overallScore: u.overallScore ?? 0,
        xp: u.xp ?? 0,
        streakDays: u.streakDays ?? 0,
        isOnline: true,
        level: Math.max(1, Math.floor((u.xp ?? 0) / 500) + 1),
        mode: u.mode || 'adult',
        lastActive: u.updatedAt ? new Date(u.updatedAt).toLocaleDateString('vi-VN') : 'Trực tuyến',
        giftReceivedToday: false,
        giftSentToday: false,
        isFavorite: false,
        shieldsCount: 1,
      }));
    setFriends(mappedFriends);
  }, [realUsers, currentUser?.id]);

  // Subscribe to real Firebase Auth state
  useEffect(() => {
    let unsubDoc: (() => void) | null = null;
    const unsubAuth = subscribeToFirebaseAuth(
      (account) => {
        if (unsubDoc) {
          unsubDoc();
          unsubDoc = null;
        }
        setCurrentUser(account);
        setUserProfile(account.profile);
        setIsAuthLoading(false);
        unsubDoc = subscribeToUserFirestoreDoc(account.id, (liveProfile) => {
          setUserProfile(liveProfile);
          setCurrentUser((prev) => (prev ? { ...prev, profile: liveProfile } : prev));
        });
      },
      () => {
        if (unsubDoc) {
          unsubDoc();
          unsubDoc = null;
        }
        setCurrentUser(null);
        setUserProfile(createEmptyUnauthenticatedProfile());
        setIsAuthLoading(false);
      }
    );
    return () => {
      unsubAuth();
      if (unsubDoc) unsubDoc();
    };
  }, []);

  // Synchronize live community surveys across all devices (PC, Phone, Tablet)
  useEffect(() => {
    syncLiveSurveysWithServer();
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        syncLiveSurveysWithServer();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Sync survey completion & roadmap progress directly to userProfile & Cloud Firestore `users/{uid}`
  useEffect(() => {
    const handleSurveyCompletedSync = (e?: any) => {
      let parsedSurvey = e?.detail || null;
      if (!parsedSurvey) {
        try {
          const raw =
            localStorage.getItem('scamguard_survey_submission') ||
            localStorage.getItem('visef_my_latest_survey');
          if (raw) parsedSurvey = JSON.parse(raw);
        } catch {
          // ignore
        }
      }

      setUserProfile((prev) => {
        if (prev.hasCompletedSurvey && (!parsedSurvey || prev.surveyData?.id === parsedSurvey?.id)) {
          return prev;
        }
        const next: UserProfile = {
          ...prev,
          hasCompletedSurvey: true,
          surveyData: parsedSurvey || prev.surveyData || null,
        };
        if (currentUser && currentUser.id && currentUser.id !== 'unauthenticated') {
          syncUserProfileToFirestore(currentUser.id, {
            hasCompletedSurvey: true,
            surveyData: next.surveyData,
          });
        }
        return next;
      });
    };

    const handleRoadmapNodesSync = (e?: any) => {
      const nodes: string[] = Array.isArray(e?.detail) ? e.detail : [];
      setUserProfile((prev) => {
        if (
          Array.isArray(prev.completedRoadmapNodes) &&
          prev.completedRoadmapNodes.length === nodes.length &&
          prev.completedRoadmapNodes.every((n, i) => n === nodes[i])
        ) {
          return prev;
        }
        const next: UserProfile = {
          ...prev,
          completedRoadmapNodes: nodes,
        };
        if (currentUser && currentUser.id && currentUser.id !== 'unauthenticated') {
          syncUserProfileToFirestore(currentUser.id, {
            completedRoadmapNodes: nodes,
          });
        }
        return next;
      });
    };

    const handleOpenUnifiedSurvey = () => {
      setIsScienceFairDemoOpen(true);
    };

    window.addEventListener('visef_survey_updated', handleSurveyCompletedSync);
    window.addEventListener('scamguard_survey_completed', handleSurveyCompletedSync);
    window.addEventListener('scamguard_roadmap_progress_updated', handleRoadmapNodesSync);
    window.addEventListener('scamguard_open_visef_survey', handleOpenUnifiedSurvey);
    return () => {
      window.removeEventListener('visef_survey_updated', handleSurveyCompletedSync);
      window.removeEventListener('scamguard_survey_completed', handleSurveyCompletedSync);
      window.removeEventListener('scamguard_roadmap_progress_updated', handleRoadmapNodesSync);
      window.removeEventListener('scamguard_open_visef_survey', handleOpenUnifiedSurvey);
    };
  }, [currentUser?.id]);

  const handleLoginSuccess = async (account: UserAccount) => {
    const cleanProfile: UserProfile = {
      ...account.profile,
      xp: account.profile.xp ?? 0,
      streakDays: account.profile.streakDays ?? 0,
      overallScore: account.profile.overallScore ?? 0,
      completedScenarios: account.profile.completedScenarios || [],
      completedRoadmapNodes: account.profile.completedRoadmapNodes || [],
      masteredFlashcards: account.profile.masteredFlashcards || [],
      hasCompletedSurvey: Boolean(account.profile.hasCompletedSurvey),
      surveyData: account.profile.surveyData || null,
      mode: account.profile.mode || 'adult',
    };

    if (account.token) {
      localStorage.setItem('scamguard_token', account.token);
    }

    const updatedAccount = {
      ...account,
      profile: cleanProfile,
    };

    setCurrentUser(updatedAccount);
    setUserProfile(cleanProfile);
    setIsAuthLoading(false);

    await syncUserProfileToFirestore(account.id, cleanProfile);

    // If new user or survey not completed yet, automatically open survey diagnosis to unlock roadmap
    if (!cleanProfile.hasCompletedSurvey) {
      setActiveTab('home');
      setTimeout(() => {
        setIsScienceFairDemoOpen(true);
      }, 500);
    }
  };

  const handleLogout = async () => {
    await logoutFromFirebase();
    localStorage.removeItem('scamguard_token');
    localStorage.removeItem('scamguard_guest_profile');
    setCurrentUser(null);
    setUserProfile(createEmptyUnauthenticatedProfile());
  };

  const handleModeChange = (mode: ExperienceMode) => {
    setUserProfile((prev) => ({ ...prev, mode }));
    if (currentUser) {
      updateServerProfile({ mode });
    }
  };

  const handleLanguageChange = (language: Language) => {
    setUserProfile((prev) => ({ ...prev, language }));
    if (currentUser) {
      updateServerProfile({ language });
    }
  };

  const updateServerProfile = async (updates: Partial<UserProfile>) => {
    const token = localStorage.getItem('scamguard_token');
    if (!token) return;

    try {
      await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
    } catch (e) {
      console.error('Failed to sync profile update', e);
    }
  };

  const handleNavigate = (
    tab: 'home' | 'train' | 'check' | 'learn' | 'progress' | 'leaderboard' | 'quests' | 'store' | 'profile' | 'more' | 'research' | 'scamdna' | 'roadmap',
    subView?: string
  ) => {
    setActiveTab(tab);

    // Modal triggers directly from search or buttons
    if (subView === 'radar') {
      setIsScamRadarOpen(true);
      return;
    }
    if (subView === 'wifi-shield') {
      setIsWifiShieldOpen(true);
      return;
    }
    if (subView === 'call-sim') {
      setIsCallSimulatorOpen(true);
      return;
    }

    // Train hub sub-tabs & cases
    if (tab === 'train') {
      if (subView && ['arena', 'quishing', 'deepfake', 'drills'].includes(subView)) {
        setTrainSubTab(subView as 'arena' | 'quishing' | 'deepfake' | 'drills');
      }
    }

    // Check scam sub-tabs
    if (tab === 'check') {
      if (subView && ['smart_link', 'fake_bill', 'threat_intel', 'blacklist', 'pii_redact'].includes(subView)) {
        setCheckSubTab(subView as any);
      } else if (subView === 'detect') {
        setCheckSubTab('smart_link');
      } else if (subView === 'domain') {
        setCheckSubTab('threat_intel');
      } else if (subView === 'pii') {
        setCheckSubTab('pii_redact');
      }
    }

    // Learn view tactics
    if (tab === 'learn' && subView) {
      setLearnTactic(subView as ScamTactic);
    }

    // Progress sub-tab
    if (tab === 'progress' && subView) {
      setProgressSubTab(subView);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEarnXp = (amount: number) => {
    handleExtendStreak();
    setUserProfile((prev) => {
      const updated = {
        ...prev,
        xp: (prev.xp ?? 0) + amount,
        overallScore: Math.min(100, (prev.overallScore ?? 0) + 1),
      };
      if (currentUser) {
        updateServerProfile({ xp: updated.xp, overallScore: updated.overallScore });
        syncUserProfileToFirestore(currentUser.id, updated);
      }
      return updated;
    });

    // Check if any quest can be progressed
    setDailyQuests((prev) =>
      prev.map((q) => {
        if (q.id === 'quest_arena' && !q.completed) {
          const current = Math.min(q.target, q.current + 1);
          return { ...q, current, completed: current >= q.target };
        }
        return q;
      })
    );
  };

  const handleStartFriendDuel = (friend: FriendUser) => {
    setActiveDuelFriend(friend);
    setIsFriendsHubOpen(false);
    setIsDuelOpen(true);
  };

  const handleClaimQuest = (questId: string, xpReward: number) => {
    setDailyQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, completed: true, claimed: true } : q))
    );
    handleEarnXp(xpReward);
    playRewardTrophy();
  };

  const handleOpenChest = () => {
    if (chestsCount <= 0) return;
    setChestsCount((c) => Math.max(0, c - 1));
    handleEarnXp(120);
    playRewardTrophy();
  };

  const handleSendShieldToFriend = (friendId: string) => {
    setFriends((prev) =>
      prev.map((f) => (f.id === friendId ? { ...f, streakDays: f.streakDays + 1, giftSentToday: true } : f))
    );
    handleEarnXp(25);
    playSuccessChime();
  };

  const handleAddFriend = (codeOrUser: string) => {
    const query = codeOrUser.trim().toLowerCase();
    const matchedRealUser = realUsers.find(
      (u) =>
        (u.username && u.username.toLowerCase() === query) ||
        (u.email && u.email.toLowerCase() === query) ||
        (u.name && u.name.toLowerCase() === query) ||
        (u.id && u.id.toLowerCase().includes(query))
    );
    if (!matchedRealUser) {
      return {
        success: false,
        message: 'Không tìm thấy tài khoản thật nào khớp với mã/tên này trên Cloud Firestore.',
      };
    }
    return {
      success: true,
      message: `Đã kết nối với tài khoản thật: ${matchedRealUser.name}!`,
    };
  };

  const handleLikeActivity = (activityId: string) => {
    setActivityFeed((prev) =>
      prev.map((act) =>
        act.id === activityId
          ? {
              ...act,
              likesCount: act.likedByMe ? act.likesCount - 1 : act.likesCount + 1,
              likedByMe: !act.likedByMe,
            }
          : act
      )
    );
    playSuccessChime();
  };

  const handleBroadcastSos = (message: string) => {
    const newEvent: FriendActivityEvent = {
      id: `act_${Date.now()}`,
      userId: userProfile.id || 'user_me',
      userName: currentUser?.name || userProfile.name || 'Bạn',
      userAvatar:
        currentUser?.avatarUrl ||
        userProfile.avatarUrl ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face',
      userMode: userProfile.mode,
      actionType: 'sos_shared',
      title: '🚨 Cảnh Báo Khẩn Cấp Được Chia Sẻ',
      description: message,
      timestamp: 'Vừa xong',
      likesCount: 1,
      likedByMe: true,
    };
    setActivityFeed((prev) => [newEvent, ...prev]);
  };

  const handleUpdateContacts = (contacts: TrustedContact[]) => {
    setUserProfile((prev) => {
      const updated = {
        ...prev,
        trustedContacts: contacts,
      };
      if (currentUser) {
        updateServerProfile({ trustedContacts: contacts });
      }
      return updated;
    });
  };

  const handleResetAllData = async () => {
    try {
      const token = localStorage.getItem('scamguard_token');
      await fetch('/api/account/reset-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (e) {
      console.warn('Reset server sync info:', e);
    }

    // Clear all client-side local storage
    localStorage.clear();

    // Reset profile and all state to 0
    setUserProfile({
      id: `user_${Date.now()}`,
      name: 'Tân Binh An Toàn',
      mode: 'adult',
      language: 'vi',
      overallScore: 50,
      xp: 0,
      streakDays: 0,
      completedScenarios: [],
      trustedContacts: [],
    });
    setCurrentUser(null);
    setGems(0);
    setLives(5);
    setHasStreakFreeze(false);
    setChestsCount(0);
    setDailyQuests(INITIAL_QUESTS.map((q) => ({ ...q, current: 0, completed: false, claimed: false })));

    // Emit data reset events
    window.dispatchEvent(new Event('scamguard_data_cleared'));
    window.dispatchEvent(new Event('scamguard_reset_data'));
  };

  const handleDataCleared = () => {
    handleResetAllData();
  };

  const onlineFriendsCount = friends.filter((f) => f.isOnline).length;
  const completedQuestsCount = dailyQuests.filter((q) => q.completed).length;

  if (isAuthLoading) {
    return (
      <div className="min-h-screen w-full bg-[#EAF0F8] flex flex-col items-center justify-center gap-3 text-slate-700 font-sans">
        <div className="w-10 h-10 rounded-xl border-2 border-sky-600 border-t-transparent animate-spin" />
        <span className="text-xs font-semibold tracking-wide text-slate-500">
          Đang kiểm tra phiên xác thực ScamGuard VN...
        </span>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthGate onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <LanguageProvider
      language={userProfile.language || 'vi'}
      onLanguageChange={handleLanguageChange}
    >
      <div className="min-h-screen bg-[#EAF0F8] text-slate-900 flex font-sans selection:bg-sky-600 selection:text-white pb-20 lg:pb-0">
        {/* Left Sidebar (Desktop) */}
        <DuolingoSidebar
          activeTab={activeTab}
          onSelectTab={(tab, sub) => handleNavigate(tab, sub)}
          onOpenEmergency={() => setIsEmergencyOpen(true)}
          onOpenAboutProject={() => setIsAboutProjectOpen(true)}
        />

        {/* Center Main Column */}
        <div className="flex-1 flex flex-col min-w-0 relative bg-[#EAF0F8]">
          {/* Subtle Anti-Glare Security Daylight Ambient Pattern */}
          <div
            className="absolute inset-0 pointer-events-none opacity-55"
            style={{
              backgroundImage:
                'radial-gradient(#94a3b8 1px, transparent 1px), radial-gradient(circle at 88% 8%, rgba(2, 132, 199, 0.08), transparent 45%), radial-gradient(circle at 12% 85%, rgba(37, 99, 235, 0.05), transparent 50%)',
              backgroundSize: '28px 28px, 100% 100%, 100% 100%',
            }}
          />

          {/* Top Main Navigation Header */}
          <Navbar
            activeTab={activeTab}
            userProfile={userProfile}
            currentUser={currentUser}
            onSelectTab={(tab, sub) => handleNavigate(tab, sub)}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
            onLogout={handleLogout}
            onOpenStreak={() => setIsStreakModalOpen(true)}
            onOpenScienceFairDemo={() => setIsScienceFairDemoOpen(true)}
            onOpenAboutProject={() => setIsAboutProjectOpen(true)}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onOpenChat={() => setIsFriendsHubOpen(true)}
            onOpenDrawer={() => setIsMobileDrawerOpen(true)}
            onLanguageChange={handleLanguageChange}
          />

          {/* Main Dynamic View Content */}
          <main className="flex-1 w-full relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                {activeTab === 'home' && (
                  <HomeView
                    userProfile={userProfile}
                    currentUser={currentUser}
                    realUsers={realUsers}
                    overallScore={userProfile.overallScore}
                    friendsList={friends}
                    dailyQuests={dailyQuests}
                    onNavigate={handleNavigate}
                    onOpenEmergency={() => setIsEmergencyOpen(true)}
                    onOpenFamilySchool={() => setIsFamilySchoolOpen(true)}
                    onOpenTrustedContacts={() => setIsTrustedContactsOpen(true)}
                    onOpenFriends={() => setIsFriendsHubOpen(true)}
                    onOpenQuests={() => setIsDailyQuestsOpen(true)}
                    onOpenCallSim={() => setIsCallSimulatorOpen(true)}
                    onStartFriendDuel={handleStartFriendDuel}
                    onEarnXp={handleEarnXp}
                    onOpenScienceFairDemo={() => setIsScienceFairDemoOpen(true)}
                    onOpenAboutProject={() => setIsAboutProjectOpen(true)}
                  />
                )}

                {activeTab === 'check' && (
                  <CheckScamView
                    subView={checkSubTab}
                    onOpenEmergency={() => setIsEmergencyOpen(true)}
                    onOpenSentinel={() => setIsScreenSentinelOpen(true)}
                  />
                )}

                {activeTab === 'learn' && (
                  <LearnView
                    initialTactic={learnTactic}
                    onNavigate={(tab, sub) => handleNavigate(tab as any, sub)}
                  />
                )}

                {activeTab === 'progress' && (
                  <ProgressView
                    userProfile={userProfile}
                    subTab={progressSubTab}
                    onNavigate={(tab, sub) => handleNavigate(tab as any, sub)}
                    onEarnXp={handleEarnXp}
                  />
                )}

                {activeTab === 'train' && (
                  <TrainHubView
                    subView={trainSubTab}
                    onSubViewChange={setTrainSubTab}
                    selectedScenario={selectedScenario}
                    onScenarioSelect={setSelectedScenario}
                    selectedQuishId={selectedQuishId}
                    selectedDeepfakeId={selectedDeepfakeId}
                    onCompleteScenario={(score) => {
                      setUserProfile((prev) => ({
                        ...prev,
                        overallScore: Math.round(((prev.overallScore ?? 0) + score) / 2),
                      }));
                    }}
                    onAddXp={handleEarnXp}
                  />
                )}

                {activeTab === 'leaderboard' && (
                  <LeaderboardView
                    currentUserProfile={userProfile}
                    currentUser={currentUser}
                    realUsers={realUsers}
                    posts={posts}
                    onAddPost={handleAddPost}
                    onReactPost={handleReactPost}
                    onAddComment={handleAddComment}
                    onSharePost={handleSharePost}
                    onToggleFollowUser={handleToggleFollowUser}
                    friends={friends}
                    onEarnXp={handleEarnXp}
                  />
                )}

                {activeTab === 'quests' && (
                  <DailyQuestsView
                    quests={dailyQuests}
                    onClaimQuest={(id, xp) => handleClaimQuest(id, xp)}
                    onOpenMysteryChest={(reward) => handleEarnXp(reward.amount || 50)}
                  />
                )}

                {activeTab === 'store' && (
                  <SupplyStoreView
                    userProfile={userProfile}
                    gems={userProfile.gems || 505}
                    onDeductGems={(amount) => {
                      setUserProfile((prev) => ({
                        ...prev,
                        gems: Math.max(0, (prev.gems || 505) - amount),
                      }));
                    }}
                    onRefillLives={handleRefillLives}
                    onEquipStreakFreeze={() => setHasStreakFreeze(true)}
                    onEarnXp={handleEarnXp}
                  />
                )}

                {activeTab === 'profile' && (
                  <ProfileView
                    userProfile={userProfile}
                    currentUser={currentUser}
                    currentThemeConfig={themeConfig}
                    onOpenAuth={() => {}}
                    onLoginSuccess={handleLoginSuccess}
                    onLogout={handleLogout}
                    onOpenTheme={() => setIsThemeModalOpen(true)}
                    onUpdateThemeConfig={setThemeConfig}
                    onNavigate={(tab, sub) => handleNavigate(tab as any, sub)}
                  />
                )}

                {activeTab === 'more' && (
                  <MoreToolsView
                    onOpenEmergency={() => setIsEmergencyOpen(true)}
                    onOpenFriends={() => setIsFriendsHubOpen(true)}
                    onOpenTrustedContacts={() => setIsTrustedContactsOpen(true)}
                    onOpenFamilySchool={() => setIsFamilySchoolOpen(true)}
                    onOpenPrivacyCenter={() => setIsPrivacyCenterOpen(true)}
                    onOpenCallSim={() => setIsCallSimulatorOpen(true)}
                    onOpenSentinel={() => setIsScreenSentinelOpen(true)}
                    onOpenDecoder={() => setIsSpeechDecoderOpen(true)}
                    onOpenRadar={() => setIsScamRadarOpen(true)}
                    onOpenWifiShield={() => setIsWifiShieldOpen(true)}
                    onOpenTheme={() => setIsThemeModalOpen(true)}
                    userProfile={userProfile}
                    onEarnXp={handleEarnXp}
                    posts={posts}
                    onAddPost={handleAddPost}
                    onReactPost={handleReactPost}
                    onAddComment={handleAddComment}
                    onSharePost={handleSharePost}
                    onToggleFollowUser={handleToggleFollowUser}
                  />
                )}

                {activeTab === 'research' && (
                  <ErrorBoundary fallbackTitle="Không thể tải phân hệ Nghiên Cứu ViSEF">
                    <ResearchCenterView
                      onNavigateToMainUI={() => setActiveTab('home')}
                      onOpenSurvey={() => setIsScienceFairDemoOpen(true)}
                      currentUser={currentUser}
                    />
                  </ErrorBoundary>
                )}

                {activeTab === 'scamdna' && (
                  <ScamDnaView
                    userProfile={userProfile}
                    currentUser={currentUser}
                    realUsers={realUsers}
                    onOpenSurvey={() => setIsScienceFairDemoOpen(true)}
                    onNavigateToArena={(scenarioId) => {
                      if (scenarioId) {
                        const matchedScenario =
                          SCAM_SCENARIOS.find((s) => s.id === scenarioId) ||
                          userProfile.completedScenarios?.find((s) => s.id === scenarioId);
                        if (matchedScenario) {
                          setSelectedScenario(matchedScenario as any);
                        }
                      }
                      handleNavigate('train', 'arena');
                    }}
                    onEarnXp={handleEarnXp}
                  />
                )}

                {activeTab === 'roadmap' && (
                  <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                    <div className="border-b border-sky-200/80 pb-5 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                        <span className="text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200/80">
                          Chương Trình Đào Tạo Nhận Thức An Ninh
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-slate-600 font-medium">12 Phân khu phòng tuyến số</span>
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                        Lộ Trình Huấn Luyện Phòng Tuyến Số
                      </h1>
                      <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                        Hoàn thành 12 phân khu mô phỏng phòng thủ không gian mạng theo cấu trúc lộ trình zích-zắc (Snake Path) và bài thi sát hạch định lượng ViSEF.
                      </p>
                    </div>

                    <RoadmapSnakePath
                      userProfile={userProfile}
                      onNavigate={handleNavigate}
                      onOpenLeaderboard={() => setActiveTab('leaderboard')}
                      onEarnXp={handleEarnXp}
                      onOpenSurvey={() => setIsScienceFairDemoOpen(true)}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Professional Utility Footer */}
          <UtilityFooter onNavigateToResearch={() => handleNavigate('research')} />
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <MobileBottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => handleNavigate(tab)}
          onOpenEmergency={() => setIsEmergencyOpen(true)}
          onOpenDrawer={() => setIsMobileDrawerOpen(true)}
        />

        {/* Mobile & Tablet Full Operations Drawer Menu */}
        <MobileDrawerMenu
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
          activeTab={activeTab}
          userProfile={userProfile}
          currentUser={currentUser}
          onSelectTab={(tab, sub) => handleNavigate(tab, sub)}
          onOpenEmergency={() => setIsEmergencyOpen(true)}
          onOpenStreak={() => setIsStreakModalOpen(true)}
          onOpenTheme={() => setIsThemeModalOpen(true)}
          onOpenScienceFairDemo={() => setIsScienceFairDemoOpen(true)}
          onOpenAboutProject={() => setIsAboutProjectOpen(true)}
        />

        {/* Modals */}
        <NotificationsModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          onNavigate={handleNavigate}
        />

        <FriendsHubModal
          isOpen={isFriendsHubOpen}
          onClose={() => setIsFriendsHubOpen(false)}
          currentUser={currentUser}
          userProfile={userProfile}
          friendsList={friends}
          activityFeed={activityFeed}
          onSendGift={handleSendShieldToFriend}
          onStartDuel={handleStartFriendDuel}
          onAddFriend={handleAddFriend}
          onLikeActivity={handleLikeActivity}
          onBroadcastSos={handleBroadcastSos}
        />

        <FriendDuelModal
          isOpen={isDuelOpen}
          onClose={() => setIsDuelOpen(false)}
          friend={activeDuelFriend}
          userProfile={userProfile}
          onEarnXp={handleEarnXp}
        />

        <DailyQuestsModal
          isOpen={isDailyQuestsOpen}
          onClose={() => setIsDailyQuestsOpen(false)}
          quests={dailyQuests}
          chestsCount={chestsCount}
          streakDays={userProfile.streakDays || 3}
          onClaimQuest={handleClaimQuest}
          onOpenChest={handleOpenChest}
        />

        <LiveCallSimulatorModal
          isOpen={isCallSimulatorOpen}
          onClose={() => setIsCallSimulatorOpen(false)}
          onEarnXp={handleEarnXp}
        />

        <ScreenSentinelModal
          isOpen={isScreenSentinelOpen}
          onClose={() => setIsScreenSentinelOpen(false)}
          onOpenEmergency={() => {
            setIsScreenSentinelOpen(false);
            setIsEmergencyOpen(true);
          }}
        />

        <ScamSpeechDecoderModal
          isOpen={isSpeechDecoderOpen}
          onClose={() => setIsSpeechDecoderOpen(false)}
          onOpenEmergency={() => {
            setIsSpeechDecoderOpen(false);
            setIsEmergencyOpen(true);
          }}
        />

        <PublicWifiNfcShieldModal
          isOpen={isWifiShieldOpen}
          onClose={() => setIsWifiShieldOpen(false)}
        />

        <LiveScamRadarModal
          isOpen={isScamRadarOpen}
          onClose={() => setIsScamRadarOpen(false)}
          onOpenEmergency={() => {
            setIsScamRadarOpen(false);
            setIsEmergencyOpen(true);
          }}
        />

        <EmergencyModal
          isOpen={isEmergencyOpen}
          onClose={() => setIsEmergencyOpen(false)}
        />

        <TrustedContactsModal
          isOpen={isTrustedContactsOpen}
          onClose={() => setIsTrustedContactsOpen(false)}
          contacts={userProfile.trustedContacts || []}
          onSaveContacts={handleUpdateContacts}
        />

        <FamilySchoolModal
          isOpen={isFamilySchoolOpen}
          onClose={() => setIsFamilySchoolOpen(false)}
        />

        <PrivacyCenterModal
          isOpen={isPrivacyCenterOpen}
          onClose={() => setIsPrivacyCenterOpen(false)}
          userId={userProfile.id}
          onDataCleared={handleDataCleared}
        />

        {/* Gamification Metric Modals */}
        <StreakModal
          isOpen={isStreakModalOpen}
          onClose={() => setIsStreakModalOpen(false)}
          streakDays={userProfile.streakDays || 1}
          gems={gems}
          hasFreeze={hasStreakFreeze}
          onBuyFreeze={handleBuyStreakFreeze}
          onNavigate={handleNavigate}
          onOpenFriends={() => setIsFriendsHubOpen(true)}
          onCheckInStreak={handleExtendStreak}
        />

        <StreakCelebrationModal
          isOpen={isStreakCelebrationOpen}
          onClose={() => setIsStreakCelebrationOpen(false)}
          oldStreak={prevStreakValue}
          newStreak={userProfile.streakDays || 1}
        />

        <GemsModal
          isOpen={isGemsModalOpen}
          onClose={() => setIsGemsModalOpen(false)}
          gems={gems}
          onNavigate={handleNavigate}
        />

        <HeartsModal
          isOpen={isHeartsModalOpen}
          onClose={() => setIsHeartsModalOpen(false)}
          lives={lives}
          maxLives={5}
          gems={gems}
          onRefillLives={handleRefillLives}
          onNavigate={handleNavigate}
        />

        {/* National Science Fair ViSEF 5-Minute Evaluation Demo Modal */}
        <NationalScienceFairDemoModal
          isOpen={isScienceFairDemoOpen}
          onClose={() => setIsScienceFairDemoOpen(false)}
          currentUser={currentUser}
          onNavigateToResearch={() => {
            setIsScienceFairDemoOpen(false);
            setActiveTab('research');
          }}
          onNavigateToMainUI={() => {
            setIsScienceFairDemoOpen(false);
            setActiveTab('home');
          }}
        />

        {/* Official KHKT / ViSEF Project Introduction Modal */}
        <AboutProjectModal
          isOpen={isAboutProjectOpen}
          onClose={() => setIsAboutProjectOpen(false)}
          onExploreResearch={() => {
            setIsAboutProjectOpen(false);
            setActiveTab('research');
          }}
        />
      </div>
    </LanguageProvider>
  );
}
