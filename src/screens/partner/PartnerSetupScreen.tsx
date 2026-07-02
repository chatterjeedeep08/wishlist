import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ThemedBackdrop from '../../components/ThemedBackdrop';
import { Theme, radius, spacing } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import { PartnerStackParamList } from '../../navigation/types';
import { logOut } from '../../services/authService';

type Props = NativeStackScreenProps<PartnerStackParamList, 'PartnerSetup'>;

export default function PartnerSetupScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const c = theme.colors;
  return (
    <View style={styles.container}>
      <ThemedBackdrop />
      <Text style={styles.emoji}>💑</Text>
      <Text style={styles.title}>Connect with your partner</Text>
      <Text style={styles.subtitle}>
        Wishlist is built for two. Invite your partner, or join them if they
        already sent you a code.
      </Text>

      <TouchableOpacity
        style={styles.option}
        onPress={() => navigation.navigate('InvitePartner')}
        activeOpacity={0.85}
      >
        <View style={[styles.iconWrap, { backgroundColor: c.primaryLight }]}>
          <Ionicons name="paper-plane" size={22} color={c.primary} />
        </View>
        <View style={styles.optionBody}>
          <Text style={styles.optionTitle}>Invite Partner</Text>
          <Text style={styles.optionText}>Generate a code and share it</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.option}
        onPress={() => navigation.navigate('JoinPartner')}
        activeOpacity={0.85}
      >
        <View style={[styles.iconWrap, { backgroundColor: c.activityBg }]}>
          <Ionicons name="key" size={22} color={c.activity} />
        </View>
        <View style={styles.optionBody}>
          <Text style={styles.optionTitle}>Join Partner</Text>
          <Text style={styles.optionText}>Enter the code they shared with you</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity onPress={logOut} style={styles.logout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
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
      marginBottom: spacing.xl,
      lineHeight: 21,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    optionBody: { flex: 1 },
    optionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
    optionText: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
    logout: { alignItems: 'center', marginTop: spacing.lg },
    logoutText: { color: colors.textMuted, fontSize: 14 },
  });
