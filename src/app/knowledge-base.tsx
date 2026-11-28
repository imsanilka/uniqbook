
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { getPublishedArticles } from '../features/knowledge/knowledge-service';

const categories = [
  'All',
  'Academic',
  'IT Support',
  'Facilities',
  'Administration',
];

type Question = {
  id: string;
  category: string;
  question: string;
  answer: string;
};

export default function KnowledgeBaseScreen() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadQuestions = async () => {
      try {
        const articles = await getPublishedArticles();

        if (active) {
          setQuestions(
            articles.map((article) => ({
              id: article.id,
              category: article.category ?? '',
              question: article.title ?? '',
              answer: article.content ?? '',
            }))
          );
        }
      } catch (err) {
        console.error('Error loading articles:', err);

        if (active) {
          setError('Unable to load questions. Please try again later.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadQuestions();

    return () => {
      active = false;
    };
  }, []);

  const availableCategories = Array.from(
    new Set([
      ...categories,
      ...questions.map((item) => item.category).filter(Boolean),
    ])
  );

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
        {availableCategories.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setCategory(item)}
            accessibilityRole="button"
            accessibilityState={{
              selected: category === item,
            }}
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

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#75c9a7"
          />

          <Text style={styles.loadingText}>
            Loading questions...
          </Text>
        </View>
      )}

      {!!error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}

      {!loading && !error && (
        <>
          <Text style={styles.count}>
            {filteredQuestions.length}{' '}
            {filteredQuestions.length === 1
              ? 'question found'
              : 'questions found'}
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
                  expandedId === item.id
                    ? null
                    : item.id
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

          <Text style={styles.notice}>
            Published articles from Firebase.
          </Text>
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

  loadingContainer: {
    alignItems: 'center',
    marginTop: 30,
  },

  loadingText: {
    color: '#aaaaaa',
    marginTop: 12,
  },

  error: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginTop: 20,
  },

  notice: {
    color: '#aaaaaa',
    fontSize: 12,
    marginTop: 15,
  },
});
