 
import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';

import {
  fetchStudentNotifications,
  readStudentNotification,
} from '@/features/staff/staff-api';

import type {
  StudentNotification,
} from '@/features/staff/types';

export default function NotificationsScreen() {
  const router = useRouter();

  const [notifications, setNotifications] =
    useState<StudentNotification[]>([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;

      setLoading(true);
      setError('');
      setNotifications([]);

      fetchStudentNotifications()
        .then((data) => {
          if (active) setNotifications(data);
        })
        .catch((err) => {
          if (active) {
            setError(
              err instanceof Error
                ? err.message
                : 'Unable to load notifications.'
            );
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });

      return () => {
        active = false;
      };
    }, [])
  );

  async function markRead(item: StudentNotification) {
    if (item.read) return;

    await readStudentNotification(item.id);

    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === item.id
          ? { ...notification, read: true }
          : notification
      )
    );
  }

  async function handleNotification(
    item: StudentNotification,
    openRequest: boolean
  ) {
    if (busy) return;

    setBusy(true);
    setError('');

    try {
      await markRead(item);

      if (openRequest) {
        router.push({
          pathname: '/my-requests/[id]',
          params: { id: item.requestId },
        });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update notification.'
      );
    } finally {
      setBusy(false);
    }
  }

  const unreadCount = notifications.filter(
    (item) => !item.read
  ).length;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heading}>Notifications</Text>
        <Text style={styles.label}>
          {unreadCount} unread notifications
        </Text>
      </View>

      {loading && <ActivityIndicator color="#A7E5CC" />}

      {!!error && (
        <Text style={styles.error}>{error}</Text>
      )}

      {!loading && !error && notifications.length === 0 && (
        <Text style={styles.label}>
          No notifications yet.
        </Text>
      )}

      {notifications.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.label}>
            {item.read ? 'Read' : 'New Notification'}
          </Text>

          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message}>{item.message}</Text>

          {!item.read && (
            <Pressable
              disabled={busy}
              style={styles.button}
              onPress={() =>
                void handleNotification(item, false)
              }
            >
              <Text style={styles.buttonText}>
                Mark as Read
              </Text>
            </Pressable>
          )}

          <Pressable
            disabled={busy}
            style={styles.button}
            onPress={() =>
              void handleNotification(item, true)
            }
          >
            <Text style={styles.buttonText}>
              Open Request
            </Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#101010',
    gap: 16,
  },
  hero: {
    backgroundColor: '#123C35',
    padding: 24,
    borderRadius: 24,
    gap: 10,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
  },
  label: {
    color: '#A7E5CC',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#202020',
    padding: 20,
    borderRadius: 14,
    gap: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  message: {
    color: '#CCCCCC',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#123C35',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  error: {
    color: '#FF9999',
    fontSize: 15,
  },
});

