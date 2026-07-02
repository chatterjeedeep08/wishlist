import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import WishCard from '../../components/WishCard';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useWishes } from '../../context/WishesContext';
import { colors, spacing } from '../../theme';
import { MainStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'CompletedWishes'>;

export default function CompletedWishesScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { completedWishes } = useWishes();

  return (
    <View style={styles.container}>
      <FlatList
        data={completedWishes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <WishCard
            wish={item}
            currentUserId={user?.uid ?? ''}
            onPress={() => navigation.navigate('WishDetail', { wishId: item.id })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            emoji="🏆"
            title="Nothing completed yet"
            subtitle="When you fulfil a wish, mark it completed and it will show up here as a memory."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md },
});
