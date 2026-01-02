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
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Pub, UserProfile } from '../types';
import { createUserProfile, getUserProfile } from './userProfiles';

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

// Get all pubs for a user with user profile data
// Automatically creates profile if it doesn't exist (handles user migration)
export const getUserPubs = async (userId: string): Promise<Pub[]> => {
  try {
    const q = query(
      collection(db, 'pubs'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const pubs: Pub[] = [];

    // Fetch user profile once (with automatic migration for existing users)
    let userProfile: UserProfile | null = null;
    try {
      userProfile = await getUserProfile(userId);
      
      // Migration: if user has no profile but is trying to view pubs, create one
      if (!userProfile) {
        console.log(`Profile missing for user ${userId}, creating...`);
        try {
          const displayName = userId.split('@')[0] || 'User';
          await createUserProfile(userId, displayName, userId);
          userProfile = await getUserProfile(userId);
        } catch (createError) {
          console.error('Error creating profile during migration:', createError);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }

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
        userProfile: userProfile ? {
          displayName: userProfile.displayName,
          profilePictureUrl: userProfile.profilePictureUrl,
        } : undefined,
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
/**
 * Get explore pubs - pubs from users not followed by current user
 */
export const getExplorePubs = async (currentUserId: string, limit: number = 50): Promise<Pub[]> => {
  try {
    // Get current user's following list
    const followsQuery = query(
      collection(db, 'follows'),
      where('follower', '==', currentUserId)
    );
    
    const followsSnapshot = await getDocs(followsQuery);
    const followingIds = new Set(followsSnapshot.docs.map(doc => doc.data().following));
    
    // Get all pubs
    const allPubsQuery = query(
      collection(db, 'pubs'),
      orderBy('visitDate', 'desc')
    );
    
    const allPubsSnapshot = await getDocs(allPubsQuery);
    const explorePubs: Pub[] = [];
    
    for (const doc of allPubsSnapshot.docs) {
      if (explorePubs.length >= limit) break;
      
      const pubData = doc.data() as any;
      const pubId = doc.id;
      const userId = pubData.userId;
      
      // Only include pubs from users not being followed and not from current user
      if (!followingIds.has(userId) && userId !== currentUserId) {
        try {
          const userProfile = await getUserProfile(userId);
          
          if (userProfile) {
            const pub: Pub = {
              pubId,
              userId,
              pubName: pubData.pubName || '',
              location: pubData.location || '',
              whatYouHad: pubData.whatYouHad || '',
              valueForMoney: pubData.valueForMoney || 0,
              beerQuality: pubData.beerQuality || 0,
              foodQuality: pubData.foodQuality || undefined,
              visitDate: pubData.visitDate?.toDate?.() || new Date(),
              photoUrls: pubData.photoUrls || [],
              thumbnailUrls: pubData.thumbnailUrls || [],
              createdAt: pubData.createdAt?.toDate?.() || new Date(),
              updatedAt: pubData.updatedAt?.toDate?.() || new Date(),
              userProfile: {
                displayName: userProfile.displayName,
                profilePictureUrl: userProfile.profilePictureUrl,
              },
            };
            explorePubs.push(pub);
          }
        } catch (error) {
          console.error('Error fetching user profile for pub:', error);
          // Skip this pub if we can't fetch the user profile
          continue;
        }
      }
    }
    
    return explorePubs;
  } catch (error) {
    console.error('Error getting explore pubs:', error);
    return [];
  }
};

// Like a pub
export const likePub = async (userId: string, pubId: string): Promise<void> => {
  try {
    const likeRef = doc(db, 'pubs', pubId, 'likes', userId);
    await setDoc(likeRef, {
      userId,
      likedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error liking pub:', error);
    throw error;
  }
};

// Unlike a pub
export const unlikePub = async (userId: string, pubId: string): Promise<void> => {
  try {
    const likeRef = doc(db, 'pubs', pubId, 'likes', userId);
    await deleteDoc(likeRef);
  } catch (error) {
    console.error('Error unliking pub:', error);
    throw error;
  }
};

// Check if user has liked a pub
export const hasLikedPub = async (userId: string, pubId: string): Promise<boolean> => {
  try {
    const likeRef = doc(db, 'pubs', pubId, 'likes', userId);
    const likeDoc = await getDoc(likeRef);
    return likeDoc.exists();
  } catch (error) {
    console.error('Error checking if user liked pub:', error);
    return false;
  }
};

// Get like count for a pub
export const getLikeCount = async (pubId: string): Promise<number> => {
  try {
    const likesQuery = query(collection(db, 'pubs', pubId, 'likes'));
    const likesDocs = await getDocs(likesQuery);
    return likesDocs.size;
  } catch (error) {
    console.error('Error getting like count:', error);
    return 0;
  }
};

// Dislike a pub
export const dislikePub = async (userId: string, pubId: string): Promise<void> => {
  try {
    const dislikeRef = doc(db, 'pubs', pubId, 'dislikes', userId);
    await setDoc(dislikeRef, {
      userId,
      dislikedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error disliking pub:', error);
    throw error;
  }
};

// Remove dislike from a pub
export const undislikePub = async (userId: string, pubId: string): Promise<void> => {
  try {
    const dislikeRef = doc(db, 'pubs', pubId, 'dislikes', userId);
    await deleteDoc(dislikeRef);
  } catch (error) {
    console.error('Error removing dislike from pub:', error);
    throw error;
  }
};

// Check if user has disliked a pub
export const hasDislikedPub = async (userId: string, pubId: string): Promise<boolean> => {
  try {
    const dislikeRef = doc(db, 'pubs', pubId, 'dislikes', userId);
    const dislikeDoc = await getDoc(dislikeRef);
    return dislikeDoc.exists();
  } catch (error) {
    console.error('Error checking if user disliked pub:', error);
    return false;
  }
};

// Get dislike count for a pub
export const getDislikeCount = async (pubId: string): Promise<number> => {
  try {
    const dislikesQuery = query(collection(db, 'pubs', pubId, 'dislikes'));
    const dislikesDocs = await getDocs(dislikesQuery);
    return dislikesDocs.size;
  } catch (error) {
    console.error('Error getting dislike count:', error);
    return 0;
  }
};