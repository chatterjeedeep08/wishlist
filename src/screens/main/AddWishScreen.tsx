import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { extractUrl } from '../../services/linkParser';
import { colors, radius, spacing } from '../../theme';
import { MainStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'AddWish'>;

/**
 * Entry point for new wishes: paste a link (Amazon, Instagram, Maps, any
 * site) or create one manually. Content shared from other apps skips this
 * screen and lands directly on Link Processing.
 */
export default function AddWishScreen({ navigation }: Props) {
  const [link, setLink] = useState('');

  const processLink = (raw: string) => {
    const url = extractUrl(raw);
    if (!url) {
      Alert.alert('No link found', 'Paste a valid link starting with http(s)://');
      return;
    }
    navigation.navigate('LinkProcessing', { url });
  };

  const pasteFromClipboard = async () => {
    const text = await Clipboard.getStringAsync();
    if (!text) {
      Alert.alert('Clipboard empty', 'Copy a link first, then try again.');
      return;
    }
    setLink(text);
    if (extractUrl(text)) processLink(text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Add from a link</Text>
      <Text style={styles.sub}>
        Paste a link from Amazon, Flipkart, Instagram, Google Maps or any
        website — we'll fill in the details.
      </Text>

      <Input
        placeholder="https://…"
        value={link}
        onChangeText={setLink}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />
      <View style={styles.row}>
        <Button
          title="Paste"
          variant="secondary"
          onPress={pasteFromClipboard}
          style={{ flex: 1 }}
        />
        <Button
          title="Continue"
          onPress={() => processLink(link)}
          disabled={!link.trim()}
          style={{ flex: 2 }}
        />
      </View>

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.divider} />
      </View>

      <TouchableOpacity
        style={styles.manualCard}
        onPress={() => navigation.navigate('ManualWish', {})}
        activeOpacity={0.85}
      >
        <View style={styles.manualIcon}>
          <Ionicons name="create-outline" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.manualTitle}>Add manually</Text>
          <Text style={styles.manualText}>Write your own wish from scratch</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <View style={styles.tip}>
        <Ionicons name="share-social-outline" size={16} color={colors.textMuted} />
        <Text style={styles.tipText}>
          Tip: you can also share directly to Wishlist from Instagram, Amazon,
          Chrome and more using the share button in those apps.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  heading: { fontSize: 20, fontWeight: '800', color: colors.text },
  sub: { fontSize: 14, color: colors.textMuted, marginTop: 4, marginBottom: spacing.md, lineHeight: 20 },
  row: { flexDirection: 'row', gap: spacing.sm },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.lg,
  },
  divider: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textMuted, fontSize: 13 },
  manualCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  manualIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  manualTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  manualText: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  tip: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipText: { flex: 1, fontSize: 12, color: colors.textMuted, lineHeight: 18 },
});
