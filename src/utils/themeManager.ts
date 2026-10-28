/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ThemePresetId =
  | 'cyberpunk'
  | 'emerald_matrix'
  | 'synthwave_purple'
  | 'solar_amber'
  | 'crimson_alert'
  | 'ocean_sapphire'
  | 'sakura_cyber'
  | 'clean_light'
  | 'oled_black'
  | 'nordic_forest';

export type GlowIntensity = 'none' | 'subtle' | 'normal' | 'ultra';
export type BgPatternStyle = 'grid' | 'dots' | 'hex' | 'scanlines' | 'none';
export type CardGlassStyle = 'glass' | 'solid' | 'neon_glow';
export type BorderRadiusStyle = 'sharp' | 'standard' | 'pill';
export type UiDensity = 'compact' | 'comfortable' | 'accessible_large';
export type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'high_contrast';

export interface ThemePreset {
  id: ThemePresetId;
  name: string;
  nameVi: string;
  category: 'cyber' | 'tactical' | 'natural' | 'minimal';
  accentColor: string;
  accentSecondary: string;
  bgBase: string;
  bgSurface: string;
  textBase: string;
  textMuted: string;
  descriptionVi: string;
  badge: string;
  isLight?: boolean;
}

export interface ThemeConfig {
  preset: ThemePresetId;
  accentColor: string;
  accentSecondary: string;
  bgBase: string;
  bgSurface: string;
  glowIntensity: GlowIntensity;
  bgPattern: BgPatternStyle;
  cardGlass: CardGlassStyle;
  borderRadius: BorderRadiusStyle;
  uiDensity: UiDensity;
  colorBlindMode: ColorBlindMode;
  customMode: boolean;
}

const UNIFIED_SECURITY_DAYLIGHT_PRESET: ThemePreset = {
  id: 'clean_light',
  name: 'ScamGuard Security Daylight',
  nameVi: 'Trắng An Ninh Dịu Mắt (Security Daylight)',
  category: 'minimal',
  accentColor: '#0284c7',
  accentSecondary: '#2563eb',
  bgBase: '#f3f6fa',
  bgSurface: '#ffffff',
  textBase: '#0f172a',
  textMuted: '#475569',
  descriptionVi:
    'Giao diện chuẩn an ninh mạng nền trắng Alabaster chống chói mắt kết hợp sắc xanh dương bảo mật đồng bộ.',
  badge: 'Chuẩn An Ninh Mặc Định',
  isLight: true,
};

export const THEME_PRESETS: Record<ThemePresetId, ThemePreset> = {
  cyberpunk: UNIFIED_SECURITY_DAYLIGHT_PRESET,
  emerald_matrix: UNIFIED_SECURITY_DAYLIGHT_PRESET,
  synthwave_purple: UNIFIED_SECURITY_DAYLIGHT_PRESET,
  solar_amber: UNIFIED_SECURITY_DAYLIGHT_PRESET,
  crimson_alert: UNIFIED_SECURITY_DAYLIGHT_PRESET,
  ocean_sapphire: UNIFIED_SECURITY_DAYLIGHT_PRESET,
  sakura_cyber: UNIFIED_SECURITY_DAYLIGHT_PRESET,
  oled_black: UNIFIED_SECURITY_DAYLIGHT_PRESET,
  clean_light: UNIFIED_SECURITY_DAYLIGHT_PRESET,
  nordic_forest: UNIFIED_SECURITY_DAYLIGHT_PRESET,
};

export const QUICK_ACCENT_COLORS = [
  { hex: '#0284c7', name: 'Security Sky' },
  { hex: '#2563eb', name: 'Royal Blue' },
];

export const QUICK_BG_COLORS = [
  { hex: '#f3f6fa', name: 'Anti-Glare Alabaster', isLight: true },
  { hex: '#ffffff', name: 'Pure White Surface', isLight: true },
];

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  preset: 'clean_light',
  accentColor: '#0284c7',
  accentSecondary: '#2563eb',
  bgBase: '#f3f6fa',
  bgSurface: '#ffffff',
  glowIntensity: 'subtle',
  bgPattern: 'dots',
  cardGlass: 'solid',
  borderRadius: 'standard',
  uiDensity: 'comfortable',
  colorBlindMode: 'none',
  customMode: false,
};

export function getStoredThemeConfig(): ThemeConfig {
  return DEFAULT_THEME_CONFIG;
}

export function applyThemeToDom(_config?: ThemeConfig) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const body = document.body;

  root.style.setProperty('--theme-accent', '#0284c7');
  root.style.setProperty('--theme-accent-rgb', '2, 132, 199');
  root.style.setProperty('--theme-accent-secondary', '#2563eb');
  root.style.setProperty('--theme-accent-secondary-rgb', '37, 99, 235');
  root.style.setProperty('--theme-bg-base', '#f3f6fa');
  root.style.setProperty('--theme-bg-surface', '#ffffff');
  root.style.setProperty('--theme-border', '#e2e8f0');
  root.style.setProperty('--theme-text-base', '#0f172a');
  root.style.setProperty('--theme-text-muted', '#475569');
  root.style.setProperty('--theme-border-radius', '14px');
  root.style.setProperty('--theme-glow-opacity', '0.12');

  root.classList.add('theme-mode-light');
  root.classList.remove('theme-mode-dark');
  root.style.colorScheme = 'light';

  if (body) {
    body.style.backgroundColor = '#f3f6fa';
    body.style.color = '#0f172a';
  }
}

export function saveThemeConfig(_config: ThemeConfig) {
  applyThemeToDom(DEFAULT_THEME_CONFIG);
}

export function applyThemePreset(_presetId: ThemePresetId, _currentConfig: ThemeConfig): ThemeConfig {
  applyThemeToDom(DEFAULT_THEME_CONFIG);
  return DEFAULT_THEME_CONFIG;
}
