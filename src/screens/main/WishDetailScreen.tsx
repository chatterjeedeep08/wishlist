import React, { useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import PromptModal from '../../components/PromptModal';
import { useAuth } from '../../context/AuthContext';
import { useWishes } from '../../context/WishesContext';
import {
  completeWish,
  deleteWish,
  reopenWish,
  togglePlanning,
} from '../../services/wishService';
import { Theme, radius, spacing, typeBg, typeColor, typeMeta } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import { MainStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'WishDetail'>;

export default function WishDetailScreen({ navigation, route }: Props) {
  const { wishId } = route.params;
  const { user, profile, fullAccess } = useAuth();
  const { wishes, plannedWishIds } = useWishes();
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [notePromptVisible, setNotePromptVisible] = useState(false);

  const wish = wishes.find((w) => w.id === wishId);

  if (!wish || !user || !profile) {
    return (
      <View style={styles.missing}>
        <EmptyState emoji="🫥" title="Wish not found" subtitle="It may have been deleted." />
      </View>
    );
  }

  const c = theme.colors;
  const meta = typeMeta(wish.type);
  const isMine = wish.createdBy === user.uid;
  // Secret planning: plans live in a private collection, so the creator
  // can't see them even by querying Firestore directly.
  const iAmPlanning = plannedWishIds.has(wish.id);
  const completed = wish.status === 'completed';

  const handlePlan = async () => {
    if (!fullAccess) {
      Alert.alert(
        'Premium feature',
        'Secret planning is part of Premium. Upgrade to plan surprises!',
        [
          { text: 'Not now' },
          { text: 'Upgrade', onPress: () => navigation.navigate('Subscription') },
        ]
      );
      return;
    }
    await togglePlanning(wish, user.uid, iAmPlanning);
  };

  const finishCompletion = async (note?: string) => {
    setNotePromptVisible(false);
    await completeWish(wish, profile, note);
    navigation.goBack();
  };

  const handleComplete = async () => {
    if (completed) {
      await reopenWish(wish.id);
    } else {
      // Optional memory note before marking it done.
      setNotePromptVisible(true);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete wish?', `“${wish.title}” will be removed for both of you.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteWish(wish.id, user.uid);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <PromptModal
        visible={notePromptVisible}
        title="Wish completed 🎉"
        message="Add a note about how it went (optional) — it's saved with the memory."
        placeholder="e.g. Went there for our anniversary, loved it!"
        confirmLabel="Save"
        cancelLabel="Skip"
        multiline
        onConfirm={(note) => finishCompletion(note)}
        onCancel={() => finishCompletion()}
      />

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
          <Text style={{ fontSize: 56 }}>{meta.emoji}</Text>
        </View>
      )}

      <View style={styles.badgeRow}>
        <View style={[styles.badge, { backgroundColor: typeBg(theme, wish.type) }]}>
          <Ionicons name={meta.icon as any} size={13} color={typeColor(theme, wish.type)} />
          <Text style={[styles.badgeText, { color: typeColor(theme, wish.type) }]}>
            {meta.label}
          </Text>
        </View>
        <View style={[styles.badge, styles.priorityBadge]}>
          <Text style={styles.badgeTextMuted}>Priority: {wish.priority}</Text>
        </View>
        {completed && (
          <View style={[styles.badge, { backgroundColor: c.successBg }]}>
            <Text style={[styles.badgeText, { color: c.success }]}>Completed ✓</Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>{wish.title}</Text>
      <Text style={styles.creator}>
        Added by {isMine ? 'you' : wish.createdByName}
        {wish.price ? ` · ${wish.price}` : ''}
      </Text>

      {wish.description ? <Text style={styles.description}>{wish.description}</Text> : null}

      {completed && wish.completionNote ? (
        <View style={styles.noteBox}>
          <Ionicons name="journal-outline" size={16} color={c.success} />
          <Text style={styles.noteText}>{wish.completionNote}</Text>
        </View>
      ) : null}

      {wish.link ? (
        <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL(wish.link!)}>
          <Ionicons name="link-outline" size={16} color={c.primary} />
          <Text style={styles.linkText} numberOfLines={1}>
            {wish.link}
          </Text>
          <Ionicons name="open-outline" size={16} color={c.primary} />
        </TouchableOpacity>
      ) : null}

      {iAmPlanning && (
        <View style={styles.planningNote}>
          <Ionicons name="sparkles" size={16} color={c.gold} />
          <Text style={styles.planningNoteText}>
            You're secretly planning this. {isMine ? '' : `${wish.createdByName} can't see it.`}
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        {!completed && (
          <Button
            title="Edit wish ✏️"
            variant="secondary"
            onPress={() => navigation.navigate('ManualWish', { editWishId: wish.id })}
          />
        )}
        {!isMine && !completed && (
          <Button
            title={iAmPlanning ? 'Stop planning 🤫' : 'Plan this (secret) 🤫'}
            variant="secondary"
            onPress={handlePlan}
          />
        )}
        <Button
          title={completed ? 'Move back to wishlist' : 'Mark completed ✓'}
          onPress={handleComplete}
          variant={completed ? 'secondary' : 'primary'}
        />
        <Button title="Delete wish" variant="danger" onPress={handleDelete} />
      </View>
    </ScrollView>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    missing: { flex: 1, backgroundColor: colors.background, justifyContent: 'center' },
    image: {
      width: '100%',
      height: 220,
      borderRadius: radius.lg,
      marginBottom: spacing.md,
      backgroundColor: colors.border,
    },
    imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
    badgeRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: radius.pill,
    },
    priorityBadge: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    badgeText: { fontSize: 12, fontWeight: '700' },
    badgeTextMuted: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
      textTransform: 'capitalize',
    },
    title: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: spacing.md },
    creator: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
    description: { fontSize: 15, color: colors.text, lineHeight: 22, marginTop: spacing.md },
    noteBox: {
      flexDirection: 'row',
      gap: spacing.sm,
      backgroundColor: colors.successBg,
      borderRadius: radius.md,
      padding: spacing.md,
      marginTop: spacing.md,
    },
    noteText: { flex: 1, fontSize: 14, color: colors.text, lineHeight: 20, fontStyle: 'italic' },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.md,
      marginTop: spacing.md,
    },
    linkText: { flex: 1, fontSize: 13, color: colors.primary },
    planningNote: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.goldBg,
      borderRadius: radius.md,
      padding: spacing.md,
      marginTop: spacing.md,
    },
    planningNoteText: { flex: 1, fontSize: 13, color: colors.gold, fontWeight: '600' },
    actions: { marginTop: spacing.lg, gap: spacing.sm },
  });
