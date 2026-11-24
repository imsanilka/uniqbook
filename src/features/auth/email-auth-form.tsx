import { Link } from 'expo-router';
import { type ComponentRef, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';

import { NavigationScreen } from '@/components/navigation-screen';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

import { AuthButton } from './auth-button';
import { authenticate, type AuthMode, validateCredentials } from './email-auth';
import { useAuthAction } from './use-auth-action';

export function EmailAuthForm({ mode }: { mode: AuthMode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string>();
  const passwordInput = useRef<ComponentRef<typeof TextInput>>(null);
  const { run, pending, error, clearError } = useAuthAction();
  const theme = useTheme();
  const isRegistration = mode === 'register';
  const feedback = validationError ?? error;

  function submit() {
    if (pending) return;

    const address = email.trim();
    const message = validateCredentials(mode, address, password);
    setValidationError(message);
    if (message) return;

    void run(
      () => authenticate(mode, address, password),
      isRegistration ? 'Could not create your account. Try again.' : 'Could not sign in. Try again.',
    );
  }

  function resetFeedback() {
    setValidationError(undefined);
    clearError();
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
      <NavigationScreen home>
        <ThemedText type="title" accessibilityRole="header">UniQbook</ThemedText>
        <ThemedText type="subtitle">{isRegistration ? 'Create a student account' : 'Sign in'}</ThemedText>
        <View style={styles.field}>
          <ThemedText type="smallBold">Email</ThemedText>
          <TextInput
            accessibilityLabel="Email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            editable={!pending}
            keyboardType="email-address"
            onChangeText={(value) => {
              setEmail(value);
              resetFeedback();
            }}
            onSubmitEditing={() => passwordInput.current?.focus()}
            returnKeyType="next"
            style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
            value={email}
          />
        </View>
        <View style={styles.field}>
          <ThemedText type="smallBold">Password</ThemedText>
          <TextInput
            ref={passwordInput}
            accessibilityLabel="Password"
            autoCapitalize="none"
            autoComplete={isRegistration ? 'new-password' : 'current-password'}
            editable={!pending}
            onChangeText={(value) => {
              setPassword(value);
              resetFeedback();
            }}
            onSubmitEditing={submit}
            returnKeyType="go"
            secureTextEntry
            style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
            value={password}
          />
          {isRegistration && (
            <ThemedText type="small" themeColor="textSecondary">Use at least 6 characters.</ThemedText>
          )}
        </View>
        {feedback && <ThemedText accessibilityRole="alert">{feedback}</ThemedText>}
        <AuthButton
          label={isRegistration
            ? (pending ? 'Creating account…' : 'Create account')
            : (pending ? 'Signing in…' : 'Sign in')}
          pending={pending}
          onPress={submit}
        />
        {!pending && (
          <Link href={isRegistration ? '/login' : '/register'} replace asChild>
            <ThemedText type="smallBold" style={styles.link}>
              {isRegistration ? 'Already have an account? Sign in' : 'New student? Create an account'}
            </ThemedText>
          </Link>
        )}
      </NavigationScreen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  field: { gap: 4 },
  input: { borderWidth: 1, borderRadius: 8, minHeight: 48, padding: 12, fontSize: 16 },
  link: { paddingVertical: 12, textDecorationLine: 'underline' },
});
