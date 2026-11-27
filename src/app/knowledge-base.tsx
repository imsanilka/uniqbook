
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const categories = [
  'All',
  'Academic',
  'IT Support',
  'Facilities',
  'Administration',
];

const questions = [
  {
    id: '1',
    category: 'Academic',
    question: 'How do I check my exam results?',
    answer:
      'Sign in to the student portal and check the examination results section.',
  },
  {
    id: '2',
    category: 'IT Support',
    question: 'How do I reset my student portal password?',
    answer:
      'Use the password recovery option or contact the campus IT support team.',
  },
  {
    id: '3',
    category: 'Facilities',
    question: 'How do I access the library?',
    answer:
      'Contact the campus library for access requirements and opening hours.',
  },
  {
    id: '4',
    category: 'IT Support',
    question: 'How do I connect to campus Wi-Fi?',
    answer:
      'Contact IT Support for the campus Wi-Fi network and login instructions.',
  },
  {
    id: '5',
    category: 'Administration',
    question: 'How do I request a student confirmation letter?',
    answer:
      'Contact the student administration office for the application procedure.',
  },
  {
    id: '6',
    category: 'Academic',
    question: 'How do I contact my lecturer?',
    answer:
      'Check your learning portal for lecturer contact details or contact your faculty.',
  },
];

export default function KnowledgeBaseScreen() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [expandedId, setExpandedId] =
    useState<string | null>(null);

  const filteredQuestions = questions.filter((item) => {
    const matchesCategory =
      category === 'All' || item.category === category;

    const keyword = search.trim().toLowerCase();

    const matchesSearch =
      item.question.toLowerCase().includes(keyword) ||
      item.answer.toLowerCase().includes(keyword) ||
      item.category.toLowerCase().includes(keyword);

    return matchesCategory && matchesSearch;
  });

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>
        How can we help you?
      </Text>

      <Text style={styles.subtitle}>
        Find answers to common campus questions.
      </Text>

      <TextInput
        style={styles.search}
        placeholder="Search questions..."
        placeholderTextColor="#999"
        value={search}
        onChangeText={setSearch}
      />

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

      <Text style={styles.count}>
        {filteredQuestions.length} questions found
      </Text>

      {filteredQuestions.length === 0 && (
        <Text style={styles.empty}>
          No matching questions found.
        </Text>
      )}

      {filteredQuestions.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
          accessibilityRole="button"
          accessibilityState={{
            expanded: expandedId === item.id,
          }}
          onPress={() =>
            setExpandedId(
              expandedId === item.id ? null : item.id
            )
          }
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardContent}>
              <Text style={styles.question}>
                {item.question}
              </Text>

              <Text style={styles.tag}>
                {item.category}
              </Text>
            </View>

            <Text style={styles.arrow}>
              {expandedId === item.id ? '−' : '+'}
            </Text>
          </View>

          {expandedId === item.id && (
            <Text style={styles.answer}>
              {item.answer}
            </Text>
          )}
        </TouchableOpacity>
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
  heading: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#aaaaaa',
    fontSize: 15,
    marginBottom: 22,
  },
  search: {
    backgroundColor: '#202020',
    borderColor: '#444444',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 20,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  category: {
    backgroundColor: '#292929',
    padding: 12,
    borderRadius: 8,
  },
  selected: {
    backgroundColor: '#087f5b',
  },
  categoryText: {
    color: '#ffffff',
  },
  count: {
    color: '#aaaaaa',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#202020',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  question: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tag: {
    color: '#75c9a7',
    fontSize: 13,
    marginTop: 8,
  },
  arrow: {
    color: '#ffffff',
    fontSize: 24,
    marginLeft: 10,
  },
  answer: {
    color: '#cccccc',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#444444',
    paddingTop: 15,
  },
  empty: {
    color: '#aaaaaa',
    textAlign: 'center',
    marginTop: 20,
  },
});
