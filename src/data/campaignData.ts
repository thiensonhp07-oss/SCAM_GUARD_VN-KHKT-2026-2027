export * from './campaignTypes';
export * from './campaignBattles';
import { SECTORS_PART_1 } from './campaignSectorsPart1';
import { SECTORS_PART_2 } from './campaignSectorsPart2';
import { SectorCampaign } from './campaignTypes';

// 12 COMPREHENSIVE THEMATIC SIMULATION SECTORS (10 STATIONS EACH = 120 NODES)
export const CAMPAIGN_SECTORS: SectorCampaign[] = [
  ...SECTORS_PART_1,
  ...SECTORS_PART_2,
];
