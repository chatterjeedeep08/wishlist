import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import EmptyState from '../../components/EmptyState';
import { useNotifications } from '../../context/NotificationsContext';
import { markNotificationRead } from '../../services/notificationService';
import { AppNotification } from '../../types';
import { Theme, radius, spacing } from '../../theme';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import { MainStackParamList, TabsParamList } from '../../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabsParamList, 'Notifications'>,
  NativeStackScreenProps<MainStackParamList>
>;

function timeAgo(ts: AppNotification['createdAt']): string {
  if (!ts) return '';
  const ms = Date.now() - ts.toMillis();
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationsScreen({ navigation }: Props) {
  const { notifications } = useNotifications();
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const c = theme.colors;

  const typeMeta: Record<string, { icon: string; color: string; bg: string }> = {
    wish_added: { icon: 'gift-outline', color: c.primary, bg: c.primaryLight },
    wish_updated: { icon: 'create-outline', color: c.activity, bg: c.activityBg },
    partner_joined: { icon: 'heart', color: c.gift, bg: c.giftBg },
    wish_completed: { icon: 'checkmark-circle-outline', color: c.success, bg: c.successBg },
  };

  const handlePress = (item: AppNotification) => {
    if (!item.read) markNotificationRead(item.id).catch(() => {});
    if (item.wishId) {
      navigation.navigate('WishDetail', { wishId: item.wishId });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { paddingTop: insets.top + spacing.md }]}>
        Notifications
      </Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const meta = typeMeta[item.type] ?? typeMeta.wish_added;
          return (
            <TouchableOpacity
              style={[styles.item, !item.read && styles.itemUnread]}
              onPress={() => handlePress(item)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
                <Ionicons name={meta.icon as any} size={18} color={meta.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
              </View>
              {!item.read && <View style={styles.dot} />}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            emoji="🔔"
            title="No notifications yet"
            subtitle="You'll see updates here when your partner adds, edits or completes wishes."
          />
        }
      />
    </View>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    title: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.text,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.sm,
    },
    list: { padding: spacing.md, paddingTop: 0 },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      marginBottom: spacing.sm,
      gap: spacing.md,
    },
    itemUnread: { borderColor: colors.primary },
    iconWrap: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
    },
    message: { fontSize: 14, color: colors.text, lineHeight: 20 },
    time: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.primary },
  });
