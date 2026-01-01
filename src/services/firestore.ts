import {
  collection,
  addDoc,
  setDoc,
  doc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Pub } from '../types';

// Create a new pub entry using setDoc instead of addDoc
export const createPub = async (
  userId: string,
  pubData: {
    pubName: string;
    location: string;
    whatYouHad?: string;
    valueForMoney: number;
    beerQuality: number;
    foodQuality?: number;
    visitDate?: Date;
    photoUrls: string[];
    thumbnailUrls: string[];
  }
): Promise<string> => {
  try {
    // Generate ID client-side
    const pubId = `pub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const pubRef = doc(db, 'pubs', pubId);
    
    await setDoc(pubRef, {
      userId,
      pubName: pubData.pubName,
      location: pubData.location,
      whatYouHad: pubData.whatYouHad || '',
      valueForMoney: pubData.valueForMoney,
      beerQuality: pubData.beerQuality,
      foodQuality: pubData.foodQuality || null,
      visitDate: pubData.visitDate ? Timestamp.fromDate(pubData.visitDate) : null,
      photoUrls: pubData.photoUrls,
      thumbnailUrls: pubData.thumbnailUrls,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return pubId;
  } catch (error) {
    console.error('Error creating pub:', error);
    throw error;
  }
};

// Get all pubs for a user
export const getUserPubs = async (userId: string): Promise<Pub[]> => {
  try {
    const q = query(
      collection(db, 'pubs'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const pubs: Pub[] = [];

    querySnapshot.forEach(doc => {
      const data = doc.data();
      pubs.push({
        pubId: doc.id,
        userId: data.userId,
        pubName: data.pubName,
        location: data.location,
        whatYouHad: data.whatYouHad,
        valueForMoney: data.valueForMoney,
        beerQuality: data.beerQuality,
        foodQuality: data.foodQuality || undefined,
        visitDate: data.visitDate ? data.visitDate.toDate() : undefined,
        photoUrls: data.photoUrls,
        thumbnailUrls: data.thumbnailUrls,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      });
    });

    return pubs;
  } catch (error) {
    console.error('Error getting pubs:', error);
    throw error;
  }
};

// Delete a pub
export const deletePub = async (pubId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'pubs', pubId));
  } catch (error) {
    console.error('Error deleting pub:', error);
    throw error;
  }
};
