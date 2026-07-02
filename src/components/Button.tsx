import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Theme, radius, spacing } from '../theme';
import { useTheme, useThemedStyles } from '../context/ThemeContext';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
}: Props) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], isDisabled && styles.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? '#fff' : theme.colors.primary}
        />
      ) : (
        <Text
          style={[
            styles.text,
            (variant === 'secondary' || variant === 'ghost') && styles.textAlt,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    base: {
      paddingVertical: 14,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primary: { backgroundColor: colors.primary },
    secondary: { backgroundColor: colors.primaryLight },
    danger: { backgroundColor: colors.danger },
    ghost: { backgroundColor: 'transparent' },
    disabled: { opacity: 0.5 },
    text: { color: '#fff', fontSize: 16, fontWeight: '600' },
    textAlt: { color: colors.primary },
  });
