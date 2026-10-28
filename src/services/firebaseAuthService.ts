import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  linkWithPopup,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged,
  setPersistence,
  inMemoryPersistence,
  browserLocalPersistence,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import {
  auth,
  googleProvider,
  facebookProvider,
  githubProvider,
  db,
  OperationType,
  handleFirestoreError,
} from '../firebase';
import { UserAccount, UserProfile, ExperienceMode, SocialPost } from '../types';

export interface FirebaseAuthResult {
  success: boolean;
  user?: UserAccount;
  error?: string;
  errorCode?: string;
  providerSetupRequired?: 'google' | 'facebook' | 'github' | 'password';
}

/**
 * Helper to read local training progress (Roadmap nodes, Flashcards, Survey, Final Exam Cert)
 * so it can be merged into and restored from the user's Cloud Firestore database (`users/{uid}`).
 */
export function getLocalTrainingSnapshot(): {
  completedRoadmapNodes: string[];
  masteredFlashcards: string[];
  hasCompletedSurvey: boolean;
  surveyData: any;
  cyberGuardianCert: any;
} {
  let completedRoadmapNodes: string[] = [];
  let masteredFlashcards: string[] = [];
  let hasCompletedSurvey = false;
  let surveyData: any = null;
  let cyberGuardianCert: any = null;

  try {
    const rawNodes = localStorage.getItem('scamguard_campaign_completed_nodes');
    if (rawNodes) completedRoadmapNodes = JSON.parse(rawNodes);
  } catch {
    // ignore
  }

  try {
    const rawCards = localStorage.getItem('scamguard_mastered_flashcards');
    if (rawCards) masteredFlashcards = JSON.parse(rawCards);
  } catch {
    // ignore
  }

  try {
    const rawSurvey =
      localStorage.getItem('scamguard_survey_submission') ||
      localStorage.getItem('visef_my_latest_survey');
    if (rawSurvey) {
      surveyData = JSON.parse(rawSurvey);
      hasCompletedSurvey = true;
    } else if (
      localStorage.getItem('scamguard_survey_completed') === 'true' ||
      localStorage.getItem('visef_survey_completed') === 'true'
    ) {
      hasCompletedSurvey = true;
    }
  } catch {
    // ignore
  }

  try {
    const rawCert = localStorage.getItem('scamguard_cyber_guardian_cert');
    if (rawCert) cyberGuardianCert = JSON.parse(rawCert);
  } catch {
    // ignore
  }

  return {
    completedRoadmapNodes: Array.isArray(completedRoadmapNodes) ? completedRoadmapNodes : [],
    masteredFlashcards: Array.isArray(masteredFlashcards) ? masteredFlashcards : [],
    hasCompletedSurvey,
    surveyData,
    cyberGuardianCert,
  };
}

/**
 * Clear all unscoped browser localStorage keys related to survey & training roadmap
 * so a newly registered or switched user account starts completely clean.
 */
export function clearLocalTrainingSnapshot() {
  try {
    localStorage.removeItem('scamguard_survey_submission');
    localStorage.removeItem('visef_my_latest_survey');
    localStorage.removeItem('scamguard_survey_completed');
    localStorage.removeItem('visef_survey_completed');
    localStorage.removeItem('scamguard_last_survey_result');
    localStorage.removeItem('scamguard_campaign_completed_nodes');
    localStorage.removeItem('scamguard_mastered_flashcards');
    localStorage.removeItem('scamguard_cyber_guardian_cert');
    localStorage.removeItem('visef_post_app_certifications');
    localStorage.removeItem('scamguard_active_sector_idx');
  } catch {
    // ignore
  }
}

/**
 * Restore cloud training data from Firestore `users/{uid}` into localStorage
 * so Roadmap Snake Path, Survey, and Certificates strictly reflect this account's cloud state.
 */
export function restoreCloudTrainingToLocal(profileData: Partial<UserProfile>) {
  try {
    if (
      Array.isArray(profileData.completedRoadmapNodes) &&
      profileData.completedRoadmapNodes.length > 0
    ) {
      localStorage.setItem(
        'scamguard_campaign_completed_nodes',
        JSON.stringify(profileData.completedRoadmapNodes)
      );
    } else {
      localStorage.removeItem('scamguard_campaign_completed_nodes');
    }

    if (
      Array.isArray(profileData.masteredFlashcards) &&
      profileData.masteredFlashcards.length > 0
    ) {
      localStorage.setItem(
        'scamguard_mastered_flashcards',
        JSON.stringify(profileData.masteredFlashcards)
      );
    } else {
      localStorage.removeItem('scamguard_mastered_flashcards');
    }

    if (profileData.hasCompletedSurvey && profileData.surveyData) {
      localStorage.setItem('scamguard_survey_submission', JSON.stringify(profileData.surveyData));
      localStorage.setItem('visef_my_latest_survey', JSON.stringify(profileData.surveyData));
      localStorage.setItem('scamguard_survey_completed', 'true');
      localStorage.setItem('visef_survey_completed', 'true');
      window.dispatchEvent(
        new CustomEvent('visef_survey_updated', { detail: profileData.surveyData })
      );
    } else if (profileData.hasCompletedSurvey) {
      localStorage.setItem('scamguard_survey_completed', 'true');
      localStorage.setItem('visef_survey_completed', 'true');
    } else {
      localStorage.removeItem('scamguard_survey_submission');
      localStorage.removeItem('visef_my_latest_survey');
      localStorage.removeItem('scamguard_survey_completed');
      localStorage.removeItem('visef_survey_completed');
      localStorage.removeItem('scamguard_last_survey_result');
      localStorage.removeItem('visef_post_app_certifications');
      localStorage.removeItem('scamguard_active_sector_idx');
    }

    if (profileData.cyberGuardianCert) {
      localStorage.setItem(
        'scamguard_cyber_guardian_cert',
        JSON.stringify(profileData.cyberGuardianCert)
      );
    } else {
      localStorage.removeItem('scamguard_cyber_guardian_cert');
    }

    window.dispatchEvent(
      new CustomEvent('scamguard_cloud_profile_restored', { detail: profileData })
    );
  } catch (e) {
    console.warn('Error restoring cloud training snapshot to localStorage:', e);
  }
}

function normalizeProviderName(
  providerId?: string
): 'google' | 'facebook' | 'github' | 'firebase' {
  if (!providerId) return 'firebase';
  if (providerId.includes('google')) return 'google';
  if (providerId.includes('facebook')) return 'facebook';
  if (providerId.includes('github')) return 'github';
  return 'firebase';
}

export function mapFirebaseUserToAccount(
  fbUser: FirebaseUser,
  profileData?: Partial<UserProfile>
): UserAccount {
  const linkedProviders = fbUser.providerData
    .map((p) => p.providerId)
    .filter(Boolean);
  const primaryProvider =
    profileData?.provider && profileData.provider !== 'local' && profileData.provider !== 'demo'
      ? profileData.provider
      : normalizeProviderName(fbUser.providerData[0]?.providerId);

  const completedRoadmapNodes = Array.from(
    new Set([...(profileData?.completedRoadmapNodes || [])])
  );

  const masteredFlashcards = Array.from(
    new Set([...(profileData?.masteredFlashcards || [])])
  );

  const displayName =
    profileData?.name ||
    fbUser.displayName ||
    fbUser.email?.split('@')[0] ||
    'Người dùng ScamGuard';

  const email =
    fbUser.email ||
    profileData?.email ||
    fbUser.providerData.find((p) => p.email)?.email ||
    `${fbUser.uid.substring(0, 8)}@users.scamguard.vn`;

  const username = (
    profileData?.username ||
    email.split('@')[0] ||
    `user_${fbUser.uid.substring(0, 6)}`
  )
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, '');

  const avatarUrl =
    fbUser.photoURL ||
    profileData?.avatarUrl ||
    fbUser.providerData.find((p) => p.photoURL)?.photoURL ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=0f172a,1e293b`;

  const nowIso = new Date().toISOString();

  const profile: UserProfile = {
    id: fbUser.uid,
    uid: fbUser.uid,
    name: displayName.slice(0, 150),
    username: username.slice(0, 100),
    email: email.slice(0, 254),
    emailVerified: fbUser.emailVerified,
    mode: (profileData?.mode as ExperienceMode) || 'adult',
    language: profileData?.language || 'vi',
    overallScore: profileData?.overallScore !== undefined ? profileData.overallScore : 0,
    xp: profileData?.xp !== undefined ? profileData.xp : 0,
    gems: profileData?.gems !== undefined ? profileData.gems : 0,
    streakDays: profileData?.streakDays !== undefined ? profileData.streakDays : 0,
    completedScenarios: Array.from(new Set([...(profileData?.completedScenarios || [])])),
    completedRoadmapNodes,
    masteredFlashcards,
    hasCompletedSurvey: Boolean(profileData?.hasCompletedSurvey),
    surveyData: profileData?.surveyData || null,
    cyberGuardianCert: profileData?.cyberGuardianCert || null,
    trustedContacts: profileData?.trustedContacts || [],
    avatarUrl,
    provider: primaryProvider,
    providersLinked: linkedProviders.length > 0 ? linkedProviders : [primaryProvider],
    lastLoginAt: profileData?.lastLoginAt || nowIso,
    createdAt: profileData?.createdAt || nowIso,
    updatedAt: profileData?.updatedAt || nowIso,
  };

  return {
    id: fbUser.uid,
    username: profile.username || 'user',
    email: profile.email || '',
    name: profile.name,
    avatarUrl: profile.avatarUrl,
    provider: primaryProvider,
    profile,
    token: `fb_${fbUser.uid}`,
    createdAt: profile.createdAt || nowIso,
  };
}

/**
 * Strip undefined values before writing to Firestore (Firestore rejects undefined fields)
 */
function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      clean[key] = val;
    }
  }
  return clean;
}

/**
 * Sync Firebase user profile to server backend session memory
 */
export async function syncFirebaseUserToBackend(account: UserAccount) {
  try {
    await fetch('/api/auth/firebase-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: account.id,
        name: account.name,
        email: account.email,
        username: account.username,
        avatarUrl: account.avatarUrl,
        provider: account.provider,
        mode: account.profile?.mode,
        profile: account.profile,
      }),
    });
  } catch (e) {
    console.warn('Firebase session backend sync warning', e);
  }
}

/**
 * Create or merge a user's Cloud Firestore Database document at `users/{uid}`
 */
export async function upsertUserFirestoreDatabase(
  fbUser: FirebaseUser,
  overrides?: Partial<UserProfile>
): Promise<UserAccount> {
  const userPath = `users/${fbUser.uid}`;
  const userRef = doc(db, 'users', fbUser.uid);

  let existingData: Partial<UserProfile> | undefined;
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      existingData = snap.data() as Partial<UserProfile>;
    }
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.GET, userPath);
    } catch {
      // Logged structured FirestoreErrorInfo
    }
  }

  const nowIso = new Date().toISOString();

  const mergedProfileSeed: Partial<UserProfile> = {
    ...existingData,
    ...overrides,
    id: fbUser.uid,
    uid: fbUser.uid,
    name: (
      overrides?.name ||
      existingData?.name ||
      fbUser.displayName ||
      fbUser.email?.split('@')[0] ||
      'Người dùng ScamGuard'
    ).slice(0, 150),
    email:
      fbUser.email ||
      overrides?.email ||
      existingData?.email ||
      fbUser.providerData.find((p) => p.email)?.email ||
      `${fbUser.uid.substring(0, 8)}@users.scamguard.vn`,
    emailVerified: fbUser.emailVerified,
    avatarUrl:
      overrides?.avatarUrl ||
      fbUser.photoURL ||
      existingData?.avatarUrl ||
      fbUser.providerData.find((p) => p.photoURL)?.photoURL ||
      undefined,
    xp: Math.max(existingData?.xp || 0, overrides?.xp || 0),
    overallScore: Math.max(existingData?.overallScore || 0, overrides?.overallScore || 0),
    streakDays: Math.max(existingData?.streakDays || 0, overrides?.streakDays || 0),
    gems: Math.max(existingData?.gems || 0, overrides?.gems || 0),
    completedScenarios: Array.from(
      new Set([
        ...(existingData?.completedScenarios || []),
        ...(overrides?.completedScenarios || []),
      ])
    ),
    completedRoadmapNodes: Array.from(
      new Set([
        ...(existingData?.completedRoadmapNodes || []),
        ...(overrides?.completedRoadmapNodes || []),
      ])
    ),
    masteredFlashcards: Array.from(
      new Set([
        ...(existingData?.masteredFlashcards || []),
        ...(overrides?.masteredFlashcards || []),
      ])
    ),
    hasCompletedSurvey: Boolean(
      existingData?.hasCompletedSurvey || overrides?.hasCompletedSurvey
    ),
    surveyData: existingData?.surveyData || overrides?.surveyData || null,
    cyberGuardianCert:
      existingData?.cyberGuardianCert || overrides?.cyberGuardianCert || null,
    trustedContacts:
      overrides?.trustedContacts && overrides.trustedContacts.length > 0
        ? overrides.trustedContacts
        : existingData?.trustedContacts || [],
    providersLinked: fbUser.providerData.map((p) => p.providerId).filter(Boolean),
    lastLoginAt: nowIso,
    createdAt: existingData?.createdAt || nowIso,
    updatedAt: nowIso,
  };

  const account = mapFirebaseUserToAccount(fbUser, mergedProfileSeed);

  restoreCloudTrainingToLocal(account.profile);

  try {
    await setDoc(userRef, sanitizeForFirestore(account.profile), { merge: true });
  } catch (err) {
    try {
      handleFirestoreError(
        err,
        existingData ? OperationType.UPDATE : OperationType.CREATE,
        userPath
      );
    } catch {
      // Structured Firestore error logged
    }
  }

  await syncFirebaseUserToBackend(account);
  return account;
}

/**
 * Detect whether a Firebase Auth error is caused by an IndexedDB/storage transaction abort
 * (`auth/internal-error`: "The transaction was aborted, so the request cannot be fulfilled")
 */
function isTransactionAbortOrInternalAuthError(err: any): boolean {
  const code = String(err?.code || '');
  const msg = String(err?.message || '').toLowerCase();
  return (
    code === 'auth/internal-error' ||
    code === 'auth/web-storage-unsupported' ||
    msg.includes('transaction was aborted') ||
    msg.includes('indexeddb') ||
    msg.includes('aborted')
  );
}

/**
 * Execute a Firebase Auth operation and automatically recover if browser storage/IndexedDB
 * aborts a transaction by switching Auth persistence to `browserLocalPersistence` / `inMemoryPersistence`.
 */
async function executeWithAuthPersistenceFallback<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (err: any) {
    if (isTransactionAbortOrInternalAuthError(err)) {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch {
        try {
          await setPersistence(auth, inMemoryPersistence);
        } catch {
          // ignore
        }
      }
      try {
        return await operation();
      } catch (retryErr: any) {
        if (isTransactionAbortOrInternalAuthError(retryErr)) {
          try {
            await setPersistence(auth, inMemoryPersistence);
            return await operation();
          } catch (finalErr) {
            throw finalErr;
          }
        }
        throw retryErr;
      }
    }
    throw err;
  }
}

/**
 * Parse Firebase Auth errors into clear Vietnamese instructions
 */
function formatFirebaseAuthError(
  err: any,
  providerLabel: string,
  providerKey: 'google' | 'facebook' | 'github' | 'password'
): FirebaseAuthResult {
  const code = err?.code || '';
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return {
      success: false,
      errorCode: code,
      error: `Bạn đã đóng cửa sổ đăng nhập ${providerLabel} trước khi hoàn tất.`,
    };
  }
  if (code === 'auth/popup-blocked') {
    return {
      success: false,
      errorCode: code,
      error: `Trình duyệt đang chặn cửa sổ bật lên (Popup). Vui lòng cho phép Popup trên thanh địa chỉ trình duyệt để đăng nhập ${providerLabel}.`,
    };
  }
  if (code === 'auth/operation-not-allowed' || code === 'auth/configuration-not-found') {
    return {
      success: false,
      errorCode: code,
      providerSetupRequired: providerKey,
      error: `Phương thức đăng nhập ${providerLabel} chưa được bật (Enable) trong Firebase Console của dự án. Xem hướng dẫn bật nhanh 30 giây ngay bên dưới.`,
    };
  }
  if (code === 'auth/account-exists-with-different-credential') {
    return {
      success: false,
      errorCode: code,
      error: `Email của tài khoản ${providerLabel} này đã được đăng ký bằng một phương thức khác (ví dụ: Google). Vui lòng đăng nhập bằng phương thức ban đầu rồi bấm "Liên kết tài khoản ${providerLabel}" trong Hồ Sơ.`,
    };
  }
  if (code === 'auth/unauthorized-domain') {
    return {
      success: false,
      errorCode: code,
      error: `Tên miền hiện tại chưa được thêm vào danh sách Authorized Domains trong Firebase Authentication Settings.`,
    };
  }
  if (isTransactionAbortOrInternalAuthError(err)) {
    return {
      success: false,
      errorCode: code || 'auth/internal-error',
      error: `Trình duyệt đang giới hạn bộ nhớ phiên của cửa sổ ${providerLabel}. Vui lòng thử lại hoặc đăng nhập bằng Email & Mật khẩu bên dưới.`,
    };
  }
  return {
    success: false,
    errorCode: code,
    error: err?.message || `Không thể xác thực qua ${providerLabel}.`,
  };
}

/**
 * Create or merge a direct Account record in Cloud Firestore `users/{uid}` (used when Email/Password fallback is needed)
 */
async function upsertDirectAccountFirestore(account: UserAccount): Promise<UserAccount> {
  const userPath = `users/${account.id}`;
  const userRef = doc(db, 'users', account.id);
  const nowIso = new Date().toISOString();

  let existingData: Partial<UserProfile> | undefined;
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      existingData = snap.data() as Partial<UserProfile>;
    }
  } catch {
    // ignore read error
  }

  const mergedProfile: UserProfile = {
    ...existingData,
    ...account.profile,
    id: account.id,
    uid: account.id,
    name: (account.name || existingData?.name || 'Người dùng ScamGuard').slice(0, 150),
    username: account.username || existingData?.username || 'user',
    email: account.email || existingData?.email || '',
    xp: Math.max(existingData?.xp || 0, account.profile?.xp || 0),
    overallScore: Math.max(existingData?.overallScore || 0, account.profile?.overallScore || 0),
    streakDays: Math.max(existingData?.streakDays || 0, account.profile?.streakDays || 0),
    gems: Math.max(existingData?.gems || 0, account.profile?.gems || 0),
    completedScenarios: Array.from(
      new Set([
        ...(existingData?.completedScenarios || []),
        ...(account.profile?.completedScenarios || []),
      ])
    ),
    completedRoadmapNodes: Array.from(
      new Set([
        ...(existingData?.completedRoadmapNodes || []),
        ...(account.profile?.completedRoadmapNodes || []),
      ])
    ),
    masteredFlashcards: Array.from(
      new Set([
        ...(existingData?.masteredFlashcards || []),
        ...(account.profile?.masteredFlashcards || []),
      ])
    ),
    hasCompletedSurvey: Boolean(
      existingData?.hasCompletedSurvey || account.profile?.hasCompletedSurvey
    ),
    surveyData: existingData?.surveyData || account.profile?.surveyData || null,
    cyberGuardianCert:
      existingData?.cyberGuardianCert || account.profile?.cyberGuardianCert || null,
    trustedContacts:
      account.profile?.trustedContacts && account.profile.trustedContacts.length > 0
        ? account.profile.trustedContacts
        : existingData?.trustedContacts || [],
    lastLoginAt: nowIso,
    createdAt: existingData?.createdAt || account.createdAt || nowIso,
    updatedAt: nowIso,
  };

  const finalAccount: UserAccount = {
    ...account,
    name: mergedProfile.name,
    email: mergedProfile.email || account.email,
    avatarUrl: mergedProfile.avatarUrl || account.avatarUrl,
    profile: mergedProfile,
  };

  restoreCloudTrainingToLocal(mergedProfile);

  try {
    await setDoc(userRef, sanitizeForFirestore(mergedProfile), { merge: true });
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, userPath);
    } catch {
      // Logged structured FirestoreErrorInfo
    }
  }

  localStorage.setItem('scamguard_session_account', JSON.stringify(finalAccount));
  if (finalAccount.token) {
    localStorage.setItem('scamguard_token', finalAccount.token);
  }
  await syncFirebaseUserToBackend(finalAccount);
  return finalAccount;
}

/**
 * Register with Email & Password via Firebase Auth & create `users/{uid}` in Cloud Firestore
 */
export async function registerWithFirebase(params: {
  name: string;
  username: string;
  email: string;
  password: string;
  mode?: ExperienceMode;
  avatarUrl?: string;
}): Promise<FirebaseAuthResult> {
  // Wipe any local survey/roadmap progress from previous browser sessions before creating a new account
  clearLocalTrainingSnapshot();

  try {
    const cred = await executeWithAuthPersistenceFallback(() =>
      createUserWithEmailAndPassword(auth, params.email, params.password)
    );
    const fbUser = cred.user;

    if (params.name || params.avatarUrl) {
      await updateProfile(fbUser, {
        displayName: params.name,
        photoURL: params.avatarUrl,
      }).catch(() => {});
    }

    const account = await upsertUserFirestoreDatabase(fbUser, {
      name: params.name,
      username: params.username.toLowerCase(),
      email: params.email,
      mode: params.mode || 'adult',
      avatarUrl: params.avatarUrl,
      provider: 'firebase',
      hasCompletedSurvey: false,
      surveyData: null,
      completedRoadmapNodes: [],
      masteredFlashcards: [],
    });

    localStorage.setItem('scamguard_session_account', JSON.stringify(account));
    return { success: true, user: account };
  } catch (err: any) {
    // If Email/Password provider is not enabled yet OR if iframe storage aborted an internal transaction,
    // seamlessly fall back to backend auth + real Cloud Firestore user record
    if (
      err?.code === 'auth/operation-not-allowed' ||
      err?.code === 'auth/configuration-not-found' ||
      isTransactionAbortOrInternalAuthError(err)
    ) {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: params.name,
            username: params.username,
            email: params.email,
            password: params.password,
            mode: params.mode || 'adult',
          }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          const syncedAccount = await upsertDirectAccountFirestore({
            ...data.user,
            profile: {
              ...data.user.profile,
              hasCompletedSurvey: false,
              surveyData: null,
              completedRoadmapNodes: [],
              masteredFlashcards: [],
            },
            avatarUrl:
              params.avatarUrl ||
              data.user.avatarUrl ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(params.name)}&backgroundColor=0f172a,1e293b`,
            provider: 'firebase',
          });
          return { success: true, user: syncedAccount };
        }
        return {
          success: false,
          error: data.error || 'Không thể đăng ký tài khoản.',
        };
      } catch {
        // continue to standard error
      }
    }

    if (err.code === 'auth/email-already-in-use') {
      return {
        success: false,
        errorCode: err.code,
        error: 'Email này đã được đăng ký. Vui lòng chuyển sang chế độ Đăng Nhập (Log in).',
      };
    }
    if (err.code === 'auth/weak-password') {
      return {
        success: false,
        errorCode: err.code,
        error: 'Mật khẩu quá yếu. Vui lòng nhập mật khẩu tối thiểu 6 ký tự.',
      };
    }
    if (err.code === 'auth/invalid-email') {
      return {
        success: false,
        errorCode: err.code,
        error: 'Định dạng địa chỉ Email không hợp lệ.',
      };
    }
    return formatFirebaseAuthError(err, 'Email/Mật khẩu', 'password');
  }
}

/**
 * Sign in with Email & Password via Firebase Auth & sync `users/{uid}` in Cloud Firestore
 */
export async function loginWithFirebase(
  email: string,
  password: string
): Promise<FirebaseAuthResult> {
  try {
    const cred = await executeWithAuthPersistenceFallback(() =>
      signInWithEmailAndPassword(auth, email, password)
    );
    const account = await upsertUserFirestoreDatabase(cred.user);
    localStorage.setItem('scamguard_session_account', JSON.stringify(account));
    return { success: true, user: account };
  } catch (err: any) {
    if (
      err?.code === 'auth/operation-not-allowed' ||
      err?.code === 'auth/configuration-not-found' ||
      err?.code === 'auth/user-not-found' ||
      err?.code === 'auth/invalid-credential' ||
      isTransactionAbortOrInternalAuthError(err)
    ) {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usernameOrEmail: email,
            password,
          }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          const syncedAccount = await upsertDirectAccountFirestore(data.user);
          return { success: true, user: syncedAccount };
        }
      } catch {
        // continue to Firestore check below
      }

      // Also check if the user already has a persisted profile in Cloud Firestore `users` collection
      // (e.g. if the server restarted after a fallback registration)
      try {
        const normalizedQuery = email.trim().toLowerCase();
        const snap = await getDocs(collection(db, 'users'));
        let matchedProfile: UserProfile | null = null;
        snap.forEach((docSnap) => {
          const d = docSnap.data() as UserProfile;
          if (
            d &&
            d.id &&
            ((d.email && d.email.toLowerCase() === normalizedQuery) ||
              (d.username && d.username.toLowerCase() === normalizedQuery))
          ) {
            matchedProfile = d;
          }
        });
        if (matchedProfile) {
          const p = matchedProfile as UserProfile;
          const restoredAccount: UserAccount = {
            id: p.id,
            username: p.username || normalizedQuery.split('@')[0],
            email: p.email || normalizedQuery,
            name: p.name || 'Người dùng ScamGuard',
            avatarUrl: p.avatarUrl,
            provider: p.provider || 'firebase',
            profile: p,
            token: `sg_tok_${p.id}`,
            createdAt: p.createdAt || new Date().toISOString(),
          };
          const syncedAccount = await upsertDirectAccountFirestore(restoredAccount);
          return { success: true, user: syncedAccount };
        }
      } catch {
        // continue to error below
      }
    }

    if (
      err.code === 'auth/user-not-found' ||
      err.code === 'auth/wrong-password' ||
      err.code === 'auth/invalid-credential' ||
      err.code === 'auth/operation-not-allowed'
    ) {
      return {
        success: false,
        errorCode: err.code,
        error: 'Email hoặc mật khẩu không chính xác, hoặc tài khoản chưa được đăng ký. Vui lòng kiểm tra lại hoặc tạo tài khoản mới.',
      };
    }
    if (err.code === 'auth/too-many-requests') {
      return {
        success: false,
        errorCode: err.code,
        error: 'Quá nhiều lần thử sai liên tiếp. Vui lòng đợi ít phút hoặc đặt lại mật khẩu.',
      };
    }
    return formatFirebaseAuthError(err, 'Email/Mật khẩu', 'password');
  }
}

/**
 * Send real Firebase Password Reset email
 */
export async function sendPasswordResetFirebase(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await executeWithAuthPersistenceFallback(() =>
      sendPasswordResetEmail(auth, email.trim())
    );
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error:
        err.code === 'auth/user-not-found'
          ? 'Không tìm thấy tài khoản nào đăng ký với địa chỉ email này.'
          : 'Không thể gửi email khôi phục mật khẩu. Vui lòng kiểm tra lại địa chỉ email.',
    };
  }
}

/**
 * Sign in or Register with Real Google Account via Firebase Auth & create `users/{uid}` in Firestore
 */
export async function signInWithGoogleFirebase(
  mode: ExperienceMode = 'adult'
): Promise<FirebaseAuthResult> {
  try {
    const cred = await executeWithAuthPersistenceFallback(() =>
      signInWithPopup(auth, googleProvider)
    );
    const account = await upsertUserFirestoreDatabase(cred.user, {
      mode,
      provider: 'google',
    });
    localStorage.setItem('scamguard_session_account', JSON.stringify(account));
    return { success: true, user: account };
  } catch (err: any) {
    return formatFirebaseAuthError(err, 'Google', 'google');
  }
}

/**
 * Sign in or Register with Real GitHub Account via Firebase Auth & create `users/{uid}` in Firestore
 */
export async function signInWithGithubFirebase(
  mode: ExperienceMode = 'adult'
): Promise<FirebaseAuthResult> {
  try {
    const cred = await executeWithAuthPersistenceFallback(() =>
      signInWithPopup(auth, githubProvider)
    );
    const account = await upsertUserFirestoreDatabase(cred.user, {
      mode,
      provider: 'github',
    });
    localStorage.setItem('scamguard_session_account', JSON.stringify(account));
    return { success: true, user: account };
  } catch (err: any) {
    return formatFirebaseAuthError(err, 'GitHub', 'github');
  }
}

/**
 * Sign in or Register with Real Facebook Account via Firebase Auth & create `users/{uid}` in Firestore
 */
export async function signInWithFacebookFirebase(
  mode: ExperienceMode = 'adult'
): Promise<FirebaseAuthResult> {
  try {
    const cred = await executeWithAuthPersistenceFallback(() =>
      signInWithPopup(auth, facebookProvider)
    );
    const account = await upsertUserFirestoreDatabase(cred.user, {
      mode,
      provider: 'facebook',
    });
    localStorage.setItem('scamguard_session_account', JSON.stringify(account));
    return { success: true, user: account };
  } catch (err: any) {
    return formatFirebaseAuthError(err, 'Facebook', 'facebook');
  }
}

/**
 * Link an additional OAuth provider (Google, Facebook, or GitHub) to the currently signed-in Firebase user
 */
export async function linkAccountWithProvider(
  providerName: 'google' | 'facebook' | 'github'
): Promise<FirebaseAuthResult> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return {
      success: false,
      error: 'Bạn cần đăng nhập qua OAuth trước khi liên kết thêm tài khoản mạng xã hội.',
    };
  }

  const providerInstance =
    providerName === 'google'
      ? googleProvider
      : providerName === 'facebook'
      ? facebookProvider
      : githubProvider;

  const label =
    providerName === 'google'
      ? 'Google'
      : providerName === 'facebook'
      ? 'Facebook'
      : 'GitHub';

  try {
    const cred = await executeWithAuthPersistenceFallback(() =>
      linkWithPopup(currentUser, providerInstance)
    );
    const account = await upsertUserFirestoreDatabase(cred.user);
    localStorage.setItem('scamguard_session_account', JSON.stringify(account));
    return { success: true, user: account };
  } catch (err: any) {
    if (err.code === 'auth/credential-already-in-use') {
      return {
        success: false,
        errorCode: err.code,
        error: `Tài khoản ${label} này đã được gắn với một hồ sơ người dùng khác.`,
      };
    }
    if (err.code === 'auth/provider-already-linked') {
      return {
        success: false,
        errorCode: err.code,
        error: `Hồ sơ của bạn đã được liên kết với ${label} rồi.`,
      };
    }
    return formatFirebaseAuthError(err, label, providerName);
  }
}

/**
 * Sync updated user profile and local training state into Cloud Firestore `users/{uid}`
 */
export async function syncUserProfileToFirestore(
  userId: string,
  profileUpdates: Partial<UserProfile>
): Promise<boolean> {
  if (
    !userId ||
    userId === 'unauthenticated' ||
    userId.startsWith('guest_') ||
    userId.startsWith('preset_')
  ) {
    return false;
  }

  const userPath = `users/${userId}`;
  const userRef = doc(db, 'users', userId);
  const localSnap = getLocalTrainingSnapshot();

  const payload = sanitizeForFirestore({
    ...profileUpdates,
    id: userId,
    uid: userId,
    completedRoadmapNodes:
      profileUpdates.completedRoadmapNodes || localSnap.completedRoadmapNodes,
    masteredFlashcards:
      profileUpdates.masteredFlashcards || localSnap.masteredFlashcards,
    hasCompletedSurvey:
      profileUpdates.hasCompletedSurvey !== undefined
        ? profileUpdates.hasCompletedSurvey
        : localSnap.hasCompletedSurvey,
    surveyData:
      profileUpdates.surveyData !== undefined
        ? profileUpdates.surveyData
        : localSnap.surveyData,
    cyberGuardianCert:
      profileUpdates.cyberGuardianCert !== undefined
        ? profileUpdates.cyberGuardianCert
        : localSnap.cyberGuardianCert,
    updatedAt: new Date().toISOString(),
  });

  try {
    await setDoc(userRef, payload, { merge: true });
    return true;
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, userPath);
    } catch {
      // Structured FirestoreErrorInfo logged
    }
    return false;
  }
}

/**
 * Subscribe to real-time updates on `users/{uid}` in Cloud Firestore
 */
export function subscribeToUserFirestoreDoc(
  uid: string,
  onProfileUpdate: (profile: UserProfile) => void
): Unsubscribe {
  const userPath = `users/${uid}`;
  const userRef = doc(db, 'users', uid);

  return onSnapshot(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        restoreCloudTrainingToLocal(data);
        onProfileUpdate(data);
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, userPath);
      } catch {
        // Logged structured FirestoreErrorInfo
      }
    }
  );
}

/**
 * Subscribe to ALL real registered user accounts in Cloud Firestore (`users` collection).
 * If no one has logged in yet, this returns an empty array `[]` (0 NPCs).
 */
export function subscribeToAllRealUsers(
  onUsersUpdate: (users: UserProfile[]) => void
): Unsubscribe {
  const usersCol = collection(db, 'users');
  return onSnapshot(
    usersCol,
    (snapshot) => {
      const list: UserProfile[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as UserProfile;
        if (data && data.id && data.name) {
          list.push(data);
        }
      });
      list.sort((a, b) => (b.xp || 0) - (a.xp || 0));
      onUsersUpdate(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'users');
      } catch {
        onUsersUpdate([]);
      }
    }
  );
}

/**
 * Subscribe to ALL real social posts in Cloud Firestore (`social_posts` collection).
 * Starts empty `[]` until real authenticated users publish posts.
 */
export function subscribeToRealSocialPosts(
  onPostsUpdate: (posts: SocialPost[]) => void
): Unsubscribe {
  const postsCol = collection(db, 'social_posts');
  return onSnapshot(
    postsCol,
    (snapshot) => {
      const list: SocialPost[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as SocialPost;
        if (data && data.id && data.content) {
          list.push(data);
        }
      });
      list.sort((a, b) => (b.id > a.id ? 1 : -1));
      onPostsUpdate(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'social_posts');
      } catch {
        onPostsUpdate([]);
      }
    }
  );
}

/**
 * Persist a real user's social post or reaction/comment update into Cloud Firestore (`social_posts/{postId}`)
 */
export async function saveRealSocialPostToFirestore(post: SocialPost): Promise<boolean> {
  if (!post.userId || post.userId === 'unauthenticated') return false;
  const postPath = `social_posts/${post.id}`;
  const postRef = doc(db, 'social_posts', post.id);
  try {
    await setDoc(
      postRef,
      sanitizeForFirestore({
        ...post,
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );
    return true;
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, postPath);
    } catch {
      // Logged structured FirestoreErrorInfo
    }
    return false;
  }
}

/**
 * Listen to Firebase Auth state changes across page reloads
 */
export function subscribeToFirebaseAuth(
  onAuthenticated: (account: UserAccount) => void,
  onSignedOut: () => void
): Unsubscribe {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      const account = await upsertUserFirestoreDatabase(fbUser);
      localStorage.setItem('scamguard_session_account', JSON.stringify(account));
      onAuthenticated(account);
      return;
    }

    // Check if there is an active authenticated Email/Password session in localStorage
    try {
      const rawSession = localStorage.getItem('scamguard_session_account');
      if (rawSession) {
        const parsed = JSON.parse(rawSession) as UserAccount;
        if (parsed && parsed.id && parsed.id !== 'unauthenticated') {
          const synced = await upsertDirectAccountFirestore(parsed);
          onAuthenticated(synced);
          return;
        }
      }
    } catch {
      // ignore invalid session
    }

    onSignedOut();
  });
}

/**
 * Sign out of Firebase and clear local session
 */
export async function logoutFromFirebase() {
  localStorage.removeItem('scamguard_session_account');
  localStorage.removeItem('scamguard_token');
  clearLocalTrainingSnapshot();
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Firebase signOut', e);
  }
}
