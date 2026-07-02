import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useWishes } from '../../context/WishesContext';
import WishCard from '../../components/WishCard';
import CategoryFilter from '../../components/CategoryFilter';
import EmptyState from '../../components/EmptyState';
import { WishType } from '../../types';
import { Theme, spacing } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import { MainStackParamList, TabsParamList } from '../../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabsParamList, 'Wishlist'>,
  NativeStackScreenProps<MainStackParamList>
>;

export default function WishlistScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { activeWishes, plannedWishIds, loading } = useWishes();
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<WishType | 'all'>('all');

  const filtered = useMemo(
    () => (filter === 'all' ? activeWishes : activeWishes.filter((w) => w.type === filter)),
    [activeWishes, filter]
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.title}>Our Wishlist</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CompletedWishes')}>
          <Text style={styles.completedLink}>Completed ✓</Text>
        </TouchableOpacity>
      </View>

      <CategoryFilter selected={filter} onSelect={setFilter} />

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <WishCard
              wish={item}
              currentUserId={user?.uid ?? ''}
              isPlanning={plannedWishIds.has(item.id)}
              onPress={() => navigation.navigate('WishDetail', { wishId: item.id })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              emoji="🗒️"
              title={filter === 'all' ? 'Your wishlist is empty' : 'Nothing in this category yet'}
              subtitle="Add a wish manually, paste a link, or share from Instagram, Amazon and more."
            />
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddWish')}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
    },
    title: { fontSize: 26, fontWeight: '800', color: colors.text },
    completedLink: { fontSize: 14, fontWeight: '600', color: colors.success },
    list: { paddingHorizontal: spacing.md, paddingBottom: 96 },
    fab: {
      position: 'absolute',
      right: spacing.lg,
      bottom: spacing.lg,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
    },
  });
