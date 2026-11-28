 
import { useCallback, useRef, useState } from 'react';
import {
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from 'react-native';

import {
  fetchStaffRequest,
  fetchStaffReplyHistory,
  submitStaffReply,
  changeStaffRequestStatus,
  type StaffReplyRecord,
} from '@/features/staff/staff-api';

import { getAllowedStatuses } from '@/features/staff/status';

import type {
  StaffRequest,
  RequestStatus,
} from '@/features/staff/types';

function createEventId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2).padEnd(16, '0');
}

export default function StaffRequestDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <RequestDetails key={id} id={id} />;
}

function RequestDetails({ id }: { id: string }) {
  const [request, setRequest] = useState<StaffRequest | null>(null);
  const [replies, setReplies] = useState<StaffReplyRecord[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pending = useRef<{
    key: string;
    eventId: string;
  } | null>(null);

  const locked = useRef(false);
  const [hasPending, setHasPending] = useState(false);

  const load = useCallback(async () => {
    const [details, history] = await Promise.all([
      fetchStaffRequest(id),
      fetchStaffReplyHistory(id),
    ]);

    return { details, history };
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      setLoading(true);
      setRequest(null);
      setReplies([]);
      setError('');

      load()
        .then(({ details, history }) => {
          if (active) {
            setRequest(details);
            setReplies(history);
          }
        })
        .catch((err) => {
          if (active) {
            setError(
              err instanceof Error
                ? err.message
                : 'Request access denied.'
            );
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });

      return () => {
        active = false;
      };
    }, [load])
  );

  function getEventId(key: string) {
    if (pending.current) {
      if (pending.current.key !== key) {
        throw new Error(
          'Retry the previous action before starting another.'
        );
      }

      return pending.current.eventId;
    }

    const eventId = createEventId();

    pending.current = { key, eventId };
    setHasPending(true);

    return eventId;
  }

  async function performAction(
    key: string,
    action: (eventId: string) => Promise<unknown>,
    clearMessage = false
  ) {
    if (locked.current) return;

    locked.current = true;
    setBusy(true);
    setError('');

    try {
      const eventId = getEventId(key);

      await action(eventId);

      pending.current = null;
      setHasPending(false);

      if (clearMessage) setMessage('');

      try {
        const { details, history } = await load();

        setRequest(details);
        setReplies(history);
      } catch {
        setRequest(null);
        setReplies([]);
        setError(
          'Action saved. Reopen the request to refresh.'
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Action failed. Please retry.'
      );
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  function sendReply() {
    const clean = message.trim();

    if (!clean || clean.length > 1000) return;

    void performAction(
      `reply:${clean}`,
      (eventId) => submitStaffReply(id, clean, eventId),
      true
    );
  }

  function updateStatus(status: RequestStatus) {
    void performAction(
      `status:${status}`,
      (eventId) =>
        changeStaffRequestStatus(id, status, eventId)
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.hero}>
        <Text style={styles.heading}>Request Details</Text>
      </View>

      {loading && <ActivityIndicator color="#A7E5CC" />}

      {!!error && (
        <Text style={styles.error}>{error}</Text>
      )}

      {request && !loading && (
        <>
          <View style={styles.card}>
            <Text style={styles.label}>Request ID</Text>
            <Text style={styles.value}>{request.id}</Text>

            <Text style={styles.label}>Title</Text>
            <Text style={styles.value}>{request.title}</Text>

            <Text style={styles.label}>Description</Text>
            <Text style={styles.value}>{request.description}</Text>

            <Text style={styles.label}>Category</Text>
            <Text style={styles.value}>{request.category}</Text>

            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{request.status}</Text>

            <Text style={styles.label}>Submission Type</Text>
            <Text style={styles.value}>
              {request.anonymous ? 'Anonymous' : 'Standard'}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Update Status</Text>

            {getAllowedStatuses(request.status).map((status) => (
              <Pressable
                key={status}
                disabled={busy}
                style={styles.button}
                onPress={() => updateStatus(status)}
              >
                <Text style={styles.buttonText}>
                  Change to {status}
                </Text>
              </Pressable>
            ))}

            {getAllowedStatuses(request.status).length === 0 && (
              <Text style={styles.label}>
                No further status updates available.
              </Text>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Staff Reply</Text>

            <TextInput
              style={styles.input}
              placeholder="Write a reply..."
              placeholderTextColor="#888888"
              multiline
              maxLength={1000}
              editable={!busy && !hasPending}
              value={message}
              onChangeText={setMessage}
            />

            <Text style={styles.label}>
              {message.length}/1000
            </Text>

            <Pressable
              disabled={busy || !message.trim()}
              style={styles.button}
              onPress={sendReply}
            >
              <Text style={styles.buttonText}>
                {busy ? 'Please wait...' : 'Send Reply'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>
              Reply History ({replies.length})
            </Text>

            {replies.length === 0 && (
              <Text style={styles.label}>No replies yet.</Text>
            )}

            {replies.map((reply) => (
              <View key={reply.id} style={styles.reply}>
                <Text style={styles.label}>
                  {reply.authorLabel}
                </Text>

                <Text style={styles.value}>
                  {reply.message}
                </Text>

                {reply.createdAt !== null && (
                  <Text style={styles.label}>
                    {new Date(reply.createdAt).toLocaleString()}
                  </Text>
                )}
              </View>
            ))}
          </View>
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
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
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
  label: {
    color: '#A7E5CC',
    fontSize: 14,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#123C35',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  input: {
    color: '#FFFFFF',
    backgroundColor: '#303030',
    padding: 15,
    borderRadius: 12,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  reply: {
    backgroundColor: '#303030',
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  error: {
    color: '#FF9999',
    fontSize: 15,
  },
});


