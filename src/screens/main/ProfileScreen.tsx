import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../../components/Button';
import Input from '../../components/Input';
import PromptModal from '../../components/PromptModal';
import FloatingHearts from '../../components/FloatingHearts';
import ThemedBackdrop from '../../components/ThemedBackdrop';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import {
  changePassword,
  deleteAccount,
  friendlyAuthError,
  logOut,
} from '../../services/authService';
import { breakPair } from '../../services/coupleService';
import { prepareProfilePhoto } from '../../services/imageService';
import { validatePassword } from '../../utils/validation';
import { Theme, radius, spacing } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';
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
  const { user, profile, partner, status, trialRemaining } = useAuth();
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const c = theme.colors;

  const [celebrate, setCelebrate] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwError, setPwError] = useState<string | undefined>();
  const [pwSaving, setPwSaving] = useState(false);
  const [deletePrompt, setDeletePrompt] = useState(false);

  // One-shot floating hearts the first time the profile is opened after
  // pairing (tracked per couple on this device).
  useEffect(() => {
    if (!partner || !profile?.coupleId) return;
    const key = `wishlist.pairingCelebrated.${profile.coupleId}`;
    AsyncStorage.getItem(key).then((seen) => {
      if (!seen) {
        setCelebrate(true);
        AsyncStorage.setItem(key, '1').catch(() => {});
      }
    });
  }, [partner?.uid, profile?.coupleId]);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled || !result.assets[0] || !user) return;
    try {
      const photo = await prepareProfilePhoto(result.assets[0].uri);
      await updateDoc(doc(db, 'users', user.uid), { photo });
    } catch (err) {
      Alert.alert('Could not set photo', (err as Error).message);
    }
  };

  const handleChangePassword = async () => {
    const error = validatePassword(newPw);
    if (error) {
      setPwError(error);
      return;
    }
    setPwSaving(true);
    try {
      await changePassword(currentPw, newPw);
      setPasswordModal(false);
      setCurrentPw('');
      setNewPw('');
      Alert.alert('Password changed', 'Use your new password next time you log in.');
    } catch (err) {
      setPwError(friendlyAuthError(err));
    } finally {
      setPwSaving(false);
    }
  };

  const handleBreakPair = () => {
    if (!profile) return;
    Alert.alert(
      'Break the pair? 💔',
      `You and ${partner?.name ?? 'your partner'} will be disconnected and the shared wishlist will no longer be accessible. This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Break pair',
          style: 'destructive',
          onPress: async () => {
            try {
              await breakPair(profile);
            } catch (err) {
              Alert.alert('Could not unpair', (err as Error).message);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async (password: string) => {
    setDeletePrompt(false);
    if (!profile) return;
    try {
      await deleteAccount(profile, password);
      // Auth listener signs the user out automatically.
    } catch (err) {
      Alert.alert('Could not delete account', friendlyAuthError(err));
    }
  };

  const initials = (profile?.name ?? '?')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={styles.flex}>
      <ThemedBackdrop />
      {celebrate && <FloatingHearts onDone={() => setCelebrate(false)} />}

      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          padding: spacing.md,
          paddingTop: insets.top + spacing.md,
          paddingBottom: spacing.xl,
        }}
      >
        <View style={styles.card}>
          <TouchableOpacity onPress={pickPhoto} activeOpacity={0.8}>
            {profile?.photo ? (
              <Image source={{ uri: profile.photo }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <View style={styles.avatarEdit}>
              <Ionicons name="camera" size={13} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{profile?.name}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
          <View style={styles.partnerRow}>
            <Text style={styles.partnerHeart}>{partner ? '❤️' : '💔'}</Text>
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

        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('ThemeSettings')}>
          <Text style={styles.rowEmoji}>{theme.emoji}</Text>
          <Text style={styles.rowText}>Theme · {theme.label}</Text>
          <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Subscription')}>
          <Ionicons name="diamond-outline" size={20} color={c.primary} />
          <Text style={styles.rowText}>Manage subscription</Text>
          <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('CompletedWishes')}
        >
          <Ionicons name="checkmark-done-outline" size={20} color={c.success} />
          <Text style={styles.rowText}>Completed wishes</Text>
          <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.row}
          onPress={() => {
            setPwError(undefined);
            setPasswordModal(true);
          }}
        >
          <Ionicons name="key-outline" size={20} color={c.gold} />
          <Text style={styles.rowText}>Change password</Text>
          <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
        </TouchableOpacity>
        {partner && (
          <TouchableOpacity style={styles.row} onPress={handleBreakPair}>
            <Text style={styles.rowEmoji}>💔</Text>
            <Text style={[styles.rowText, { color: c.danger }]}>Break the pair</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.row}
          onPress={() =>
            Alert.alert('Log out?', 'You can log back in any time.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Log out', onPress: () => logOut() },
            ])
          }
        >
          <Ionicons name="log-out-outline" size={20} color={c.textMuted} />
          <Text style={styles.rowText}>Log out</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => setDeletePrompt(true)}>
          <Ionicons name="trash-outline" size={20} color={c.danger} />
          <Text style={[styles.rowText, { color: c.danger }]}>Delete account</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Change password */}
      <Modal
        visible={passwordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setPasswordModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Change password</Text>
            <View style={{ height: spacing.md }} />
            <Input
              label="Current password"
              value={currentPw}
              onChangeText={setCurrentPw}
              secureTextEntry
              placeholder="••••••••"
            />
            <Input
              label="New password"
              value={newPw}
              onChangeText={(v) => {
                setNewPw(v);
                setPwError(undefined);
              }}
              error={pwError}
              secureTextEntry
              placeholder="At least 6 characters"
            />
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setPasswordModal(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Change"
                onPress={handleChangePassword}
                loading={pwSaving}
                disabled={!currentPw || !newPw}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete account */}
      <PromptModal
        visible={deletePrompt}
        title="Delete account? ⚠️"
        message="This permanently removes your account and unpairs you from your partner. Enter your password to confirm."
        placeholder="Your password"
        confirmLabel="Delete forever"
        secureTextEntry
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeletePrompt(false)}
      />
    </View>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    container: { flex: 1, backgroundColor: 'transparent' },
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
    avatarImage: { width: 72, height: 72, borderRadius: 36 },
    avatarEdit: {
      position: 'absolute',
      right: -2,
      bottom: -2,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.card,
    },
    avatarText: { fontSize: 26, fontWeight: '800', color: colors.primary },
    name: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
    email: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
    partnerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: spacing.sm,
    },
    partnerHeart: { fontSize: 16 },
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
    rowEmoji: { fontSize: 18, width: 20, textAlign: 'center' },
    rowText: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    modalSheet: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: spacing.lg,
    },
    modalTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
    modalActions: { flexDirection: 'row', gap: spacing.sm },
  });
