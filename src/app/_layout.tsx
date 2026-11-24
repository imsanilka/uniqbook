import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal', headerShadowVisible: false }}>
        <Stack.Screen name="index" options={{ title: 'Home', headerShown: false }} />
        <Stack.Screen name="submit-request" options={{ title: 'Submit Request' }} />
        <Stack.Screen name="my-requests/index" options={{ title: 'My Requests' }} />
        <Stack.Screen name="my-requests/[id]" options={{ title: 'Request Details' }} />
        <Stack.Screen name="knowledge-base" options={{ title: 'Knowledge Base' }} />
        <Stack.Screen name="clubs-events" options={{ title: 'Clubs & Events' }} />
        <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
        <Stack.Screen name="explore" options={{ title: 'Explore' }} />
      </Stack>
    </ThemeProvider>
  );
}
