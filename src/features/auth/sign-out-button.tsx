import { ThemedText } from '@/components/themed-text';

import { AuthButton } from './auth-button';
import { endSession } from './email-auth';
import { useAuthAction } from './use-auth-action';

export function SignOutButton() {
  const { run, pending, error } = useAuthAction();

  return (
    <>
      {error && <ThemedText accessibilityRole="alert">{error}</ThemedText>}
      <AuthButton
        label={pending ? 'Signing out…' : 'Sign out'}
        pending={pending}
        onPress={() => void run(endSession, 'Could not sign out. Try again.')}
      />
    </>
  );
}
