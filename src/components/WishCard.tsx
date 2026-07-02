import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Wish } from '../types';
import { colors, radius, spacing, typeBg, typeColor, typeMeta } from '../theme';

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
  onPress: () => void;
}

export default function WishCard({ wish, currentUserId, onPress }: Props) {
  const meta = typeMeta(wish.type);
  const isMine = wish.createdBy === currentUserId;
  // Secret planning: only the planner ever sees this indicator.
  const iAmPlanning = wish.plannedBy === currentUserId;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {wish.image ? (
        <Image source={{ uri: wish.image }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder, { backgroundColor: typeBg(wish.type) }]}>
          <Text style={styles.placeholderEmoji}>{meta.emoji}</Text>
        </View>
      )}
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={[styles.typeBadge, { backgroundColor: typeBg(wish.type) }]}>
            <Ionicons name={meta.icon as any} size={12} color={typeColor(wish.type)} />
            <Text style={[styles.typeText, { color: typeColor(wish.type) }]}>
              {meta.label}
            </Text>
          </View>
          {iAmPlanning && (
            <View style={styles.planningBadge}>
              <Ionicons name="sparkles" size={11} color={colors.gold} />
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
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#FBF3E2',
  },
  planningText: { fontSize: 11, fontWeight: '700', color: colors.gold },
  title: { fontSize: 15, fontWeight: '600', color: colors.text },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 3 },
});
