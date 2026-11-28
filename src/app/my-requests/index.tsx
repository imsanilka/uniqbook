
import {
  collection,
  onSnapshot,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';

import { useEffect, useState } from 'react';

import {
  NavigationCard,
  NavigationScreen,
} from '@/components/navigation-screen';

import { ThemedText } from '@/components/themed-text';
import { useAuthSession } from '@/features/auth/session';
import { getFirebaseDb } from '@/lib/firebase';

type StudentRequest = {
  id: string;
  title: string;
  description: string;
  category: string;
  requestType?: string;
  status: string;
  createdAt?: Timestamp | null;
};

function formatDate(timestamp?: Timestamp | null) {
  if (!timestamp) {
    return 'Date unavailable';
  }

  return timestamp.toDate().toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MyRequestsScreen() {
  const session = useAuthSession();

  const userId =
    session.status === 'ready'
      ? session.user?.uid
      : undefined;

  const [result, setResult] = useState<{
    userId: string;
    items: StudentRequest[];
    error: string;
  } | null>(null);

  const currentResult =
    result?.userId === userId ? result : null;

  const requests = currentResult?.items ?? [];

  const loading = !!userId && !currentResult;

  const error = currentResult?.error ?? '';

  useEffect(() => {
    if (!userId) return;

    const requestsQuery = query(
      collection(getFirebaseDb(), 'requests'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      requestsQuery,

      (snapshot) => {
        const data = snapshot.docs.map((document) => ({
          ...document.data(),
          id: document.id,
        })) as StudentRequest[];

        data.sort((a, b) => {
          const first = a.createdAt?.toMillis() ?? 0;
          const second = b.createdAt?.toMillis() ?? 0;

          return second - first;
        });

        setResult({
          userId,
          items: data,
          error: '',
        });
      },

      (err) => {
        console.error(err);

        setResult({
          userId,
          items: [],
          error: 'Unable to load requests. Please try again.',
        });
      }
    );

    return unsubscribe;
  }, [userId]);

  return (
    <NavigationScreen>

      <ThemedText
        type="subtitle"
        accessibilityRole="header"
      >
        My Requests
      </ThemedText>

      <ThemedText>
        View and track your submitted requests.
      </ThemedText>

      {session.status === 'restoring' ? (

        <ThemedText>
          Loading session...
        </ThemedText>

      ) : !userId ? (

        <ThemedText>
          Please sign in first.
        </ThemedText>

      ) : loading ? (

        <ThemedText>
          Loading requests...
        </ThemedText>

      ) : error ? (

        <ThemedText>
          {error}
        </ThemedText>

      ) : requests.length === 0 ? (

        <ThemedText>
          No requests submitted yet.
        </ThemedText>

      ) : (

        <>
          <ThemedText type="smallBold">
            Total Requests: {requests.length}
          </ThemedText>

          {requests.map((request) => (

            <NavigationCard
              key={request.id}
              href={{
                pathname: '/my-requests/[id]',
                params: {
                  id: request.id,
                },
              }}
              title={request.title}
              description={
                `${request.requestType ?? 'Request'} | ` +
                `${request.category}\n` +
                `Status: ${request.status}\n` +
                `${formatDate(request.createdAt)}`
              }
            />

          ))}
        </>

      )}

    </NavigationScreen>
  );
}

