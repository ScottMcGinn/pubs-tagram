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
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, storage } from './firebase';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { UserProfile } from '../types';

/**
 * Create a new user profile
 */
export const createUserProfile = async (uid: string, displayName: string, email: string): Promise<UserProfile> => {
  const userRef = doc(collection(db, 'users'), uid);
  
  const profileData: any = {
    uid,
    email,
    displayName,
    bio: '',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isPublic: true,
    followers: [],
    following: [],
    // Don't include profilePictureUrl if undefined - Firestore rejects undefined values
  };

  await setDoc(userRef, profileData);
  return profileData as UserProfile;
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
/**
 * Follow a user - creates a document in the follows collection
 */
export const followUser = async (currentUserId: string, targetUserId: string): Promise<void> => {
  try {
    // Create a document in the follows collection
    const followRef = doc(collection(db, 'follows'));
    
    await setDoc(followRef, {
      follower: currentUserId,
      following: targetUserId,
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

/**
 * Unfollow a user - deletes the follow document
 */
export const unfollowUser = async (currentUserId: string, targetUserId: string): Promise<void> => {
  try {
    // Find and delete the follow relationship
    const q = query(
      collection(db, 'follows'),
      where('follower', '==', currentUserId),
      where('following', '==', targetUserId)
    );

    const snapshot = await getDocs(q);
    
    for (const doc of snapshot.docs) {
      await deleteDoc(doc.ref);
    }
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

/**
 * Check if current user is following target user
 */
export const isFollowing = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
  try {
    const q = query(
      collection(db, 'follows'),
      where('follower', '==', currentUserId),
      where('following', '==', targetUserId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.length > 0;
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
};

/**
 * Get followers count for a user
 */
export const getFollowersCount = async (userId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, 'follows'),
      where('following', '==', userId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.length;
  } catch (error) {
    console.error('Error getting followers count:', error);
    return 0;
  }
};

/**
 * Get following count for a user
 */
export const getFollowingCount = async (userId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, 'follows'),
      where('follower', '==', userId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.length;
  } catch (error) {
    console.error('Error getting following count:', error);
    return 0;
  }
};

/**
 * Get list of users following a specific user (followers)
 */
export const getFollowersList = async (userId: string): Promise<UserProfile[]> => {
  try {
    const q = query(
      collection(db, 'follows'),
      where('following', '==', userId)
    );

    const snapshot = await getDocs(q);
    const followerIds = snapshot.docs.map(doc => doc.data().follower);
    
    // Fetch user profiles for all followers
    const profiles: UserProfile[] = [];
    for (const followerId of followerIds) {
      const profile = await getUserProfile(followerId);
      if (profile) {
        profiles.push(profile);
      }
    }
    
    return profiles;
  } catch (error) {
    console.error('Error getting followers list:', error);
    return [];
  }
};

/**
 * Get list of users that a specific user is following (following)
 */
export const getFollowingList = async (userId: string): Promise<UserProfile[]> => {
  try {
    const q = query(
      collection(db, 'follows'),
      where('follower', '==', userId)
    );

    const snapshot = await getDocs(q);
    const followingIds = snapshot.docs.map(doc => doc.data().following);
    
    // Fetch user profiles for all following users
    const profiles: UserProfile[] = [];
    for (const followingId of followingIds) {
      const profile = await getUserProfile(followingId);
      if (profile) {
        profiles.push(profile);
      }
    }
    
    return profiles;
  } catch (error) {
    console.error('Error getting following list:', error);
    return [];
  }
};

/**
 * Get suggested users (public users not yet followed by current user)
 */
export const getSuggestedUsers = async (currentUserId: string, limit: number = 20): Promise<UserProfile[]> => {
  try {
    console.log('Getting suggested users for:', currentUserId);
    
    // Get all public users
    const allUsersQuery = query(
      collection(db, 'users'),
      where('isPublic', '==', true)
    );
    
    const allUsersSnapshot = await getDocs(allUsersQuery);
    const allUsers = allUsersSnapshot.docs.map(doc => doc.data() as UserProfile);
    console.log('All public users:', allUsers.map(u => ({ uid: u.uid, displayName: u.displayName })));
    
    // Get current user's following list
    const followingQuery = query(
      collection(db, 'follows'),
      where('follower', '==', currentUserId)
    );
    
    const followingSnapshot = await getDocs(followingQuery);
    const followingIds = new Set(followingSnapshot.docs.map(doc => doc.data().following));
    console.log('Currently following:', Array.from(followingIds));
    
    // Filter out current user and users already followed
    const suggested = allUsers.filter(
      user => {
        const isNotCurrent = user.uid !== currentUserId;
        const isNotFollowing = !followingIds.has(user.uid);
        console.log(`User ${user.displayName} (${user.uid}): isNotCurrent=${isNotCurrent}, isNotFollowing=${isNotFollowing}`);
        return isNotCurrent && isNotFollowing;
      }
    );
    
    console.log('Suggested users after filter:', suggested.map(u => ({ uid: u.uid, displayName: u.displayName })));
    
    // Shuffle and limit results
    return suggested.sort(() => Math.random() - 0.5).slice(0, limit);
  } catch (error) {
    console.error('Error getting suggested users:', error);
    return [];
  }
};