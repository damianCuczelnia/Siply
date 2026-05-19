export const COLORS = {
  // Primary water-themed palette
  primary: '#3B9EE8',
  primaryLight: '#6BB8F0',
  primaryDark: '#1E7CC8',

  // Accent
  accent: '#00C9FF',
  accentLight: '#7DE8FF',

  // Background
  background: '#F0F8FF',
  backgroundCard: '#FFFFFF',
  backgroundDark: '#E8F4FD',

  // Gradient stops
  gradientStart: '#E8F4FD',
  gradientEnd: '#C8E8F8',

  // Water fill gradient
  waterStart: '#3B9EE8',
  waterEnd: '#00C9FF',

  // Text
  textPrimary: '#1A2F45',
  textSecondary: '#6B8FA8',
  textLight: '#A8C4D8',
  textWhite: '#FFFFFF',

  // State colors
  success: '#4CAF82',
  warning: '#FFB347',
  danger: '#FF6B6B',

  // Shadow
  shadow: '#3B9EE8',
} as const;

export const QUICK_ADD_OPTIONS = [100, 250, 330, 500] as const;

export const DEFAULT_DAILY_GOAL_ML = 2000;

export const STORAGE_KEYS = {
  WATER_RECORDS: 'siply_water_records',
  SETTINGS: 'siply_settings',
} as const;

export const APP_INFO = {
  name: 'Siply',
  tagline: 'Nawadniaj się pięknie.',
  version: '1.0.0',
  author: 'Damian Chymkowski',
  description: 'Siply pomaga śledzić dzienne spożycie wody w prosty i elegancki sposób.',
} as const;
