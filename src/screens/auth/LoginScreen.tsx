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
import { friendlyAuthError, logIn } from '../../services/authService';
import { Theme, spacing } from '../../theme';
import { useThemedStyles } from '../../context/ThemeContext';
import { FieldErrors, hasErrors, validateEmail, validatePassword } from '../../utils/validation';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const styles = useThemedStyles(makeStyles);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const fieldErrors: FieldErrors = {
      email: validateEmail(email),
      password: password ? undefined : 'Password is required.',
    };
    setErrors(fieldErrors);
    if (hasErrors(fieldErrors)) return;

    setLoading(true);
    try {
      await logIn(email, password);
      // AuthContext takes over navigation from here.
    } catch (err) {
      Alert.alert('Login failed', friendlyAuthError(err));
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
        <Text style={styles.emoji}>💝</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to your shared wishlist</Text>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
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
              if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
            }}
            error={errors.password}
            secureTextEntry
            placeholder="••••••••"
          />
          <Button title="Log in" onPress={handleLogin} loading={loading} />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.switch}>
          <Text style={styles.switchText}>
            New here? <Text style={styles.switchLink}>Create an account</Text>
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
