import { collection, getDocs, query, where } from 'firebase/firestore';
import { getFirebaseDb } from '../../lib/firebase';

export interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
}

export async function getPublishedClubs(): Promise<Club[]> {
  const db = getFirebaseDb();

  const q = query(
    collection(db, 'clubs'),
    where('status', '==', 'published')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  } as Club));
}