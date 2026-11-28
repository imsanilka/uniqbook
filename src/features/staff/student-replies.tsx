import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { httpsCallable } from 'firebase/functions';
import { View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { getFirebaseFunctions } from '@/lib/firebase';
import type { StaffReplyRecord } from './staff-api';

export function StudentReplies({
  requestId,
}: {
  requestId: string;
}) {
  const [replies, setReplies] = useState<StaffReplyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;

      setLoading(true);
      setReplies([]);
      setError('');

      async function loadReplies() {
        try {
          const callable = httpsCallable<
            { requestId: string },
            { replies: StaffReplyRecord[] }
          >(
            getFirebaseFunctions(),
            'getStudentReplyHistory'
          );

          const result = await callable({ requestId });

          if (active) {
            setReplies(result.data.replies);
          }
        } catch {
          if (active) {
            setError('Unable to load staff replies.');
          }
        } finally {
          if (active) setLoading(false);
        }
      }

      void loadReplies();

      return () => {
        active = false;
      };
    }, [requestId])
  );

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">
        Staff Replies
      </ThemedText>

      {loading && (
        <ThemedText>Loading replies...</ThemedText>
      )}

      {!!error && (
        <ThemedText>{error}</ThemedText>
      )}

      {!loading && !error && replies.length === 0 && (
        <ThemedText>No replies yet.</ThemedText>
      )}

      {replies.map((reply) => (
        <View key={reply.id} style={styles.card}>
          <ThemedText type="smallBold">
            {reply.authorLabel}
          </ThemedText>

          <ThemedText>{reply.message}</ThemedText>

          {reply.createdAt !== null && (
            <ThemedText themeColor="textSecondary">
              {new Date(reply.createdAt).toLocaleString()}
            </ThemedText>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginVertical: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#808080',
    gap: 8,
  },
});
