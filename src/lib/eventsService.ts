import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export type EventType = 'training' | 'match' | 'event';

export interface ClubEvent {
  id?: string;
  clubId: string;
  teamId?: string;
  title: string;
  description: string;
  type: EventType;
  date: string;       // ISO date string YYYY-MM-DD
  time: string;       // HH:MM
  location: string;
  createdAt: string;
}

export const createEvent = async (data: Omit<ClubEvent, 'id'>): Promise<ClubEvent> => {
  const docRef = await addDoc(collection(db, 'events'), data);
  return { id: docRef.id, ...data };
};

export const getClubEvents = async (clubId: string): Promise<ClubEvent[]> => {
  const q = query(collection(db, 'events'), where('clubId', '==', clubId), orderBy('date', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ClubEvent));
};

export const getPlayerEvents = async (clubId: string, teamId?: string): Promise<ClubEvent[]> => {
  const allEvents = await getClubEvents(clubId);
  // Return events that are club-wide (no teamId) or match the player's team
  return allEvents.filter(e => !e.teamId || e.teamId === teamId);
};

export const updateEvent = async (eventId: string, data: Partial<ClubEvent>): Promise<void> => {
  await updateDoc(doc(db, 'events', eventId), data);
};

export const deleteEvent = async (eventId: string): Promise<void> => {
  await deleteDoc(doc(db, 'events', eventId));
};
