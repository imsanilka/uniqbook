 
import { useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';

import { mockStaff } from '../../features/staff/mock-data';

import { useStaff } from '../../features/staff/staff-provider';

export default function StaffQueueScreen() {
  const router = useRouter();

  const { requests, notifications } = useStaff();

  const assignedRequests = requests.filter(
    (request) =>
      request.assignedTeamId === mockStaff.teamId
  );

  const inProgress = assignedRequests.filter(
    (request) => request.status === 'In Progress'
  ).length;

  const resolved = assignedRequests.filter(
    (request) => request.status === 'Resolved'
  ).length;

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.badge}>STAFF PORTAL</Text>

        <Text style={styles.heading}>Staff Queue</Text>

        <Text style={styles.subtitle}>
          IT Support Department
        </Text>

        <Text style={styles.subtitle}>Demo mode</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.label}>
            Assigned Requests
          </Text>

          <Text style={styles.number}>
            {assignedRequests.length}
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.label}>In Progress</Text>

          <Text style={styles.number}>
            {inProgress}
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.label}>Resolved</Text>

          <Text style={styles.number}>
            {resolved}
          </Text>
        </View>
      </View>

      <Pressable
        style={styles.notificationButton}
        onPress={() =>
          router.push('/staff-queue/notification-demo')
        }
      >
        <Text style={styles.notificationText}>
          Notification Demo
        </Text>

        <Text style={styles.notificationCount}>
          {unreadCount} Unread
        </Text>
      </Pressable>

      <Text style={styles.sectionTitle}>
        Department Queue
      </Text>

      {assignedRequests.length === 0 && (
        <Text style={styles.label}>
          No assigned requests.
        </Text>
      )}

      {assignedRequests.map((request) => (
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
          <Text style={styles.requestId}>
            {request.id}
          </Text>

          <Text style={styles.title}>
            {request.title}
          </Text>

          <Text style={styles.label}>
            {request.category}
          </Text>

          <View style={styles.statusRow}>
            <Text
              style={[
                styles.status,
                request.status === 'Resolved' &&
                  styles.resolvedStatus,
              ]}
            >
              {request.status}
            </Text>

            {request.anonymous && (
              <Text style={styles.anonymous}>
                Anonymous
              </Text>
            )}
          </View>

          <Text style={styles.link}>
            View Details
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#101010',
  },
  hero: {
    backgroundColor: '#123C35',
    padding: 24,
    borderRadius: 24,
    marginBottom: 20,
  },
  badge: {
    color: '#A7E5CC',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#D2EAE0',
    fontSize: 15,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#202020',
    padding: 14,
    borderRadius: 14,
  },
  label: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  number: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#202020',
    padding: 20,
    borderRadius: 14,
    marginBottom: 15,
  },
  requestId: {
    color: '#A7E5CC',
    fontSize: 12,
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 15,
  },
  status: {
    color: '#F5C46B',
    backgroundColor: '#393021',
    padding: 8,
    borderRadius: 8,
  },
  resolvedStatus: {
    color: '#86D6A0',
    backgroundColor: '#19382A',
  },
  anonymous: {
    color: '#CCCCCC',
    backgroundColor: '#333333',
    padding: 8,
    borderRadius: 8,
  },
  link: {
    color: '#A7E5CC',
    marginTop: 16,
    fontWeight: '600',
  },
  notificationButton: {
    backgroundColor: '#123C35',
    padding: 18,
    borderRadius: 14,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationCount: {
    color: '#A7E5CC',
    fontSize: 14,
    fontWeight: '600',
  },
});

