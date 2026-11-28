import { StudentReplies } from '@/features/staff/student-replies';

import { useLocalSearchParams } from 'expo-router';
import {
  doc,
  onSnapshot,
  type Timestamp,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { NavigationCard, NavigationScreen } from '@/components/navigation-screen';
import { ThemedText } from '@/components/themed-text';
import { useAuthSession } from '@/features/auth/session';
import { getFirebaseDb } from '@/lib/firebase';

type RequestDetails = {
  title: string;
  description: string;
  category: string;
  status: string;
  userId: string;
  createdAt?: Timestamp;
};

export default function RequestDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = useAuthSession();

  const userId =
    session.status === 'ready' ? session.user?.uid : undefined;

  const [result, setResult] = useState<{
    id: string;
    userId: string;
    request: RequestDetails | null;
    error: string;
  } | null>(null);

  const currentResult =
    result?.id === id && result?.userId === userId
      ? result
      : null;

  const request = currentResult?.request ?? null;
  const loading = !!id && !!userId && !currentResult;
  const error = currentResult?.error ?? '';

  useEffect(() => {
    if (!id || !userId) return;

    const requestRef = doc(getFirebaseDb(), 'requests', id);

    const unsubscribe = onSnapshot(
      requestRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setResult({
            id,
            userId,
            request: null,
            error: 'Request not found.',
          });
          return;
        }

        const data = snapshot.data() as RequestDetails;

        if (data.userId !== userId) {
          setResult({
            id,
            userId,
            request: null,
            error: 'You cannot access this request.',
          });
          return;
        }

        setResult({
          id,
          userId,
          request: data,
          error: '',
        });
      },
      (err) => {
        console.error(err);

        setResult({
          id,
          userId,
          request: null,
          error: 'Unable to load request details.',
        });
      }
    );

    return unsubscribe;
  }, [id, userId]);

  return (
    <NavigationScreen>
      {session.status === 'restoring' ? (
        <ThemedText>Loading session...</ThemedText>
      ) : !userId ? (
        <ThemedText>Please sign in first.</ThemedText>
      ) : loading ? (
        <ThemedText>Loading request details...</ThemedText>
      ) : error || !request ? (
        <ThemedText>
          {error || 'Request not found.'}
        </ThemedText>
      ) : (
        <>
          <ThemedText type="subtitle" accessibilityRole="header">
            {request.title}
          </ThemedText>

          <ThemedText type="smallBold">
            Category
          </ThemedText>
          <ThemedText>{request.category}</ThemedText>

          <ThemedText type="smallBold">
            Description
          </ThemedText>
          <ThemedText>{request.description}</ThemedText>

          <ThemedText type="smallBold">
            Status
          </ThemedText>
          <ThemedText>{request.status}</ThemedText>

          <ThemedText type="smallBold">
            Submitted Date
          </ThemedText>
          <ThemedText>
            {request.createdAt?.toDate().toLocaleString() ??
              'Date unavailable'}
          </ThemedText>
          <StudentReplies key={userId + id} requestId={id} />
        </>
      )}

      <NavigationCard
        href="/my-requests"
        title="Back to My Requests"
        description="View all your submitted requests."
      />
    </NavigationScreen>
  );
}
