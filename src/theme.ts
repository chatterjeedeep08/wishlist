import { WishType } from './types';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
};

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  background: string;
  card: string;
  text: string;
  textMuted: string;
  border: string;
  success: string;
  successBg: string;
  danger: string;
  gold: string;
  goldBg: string;

  food: string;
  foodBg: string;
  activity: string;
  activityBg: string;
  place: string;
  placeBg: string;
  gift: string;
  giftBg: string;
}

export interface Theme {
  key: ThemeKey;
  label: string;
  emoji: string;
  dark: boolean;
  /** Large faint emoji scattered as background graphics. */
  bgEmojis: string[];
  colors: ThemeColors;
}

export type ThemeKey = 'love' | 'cutesy' | 'dark' | 'modern' | 'nature' | 'sunset';

export const DEFAULT_THEME_KEY: ThemeKey = 'love';

const lightCategories = {
  food: '#F2913D',
  foodBg: '#FDEEDD',
  activity: '#8A63D2',
  activityBg: '#EFE8FB',
  place: '#2FA8A0',
  placeBg: '#DFF4F2',
  gift: '#E85D75',
  giftBg: '#FFE3E8',
};

export const THEMES: Record<ThemeKey, Theme> = {
  love: {
    key: 'love',
    label: 'Love',
    emoji: '💕',
    dark: false,
    bgEmojis: ['💗', '💘', '💝', '💞'],
    colors: {
      primary: '#E85D75',
      primaryDark: '#C94560',
      primaryLight: '#FFE3E8',
      background: '#FFF5F6',
      card: '#FFFFFF',
      text: '#2B2233',
      textMuted: '#8A7F92',
      border: '#F0DDE1',
      success: '#3BAF7E',
      successBg: '#E2F5EC',
      danger: '#D64550',
      gold: '#E8A33D',
      goldBg: '#FBF3E2',
      ...lightCategories,
    },
  },
  cutesy: {
    key: 'cutesy',
    label: 'Cutesy',
    emoji: '🎀',
    dark: false,
    bgEmojis: ['🎀', '🧸', '🌸', '🍓'],
    colors: {
      primary: '#F06EB2',
      primaryDark: '#D14E96',
      primaryLight: '#FFE0F0',
      background: '#FFF0F7',
      card: '#FFFFFF',
      text: '#463046',
      textMuted: '#A386A0',
      border: '#F6D9E9',
      success: '#57BE8E',
      successBg: '#E4F6EC',
      danger: '#E25667',
      gold: '#EFAE4E',
      goldBg: '#FCF3E1',
      food: '#F49A56',
      foodBg: '#FDEFE0',
      activity: '#A175E0',
      activityBg: '#F1E9FC',
      place: '#4BB4C9',
      placeBg: '#E2F4F8',
      gift: '#F06EB2',
      giftBg: '#FFE0F0',
    },
  },
  dark: {
    key: 'dark',
    label: 'Dark',
    emoji: '🌙',
    dark: true,
    bgEmojis: ['🌙', '✨', '⭐', '🌌'],
    colors: {
      primary: '#F27B93',
      primaryDark: '#F79DAF',
      primaryLight: '#3D2530',
      background: '#15121C',
      card: '#221D2C',
      text: '#F2EDF7',
      textMuted: '#9C91AC',
      border: '#342C42',
      success: '#4FC08D',
      successBg: '#1E3229',
      danger: '#E36470',
      gold: '#E8B45C',
      goldBg: '#37301E',
      food: '#F2A05C',
      foodBg: '#37281A',
      activity: '#A98BE4',
      activityBg: '#2B2340',
      place: '#54BDB4',
      placeBg: '#1B3331',
      gift: '#F27B93',
      giftBg: '#3D2530',
    },
  },
  modern: {
    key: 'modern',
    label: 'Modern',
    emoji: '🏙️',
    dark: false,
    bgEmojis: ['◽', '▫️', '🔷', '🏙️'],
    colors: {
      primary: '#5B67F1',
      primaryDark: '#4450D6',
      primaryLight: '#E4E7FE',
      background: '#F4F5F8',
      card: '#FFFFFF',
      text: '#1F2430',
      textMuted: '#7A8194',
      border: '#E3E6EE',
      success: '#2FA871',
      successBg: '#E0F4EA',
      danger: '#D9505C',
      gold: '#D9982F',
      goldBg: '#F8F0DC',
      food: '#E8823C',
      foodBg: '#FBEBDD',
      activity: '#7D64DE',
      activityBg: '#ECE7FB',
      place: '#2596A8',
      placeBg: '#DDF1F4',
      gift: '#5B67F1',
      giftBg: '#E4E7FE',
    },
  },
  nature: {
    key: 'nature',
    label: 'Nature',
    emoji: '🌿',
    dark: false,
    bgEmojis: ['🌿', '🍃', '🌻', '🦋'],
    colors: {
      primary: '#3E9B63',
      primaryDark: '#2E7C4D',
      primaryLight: '#DDF0E4',
      background: '#F3F8F1',
      card: '#FFFFFF',
      text: '#25342A',
      textMuted: '#7E9184',
      border: '#DDEADF',
      success: '#3E9B63',
      successBg: '#DDF0E4',
      danger: '#CE5B4E',
      gold: '#C89A3A',
      goldBg: '#F5EEDA',
      food: '#DC8A3E',
      foodBg: '#F9ECDD',
      activity: '#6F8F3C',
      activityBg: '#EAF2DC',
      place: '#3789A0',
      placeBg: '#E0EFF4',
      gift: '#C15B79',
      giftBg: '#F7E3EA',
    },
  },
  sunset: {
    key: 'sunset',
    label: 'Sunset',
    emoji: '🌅',
    dark: false,
    bgEmojis: ['🌅', '🧡', '🌇', '☀️'],
    colors: {
      primary: '#EE7B4D',
      primaryDark: '#D6613A',
      primaryLight: '#FDE4D9',
      background: '#FFF6F0',
      card: '#FFFFFF',
      text: '#3A2A26',
      textMuted: '#9C837B',
      border: '#F3E0D6',
      success: '#43A981',
      successBg: '#E1F3EC',
      danger: '#D64550',
      gold: '#E8A33D',
      goldBg: '#FBF3E2',
      food: '#E58A2E',
      foodBg: '#FBEEDB',
      activity: '#B0629E',
      activityBg: '#F5E5F1',
      place: '#3F9AA8',
      placeBg: '#E1F1F4',
      gift: '#EE7B4D',
      giftBg: '#FDE4D9',
    },
  },
};

export function resolveTheme(key: string | null | undefined): Theme {
  return THEMES[(key as ThemeKey) ?? DEFAULT_THEME_KEY] ?? THEMES[DEFAULT_THEME_KEY];
}

export const WISH_TYPES: {
  key: WishType;
  label: string;
  icon: string;
  emoji: string;
}[] = [
  { key: 'food', label: 'Food', icon: 'restaurant', emoji: '🍜' },
  { key: 'activity', label: 'Activities', icon: 'bicycle', emoji: '🎨' },
  { key: 'place', label: 'Places', icon: 'location', emoji: '🏖️' },
  { key: 'gift', label: 'Gifts', icon: 'gift', emoji: '🎁' },
];

export function typeColor(theme: Theme, type: WishType): string {
  return theme.colors[type];
}

export function typeBg(theme: Theme, type: WishType): string {
  return theme.colors[`${type}Bg` as const];
}

export function typeMeta(type: WishType) {
  return WISH_TYPES.find((t) => t.key === type) ?? WISH_TYPES[0];
}
