import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator } from 'react-native';

import { NavigationScreen } from '@/components/navigation-screen';
import { ThemedText } from '@/components/themed-text';
import { AuthProvider, useAuthSession } from '@/features/auth/session';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  initialRouteName: 'index',
};

function RootStack() {
  const session = useAuthSession();

  if (session.status === 'restoring') {
    return (
      <NavigationScreen home>
        <ActivityIndicator />
        <ThemedText accessibilityLiveRegion="polite">Restoring your session…</ThemedText>
      </NavigationScreen>
    );
  }

  if (session.status === 'error') {
    return (
      <NavigationScreen home>
        <ThemedText type="subtitle" accessibilityRole="header">Authentication unavailable</ThemedText>
        <ThemedText accessibilityRole="alert">{session.message}</ThemedText>
      </NavigationScreen>
    );
  }

  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal', headerShadowVisible: false }}>
      <Stack.Protected guard={!session.user}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!!session.user}>
        <Stack.Screen name="index" options={{ title: 'Home', headerShown: false }} />
        <Stack.Screen name="submit-request" options={{ title: 'Submit Request' }} />
        <Stack.Screen name="my-requests/index" options={{ title: 'My Requests' }} />
        <Stack.Screen name="my-requests/[id]" options={{ title: 'Request Details' }} />
        <Stack.Screen name="knowledge-base" options={{ title: 'Knowledge Base' }} />
        <Stack.Screen name="clubs-events" options={{ title: 'Clubs & Events' }} />
        <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
        <Stack.Screen name="explore" options={{ title: 'Explore' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style="auto" />
      <AuthProvider>
        <RootStack />
      </AuthProvider>
    </ThemeProvider>
  );
}
