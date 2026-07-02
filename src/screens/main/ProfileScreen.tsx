import React from 'react';
import {
  Alert,
  ScrollView,
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
import { logOut } from '../../services/authService';
import { colors, radius, spacing } from '../../theme';
import { MainStackParamList, TabsParamList } from '../../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabsParamList, 'Profile'>,
  NativeStackScreenProps<MainStackParamList>
>;

const STATUS_LABELS: Record<string, string> = {
  trial: 'Free trial',
  free: 'Free tier',
  premium: 'Premium 💎',
};

export default function ProfileScreen({ navigation }: Props) {
  const { profile, partner, status, trialRemaining } = useAuth();

  const handleLogout = () => {
    Alert.alert('Log out?', 'You can log back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logOut() },
    ]);
  };

  const initials = (profile?.name ?? '?')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{profile?.name}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
        <View style={styles.partnerRow}>
          <Ionicons name="heart" size={14} color={colors.primary} />
          <Text style={styles.partnerText}>
            {partner ? `Paired with ${partner.name}` : 'Not paired yet'}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.subRow}>
          <View>
            <Text style={styles.subLabel}>Subscription</Text>
            <Text style={styles.subStatus}>{STATUS_LABELS[status]}</Text>
            {status === 'trial' && trialRemaining && (
              <Text style={styles.subDetail}>{trialRemaining} of full access left</Text>
            )}
            {status === 'free' && (
              <Text style={styles.subDetail}>Max 20 wishes · limited images</Text>
            )}
            {status === 'premium' && (
              <Text style={styles.subDetail}>Unlimited wishes & secret planning</Text>
            )}
          </View>
          {status !== 'premium' && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => navigation.navigate('Subscription')}
            >
              <Text style={styles.upgradeText}>Upgrade</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Subscription')}>
        <Ionicons name="diamond-outline" size={20} color={colors.primary} />
        <Text style={styles.rowText}>Manage subscription</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('CompletedWishes')}>
        <Ionicons name="checkmark-done-outline" size={20} color={colors.success} />
        <Text style={styles.rowText}>Completed wishes</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.row} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={[styles.rowText, { color: colors.danger }]}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 26, fontWeight: '800', color: colors.primary },
  name: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  email: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  partnerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  partnerText: { fontSize: 14, color: colors.text, fontWeight: '600' },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  subLabel: {
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  subStatus: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 2 },
  subDetail: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  upgradeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  upgradeText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowText: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
});
