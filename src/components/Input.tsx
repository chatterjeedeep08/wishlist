import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Theme, radius, spacing } from '../theme';
import { useTheme, useThemedStyles } from '../context/ThemeContext';

interface Props extends TextInputProps {
  label?: string;
  /** Validation error shown under the field (also colors the border). */
  error?: string;
}

export default function Input({ label, error, style, ...rest }: Props) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={theme.colors.textMuted}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    wrapper: { marginBottom: spacing.md },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
    },
    inputError: { borderColor: colors.danger },
    error: { color: colors.danger, fontSize: 12, marginTop: 4 },
  });
