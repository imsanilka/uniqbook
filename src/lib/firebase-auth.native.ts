import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseError, type FirebaseApp } from 'firebase/app';
// @ts-expect-error Firebase's public types omit this export from its React Native build.
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';

export function initializeFirebaseAuth(app: FirebaseApp) {
  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'auth/already-initialized') {
      // Reuse the existing instance after Fast Refresh.
      return getAuth(app);
    }
    throw error;
  }
}
