import { onAuthStateChanged, type User } from 'firebase/auth';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

import { getFirebaseAuth } from '@/lib/firebase';

type Session =
  | { status: 'restoring' }
  | { status: 'error'; message: string }
  | { status: 'ready'; user: User | null };

const SessionContext = createContext<Session>({ status: 'restoring' });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>({ status: 'restoring' });

  useEffect(() => {
    // Start after the first render so web hydration has the same loading state as SSR.
    try {
      return onAuthStateChanged(getFirebaseAuth(), (user) => {
        setSession({ status: 'ready', user });
      });
    } catch {
      const timeout = setTimeout(() => {
        setSession({
          status: 'error',
          message: 'Check the Firebase web app settings in .env.local and restart Expo.',
        });
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, []);

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export function useAuthSession() {
  return useContext(SessionContext);
}
