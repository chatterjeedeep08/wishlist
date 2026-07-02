import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Theme, spacing } from '../theme';
import { useThemedStyles } from '../context/ThemeContext';

interface Props {
  emoji: string;
  title: string;
  subtitle?: string;
}

export default function EmptyState({ emoji, title, subtitle }: Props) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    container: { alignItems: 'center', padding: spacing.xl },
    emoji: { fontSize: 48, marginBottom: spacing.md },
    title: { fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center' },
    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: spacing.sm,
      lineHeight: 20,
    },
  });
