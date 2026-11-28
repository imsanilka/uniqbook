
import { useLocalSearchParams } from 'expo-router';
import {
  doc,
  onSnapshot,
  type Timestamp,
} from 'firebase/firestore';

import { useEffect, useState } from 'react';

import {
  StyleSheet,
  View,
} from 'react-native';

import {
  NavigationCard,
  NavigationScreen,
} from '@/components/navigation-screen';

import { ThemedText } from '@/components/themed-text';
import { useAuthSession } from '@/features/auth/session';
import { getFirebaseDb } from '@/lib/firebase';

type RequestDetails = {
  title: string;
  description: string;
  category: string;
  requestType?: string;
  status: string;
  userId: string;
  createdAt?: Timestamp | null;
};

const stages = [
  'Submitted',
  'Assigned',
  'In Progress',
  'Resolved',
];

function formatDate(timestamp?: Timestamp | null) {
  if (!timestamp) return 'Date unavailable';

  return timestamp.toDate().toLocaleString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function RequestDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const session = useAuthSession();

  const userId =
    session.status === 'ready'
      ? session.user?.uid
      : undefined;

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

  const currentStage = stages.indexOf(
    request?.status ?? ''
  );

  useEffect(() => {
    if (!id || !userId) return;

    const requestRef = doc(
      getFirebaseDb(),
      'requests',
      id
    );

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

        <ThemedText>
          Loading session...
        </ThemedText>

      ) : !userId ? (

        <ThemedText>
          Please sign in first.
        </ThemedText>

      ) : loading ? (

        <ThemedText>
          Loading request details...
        </ThemedText>

      ) : error || !request ? (

        <ThemedText>
          {error || 'Request not found.'}
        </ThemedText>

      ) : (

        <>

          <View style={styles.hero}>

            <ThemedText style={styles.heroLabel}>
              REQUEST DETAILS
            </ThemedText>

            <ThemedText style={styles.heroTitle}>
              {request.title}
            </ThemedText>

            <View style={styles.statusBadge}>
              <ThemedText style={styles.statusText}>
                {request.status}
              </ThemedText>
            </View>

          </View>

          <View style={styles.card}>

            <ThemedText style={styles.label}>
              Request ID
            </ThemedText>

            <ThemedText style={styles.value}>
              {id}
            </ThemedText>

            <View style={styles.divider} />

            <ThemedText style={styles.label}>
              Request Type
            </ThemedText>

            <ThemedText style={styles.value}>
              {request.requestType ?? 'Not specified'}
            </ThemedText>

            <View style={styles.divider} />

            <ThemedText style={styles.label}>
              Category
            </ThemedText>

            <ThemedText style={styles.value}>
              {request.category}
            </ThemedText>

            <View style={styles.divider} />

            <ThemedText style={styles.label}>
              Submitted Date
            </ThemedText>

            <ThemedText style={styles.value}>
              {formatDate(request.createdAt)}
            </ThemedText>

          </View>

          <View style={styles.card}>

            <ThemedText style={styles.sectionTitle}>
              Description
            </ThemedText>

            <ThemedText style={styles.description}>
              {request.description}
            </ThemedText>

          </View>

          <View style={styles.card}>

            <ThemedText style={styles.sectionTitle}>
              Request Timeline
            </ThemedText>

            {stages.map((stage, index) => {
              const completed = index < currentStage;
              const active = index === currentStage;

              return (
                <View
                  key={stage}
                  style={styles.timelineRow}
                >

                  <View
                    style={[
                      styles.timelineCircle,
                      (completed || active) &&
                        styles.activeCircle,
                    ]}
                  >
                    <ThemedText style={styles.circleText}>
                      {completed ? '✓' : index + 1}
                    </ThemedText>
                  </View>

                  <View style={styles.timelineContent}>

                    <ThemedText
                      style={[
                        styles.timelineTitle,
                        active && styles.activeText,
                      ]}
                    >
                      {stage}
                    </ThemedText>

                    <ThemedText style={styles.timelineCaption}>
                      {active
                        ? 'Current status'
                        : completed
                        ? 'Previous stage'
                        : currentStage === -1
                        ? 'Status unavailable'
                        : 'Pending'}
                    </ThemedText>

                  </View>

                </View>
              );
            })}

          </View>

          <View style={styles.card}>

            <ThemedText style={styles.sectionTitle}>
              Staff Response
            </ThemedText>

            <ThemedText style={styles.description}>
              Staff responses are not yet available.
            </ThemedText>

            <ThemedText style={styles.mutedText}>
              This feature will be available after staff
              integration is completed.
            </ThemedText>

          </View>

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

const styles = StyleSheet.create({

  hero: {
    backgroundColor: '#123c34',
    padding: 22,
    borderRadius: 20,
    gap: 12,
  },

  heroLabel: {
    color: '#9bd8c8',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  },

  heroTitle: {
    color: '#ffffff',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: 'bold',
  },

  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#087f5b',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },

  statusText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  card: {
    backgroundColor: '#202020',
    borderRadius: 16,
    padding: 18,
    gap: 10,
  },

  label: {
    color: '#aaaaaa',
    fontSize: 13,
  },

  value: {
    color: '#ffffff',
    fontSize: 16,
  },

  divider: {
    height: 1,
    backgroundColor: '#353535',
    marginVertical: 5,
  },

  sectionTitle: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  description: {
    color: '#dddddd',
    fontSize: 16,
    lineHeight: 25,
  },

  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 8,
  },

  timelineCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#444444',
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeCircle: {
    backgroundColor: '#087f5b',
  },

  circleText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },

  timelineContent: {
    flex: 1,
    gap: 3,
  },

  timelineTitle: {
    color: '#dddddd',
    fontSize: 16,
    fontWeight: 'bold',
  },

  activeText: {
    color: '#65d6ae',
  },

  timelineCaption: {
    color: '#aaaaaa',
    fontSize: 13,
  },

  mutedText: {
    color: '#999999',
    fontSize: 13,
    lineHeight: 20,
  },

});
