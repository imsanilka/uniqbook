 
import { useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';

import { useStaff } from '../../features/staff/staff-provider';

export default function NotificationDemoScreen() {
  const router = useRouter();

  const {
    notifications,
    markAsRead,
    markAllAsRead,
  } = useStaff();

  const unreadCount = notifications.filter(
    (item) => !item.read
  ).length;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.badge}>
          STUDENT NOTIFICATION DEMO
        </Text>

        <Text style={styles.heading}>
          Notifications
        </Text>

        <Text style={styles.subtitle}>
          {unreadCount} Unread Notifications
        </Text>

        <Text style={styles.subtitle}>
          Total Notifications: {notifications.length}
        </Text>

        <Text style={styles.subtitle}>
          Demo mode
        </Text>
      </View>

      {notifications.length === 0 && (
        <View style={styles.card}>
          <Text style={styles.title}>
            No Notifications
          </Text>

          <Text style={styles.message}>
            Staff replies and status updates will
            appear here.
          </Text>
        </View>
      )}

      {notifications.map((notification) => (
        <View
          key={notification.id}
          style={[
            styles.card,
            !notification.read && styles.unreadCard,
          ]}
        >
          <Text style={styles.title}>
            {notification.title}
          </Text>

          <Text style={styles.message}>
            {notification.message}
          </Text>

          <Text style={styles.requestId}>
            {notification.requestId}
          </Text>

          <Text
            style={[
              styles.status,
              !notification.read && styles.unreadStatus,
            ]}
          >
            {notification.read ? 'Read' : 'Unread'}
          </Text>

          {!notification.read && (
            <Pressable
              style={styles.secondaryButton}
              onPress={() =>
                markAsRead(notification.id)
              }
            >
              <Text style={styles.buttonText}>
                Mark as Read
              </Text>
            </Pressable>
          )}

          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              markAsRead(notification.id);

              router.push({
                pathname: '/staff-queue/[id]',
                params: {
                  id: notification.requestId,
                },
              });
            }}
          >
            <Text style={styles.buttonText}>
              Open Demo Request
            </Text>
          </Pressable>
        </View>
      ))}

      <Pressable
        style={[
          styles.button,
          unreadCount === 0 && styles.disabledButton,
        ]}
        disabled={unreadCount === 0}
        onPress={markAllAsRead}
      >
        <Text style={styles.buttonText}>
          Mark All as Read
        </Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() =>
          router.replace('/staff-queue')
        }
      >
        <Text style={styles.buttonText}>
          Back to Staff Queue
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#101010',
    padding: 20,
  },
  hero: {
    backgroundColor: '#123C35',
    borderRadius: 24,
    padding: 24,
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
    marginBottom: 10,
  },
  subtitle: {
    color: '#A7E5CC',
    fontSize: 15,
    marginBottom: 5,
  },
  card: {
    backgroundColor: '#202020',
    padding: 20,
    borderRadius: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333333',
  },
  unreadCard: {
    borderColor: '#86D6A0',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    color: '#CCCCCC',
    fontSize: 15,
    lineHeight: 22,
  },
  requestId: {
    color: '#AAAAAA',
    fontSize: 13,
    marginTop: 12,
  },
  status: {
    color: '#AAAAAA',
    fontSize: 13,
    marginTop: 8,
    marginBottom: 10,
  },
  unreadStatus: {
    color: '#86D6A0',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#123C35',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButton: {
    backgroundColor: '#303030',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.4,
  },
});

