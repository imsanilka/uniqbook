import { NavigationCard, NavigationScreen } from '@/components/navigation-screen';
import { ThemedText } from '@/components/themed-text';
import { sampleRequest } from '@/features/requests/sample-request';

export default function MyRequestsScreen() {
  return (
    <NavigationScreen>
      <ThemedText type="smallBold" accessibilityRole="header">Sample request</ThemedText>
      <NavigationCard
        href={{ pathname: '/my-requests/[id]', params: { id: sampleRequest.id } }}
        title={sampleRequest.title}
        description={sampleRequest.status}
      />
    </NavigationScreen>
  );
}
