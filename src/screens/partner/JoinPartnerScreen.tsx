import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { joinWithCode } from '../../services/coupleService';
import { colors, radius, spacing } from '../../theme';

export default function JoinPartnerScreen() {
  const { profile } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      await joinWithCode(profile, code);
      // RootNavigator switches to the main app once coupleId lands.
    } catch (err) {
      Alert.alert('Could not join', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🔑</Text>
      <Text style={styles.title}>Enter invite code</Text>
      <Text style={styles.subtitle}>
        Ask your partner for the 6-character code from their Wishlist app.
      </Text>

      <TextInput
        style={styles.codeInput}
        value={code}
        onChangeText={(t) => setCode(t.toUpperCase())}
        placeholder="AB23KD"
        placeholderTextColor={colors.border}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={6}
      />

      <Button
        title="Join partner"
        onPress={handleJoin}
        loading={loading}
        disabled={code.trim().length !== 6}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  emoji: { fontSize: 48, textAlign: 'center' },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 21,
  },
  codeInput: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    marginVertical: spacing.xl,
    paddingVertical: spacing.md,
    textAlign: 'center',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 8,
    color: colors.text,
  },
});
