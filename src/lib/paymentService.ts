import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

export interface PaymentRecord {
  id?: string;
  userId: string;
  clubId: string;
  amount: number;
  season: string;
  status: 'paid';
  paidAt: string;
}

export const recordPayment = async (userId: string, clubId: string, amount: number, season: string): Promise<PaymentRecord> => {
  const newPayment: Omit<PaymentRecord, 'id'> = {
    userId,
    clubId,
    amount,
    season,
    status: 'paid',
    paidAt: new Date().toISOString()
  };
  
  const docRef = await addDoc(collection(db, 'payments'), newPayment);
  return { id: docRef.id, ...newPayment };
};

export const getPlayerPayments = async (userId: string): Promise<PaymentRecord[]> => {
  const q = query(collection(db, 'payments'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentRecord));
};

export const getClubPayments = async (clubId: string): Promise<PaymentRecord[]> => {
  const q = query(collection(db, 'payments'), where('clubId', '==', clubId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentRecord));
};
