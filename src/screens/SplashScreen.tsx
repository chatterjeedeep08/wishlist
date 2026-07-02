import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

/**
 * Shown while auth state / profile is loading. The RootNavigator
 * redirects to the Auth stack or Main app once loading finishes.
 */
export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>💝</Text>
      <Text style={styles.title}>Wishlist</Text>
      <Text style={styles.subtitle}>Wish together. Plan surprises.</Text>
      <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { fontSize: 56, marginBottom: spacing.sm },
  title: { fontSize: 32, fontWeight: '800', color: colors.primary },
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: spacing.xs },
});
