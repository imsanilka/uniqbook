
import { Link, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export function NavigationScreen({
  children,
  home = false,
}: {
  children: ReactNode;
  home?: boolean;
}) {
  const theme = useTheme();

  return (
    <SafeAreaView
      edges={
        home
          ? ['top', 'bottom', 'left', 'right']
          : ['bottom', 'left', 'right']
      }
      style={[
        styles.screen,
        { backgroundColor: theme.background },
      ]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior={
          home ? 'never' : 'automatic'
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
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
          {
            backgroundColor: pressed
              ? theme.backgroundSelected
              : theme.backgroundElement,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <View style={styles.cardRow}>
          <View style={styles.cardCopy}>
            <ThemedText style={styles.cardTitle}>
              {title}
            </ThemedText>

            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.cardDescription}
            >
              {description}
            </ThemedText>
          </View>

          <View style={styles.arrowContainer}>
            <ThemedText
              accessible={false}
              importantForAccessibility="no"
              style={styles.arrow}
            >
              {'\u2192'}
            </ThemedText>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 640,
    padding: 20,
    paddingBottom: 32,
    gap: 14,
  },
  card: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(120, 150, 140, 0.18)',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardCopy: {
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 21,
  },
  arrowContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(45, 160, 120, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    color: '#43B58C',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
  },
});
