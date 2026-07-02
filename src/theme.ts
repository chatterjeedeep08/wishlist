import { WishType } from './types';

export const colors = {
  primary: '#E85D75',
  primaryDark: '#C94560',
  primaryLight: '#FFE3E8',
  background: '#FFF5F6',
  card: '#FFFFFF',
  text: '#2B2233',
  textMuted: '#8A7F92',
  border: '#F0DDE1',
  success: '#3BAF7E',
  danger: '#D64550',
  gold: '#E8A33D',

  food: '#F2913D',
  foodBg: '#FDEEDD',
  activity: '#8A63D2',
  activityBg: '#EFE8FB',
  place: '#2FA8A0',
  placeBg: '#DFF4F2',
  gift: '#E85D75',
  giftBg: '#FFE3E8',
};

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

export function typeColor(type: WishType): string {
  return colors[type];
}

export function typeBg(type: WishType): string {
  return colors[`${type}Bg` as const];
}

export function typeMeta(type: WishType) {
  return WISH_TYPES.find((t) => t.key === type) ?? WISH_TYPES[0];
}
