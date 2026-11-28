 
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

import { fetchStaffQueue } from '@/features/staff/staff-api';
import type { StaffRequest } from '@/features/staff/types';

export default function StaffQueueScreen() {
  const router = useRouter();

  const [requests, setRequests] = useState<StaffRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadQueue() {
        setLoading(true);
        setError('');
        setRequests([]);

        try {
          const data = await fetchStaffQueue();

          if (active) {
            setRequests(data);
          }
        } catch (err) {
          if (active) {
            setError(
              err instanceof Error
                ? err.message
                : 'Unable to load staff queue.'
            );
          }
        } finally {
          if (active) setLoading(false);
        }
      }

      void loadQueue();

      return () => {
        active = false;
      };
    }, [])
  );

  const inProgress = requests.filter(
    (item) => item.status === 'In Progress'
  ).length;

  const resolved = requests.filter(
    (item) => item.status === 'Resolved'
  ).length;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.badge}>STAFF PORTAL</Text>
        <Text style={styles.heading}>Staff Queue</Text>
        <Text style={styles.label}>
          Assigned department requests
        </Text>
      </View>

      {loading && <ActivityIndicator color="#A7E5CC" />}

      {!!error && (
        <Text style={styles.error}>{error}</Text>
      )}

      {!loading && !error && (
        <>
          <View style={styles.statsRow}>
            {[
              { label: 'Assigned', value: requests.length },
              { label: 'In Progress', value: inProgress },
              { label: 'Resolved', value: resolved },
            ].map((item) => (
              <View key={item.label} style={styles.stat}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.number}>{item.value}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.title}>Department Queue</Text>

          {requests.length === 0 && (
            <Text style={styles.label}>
              No assigned requests.
            </Text>
          )}

          {requests.map((request) => (
            <Pressable
              key={request.id}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: '/staff-queue/[id]',
                  params: { id: request.id },
                })
              }
            >
              <Text style={styles.badge}>{request.id}</Text>
              <Text style={styles.title}>{request.title}</Text>
              <Text style={styles.label}>{request.category}</Text>
              <Text style={styles.status}>{request.status}</Text>

              {request.anonymous && (
                <Text style={styles.label}>Anonymous</Text>
              )}

              <Text style={styles.badge}>View Details</Text>
            </Pressable>
          ))}
        </>
      )}
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
  badge: {
    color: '#A7E5CC',
    fontSize: 13,
    fontWeight: '600',
  },
  label: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  stat: {
    flex: 1,
    padding: 14,
    backgroundColor: '#202020',
    borderRadius: 14,
  },
  number: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#202020',
    padding: 20,
    borderRadius: 14,
    gap: 10,
  },
  status: {
    color: '#F5C46B',
    fontWeight: '600',
  },
  error: {
    color: '#FF9999',
    fontSize: 15,
  },
});

