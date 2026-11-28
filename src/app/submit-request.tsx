
import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

import { useState } from 'react';

import {
  ScrollView,
  StyleSheet,
  Switch,
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

function suggestCategory(title: string, description: string) {
  const text = `${title} ${description}`.toLowerCase();

  if (/\b(lms|wifi|wi-fi|internet|login|password|computer)\b/.test(text)) {
    return 'IT Support';
  }

  if (/\b(exam|lecture|assignment|marks|results)\b/.test(text)) {
    return 'Academic';
  }

  if (/\b(classroom|ac|water|electricity|toilet)\b/.test(text)) {
    return 'Facilities';
  }

  if (/\b(id card|payment|fees|registration)\b/.test(text)) {
    return 'Administration';
  }

  return 'Other';
}

export default function SubmitRequestScreen() {
  const session = useAuthSession();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requestType, setRequestType] = useState('Question');
  const [category, setCategory] = useState('Academic');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const suggestedCategory = suggestCategory(title, description);

  async function handleSubmit() {
    if (loading) return;

    setMessage('');
    setSuccess(false);



    if (session.status !== 'ready' || !session.user) {
      setMessage('Please sign in first.');
      return;
    }

    if (!title.trim()) {
      setMessage('Please enter a subject.');
      return;
    }

    if (title.trim().length < 5) {
      setMessage('Subject must contain at least 5 characters.');
      return;
    }

    if (title.trim().length > 100) {
      setMessage('Subject cannot exceed 100 characters.');
      return;
    }

    if (!description.trim()) {
      setMessage('Please enter a description.');
      return;
    }

    if (description.trim().length < 10) {
      setMessage('Description must contain at least 10 characters.');
      return;
    }

    if (description.trim().length > 1000) {
      setMessage('Description cannot exceed 1000 characters.');
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(getFirebaseDb(), isAnonymous ? 'anonymousReports' : 'requests'), {
        ...(isAnonymous ? { isAnonymous: true } : { userId: session.user.uid }),
        title: title.trim(),
        description: description.trim(),
        requestType,
        category,
        status: 'Submitted',
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setMessage('Request submitted successfully!');

      setTitle('');
      setDescription('');
      setCategory('Academic');
      setRequestType('Question');
      setIsAnonymous(false);

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

      <Text style={styles.label}>
        Request Type
      </Text>

      <View style={styles.categories}>
        {['Question', 'Report Issue'].map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setRequestType(item)}
            disabled={loading}
            style={[
              styles.category,
              requestType === item && styles.selected,
            ]}
          >
            <Text style={styles.categoryText}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>
        Category
      </Text>

      {!!(title.trim() || description.trim()) && (
        <TouchableOpacity
          style={styles.suggestion}
          onPress={() => setCategory(suggestedCategory)}
          disabled={loading}
        >
          <Text style={styles.suggestionTitle}>
            Suggested Category: {suggestedCategory}
          </Text>

          <Text style={styles.suggestionDescription}>
            Tap to apply suggested category
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.categories}>
        {categories.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setCategory(item)}
            disabled={loading}
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

      <Text style={styles.label}>
        Subject
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter request subject"
        placeholderTextColor="#999"
        value={title}
        editable={!loading}
        onChangeText={(value) => {
          setTitle(value);
          setMessage('');
        }}
      />

      <Text style={styles.counter}>
        {title.length}/100
      </Text>

      <Text style={styles.label}>
        Description
      </Text>

      <TextInput
        style={[styles.input, styles.description]}
        placeholder="Describe your issue..."
        placeholderTextColor="#999"
        multiline
        value={description}
        editable={!loading}
        onChangeText={(value) => {
          setDescription(value);
          setMessage('');
        }}
      />

      <Text style={styles.counter}>
        {description.length}/1000
      </Text>

      <View style={styles.anonymousCard}>

        <View style={styles.anonymousRow}>

          <Text style={styles.anonymousTitle}>
            Submit anonymously
          </Text>

          <Switch
            value={isAnonymous}
            disabled={loading}
            onValueChange={(value) => {
              setIsAnonymous(value);
              setMessage('');
            }}
            trackColor={{
              false: '#555555',
              true: '#087f5b',
            }}
            thumbColor="#ffffff"
          />

        </View>

        <Text style={styles.anonymousDescription}>
          Your account ID will not be stored with this report.
          Avoid including personal information in your description.
        </Text>

        {isAnonymous && (
          <Text style={styles.warning}>
            Anonymous reports will not appear in My Requests.
          </Text>
        )}

      </View>

      <TouchableOpacity
        style={[
          styles.button,
          loading && styles.disabledButton,
        ]}
        onPress={handleSubmit}
        disabled={loading}
      >

        <Text style={styles.buttonText}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </Text>

      </TouchableOpacity>

      {!!message && (
        <View
          style={[
            styles.messageBox,
            success ? styles.successBox : styles.errorBox,
          ]}
        >
          <Text
            style={[
              styles.message,
              success ? styles.successText : styles.errorText,
            ]}
          >
            {message}
          </Text>
        </View>
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

  suggestion: {
    backgroundColor: '#17382e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },

  suggestionTitle: {
    color: '#65d6ae',
    fontSize: 14,
  },

  suggestionDescription: {
    color: '#aaaaaa',
    marginTop: 5,
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

  counter: {
    color: '#999999',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 6,
  },

  anonymousCard: {
    backgroundColor: '#202020',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },

  anonymousRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  anonymousTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },

  anonymousDescription: {
    color: '#aaaaaa',
    marginTop: 8,
    lineHeight: 20,
  },

  warning: {
    color: '#ffb74d',
    marginTop: 10,
    fontSize: 14,
  },

  button: {
    backgroundColor: '#087f5b',
    padding: 16,
    borderRadius: 10,
    marginTop: 25,
    alignItems: 'center',
  },

  disabledButton: {
    opacity: 0.5,
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  messageBox: {
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    borderWidth: 1,
  },

  successBox: {
    backgroundColor: '#17382e',
    borderColor: '#087f5b',
  },

  errorBox: {
    backgroundColor: '#381d1d',
    borderColor: '#a94444',
  },

  message: {
    textAlign: 'center',
    fontSize: 14,
  },

  successText: {
    color: '#65d6ae',
  },

  errorText: {
    color: '#ff8a80',
  },

});

