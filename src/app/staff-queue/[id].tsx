 
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
} from 'react-native';

import { mockStaff } from '../../features/staff/mock-data';
import { getAllowedStatuses } from '../../features/staff/status';
import { useStaff } from '../../features/staff/staff-provider';

export default function StaffRequestDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const {
    requests,
    replies,
    updateStatus,
    sendReply,
  } = useStaff();

  const [drafts, setDrafts] = useState<
    Record<string, string>
  >({});

  const request = requests.find(
    (item) =>
      item.id === id &&
      item.assignedTeamId === mockStaff.teamId
  );

  if (!request) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>
          Access Denied
        </Text>

        <Text style={styles.message}>
          Request not found or unavailable for your department.
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => router.replace('/staff-queue')}
        >
          <Text style={styles.buttonText}>
            Back to Queue
          </Text>
        </Pressable>
      </View>
    );
  }

  const currentStatus = request.status;

  const allowedStatuses =
    getAllowedStatuses(currentStatus);

  const replyText = drafts[request.id] ?? '';

  const requestReplies = replies.filter(
    (reply) => reply.requestId === request.id
  );

  const handleSendReply = () => {
    const message = replyText.trim();

    if (!message || message.length > 1000) {
      return;
    }

    sendReply(request.id, message);

    setDrafts((previous) => ({
      ...previous,
      [request.id]: '',
    }));
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.hero}>
        <Text style={styles.badge}>
          STAFF PORTAL
        </Text>

        <Text style={styles.heading}>
          Request Details
        </Text>

        <Text style={styles.message}>
          Demo mode
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Request ID</Text>
        <Text style={styles.value}>{request.id}</Text>

        <Text style={styles.label}>Title</Text>
        <Text style={styles.value}>{request.title}</Text>

        <Text style={styles.label}>Description</Text>
        <Text style={styles.value}>
          {request.description}
        </Text>

        <Text style={styles.label}>Category</Text>
        <Text style={styles.value}>
          {request.category}
        </Text>

        <Text style={styles.label}>Status</Text>

        <Text
          style={[
            styles.status,
            currentStatus === 'Resolved' &&
              styles.resolvedStatus,
          ]}
        >
          {currentStatus}
        </Text>

        <Text style={styles.label}>
          Submission Type
        </Text>

        <Text style={styles.value}>
          {request.anonymous ? 'Anonymous' : 'Standard'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>
          Update Status
        </Text>

        {allowedStatuses.map((status) => (
          <Pressable
            key={status}
            style={styles.button}
            onPress={() =>
              updateStatus(request.id, status)
            }
          >
            <Text style={styles.buttonText}>
              Change to {status}
            </Text>
          </Pressable>
        ))}

        {allowedStatuses.length === 0 && (
          <Text style={styles.message}>
            No further status updates available.
          </Text>
        )}

        <Text style={styles.info}>
          Status changes generate demo notifications.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>
          Staff Reply
        </Text>

        <Text style={styles.message}>
          Write a response to the student.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Type your reply here..."
          placeholderTextColor="#888888"
          accessibilityLabel="Staff reply"
          multiline
          maxLength={1000}
          value={replyText}
          onChangeText={(text) =>
            setDrafts((previous) => ({
              ...previous,
              [request.id]: text,
            }))
          }
        />

        <Text style={styles.counter}>
          {replyText.length}/1000
        </Text>

        <Pressable
          style={[
            styles.button,
            !replyText.trim() &&
              styles.disabledButton,
          ]}
          disabled={!replyText.trim()}
          onPress={handleSendReply}
        >
          <Text style={styles.buttonText}>
            Send Reply
          </Text>
        </Pressable>

        <Text style={styles.info}>
          Replies generate demo notifications.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>
          Reply History ({requestReplies.length})
        </Text>

        {requestReplies.length === 0 && (
          <Text style={styles.message}>
            No replies yet.
          </Text>
        )}

        {requestReplies.map((reply) => (
          <View
            key={reply.id}
            style={styles.replyCard}
          >
            <Text style={styles.replyAuthor}>
              IT Support Staff
            </Text>

            <Text style={styles.replyMessage}>
              {reply.message}
            </Text>

            <Text style={styles.replyTime}>
              Demo reply
            </Text>
          </View>
        ))}
      </View>

      <Pressable
        style={styles.button}
        onPress={() => router.replace('/staff-queue')}
      >
        <Text style={styles.buttonText}>
          Back to Queue
        </Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() =>
          router.push('/staff-queue/notification-demo')
        }
      >
        <Text style={styles.buttonText}>
          View Notification Demo
        </Text>
      </Pressable>
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
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#202020',
    borderRadius: 14,
    padding: 20,
    marginBottom: 15,
  },
  label: {
    color: '#A7E5CC',
    fontSize: 14,
    marginBottom: 8,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  message: {
    color: '#AAAAAA',
    fontSize: 15,
    lineHeight: 23,
  },
  status: {
    color: '#F5C46B',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  resolvedStatus: {
    color: '#86D6A0',
  },
  button: {
    backgroundColor: '#123C35',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  info: {
    color: '#A7E5CC',
    fontSize: 13,
    marginTop: 15,
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#303030',
    color: '#FFFFFF',
    borderColor: '#444444',
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    minHeight: 120,
    fontSize: 16,
    textAlignVertical: 'top',
    marginTop: 15,
  },
  counter: {
    color: '#AAAAAA',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.4,
  },
  replyCard: {
    backgroundColor: '#303030',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  replyAuthor: {
    color: '#A7E5CC',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  replyMessage: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
  },
  replyTime: {
    color: '#888888',
    fontSize: 12,
    marginTop: 10,
  },
});

