import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotifications } from '../context/NotificationsContext';
import { useTheme } from '../context/ThemeContext';
import { markNotificationRead } from '../services/notificationService';
import { navigationRef } from '../navigation/RootNavigator';
import { radius, spacing } from '../theme';

/**
 * In-app popup shown when the partner adds / updates / completes a wish.
 * Tapping it opens the wish (or the notifications feed for pairing events).
 */
export default function NotificationBanner() {
  const { banner, dismissBanner } = useNotifications();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    if (banner) {
      slide.setValue(-120);
      Animated.spring(slide, {
        toValue: 0,
        useNativeDriver: true,
        damping: 16,
        stiffness: 160,
      }).start();
    }
  }, [banner?.id]);

  if (!banner) return null;

  const handlePress = () => {
    markNotificationRead(banner.id).catch(() => {});
    dismissBanner();
    if (navigationRef.isReady()) {
      if (banner.wishId) {
        navigationRef.navigate('WishDetail', { wishId: banner.wishId });
      }
    }
  };

  const c = theme.colors;
  return (
    <Animated.View
      style={[
        styles.wrapper,
        { top: insets.top + spacing.sm, transform: [{ translateY: slide }] },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        style={[styles.banner, { backgroundColor: c.card, borderColor: c.primary }]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={[styles.iconWrap, { backgroundColor: c.primaryLight }]}>
          <Ionicons name="heart" size={18} color={c.primary} />
        </View>
        <Text style={[styles.message, { color: c.text }]} numberOfLines={2}>
          {banner.message}
        </Text>
        <TouchableOpacity onPress={dismissBanner} hitSlop={10}>
          <Ionicons name="close" size={18} color={c.textMuted} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 100,
    elevation: 10,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 18 },
});
