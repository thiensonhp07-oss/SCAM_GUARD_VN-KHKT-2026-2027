import { DuolingoLesson } from './duolingoLessons';

export type NodeKind = 'lesson' | 'boss' | 'reflex' | 'chest';

export interface BossAttackPhase {
  phaseNumber: number;
  bossQuote: string;
  threatDescription: string;
  incomingEvidence: {
    type: 'sms' | 'call' | 'transfer' | 'url' | 'deepfake';
    content: string;
    sender: string;
  };
  options: {
    id: string;
    label: string;
    isCorrect: boolean;
    damageToBoss: number;
    feedback: string;
  }[];
}

export interface BossBattle {
  id: string;
  sectorId: string;
  bossName: string;
  bossTitle: string;
  bossAvatar: string;
  bossBgGradient: string;
  bossHp: number;
  introStory: string;
  phases: BossAttackPhase[];
  xpReward: number;
  trophyName: string;
  trophyIcon: string;
}

export interface SpeedReflexItem {
  id: string;
  type: 'url' | 'sms' | 'email' | 'call' | 'qr';
  header: string;
  content: string;
  isScam: boolean;
  explanation: string;
}

export interface SpeedReflexChallenge {
  id: string;
  sectorId: string;
  title: string;
  subtitle: string;
  durationSeconds: number;
  xpReward: number;
  badgeName: string;
  items: SpeedReflexItem[];
}

export interface SupplyChest {
  id: string;
  sectorId: string;
  chestName: string;
  xpReward: number;
  artifactName: string;
  artifactDescription: string;
  artifactIcon: string;
}

export interface CampaignNode {
  id: string;
  sectorId: string;
  nodeIndex: number;
  kind: NodeKind;
  title: string;
  shortDesc: string;
  icon: string;
  xpReward: number;
  lessonData?: DuolingoLesson;
  bossData?: BossBattle;
  reflexData?: SpeedReflexChallenge;
  chestData?: SupplyChest;
}

export interface SectorCampaign {
  id: string;
  sectorNumber: number;
  title: string;
  subtitle: string;
  environmentTheme: string;
  biomeName: string;
  themeColor: {
    bg: string;
    border: string;
    glow: string;
    text: string;
    badgeBg: string;
    accent: string;
  };
  nodes: CampaignNode[];
}
