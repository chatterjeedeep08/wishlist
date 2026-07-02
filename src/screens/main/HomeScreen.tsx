import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useWishes } from '../../context/WishesContext';
import { getCouple } from '../../services/coupleService';
import WishCard from '../../components/WishCard';
import EmptyState from '../../components/EmptyState';
import { colors, radius, spacing } from '../../theme';
import { MainStackParamList, TabsParamList } from '../../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabsParamList, 'Home'>,
  NativeStackScreenProps<MainStackParamList>
>;

export default function HomeScreen({ navigation }: Props) {
  const { user, profile, partner, status, trialRemaining } = useAuth();
  const { activeWishes, plannedWishIds } = useWishes();
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const waitingForPartner = !!profile?.coupleId && !profile.partnerId;

  useEffect(() => {
    if (waitingForPartner && profile?.coupleId) {
      getCouple(profile.coupleId).then((c) => setInviteCode(c?.inviteCode ?? null));
    }
  }, [waitingForPartner, profile?.coupleId]);

  const shareInvite = async () => {
    if (!inviteCode) return;
    await Share.share({
      message: `Join me on Wishlist! 💝 Enter my invite code: ${inviteCode}`,
    });
  };

  const recent = activeWishes.slice(0, 5);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Hi {profile?.name?.split(' ')[0] ?? 'there'} 👋</Text>
          <Text style={styles.partnerLine}>
            {partner ? `You & ${partner.name}` : 'Your shared wishlist'}
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddWish')}>
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {status === 'trial' && trialRemaining && (
        <TouchableOpacity
          style={styles.trialBanner}
          onPress={() => navigation.navigate('Subscription')}
        >
          <Ionicons name="time-outline" size={18} color={colors.gold} />
          <Text style={styles.trialText}>
            Free trial: {trialRemaining} left — tap to see Premium
          </Text>
        </TouchableOpacity>
      )}
      {status === 'free' && (
        <TouchableOpacity
          style={styles.trialBanner}
          onPress={() => navigation.navigate('Subscription')}
        >
          <Ionicons name="lock-closed-outline" size={18} color={colors.gold} />
          <Text style={styles.trialText}>
            Trial ended — you're on the free tier. Tap to upgrade.
          </Text>
        </TouchableOpacity>
      )}

      {waitingForPartner && (
        <TouchableOpacity style={styles.inviteBanner} onPress={shareInvite} activeOpacity={0.85}>
          <Text style={styles.inviteTitle}>Waiting for your partner 💌</Text>
          <Text style={styles.inviteText}>
            {inviteCode
              ? `Share your invite code: ${inviteCode}`
              : 'Loading your invite code…'}
          </Text>
          <View style={styles.inviteShare}>
            <Ionicons name="share-social-outline" size={15} color={colors.primary} />
            <Text style={styles.inviteShareText}>Tap to share</Text>
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent wishes</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Wishlist')}>
          <Text style={styles.sectionLink}>See all</Text>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: spacing.md }}>
        {recent.length === 0 ? (
          <EmptyState
            emoji="🌱"
            title="No wishes yet"
            subtitle="Add your first wish — a restaurant, a trip, a gift idea, anything!"
          />
        ) : (
          recent.map((wish) => (
            <WishCard
              key={wish.id}
              wish={wish}
              currentUserId={user?.uid ?? ''}
              isPlanning={plannedWishIds.has(wish.id)}
              onPress={() => navigation.navigate('WishDetail', { wishId: wish.id })}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  greeting: { fontSize: 26, fontWeight: '800', color: colors.text },
  partnerLine: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#FBF3E2',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  trialText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#8A6D2F' },
  inviteBanner: {
    backgroundColor: colors.primaryLight,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  inviteTitle: { fontSize: 15, fontWeight: '700', color: colors.primaryDark },
  inviteText: { fontSize: 13, color: colors.primaryDark, marginTop: 4 },
  inviteShare: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm },
  inviteShareText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  sectionLink: { fontSize: 14, fontWeight: '600', color: colors.primary },
});
