import { getApp, getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, type Auth } from 'firebase/auth';

import { initializeFirebaseAuth } from './firebase-auth';

let auth: Auth | undefined;

export function getFirebaseAuth(): Auth {
  if (auth) return auth;

  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim();
  const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim();
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID?.trim();

  if (!apiKey || !authDomain || !projectId || !appId) {
    throw new Error('Add the Firebase web app settings to .env.local and restart Expo.');
  }

  const app = getApps().some(({ name }) => name === '[DEFAULT]')
    ? getApp()
    : initializeApp({ apiKey, authDomain, projectId, appId });
  const instance = initializeFirebaseAuth(app);
  const emulatorUrl = process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_URL?.trim();

  if (__DEV__ && emulatorUrl && !instance.emulatorConfig) {
    connectAuthEmulator(instance, emulatorUrl);
  }

  auth = instance;
  return auth;
}
