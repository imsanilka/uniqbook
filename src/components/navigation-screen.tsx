import { Link, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export function NavigationScreen({ children, home = false }: { children: ReactNode; home?: boolean }) {
  const theme = useTheme();

  return (
    <SafeAreaView
      edges={home ? ['top', 'bottom', 'left', 'right'] : ['bottom', 'left', 'right']}
      style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    </SafeAreaView>
  );
}

export function NavigationCard({
  href,
  title,
  description,
}: {
  href: Href;
  title: string;
  description: string;
}) {
  const theme = useTheme();

  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="link"
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
        ]}>
        <View style={styles.cardCopy}>
          <ThemedText style={styles.cardTitle}>{title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">{description}</ThemedText>
        </View>
        <ThemedText accessible={false} importantForAccessibility="no" themeColor="textSecondary">
          →
        </ThemedText>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 640,
    padding: 24,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 16,
  },
  cardCopy: { flex: 1, gap: 2 },
  cardTitle: { fontWeight: '700' },
});
