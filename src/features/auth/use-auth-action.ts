import { useRef, useState } from 'react';

import { authErrorMessage } from './email-auth';

export function useAuthAction() {
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function run(action: () => Promise<void>, fallback: string) {
    if (inFlight.current) return;

    inFlight.current = true;
    setPending(true);
    setError(undefined);
    try {
      await action();
    } catch (error) {
      setError(authErrorMessage(error, fallback));
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  return { run, pending, error, clearError: () => setError(undefined) };
}
