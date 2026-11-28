 import type { Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';

import {
  NavigationCard,
  NavigationScreen,
} from '@/components/navigation-screen';

import { ThemedText } from '@/components/themed-text';
import { SignOutButton } from '@/features/auth/sign-out-button';
import { useAuthSession } from '@/features/auth/session';
import { getFirebaseDb } from '@/lib/firebase';

const destinations = [
  {
    href: '/submit-request',
    title: 'Submit Request',
    description: 'Ask a question or report an issue.',
  },
  {
    href: '/my-requests',
    title: 'My Requests',
    description: 'View requests and check their status.',
  },
  {
    href: '/knowledge-base',
    title: 'Knowledge Base',
    description: 'Find answers to common campus questions.',
  },
  {
    href: '/clubs-events',
    title: 'Clubs & Events',
    description: 'Discover student clubs and campus events.',
  },
  {
    href: '/notifications',
    title: 'Notifications',
    description: 'See updates on your requests.',
  },
] satisfies {
  href: Href;
  title: string;
  description: string;
}[];

export default function HomeScreen() {
  const session = useAuthSession();

  const uid =
    session.status === 'ready'
      ? session.user?.uid
      : undefined;

  const [staffUid, setStaffUid] =
    useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;

    return onSnapshot(
      doc(getFirebaseDb(), 'profiles', uid),
      (snapshot) => {
        const data = snapshot.data();

        const validStaff =
          data?.role === 'staff' &&
          typeof data.teamId === 'string' &&
          data.teamId.trim().length > 0;

        setStaffUid(validStaff ? uid : null);
      },
      () => setStaffUid(null)
    );
  }, [uid]);

  const isStaff = !!uid && staffUid === uid;

  return (
    <NavigationScreen home>
      <View style={styles.hero}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>
            {isStaff ? 'STAFF PORTAL' : 'STUDENT PORTAL'}
          </Text>
        </View>

        <Text
          accessibilityRole="header"
          style={styles.title}
        >
          UniQbook
        </Text>

        <Text style={styles.subtitle}>
          Campus support and information
        </Text>

        <View style={styles.heroDivider} />

        <Text style={styles.heroDescription}>
          Your campus. Your questions. Your support.
        </Text>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>
          Welcome to UniQbook
        </ThemedText>

        <ThemedText themeColor="textSecondary">
          How can we help you today?
        </ThemedText>
      </View>

      {isStaff && (
        <NavigationCard
          href="/staff-queue"
          title="Staff Queue"
          description="Manage assigned department requests."
        />
      )}

      {destinations.map((destination) => (
        <NavigationCard
          key={destination.href}
          {...destination}
        />
      ))}

      <View style={styles.accountSection}>
        <SignOutButton />
      </View>

      <ThemedText
        themeColor="textSecondary"
        style={styles.footer}
      >
        UniQbook | Campus Support Portal
      </ThemedText>
    </NavigationScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: '#123C35',
    borderRadius: 26,
    padding: 24,
    gap: 10,
    marginBottom: 8,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  heroBadgeText: {
    color: '#A7E5CC',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '800',
  },
  subtitle: {
    color: '#D2EAE0',
    fontSize: 16,
    lineHeight: 24,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 6,
  },
  heroDescription: {
    color: '#B6D9CB',
    fontSize: 13,
    lineHeight: 20,
  },
  section: {
    gap: 6,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 23,
    fontWeight: '700',
    lineHeight: 30,
  },
  accountSection: {
    marginTop: 12,
  },
  footer: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});

