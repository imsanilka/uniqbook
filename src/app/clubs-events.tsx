
import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getPublishedClubs } from '../features/clubs/clubs-service';

const events = [
  {
    id: 'e1',
    title: 'Technology Workshop',
    category: 'Workshop',
    date: 'December 5, 2026',
    location: 'Computer Lab',
    description: 'Learn modern software development techniques.',
  },
  {
    id: 'e2',
    title: 'Campus Sports Day',
    category: 'Sports',
    date: 'December 12, 2026',
    location: 'University Grounds',
    description: 'Participate in friendly campus sports competitions.',
  },
  {
    id: 'e3',
    title: 'Student Talent Show',
    category: 'Entertainment',
    date: 'December 18, 2026',
    location: 'Auditorium',
    description: 'Showcase student creativity, music and performances.',
  },
];

export default function ClubsEventsScreen() {
  const [clubs, setClubs] = useState<
  {
    id: string;
    title: string;
    category: string;
    description: string;
  }[]
>([]);

const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

useEffect(() => {
  async function loadClubs() {
    try {
      const data = await getPublishedClubs();

      setClubs(
        data.map((club) => ({
          id: club.id,
          title: club.name,
          category: club.category,
          description: club.description,
        }))
      );
    } catch (err) {
      console.error(err);
      setError('Unable to load clubs.');
    } finally {
      setLoading(false);
    }
  }

  loadClubs();
}, []);
  const [tab, setTab] = useState<'Clubs' | 'Events'>('Clubs');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const items = tab === 'Clubs' ? clubs : events;

  const filteredItems = items.filter((item) =>
    `${item.title} ${item.category} ${item.description}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>Campus Life</Text>

      <Text style={styles.subtitle}>
        Discover student clubs and campus events.
      </Text>

      <View style={styles.tabs}>
        {(['Clubs', 'Events'] as const).map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.tab,
              tab === item && styles.activeTab,
            ]}
            onPress={() => {
              setTab(item);
              setExpandedId(null);
              setSearch('');
            }}
          >
            <Text style={styles.tabText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.search}
        placeholder={`Search ${tab.toLowerCase()}...`}
        placeholderTextColor="#999"
        value={search}
        onChangeText={setSearch}
      />

      <Text style={styles.count}>
        {filteredItems.length} {tab.toLowerCase()} found
      </Text>

      {tab === 'Clubs' && loading && (
  <Text style={styles.subtitle}>
    Loading clubs...
  </Text>
)}

{tab === 'Clubs' && error !== '' && (
  <Text style={styles.subtitle}>
    {error}
  </Text>
)}

{filteredItems.length === 0 &&
  (tab === 'Events' || (!loading && !error)) && (
    <Text style={styles.subtitle}>
      No matching results found.
    </Text>
)}

      {filteredItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
          onPress={() =>
            setExpandedId(
              expandedId === item.id ? null : item.id
            )
          }
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardContent}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.category}>{item.category}</Text>
            </View>

            <Text style={styles.arrow}>
              {expandedId === item.id ? '−' : '+'}
            </Text>
          </View>

          {'date' in item && (
            <Text style={styles.details}>
              Date: {String(item.date)}
            </Text>
          )}

          {'location' in item && (
            <Text style={styles.details}>
              Location: {String(item.location)}
            </Text>
          )}

          {expandedId === item.id && (
            <Text style={styles.description}>
              {item.description}
            </Text>
          )}
        </TouchableOpacity>
      ))}

<Text style={styles.notice}>
  {tab === 'Clubs'
    ? 'Published clubs from Firebase.'
    : 'Demonstration content — sample events.'}
</Text>
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
  tabs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    backgroundColor: '#292929',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#087f5b',
  },
  tabText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
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
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  category: {
    color: '#75c9a7',
    marginTop: 8,
  },
  details: {
    color: '#cccccc',
    marginTop: 10,
    fontSize: 14,
  },
  description: {
    color: '#cccccc',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#444444',
    paddingTop: 15,
  },
  arrow: {
    color: '#ffffff',
    fontSize: 24,
    marginLeft: 10,
  },
  notice: {
    color: '#aaaaaa',
    fontSize: 12,
    marginTop: 15,
  },
});