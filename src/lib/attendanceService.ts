import { collection, addDoc, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export type AttendanceStatus = 'present' | 'absent' | 'justified';

export interface AttendanceRecord {
  playerId: string;
  status: AttendanceStatus;
}

export interface AttendanceSheet {
  id?: string;
  eventId: string;
  eventTitle: string;
  clubId: string;
  date: string;
  records: AttendanceRecord[];
}

export const saveAttendance = async (data: Omit<AttendanceSheet, 'id'>): Promise<AttendanceSheet> => {
  // Check if attendance already exists for this event
  const q = query(collection(db, 'attendance'), where('eventId', '==', data.eventId));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    // Update existing
    const existingId = snapshot.docs[0].id;
    await updateDoc(doc(db, 'attendance', existingId), { records: data.records });
    return { id: existingId, ...data };
  }

  // Create new
  const docRef = await addDoc(collection(db, 'attendance'), data);
  return { id: docRef.id, ...data };
};

export const getEventAttendance = async (eventId: string): Promise<AttendanceSheet | null> => {
  const q = query(collection(db, 'attendance'), where('eventId', '==', eventId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as AttendanceSheet;
};

export const getClubAttendanceHistory = async (clubId: string): Promise<AttendanceSheet[]> => {
  const q = query(collection(db, 'attendance'), where('clubId', '==', clubId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AttendanceSheet));
};

export const getPlayerAttendanceHistory = async (clubId: string, playerId: string): Promise<{ date: string; eventTitle: string; status: AttendanceStatus }[]> => {
  const sheets = await getClubAttendanceHistory(clubId);
  const results: { date: string; eventTitle: string; status: AttendanceStatus }[] = [];

  sheets.forEach(sheet => {
    const record = sheet.records.find(r => r.playerId === playerId);
    if (record) {
      results.push({ date: sheet.date, eventTitle: sheet.eventTitle, status: record.status });
    }
  });

  return results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
