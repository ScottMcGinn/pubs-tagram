import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db, storage } from './firebase';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { UserProfile } from '../types';

/**
 * Create a new user profile
 */
export const createUserProfile = async (uid: string, displayName: string, email: string): Promise<UserProfile> => {
  const userRef = doc(collection(db, 'users'), uid);
  
  const profileData: UserProfile = {
    uid,
    email,
    displayName,
    bio: '',
    profilePictureUrl: undefined,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isPublic: true,
  };

  await setDoc(userRef, profileData);
  return profileData;
};

/**
 * Get user profile by UID
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    return userSnap.data() as UserProfile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Get current user's profile (must be authenticated)
 */
export const getCurrentUserProfile = async (uid: string): Promise<UserProfile | null> => {
  return getUserProfile(uid);
};

/**
 * Update user profile (only specific fields)
 */
export const updateUserProfile = async (
  uid: string,
  updates: Partial<Omit<UserProfile, 'uid' | 'email' | 'createdAt'>>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    
    await updateDoc(userRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Upload profile picture to Firebase Storage
 */
export const uploadProfilePicture = async (uid: string, fileUri: string): Promise<string> => {
  try {
    // First ensure profile document exists
    const profileRef = doc(db, 'users', uid);
    const profileSnap = await getDoc(profileRef);
    
    if (!profileSnap.exists()) {
      // Create profile if it doesn't exist
      await setDoc(profileRef, {
        uid,
        email: '',
        displayName: 'User',
        bio: '',
        profilePictureUrl: fileUri,
        isPublic: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } else {
      // Update existing profile
      await updateUserProfile(uid, {
        profilePictureUrl: fileUri,
      });
    }

    return fileUri;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};

/**
 * Delete profile picture
 */
export const deleteProfilePicture = async (uid: string): Promise<void> => {
  try {
    const storageRef = ref(storage, `profiles/${uid}/profile.jpg`);
    await deleteObject(storageRef);

    // Update profile to remove picture URL
    await updateUserProfile(uid, {
      profilePictureUrl: undefined,
    });
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    throw error;
  }
};

/**
 * Search users by display name
 */
export const searchUsers = async (searchTerm: string, limit: number = 20): Promise<UserProfile[]> => {
  try {
    // Simple search - in production, use Algolia or similar
    const q = query(
      collection(db, 'users'),
      where('isPublic', '==', true)
    );

    const snapshot = await getDocs(q);
    const users = snapshot.docs.map(doc => doc.data() as UserProfile);

    // Client-side filtering
    return users
      .filter(user =>
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, limit);
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

/**
 * Check if user profile exists
 */
export const userProfileExists = async (uid: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists();
  } catch (error) {
    console.error('Error checking user profile:', error);
    return false;
  }
};

/**
 * Get all public profiles (for discovery) - paginated
 */
export const getPublicProfiles = async (limit: number = 20): Promise<UserProfile[]> => {
  try {
    const q = query(
      collection(db, 'users'),
      where('isPublic', '==', true)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as UserProfile).slice(0, limit);
  } catch (error) {
    console.error('Error getting public profiles:', error);
    throw error;
  }
};
