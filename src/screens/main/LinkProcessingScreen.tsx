import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../../components/Button';
import Input from '../../components/Input';
import TypeSelector from '../../components/TypeSelector';
import { useAuth } from '../../context/AuthContext';
import { parseLink } from '../../services/linkParser';
import { addWish, WishLimitError } from '../../services/wishService';
import { LinkPreview, WishSource, WishType } from '../../types';
import { colors, radius, spacing } from '../../theme';
import { MainStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'LinkProcessing'>;

const SOURCE_NAMES: Record<string, string> = {
  shopping: 'Shopping link',
  instagram: 'Instagram',
  maps: 'Google Maps',
  link: 'Web link',
};

/**
 * Shown after a link is pasted or shared from another app.
 * Fetches metadata, guesses the category, and lets the user confirm.
 */
export default function LinkProcessingScreen({ navigation, route }: Props) {
  const { url, sharedTitle, fromShare } = route.params;
  const { profile, fullAccess } = useAuth();

  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(sharedTitle ?? '');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<WishType | null>(null);

  useEffect(() => {
    let cancelled = false;
    parseLink(url, sharedTitle).then((p) => {
      if (cancelled) return;
      setPreview(p);
      if (p.title) setTitle(p.title);
      if (p.description) setDescription(p.description);
      if (p.detectedType) setType(p.detectedType);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  const handleSave = async () => {
    if (!profile) return;
    if (!type) {
      Alert.alert('Pick a category', 'Choose whether this is food, an activity, a place or a gift.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Add a title', 'Give this wish a short title.');
      return;
    }
    setSaving(true);
    try {
      const source: WishSource =
        preview && preview.source !== 'link'
          ? preview.source
          : fromShare
            ? 'shared'
            : 'link';
      await addWish(
        profile,
        {
          type,
          source,
          title,
          description,
          image: preview?.image ?? null,
          link: url,
          price: preview?.price ?? null,
        },
        fullAccess
      );
      navigation.popToTop();
    } catch (err) {
      if (err instanceof WishLimitError) {
        Alert.alert('Wish limit reached', err.message, [
          { text: 'Not now' },
          { text: 'Upgrade', onPress: () => navigation.navigate('Subscription') },
        ]);
      } else {
        Alert.alert('Could not save', (err as Error).message);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Reading the link…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      {preview?.image ? (
        <Image source={{ uri: preview.image }} style={styles.image} />
      ) : null}

      <View style={styles.sourceRow}>
        <Text style={styles.sourceBadge}>
          {SOURCE_NAMES[preview?.source ?? 'link'] ?? 'Link'}
        </Text>
        {preview?.price ? <Text style={styles.price}>{preview.price}</Text> : null}
      </View>
      <Text style={styles.url} numberOfLines={1}>
        {url}
      </Text>

      <Input label="Title" value={title} onChangeText={setTitle} placeholder="What is it?" />
      <Input
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Why do you want this? (optional)"
        multiline
        style={{ minHeight: 70 }}
      />

      <Text style={styles.label}>
        Category{' '}
        {preview?.detectedType ? <Text style={styles.detected}>(auto-detected)</Text> : null}
      </Text>
      <TypeSelector selected={type} onSelect={setType} />

      <Button
        title="Save wish"
        onPress={handleSave}
        loading={saving}
        style={{ marginTop: spacing.lg }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: { marginTop: spacing.md, color: colors.textMuted },
  image: {
    width: '100%',
    height: 200,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.border,
  },
  sourceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sourceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  price: { fontSize: 15, fontWeight: '700', color: colors.text },
  url: { fontSize: 12, color: colors.textMuted, marginTop: 6, marginBottom: spacing.md },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detected: { color: colors.success, textTransform: 'none' },
});
