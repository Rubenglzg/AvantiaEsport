import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface ContactFormData {
  clubName: string;
  email: string;
  message: string;
}

export const submitContactForm = async (data: ContactFormData) => {
  try {
    const docRef = await addDoc(collection(db, 'leads'), {
      ...data,
      createdAt: serverTimestamp(),
      status: 'new'
    });
    return docRef.id;
  } catch (error) {
    console.error("Error submitting contact form: ", error);
    throw error;
  }
};
