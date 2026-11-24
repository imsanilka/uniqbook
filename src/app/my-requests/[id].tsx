import { useLocalSearchParams } from 'expo-router';

import { NavigationCard, NavigationScreen } from '@/components/navigation-screen';
import { ThemedText } from '@/components/themed-text';
import { sampleRequest } from '@/features/requests/sample-request';

export default function RequestDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (id !== sampleRequest.id) {
    return (
      <NavigationScreen>
        <ThemedText accessibilityRole="header">Request not found</ThemedText>
        <NavigationCard
          href="/my-requests"
          title="My Requests"
          description="View available requests."
        />
      </NavigationScreen>
    );
  }

  return (
    <NavigationScreen>
      <ThemedText type="smallBold" themeColor="textSecondary">
        Sample request · {sampleRequest.status}
      </ThemedText>
      <ThemedText type="subtitle" accessibilityRole="header">
        {sampleRequest.title}
      </ThemedText>
      <ThemedText>{sampleRequest.description}</ThemedText>
    </NavigationScreen>
  );
}
