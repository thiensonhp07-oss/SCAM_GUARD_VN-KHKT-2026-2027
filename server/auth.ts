import { UserAccount, UserProfile, ExperienceMode, TrustedContact } from '../src/types';
import crypto from 'crypto';

// In-memory user database (for real synced Firebase sessions only — 0 NPCs)
const usersStore = new Map<
  string,
  {
    account: UserAccount;
    passwordHash?: string;
  }
>();

// Sessions map: token -> userId
const sessionsStore = new Map<string, string>();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(`scamguard_salt_${password}`).digest('hex');
}

function generateToken(userId: string): string {
  const token = `sg_tok_${userId}_${crypto.randomBytes(16).toString('hex')}`;
  sessionsStore.set(token, userId);
  return token;
}

// Empty preset list — all accounts are real authenticated users
export const DEMO_PRESET_USERS: Array<{
  id: string;
  username: string;
  email: string;
  name: string;
  mode: ExperienceMode;
  roleDescription: string;
  avatarUrl: string;
  score: number;
  xp: number;
  streak: number;
  completedScenarios: string[];
  trustedContacts: TrustedContact[];
}> = [];

/**
 * Register a new user with username and password
 */
export function registerUser(params: {
  name: string;
  username: string;
  email?: string;
  password?: string;
  mode?: ExperienceMode;
}): { success: boolean; user?: UserAccount; error?: string } {
  const baseUsername = (params.username || '').trim().toLowerCase() || 'user';
  const cleanName = (params.name || '').trim();
  const cleanEmail = (params.email || `${baseUsername}@scamguard.local`).trim().toLowerCase();

  if (baseUsername.length < 2) {
    return { success: false, error: 'Tên đăng nhập phải có ít nhất 2 ký tự.' };
  }
  if (!cleanName) {
    return { success: false, error: 'Vui lòng nhập Họ và Tên của bạn.' };
  }
  if (params.password && params.password.length < 4) {
    return { success: false, error: 'Mật khẩu phải có ít nhất 4 ký tự.' };
  }

  let cleanUsername = baseUsername;
  for (const [, entry] of usersStore.entries()) {
    if (params.email && entry.account.email.toLowerCase() === cleanEmail) {
      // If the same email re-registers with the same password, return the existing account smoothly
      if (!entry.passwordHash || !params.password || entry.passwordHash === hashPassword(params.password)) {
        const token = generateToken(entry.account.id);
        entry.account.token = token;
        return { success: true, user: entry.account };
      }
      return { success: false, error: 'Email này đã được đăng ký. Vui lòng chuyển sang chế độ Đăng Nhập (Log in).' };
    }
    if (entry.account.username === cleanUsername) {
      cleanUsername = `${baseUsername}_${crypto.createHash('sha256').update(cleanEmail).digest('hex').slice(0, 4)}`;
    }
  }

  const emailHash = crypto.createHash('sha256').update(cleanEmail).digest('hex').slice(0, 16);
  const userId = `user_${emailHash}`;
  const token = generateToken(userId);

  const profile: UserProfile = {
    id: userId,
    name: cleanName,
    username: cleanUsername,
    email: cleanEmail,
    mode: params.mode || 'adult',
    language: 'vi',
    overallScore: 0,
    xp: 0,
    streakDays: 0,
    completedScenarios: [],
    trustedContacts: [],
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=0f172a,1e293b,334155`,
    provider: 'local',
    createdAt: new Date().toISOString(),
  };

  const account: UserAccount = {
    id: userId,
    username: cleanUsername,
    email: cleanEmail,
    name: cleanName,
    avatarUrl: profile.avatarUrl,
    provider: 'local',
    profile,
    token,
    createdAt: new Date().toISOString(),
  };

  usersStore.set(userId, {
    account,
    passwordHash: params.password ? hashPassword(params.password) : undefined,
  });

  return { success: true, user: account };
}

/**
 * Log in with username or email and password
 */
export function loginUser(params: {
  usernameOrEmail: string;
  password?: string;
}): { success: boolean; user?: UserAccount; error?: string } {
  const query = (params.usernameOrEmail || '').trim().toLowerCase();
  if (!query) {
    return { success: false, error: 'Vui lòng nhập tên đăng nhập hoặc email.' };
  }

  let matchedUserId: string | null = null;
  let matchedEntry: { account: UserAccount; passwordHash?: string } | null = null;

  for (const [uid, entry] of usersStore.entries()) {
    if (
      entry.account.username.toLowerCase() === query ||
      entry.account.email.toLowerCase() === query
    ) {
      matchedUserId = uid;
      matchedEntry = entry;
      break;
    }
  }

  if (!matchedUserId || !matchedEntry) {
    return { success: false, error: 'Không tìm thấy tài khoản với thông tin này.' };
  }

  if (matchedEntry.passwordHash && params.password) {
    const inputHash = hashPassword(params.password);
    if (matchedEntry.passwordHash !== inputHash) {
      return { success: false, error: 'Mật khẩu không chính xác. Vui lòng thử lại.' };
    }
  }

  const token = generateToken(matchedUserId);
  matchedEntry.account.token = token;

  return { success: true, user: matchedEntry.account };
}

/**
 * Handle OAuth / Social Login
 */
export function socialLogin(params: {
  provider: 'google' | 'facebook' | 'github';
  name?: string;
  email?: string;
  avatarUrl?: string;
  mode?: ExperienceMode;
}): { success: boolean; user?: UserAccount } {
  const provider = params.provider;
  const defaultName = params.name || `Người dùng ${provider.toUpperCase()}`;
  const email = params.email || `${provider}_${Date.now()}@auth.${provider}.com`;
  const username = `${provider}_${Math.random().toString(36).substring(2, 8)}`;

  for (const [uid, entry] of usersStore.entries()) {
    if (entry.account.email === email && entry.account.provider === provider) {
      const token = generateToken(uid);
      entry.account.token = token;
      return { success: true, user: entry.account };
    }
  }

  const userId = `user_${provider}_${Date.now()}`;
  const token = generateToken(userId);
  const avatarUrl =
    params.avatarUrl ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(defaultName)}&backgroundColor=0f172a,1e293b`;

  const profile: UserProfile = {
    id: userId,
    name: defaultName,
    username,
    email,
    mode: params.mode || 'adult',
    language: 'vi',
    overallScore: 0,
    xp: 0,
    streakDays: 0,
    completedScenarios: [],
    trustedContacts: [],
    avatarUrl,
    provider,
    createdAt: new Date().toISOString(),
  };

  const account: UserAccount = {
    id: userId,
    username,
    email,
    name: defaultName,
    avatarUrl,
    provider,
    profile,
    token,
    createdAt: new Date().toISOString(),
  };

  usersStore.set(userId, { account });
  return { success: true, user: account };
}

/**
 * Sync Firebase user account into server memory session store
 */
export function syncFirebaseUser(params: {
  uid: string;
  name: string;
  email: string;
  username?: string;
  avatarUrl?: string;
  provider?: string;
  mode?: ExperienceMode;
  profile?: Partial<UserProfile>;
}): UserAccount {
  const token = `fb_${params.uid}`;
  const userId = params.uid;

  sessionsStore.set(token, userId);

  let entry = usersStore.get(userId);
  if (entry) {
    entry.account.name = params.name || entry.account.name;
    entry.account.email = params.email || entry.account.email;
    entry.account.avatarUrl = params.avatarUrl || entry.account.avatarUrl;
    entry.account.token = token;
    if (params.profile) {
      entry.account.profile = { ...entry.account.profile, ...params.profile };
    }
    return entry.account;
  }

  const cleanUsername =
    params.username ||
    (params.email ? params.email.split('@')[0] : `user_${userId.substring(0, 6)}`);
  const profile: UserProfile = {
    id: userId,
    name: params.name || 'Người dùng',
    username: cleanUsername,
    email: params.email || '',
    mode: params.mode || 'adult',
    language: 'vi',
    overallScore: params.profile?.overallScore ?? 0,
    xp: params.profile?.xp ?? 0,
    streakDays: params.profile?.streakDays ?? 0,
    completedScenarios: params.profile?.completedScenarios || [],
    trustedContacts: params.profile?.trustedContacts || [],
    avatarUrl:
      params.avatarUrl ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(params.name || 'U')}&backgroundColor=0f172a,1e293b`,
    provider: (params.provider as any) || 'firebase',
    createdAt: new Date().toISOString(),
    ...params.profile,
  };

  const account: UserAccount = {
    id: userId,
    username: cleanUsername,
    email: profile.email || '',
    name: profile.name,
    avatarUrl: profile.avatarUrl,
    provider: (profile.provider as any) || 'firebase',
    profile,
    token,
    createdAt: profile.createdAt || new Date().toISOString(),
  };

  usersStore.set(userId, { account });
  return account;
}

/**
 * Get user by session token or userId
 */
export function getUserByTokenOrId(identifier: string): UserAccount | null {
  if (!identifier) return null;

  const userIdFromSession = sessionsStore.get(identifier);
  if (userIdFromSession && usersStore.has(userIdFromSession)) {
    return usersStore.get(userIdFromSession)!.account;
  }

  if (usersStore.has(identifier)) {
    return usersStore.get(identifier)!.account;
  }

  if (identifier.startsWith('fb_')) {
    const rawUid = identifier.replace('fb_', '');
    if (usersStore.has(rawUid)) {
      const entry = usersStore.get(rawUid)!;
      entry.account.token = identifier;
      sessionsStore.set(identifier, rawUid);
      return entry.account;
    }
  }

  return null;
}

/**
 * Update user profile
 */
export function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): UserAccount | null {
  const entry = usersStore.get(userId);
  if (!entry) return null;

  entry.account.profile = {
    ...entry.account.profile,
    ...updates,
  };

  if (updates.name) {
    entry.account.name = updates.name;
  }
  if (updates.avatarUrl) {
    entry.account.avatarUrl = updates.avatarUrl;
  }

  return entry.account;
}

/**
 * Reset a user account or all accounts data
 */
export function resetUserAccountData(userId?: string) {
  if (userId && usersStore.has(userId)) {
    const entry = usersStore.get(userId)!;
    entry.account.profile = {
      ...entry.account.profile,
      completedScenarios: [],
      xp: 0,
      overallScore: 0,
      streakDays: 0,
      trustedContacts: [],
    };
    return { success: true, message: `Đã reset toàn bộ dữ liệu tài khoản ${userId}` };
  }

  usersStore.clear();
  sessionsStore.clear();
  return { success: true, message: 'Đã xóa sạch dữ liệu phiên người dùng.' };
}

/**
 * List all preset demo users (Empty — only real accounts are used)
 */
export function getPresetDemoUsers() {
  return [];
}
