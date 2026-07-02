import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WishType } from '../types';
import { colors, radius, spacing, typeBg, typeColor, WISH_TYPES } from '../theme';

interface Props {
  selected: WishType | null;
  onSelect: (type: WishType) => void;
}

export default function TypeSelector({ selected, onSelect }: Props) {
  return (
    <View style={styles.row}>
      {WISH_TYPES.map((t) => {
        const active = selected === t.key;
        return (
          <TouchableOpacity
            key={t.key}
            style={[
              styles.option,
              { backgroundColor: typeBg(t.key) },
              active && { borderColor: typeColor(t.key), borderWidth: 2 },
            ]}
            onPress={() => onSelect(t.key)}
            activeOpacity={0.8}
          >
            <Text style={styles.emoji}>{t.emoji}</Text>
            <Text style={[styles.label, { color: typeColor(t.key) }]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
