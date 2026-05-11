import { collection, addDoc, getDocs, query, where, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export interface Season {
  id?: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  fee: number;
  createdAt: string;
}

export const createSeason = async (data: Omit<Season, 'id'>): Promise<Season> => {
  // If active, deactivate all other seasons first
  if (data.isActive) {
    const active = await getActiveSeason();
    if (active?.id) {
      await updateDoc(doc(db, 'seasons', active.id), { isActive: false });
    }
  }
  const docRef = await addDoc(collection(db, 'seasons'), data);
  return { id: docRef.id, ...data };
};

export const getSeasons = async (): Promise<Season[]> => {
  const q = query(collection(db, 'seasons'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Season));
};

export const getActiveSeason = async (): Promise<Season | null> => {
  const q = query(collection(db, 'seasons'), where('isActive', '==', true));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Season;
};

export const updateSeason = async (id: string, data: Partial<Season>): Promise<void> => {
  await updateDoc(doc(db, 'seasons', id), data);
};

export const setActiveSeason = async (id: string): Promise<void> => {
  // Deactivate all
  const seasons = await getSeasons();
  for (const s of seasons) {
    if (s.id && s.isActive) {
      await updateDoc(doc(db, 'seasons', s.id), { isActive: false });
    }
  }
  // Activate selected
  await updateDoc(doc(db, 'seasons', id), { isActive: true });
};
