import { NavigationScreen } from '@/components/navigation-screen';
import { ThemedText } from '@/components/themed-text';

export function FeaturePlaceholder({ description }: { description: string }) {
  return (
    <NavigationScreen>
      <ThemedText type="smallBold" accessibilityRole="header">Coming soon</ThemedText>
      <ThemedText themeColor="textSecondary">{description}</ThemedText>
    </NavigationScreen>
  );
}
