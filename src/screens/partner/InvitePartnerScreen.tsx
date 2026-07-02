import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { createInvite } from '../../services/coupleService';
import { Theme, radius, spacing } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';

/**
 * Generates the invite code (creating the couple document) and lets the
 * user share it. Once the code exists the user already has a coupleId,
 * so the RootNavigator moves them into the main app — their partner can
 * join at any time.
 */
export default function InvitePartnerScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) return;
    createInvite(user.uid)
      .then((couple) => setCode(couple.inviteCode))
      .catch(() => setError(true));
  }, [user?.uid]);

  const shareCode = async () => {
    if (!code) return;
    await Share.share({
      message: `Join me on Wishlist! 💝 Enter my invite code: ${code}`,
    });
  };

  const copyCode = async () => {
    if (!code) return;
    await Clipboard.setStringAsync(code);
    Alert.alert('Copied', 'Invite code copied to clipboard.');
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.subtitle}>
          Could not create an invite. Check your connection and try again.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💌</Text>
      <Text style={styles.title}>Your invite code</Text>
      <Text style={styles.subtitle}>
        Share this code with your partner. When they join, your wishlists merge.
      </Text>

      {code ? (
        <TouchableOpacity style={styles.codeBox} onPress={copyCode} activeOpacity={0.8}>
          <Text style={styles.code}>{code}</Text>
          <View style={styles.copyHint}>
            <Ionicons name="copy-outline" size={14} color={theme.colors.textMuted} />
            <Text style={styles.copyHintText}>Tap to copy</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <ActivityIndicator color={theme.colors.primary} style={{ marginVertical: spacing.xl }} />
      )}

      <Button title="Share code" onPress={shareCode} disabled={!code} />
      <Text style={styles.note}>
        You can start adding wishes right away — your partner will see them once
        they join.
      </Text>
    </View>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
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
    codeBox: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      borderWidth: 2,
      borderColor: colors.primary,
      borderStyle: 'dashed',
      paddingVertical: spacing.lg,
      alignItems: 'center',
      marginVertical: spacing.xl,
    },
    code: {
      fontSize: 40,
      fontWeight: '800',
      letterSpacing: 8,
      color: colors.primary,
    },
    copyHint: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm },
    copyHintText: { fontSize: 12, color: colors.textMuted },
    note: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: spacing.lg,
      lineHeight: 19,
    },
  });
