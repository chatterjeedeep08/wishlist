import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Wish } from '../types';
import { Theme, radius, spacing, typeBg, typeColor, typeMeta } from '../theme';
import { useTheme, useThemedStyles } from '../context/ThemeContext';

const SOURCE_LABELS: Record<string, string> = {
  manual: 'Added manually',
  shopping: 'Shopping',
  instagram: 'Instagram',
  maps: 'Maps',
  shared: 'Shared',
  link: 'Link',
};

interface Props {
  wish: Wish;
  currentUserId: string;
  /** True when the current user secretly plans this wish (only they know). */
  isPlanning?: boolean;
  onPress: () => void;
}

export default function WishCard({ wish, currentUserId, isPlanning, onPress }: Props) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const meta = typeMeta(wish.type);
  const isMine = wish.createdBy === currentUserId;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {wish.image ? (
        <Image source={{ uri: wish.image }} style={styles.image} />
      ) : (
        <View
          style={[
            styles.image,
            styles.imagePlaceholder,
            { backgroundColor: typeBg(theme, wish.type) },
          ]}
        >
          <Text style={styles.placeholderEmoji}>{meta.emoji}</Text>
        </View>
      )}
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={[styles.typeBadge, { backgroundColor: typeBg(theme, wish.type) }]}>
            <Ionicons name={meta.icon as any} size={12} color={typeColor(theme, wish.type)} />
            <Text style={[styles.typeText, { color: typeColor(theme, wish.type) }]}>
              {meta.label}
            </Text>
          </View>
          {!!isPlanning && (
            <View style={styles.planningBadge}>
              <Ionicons name="sparkles" size={11} color={theme.colors.gold} />
              <Text style={styles.planningText}>Planning</Text>
            </View>
          )}
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {wish.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {isMine ? 'You' : wish.createdByName} · {SOURCE_LABELS[wish.source] ?? wish.source}
          {wish.price ? ` · ${wish.price}` : ''}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: spacing.sm,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    image: {
      width: 64,
      height: 64,
      borderRadius: radius.md,
      marginRight: spacing.md,
    },
    imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
    placeholderEmoji: { fontSize: 26 },
    body: { flex: 1, marginRight: spacing.sm },
    topRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    typeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radius.pill,
    },
    typeText: { fontSize: 11, fontWeight: '700' },
    planningBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radius.pill,
      backgroundColor: colors.goldBg,
    },
    planningText: { fontSize: 11, fontWeight: '700', color: colors.gold },
    title: { fontSize: 15, fontWeight: '600', color: colors.text },
    meta: { fontSize: 12, color: colors.textMuted, marginTop: 3 },
  });
