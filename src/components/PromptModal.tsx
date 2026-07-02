import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Button from './Button';
import { Theme, radius, spacing } from '../theme';
import { useTheme, useThemedStyles } from '../context/ThemeContext';

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  multiline?: boolean;
  secureTextEntry?: boolean;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

/**
 * Cross-platform replacement for Alert.prompt (which is iOS-only):
 * a themed modal with a single text field.
 */
export default function PromptModal({
  visible,
  title,
  message,
  placeholder,
  confirmLabel = 'Save',
  cancelLabel = 'Cancel',
  multiline,
  secureTextEntry,
  onConfirm,
  onCancel,
}: Props) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [value, setValue] = useState('');

  useEffect(() => {
    if (visible) setValue('');
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <TextInput
            style={[styles.input, multiline && styles.inputMultiline]}
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textMuted}
            multiline={multiline}
            secureTextEntry={secureTextEntry}
            autoFocus
          />
          <View style={styles.actions}>
            <Button
              title={cancelLabel}
              variant="ghost"
              onPress={onCancel}
              style={{ flex: 1 }}
            />
            <Button
              title={confirmLabel}
              onPress={() => onConfirm(value)}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    sheet: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: spacing.lg,
    },
    title: { fontSize: 18, fontWeight: '800', color: colors.text },
    message: { fontSize: 13, color: colors.textMuted, marginTop: 4, lineHeight: 19 },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 10,
      fontSize: 15,
      color: colors.text,
      marginTop: spacing.md,
    },
    inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
    actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  });
