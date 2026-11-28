
import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  getPublishedClubs,
  getPublishedEvents,
} from '../features/clubs/clubs-service';

interface ClubItem {
  id: string;
  title: string;
  category: string;
  description: string;
}

interface EventItem extends ClubItem {
  date: string;
  location: string;
}

export default function ClubsEventsScreen() {
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  const [clubsLoading, setClubsLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);

  const [clubsError, setClubsError] = useState('');
  const [eventsError, setEventsError] = useState('');

  const [tab, setTab] = useState<'Clubs' | 'Events'>('Clubs');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
        setClubsError('Unable to load clubs.');
      } finally {
        setClubsLoading(false);
      }
    }

    loadClubs();
  }, []);

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await getPublishedEvents();

        setEvents(
          data.map((event) => ({
            id: event.id,
            title: event.title,
            category: event.category,
            description: event.description,
            date: event.date.toDate().toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
            location: event.location,
          }))
        );
      } catch (err) {
        console.error(err);
        setEventsError('Unable to load events.');
      } finally {
        setEventsLoading(false);
      }
    }

    loadEvents();
  }, []);

  const items = tab === 'Clubs' ? clubs : events;

  const loading = tab === 'Clubs'
    ? clubsLoading
    : eventsLoading;

  const error = tab === 'Clubs'
    ? clubsError
    : eventsError;

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

      {loading && (
        <Text style={styles.subtitle}>
          Loading {tab.toLowerCase()}...
        </Text>
      )}

      {!loading && error !== '' && (
        <Text style={styles.error}>{error}</Text>
      )}

      {!loading && !error && (
        <Text style={styles.count}>
          {filteredItems.length} {tab.toLowerCase()} found
        </Text>
      )}

      {!loading && !error && filteredItems.length === 0 && (
        <Text style={styles.subtitle}>
          No matching results found.
        </Text>
      )}

      {!loading && !error && filteredItems.map((item) => (
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
              <Text style={styles.title}>
                {item.title}
              </Text>

              <Text style={styles.category}>
                {item.category}
              </Text>
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
          : 'Published events from Firebase.'}
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
  error: {
    color: '#ff6b6b',
    fontSize: 15,
    marginBottom: 15,
  },
});
