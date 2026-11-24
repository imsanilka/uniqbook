import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

export function useColorScheme() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Keep the initial render light for both hydration and client-only mounts.
    let active = true;
    queueMicrotask(() => {
      if (active) {
        setHasMounted(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const colorScheme = useRNColorScheme();

  return hasMounted ? colorScheme : 'light';
}
