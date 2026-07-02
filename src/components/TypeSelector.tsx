import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WishType } from '../types';
import { Theme, radius, spacing, typeBg, typeColor, WISH_TYPES } from '../theme';
import { useTheme, useThemedStyles } from '../context/ThemeContext';

interface Props {
  selected: WishType | null;
  onSelect: (type: WishType) => void;
  /** Validation error shown under the selector. */
  error?: string;
}

export default function TypeSelector({ selected, onSelect, error }: Props) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View>
      <View style={styles.row}>
        {WISH_TYPES.map((t) => {
          const active = selected === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={[
                styles.option,
                { backgroundColor: typeBg(theme, t.key) },
                active && { borderColor: typeColor(theme, t.key), borderWidth: 2 },
              ]}
              onPress={() => onSelect(t.key)}
              activeOpacity={0.8}
            >
              <Text style={styles.emoji}>{t.emoji}</Text>
              <Text style={[styles.label, { color: typeColor(theme, t.key) }]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    row: { flexDirection: 'row', gap: spacing.sm },
    option: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    emoji: { fontSize: 20 },
    label: { fontSize: 11, fontWeight: '700', marginTop: 2 },
    error: { color: colors.danger, fontSize: 12, marginTop: 6 },
  });
