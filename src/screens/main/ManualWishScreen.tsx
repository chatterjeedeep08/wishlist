import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../../components/Button';
import Input from '../../components/Input';
import TypeSelector from '../../components/TypeSelector';
import { useAuth } from '../../context/AuthContext';
import { useWishes } from '../../context/WishesContext';
import { addWish, updateWish, WishLimitError } from '../../services/wishService';
import { uploadWishImage } from '../../services/storageService';
import { WishPriority, WishType } from '../../types';
import { colors, radius, spacing } from '../../theme';
import { MainStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'ManualWish'>;

const PRIORITIES: { key: WishPriority; label: string }[] = [
  { key: 'low', label: 'Low' },
  { key: 'medium', label: 'Medium' },
  { key: 'high', label: 'High' },
];

/**
 * Create a wish from scratch, or — when opened with `editWishId` — edit
 * every field of an existing wish.
 */
export default function ManualWishScreen({ navigation, route }: Props) {
  const prefill = route.params?.prefill;
  const editWishId = route.params?.editWishId;
  const { profile, fullAccess } = useAuth();
  const { wishes } = useWishes();

  const editing = editWishId ? wishes.find((w) => w.id === editWishId) : undefined;
  const initial = editing ?? prefill;

  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [link, setLink] = useState(initial?.link ?? '');
  const [price, setPrice] = useState(initial?.price ?? '');
  const [type, setType] = useState<WishType | null>(initial?.type ?? null);
  const [priority, setPriority] = useState<WishPriority>(
    editing?.priority ?? 'medium'
  );
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Existing remote image (edit mode) shown until a new one is picked.
  const displayImage = localImage ?? editing?.image ?? null;

  const pickImage = async () => {
    // Image uploads are a premium/trial feature per the freemium model.
    if (!fullAccess) {
      Alert.alert('Premium feature', 'Image uploads are limited on the free tier. Upgrade to attach photos.', [
        { text: 'Not now' },
        { text: 'Upgrade', onPress: () => navigation.navigate('Subscription') },
      ]);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      setLocalImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    if (!title.trim()) {
      Alert.alert('Add a title', 'Give your wish a short title.');
      return;
    }
    if (!type) {
      Alert.alert('Pick a category', 'Choose food, activity, place or gift.');
      return;
    }
    setSaving(true);
    try {
      let imageUrl: string | null = editing?.image ?? null;
      if (localImage && profile.coupleId) {
        imageUrl = await uploadWishImage(profile.coupleId, localImage);
      }
      if (editing) {
        await updateWish(editing.id, {
          type,
          title: title.trim(),
          description: description.trim(),
          link: link.trim() || null,
          price: price.trim() || null,
          priority,
          image: imageUrl,
        });
        navigation.goBack();
      } else {
        await addWish(
          profile,
          {
            type,
            source: 'manual',
            title,
            description,
            link: link.trim() || null,
            price: price.trim() || null,
            priority,
            image: imageUrl,
          },
          fullAccess
        );
        navigation.popToTop();
      }
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.8}>
        {displayImage ? (
          <Image source={{ uri: displayImage }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={28} color={colors.textMuted} />
            <Text style={styles.imageText}>Add a photo (optional)</Text>
          </View>
        )}
      </TouchableOpacity>

      <Input label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Sushi dinner date" />
      <Input
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Details, why you want it… (optional)"
        multiline
        style={{ minHeight: 70 }}
      />

      <Text style={styles.label}>Category</Text>
      <TypeSelector selected={type} onSelect={setType} />

      <View style={{ height: spacing.md }} />
      <Input
        label="Link (optional)"
        value={link ?? ''}
        onChangeText={setLink}
        placeholder="https://…"
        autoCapitalize="none"
        keyboardType="url"
      />
      <Input
        label="Price (optional)"
        value={price ?? ''}
        onChangeText={setPrice}
        placeholder="e.g. ₹1,500"
      />

      <Text style={styles.label}>Priority</Text>
      <View style={styles.priorityRow}>
        {PRIORITIES.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[styles.priority, priority === p.key && styles.priorityActive]}
            onPress={() => setPriority(p.key)}
          >
            <Text
              style={[styles.priorityText, priority === p.key && styles.priorityTextActive]}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title={editing ? 'Save changes' : 'Save wish'}
        onPress={handleSave}
        loading={saving}
        style={{ marginTop: spacing.lg }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  imagePicker: { marginBottom: spacing.md },
  image: { width: '100%', height: 180, borderRadius: radius.lg },
  imagePlaceholder: {
    height: 110,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  imageText: { fontSize: 13, color: colors.textMuted, marginTop: 6 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priorityRow: { flexDirection: 'row', gap: spacing.sm },
  priority: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  priorityActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  priorityText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  priorityTextActive: { color: '#fff' },
});
