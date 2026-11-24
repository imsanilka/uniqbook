import type { Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { NavigationCard, NavigationScreen } from '@/components/navigation-screen';

const destinations = [
  { href: '/submit-request', title: 'Submit Request', description: 'Ask a question or report an issue.' },
  { href: '/my-requests', title: 'My Requests', description: 'View requests and check their status.' },
  { href: '/knowledge-base', title: 'Knowledge Base', description: 'Find answers to common campus questions.' },
  { href: '/clubs-events', title: 'Clubs & Events', description: 'Discover student clubs and campus events.' },
  { href: '/notifications', title: 'Notifications', description: 'See updates on your requests.' },
] satisfies { href: Href; title: string; description: string }[];

export default function HomeScreen() {
  return (
    <NavigationScreen home>
      <View style={styles.hero}>
        <Text accessibilityRole="header" style={styles.title}>UniQbook</Text>
        <Text style={styles.subtitle}>Campus support and information</Text>
      </View>
      {destinations.map((destination) => (
        <NavigationCard key={destination.href} {...destination} />
      ))}
    </NavigationScreen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: '#123C35', borderRadius: 24, padding: 24, gap: 6, marginBottom: 8 },
  title: { color: '#FFFFFF', fontSize: 36, fontWeight: '700' },
  subtitle: { color: '#D2EAE0', fontSize: 16, lineHeight: 24 },
});
