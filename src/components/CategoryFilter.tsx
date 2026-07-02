import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { WishType } from '../types';
import { Theme, radius, spacing, typeColor, WISH_TYPES } from '../theme';
import { useTheme, useThemedStyles } from '../context/ThemeContext';

interface Props {
  selected: WishType | 'all';
  onSelect: (value: WishType | 'all') => void;
}

export default function CategoryFilter({ selected, onSelect }: Props) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const options: { key: WishType | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    ...WISH_TYPES.map((t) => ({ key: t.key, label: t.label })),
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {options.map((opt) => {
        const active = selected === opt.key;
        const color =
          opt.key === 'all' ? theme.colors.primary : typeColor(theme, opt.key as WishType);
        return (
          <TouchableOpacity
            key={opt.key}
            style={[styles.pill, active && { backgroundColor: color, borderColor: color }]}
            onPress={() => onSelect(opt.key)}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    row: { gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
    pill: {
      paddingHorizontal: spacing.md,
      paddingVertical: 8,
      borderRadius: radius.pill,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    label: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
    labelActive: { color: '#fff' },
  });
