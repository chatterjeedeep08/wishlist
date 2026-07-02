import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import {
  configurePurchases,
  getPlans,
  PlanOption,
  purchasePlan,
  restorePurchases,
} from '../../services/subscriptionService';
import { colors, radius, spacing } from '../../theme';
import { MainStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'Subscription'>;

const FEATURES = [
  { icon: 'infinite', text: 'Unlimited wishes' },
  { icon: 'images', text: 'Unlimited image uploads' },
  { icon: 'sparkles', text: 'Secret planning for surprises' },
  { icon: 'rocket', text: 'All future premium features' },
];

export default function SubscriptionScreen({ navigation }: Props) {
  const { user, status } = useAuth();
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [live, setLive] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    (async () => {
      if (user) await configurePurchases(user.uid);
      const res = await getPlans();
      setPlans(res.plans);
      setLive(res.live);
      setSelected(res.plans[0]?.identifier ?? null);
      setLoading(false);
    })();
  }, [user?.uid]);

  const handleSubscribe = async () => {
    const plan = plans.find((p) => p.identifier === selected);
    if (!plan || !user) return;
    setBuying(true);
    try {
      await purchasePlan(user.uid, plan);
      Alert.alert('Welcome to Premium! 💎', 'Everything is unlocked. Enjoy!', [
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const code = (err as any)?.userCancelled;
      if (!code) Alert.alert('Purchase failed', (err as Error).message);
    } finally {
      setBuying(false);
    }
  };

  const handleRestore = async () => {
    if (!user) return;
    try {
      const restored = await restorePurchases(user.uid);
      Alert.alert(
        restored ? 'Restored!' : 'Nothing to restore',
        restored ? 'Your premium access is back.' : 'No previous purchases found for this account.'
      );
    } catch (err) {
      Alert.alert('Restore failed', (err as Error).message);
    }
  };

  if (status === 'premium') {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ fontSize: 52 }}>💎</Text>
        <Text style={styles.title}>You're Premium</Text>
        <Text style={styles.subtitle}>All features are unlocked. Thanks for supporting Wishlist!</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={{ fontSize: 44, textAlign: 'center' }}>💎</Text>
      <Text style={styles.title}>Wishlist Premium</Text>
      <Text style={styles.subtitle}>
        Keep wishing without limits and plan perfect surprises.
      </Text>

      <View style={styles.features}>
        {FEATURES.map((f) => (
          <View key={f.text} style={styles.feature}>
            <Ionicons name={f.icon as any} size={18} color={colors.primary} />
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
      ) : (
        <View style={styles.plans}>
          {plans.map((plan) => {
            const active = selected === plan.identifier;
            return (
              <TouchableOpacity
                key={plan.identifier}
                style={[styles.plan, active && styles.planActive]}
                onPress={() => setSelected(plan.identifier)}
                activeOpacity={0.85}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  <Text style={styles.planPrice}>{plan.priceString}</Text>
                </View>
                <Ionicons
                  name={active ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={active ? colors.primary : colors.textMuted}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <Button title="Subscribe" onPress={handleSubscribe} loading={buying} disabled={loading} />
      <TouchableOpacity onPress={handleRestore} style={styles.restore}>
        <Text style={styles.restoreText}>Restore purchases</Text>
      </TouchableOpacity>

      {!live && (
        <Text style={styles.demoNote}>
          Demo mode: RevenueCat isn't configured in this build, so subscribing
          unlocks Premium without charging. Add your RevenueCat API keys to
          enable real billing via Google Play.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  features: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginVertical: spacing.lg,
    gap: spacing.md,
  },
  feature: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  featureText: { fontSize: 15, fontWeight: '600', color: colors.text },
  plans: { gap: spacing.sm, marginBottom: spacing.lg },
  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.md,
  },
  planActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  planTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  planPrice: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  restore: { alignItems: 'center', marginTop: spacing.md },
  restoreText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  demoNote: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 18,
  },
});
