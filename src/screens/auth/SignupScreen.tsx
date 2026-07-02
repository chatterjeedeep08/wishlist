import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ThemedBackdrop from '../../components/ThemedBackdrop';
import { friendlyAuthError, signUp } from '../../services/authService';
import { Theme, spacing } from '../../theme';
import { useThemedStyles } from '../../context/ThemeContext';
import { FieldErrors, hasErrors, validateSignup } from '../../utils/validation';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const styles = useThemedStyles(makeStyles);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const clearError = (field: string) =>
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));

  const handleSignup = async () => {
    const fieldErrors = validateSignup({ name, email, password });
    setErrors(fieldErrors);
    if (hasErrors(fieldErrors)) return;

    setLoading(true);
    try {
      await signUp(name, email, password);
      // AuthContext redirects to partner setup automatically.
    } catch (err) {
      Alert.alert('Signup failed', friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ThemedBackdrop />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.emoji}>✨</Text>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Starts with a 48-hour free trial — full access</Text>

        <View style={styles.form}>
          <Input
            label="Name"
            value={name}
            onChangeText={(v) => {
              setName(v);
              clearError('name');
            }}
            error={errors.name}
            placeholder="Your name"
            maxLength={40}
          />
          <Input
            label="Email"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              clearError('email');
            }}
            error={errors.email}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              clearError('password');
            }}
            error={errors.password}
            secureTextEntry
            placeholder="At least 6 characters"
          />
          <Button title="Sign up" onPress={handleSignup} loading={loading} />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.switch}>
          <Text style={styles.switchText}>
            Already have an account? <Text style={styles.switchLink}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: 'transparent' },
    container: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
    emoji: { fontSize: 44, textAlign: 'center' },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    subtitle: { fontSize: 15, color: colors.textMuted, textAlign: 'center', marginTop: 4 },
    form: { marginTop: spacing.xl },
    switch: { marginTop: spacing.lg, alignItems: 'center' },
    switchText: { color: colors.textMuted, fontSize: 14 },
    switchLink: { color: colors.primary, fontWeight: '700' },
  });
