
import { useRouter } from 'expo-router';
import {
  collection,
  onSnapshot,
  query,
  where,
  type Timestamp,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuthSession } from '@/features/auth/session';
import { getFirebaseDb } from '@/lib/firebase';

type RequestNotification = {
  id: string;
  title: string;
  category: string;
  status: string;
  createdAt?: Timestamp;
};

export default function NotificationsScreen() {
  const router = useRouter();
  const session = useAuthSession();

  const userId =
    session.status === 'ready'
      ? session.user?.uid
      : undefined;

  
  const [result, setResult] = useState<{
    userId: string;
    items: RequestNotification[];
    error: string;
  } | null>(null);

  const currentResult =
    result?.userId === userId ? result : null;

  const notifications = currentResult?.items ?? [];
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
        const items = snapshot.docs.map((document) => ({
          ...document.data(),
          id: document.id,
        })) as RequestNotification[];

        items.sort(
          (a, b) =>
            (b.createdAt?.toMillis() ?? 0) -
            (a.createdAt?.toMillis() ?? 0)
        );

        setResult({
          userId,
          items,
          error: '',
        });
      },
      (err) => {
        console.error(err);

        setResult({
          userId,
          items: [],
          error: 'Unable to load notifications.',
        });
      }
    );

    return unsubscribe;
  }, [userId]);


  function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case 'resolved':
      case 'completed':
        return '#75c9a7';
      case 'in progress':
        return '#f5c542';
      case 'rejected':
        return '#ff6b6b';
      default:
        return '#60a5fa';
    }
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.container}
    >
      <Text style={styles.heading}>Notifications</Text>

      <Text style={styles.subtitle}>
        Stay updated on your submitted requests.
      </Text>

      {session.status === 'restoring' ? (
        <ActivityIndicator color="#75c9a7" />
      ) : !userId ? (
        <Text style={styles.empty}>
          Please sign in first.
        </Text>
      ) : loading ? (
        <ActivityIndicator
          size="large"
          color="#75c9a7"
        />
      ) : error ? (
        <Text style={styles.empty}>{error}</Text>
      ) : notifications.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.title}>
            No notifications yet
          </Text>
          <Text style={styles.message}>
            Your request updates will appear here.
          </Text>
        </View>
      ) : (
        notifications.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: '/my-requests/[id]',
                params: { id: item.id },
              })
            }
          >
            <View style={styles.cardHeader}>
              <Text style={styles.title}>
                {item.title}
              </Text>

              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      getStatusColor(item.status),
                  },
                ]}
              />
            </View>

            <Text style={styles.category}>
              {item.category}
            </Text>

            <Text style={styles.message}>
              Your request status is currently:
            </Text>

            <Text
              style={[
                styles.status,
                {
                  color: getStatusColor(item.status),
                },
              ]}
            >
              {item.status}
            </Text>

            <Text style={styles.date}>
              Submitted:{' '}
              {item.createdAt
                ?.toDate()
                .toLocaleString() ?? 'Date unavailable'}
            </Text>

            <Text style={styles.link}>
              View request details →
            </Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#101010',
  },
  heading: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#aaaaaa',
    fontSize: 15,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#202020',
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    flex: 1,
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  category: {
    color: '#aaaaaa',
    fontSize: 13,
    marginTop: 8,
  },
  message: {
    color: '#cccccc',
    fontSize: 15,
    marginTop: 14,
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  date: {
    color: '#999999',
    fontSize: 12,
    marginTop: 15,
  },
  link: {
    color: '#75c9a7',
    fontSize: 14,
    marginTop: 15,
  },
  empty: {
    color: '#aaaaaa',
    textAlign: 'center',
    marginTop: 20,
  },
});
