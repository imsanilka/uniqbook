
import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuthSession } from '@/features/auth/session';
import { getFirebaseDb } from '@/lib/firebase';

const categories = [
  'Academic',
  'IT Support',
  'Facilities',
  'Administration',
  'Other',
];

export default function SubmitRequestScreen() {
  const session = useAuthSession();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Academic');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit() {
    if (loading) return;

    if (session.status !== 'ready' || !session.user) {
      setMessage('Please sign in first.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setMessage('Please complete all fields.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      await addDoc(collection(getFirebaseDb(), 'requests'), {
        userId: session.user.uid,
        title: title.trim(),
        description: description.trim(),
        category,
        status: 'Submitted',
        createdAt: serverTimestamp(),
      });

      setMessage('Request submitted successfully!');
      setTitle('');
      setDescription('');
      setCategory('Academic');
    } catch (error) {
      console.error(error);
      setMessage('Unable to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustKeyboardInsets={true}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      alwaysBounceVertical={false}
    >
      <Text style={styles.heading}>
        Submit Request
      </Text>

      <Text style={styles.subtitle}>
        Send questions or report campus issues.
      </Text>

      <Text style={styles.label}>Category</Text>

      <View style={styles.categories}>
        {categories.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setCategory(item)}
            style={[
              styles.category,
              category === item && styles.selected,
            ]}
          >
            <Text style={styles.categoryText}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Subject</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter request subject"
        placeholderTextColor="#999"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Description</Text>

      <TextInput
        style={[styles.input, styles.description]}
        placeholder="Describe your issue..."
        placeholderTextColor="#999"
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity
        style={[
          styles.button,
          loading && { opacity: 0.5 },
        ]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </Text>
      </TouchableOpacity>

      {!!message && (
        <Text style={styles.message}>
          {message}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#101010',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    color: '#aaaaaa',
    marginBottom: 25,
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 10,
    marginTop: 15,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  category: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#292929',
  },
  selected: {
    backgroundColor: '#087f5b',
  },
  categoryText: {
    color: '#ffffff',
  },
  input: {
    backgroundColor: '#202020',
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  description: {
    height: 140,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#087f5b',
    padding: 16,
    borderRadius: 10,
    marginTop: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    color: '#ffffff',
    marginTop: 15,
    textAlign: 'center',
  },
});
