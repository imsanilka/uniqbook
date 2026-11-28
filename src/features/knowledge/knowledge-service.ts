import { collection, getDocs, query, where } from 'firebase/firestore';
import { getFirebaseDb } from '../../lib/firebase';

export interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  type: string;
  status: string;
}

export async function getPublishedArticles(): Promise<Article[]> {
  const db = getFirebaseDb();

  const q = query(
    collection(db, 'articles'),
    where('status', '==', 'published')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  } as Article));
}