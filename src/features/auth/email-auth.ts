import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

import { getFirebaseAuth } from '@/lib/firebase';

export type AuthMode = 'login' | 'register';

export function validateCredentials(mode: AuthMode, email: string, password: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
  if (!password) return 'Enter your password.';
  if (mode === 'register' && password.length < 6) return 'Use at least 6 characters for your password.';
}

export async function authenticate(mode: AuthMode, email: string, password: string) {
  const auth = getFirebaseAuth();
  if (mode === 'register') {
    // Public signup creates a Firebase identity with no privileged claims or team membership.
    await createUserWithEmailAndPassword(auth, email, password);
  } else {
    await signInWithEmailAndPassword(auth, email, password);
  }
}

export async function endSession() {
  await signOut(getFirebaseAuth());
}

export function authErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof FirebaseError)) return fallback;

  switch (error.code) {
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'The email or password is incorrect.';
    case 'auth/email-already-in-use':
      return 'This email cannot be registered. Try signing in or use a different email.';
    case 'auth/weak-password':
    case 'auth/password-does-not-meet-requirements':
      return 'Use a stronger password that meets the project’s password requirements.';
    case 'auth/network-request-failed':
      return 'Could not reach Firebase. Check your connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a moment and try again.';
    case 'auth/user-disabled':
      return 'This account is disabled. Contact university support.';
    case 'auth/operation-not-allowed':
      return 'Email and password authentication is unavailable. Check the Firebase project settings.';
    default:
      return fallback;
  }
}
