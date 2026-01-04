import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';

const PROJECT_ID = process.env.firebase_project_id;
const FIRESTORE_API_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// Get ID token from AsyncStorage
const getIdToken = async (): Promise<string> => {
  const token = await AsyncStorage.getItem('idToken');
  if (!token) throw new Error('No authentication token found');
  return token;
};

/**
 * Create a new user profile
 */
export const createUserProfile = async (
  uid: string,
  displayName: string | { email: string; displayName: string; photoUrl: null; createdAt: Date },
  email?: string
): Promise<UserProfile> => {
  try {
    const idToken = await getIdToken();
    
    // Handle both old and new call signatures
    let profileDisplayName = '';
    let profileEmail = '';
    let profilePhotoUrl = null;

    if (typeof displayName === 'string' && email) {
      profileDisplayName = displayName;
      profileEmail = email;
    } else if (typeof displayName === 'object') {
      profileEmail = displayName.email;
      profileDisplayName = displayName.displayName;
      profilePhotoUrl = displayName.photoUrl;
    }

    const now = new Date().toISOString();

    const response = await fetch(
      `${FIRESTORE_API_URL}/users/${uid}?key=${process.env.firebase_api_key}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          fields: {
            uid: { stringValue: uid },
            email: { stringValue: profileEmail },
            displayName: { stringValue: profileDisplayName },
            bio: { stringValue: '' },
            createdAt: { timestampValue: now },
            updatedAt: { timestampValue: now },
            isPublic: { booleanValue: true },
            followers: { arrayValue: { values: [] } },
            following: { arrayValue: { values: [] } },
            ...(() => profilePhotoUrl ? {
              profilePictureUrl: { stringValue: profilePhotoUrl },
            } : {})(),
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create user profile: ${response.statusText}`);
    }

    return {
      uid,
      email: profileEmail,
      displayName: profileDisplayName,
      bio: '',
      profilePictureUrl: profilePhotoUrl || undefined,
      createdAt: new Date(now),
      updatedAt: new Date(now),
      isPublic: true,
      followers: [],
      following: [],
    } as UserProfile;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

/**
 * Get user profile by UID
 */
export const getUserProfile = async (
  uid: string
): Promise<UserProfile | null> => {
  try {
    const idToken = await getIdToken();

    const response = await fetch(
      `${FIRESTORE_API_URL}/users/${uid}?key=${process.env.firebase_api_key}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const fields = data.fields || {};

    return {
      uid,
      email: fields.email?.stringValue || '',
      displayName: fields.displayName?.stringValue || '',
      bio: fields.bio?.stringValue || '',
      profilePictureUrl: fields.profilePictureUrl?.stringValue || undefined,
      createdAt: fields.createdAt?.timestampValue
        ? new Date(fields.createdAt.timestampValue)
        : new Date(),
      updatedAt: fields.updatedAt?.timestampValue
        ? new Date(fields.updatedAt.timestampValue)
        : new Date(),
      isPublic: fields.isPublic?.booleanValue ?? true,
      followers: (fields.followers?.arrayValue?.values || []).map(
        (v: any) => v.stringValue
      ),
      following: (fields.following?.arrayValue?.values || []).map(
        (v: any) => v.stringValue
      ),
    } as UserProfile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

/**
 * Get current user's profile (must be authenticated)
 */
export const getCurrentUserProfile = async (
  uid: string
): Promise<UserProfile | null> => {
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
    const idToken = await getIdToken();
    const now = new Date().toISOString();

    const updateFields: any = {
      updatedAt: { timestampValue: now },
    };

    // Convert updates to Firestore format
    if (updates.displayName) {
      updateFields.displayName = { stringValue: updates.displayName };
    }
    if (updates.bio !== undefined) {
      updateFields.bio = { stringValue: updates.bio };
    }
    if (updates.profilePictureUrl !== undefined) {
      updateFields.profilePictureUrl = {
        stringValue: updates.profilePictureUrl || '',
      };
    }
    if (updates.isPublic !== undefined) {
      updateFields.isPublic = { booleanValue: updates.isPublic };
    }

    await fetch(
      `${FIRESTORE_API_URL}/users/${uid}?key=${process.env.firebase_api_key}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          fields: updateFields,
        }),
      }
    );
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Upload profile picture to Firebase Storage (mock for now)
 */
export const uploadProfilePicture = async (
  uid: string,
  fileUri: string
): Promise<string> => {
  try {
    // TODO: Implement actual file upload when image handling is ready
    const mockUrl = `gs://${process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET}/users/${uid}/profile-picture.jpg`;
    return mockUrl;
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
    // TODO: Implement actual file deletion
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
export const searchUsers = async (
  searchTerm: string,
  limit: number = 20,
  blockedUserIds: string[] = [],
  excludePrivate: boolean = false
): Promise<UserProfile[]> => {
  try {
    const idToken = await getIdToken();

    const response = await fetch(
      `${FIRESTORE_API_URL}:runQuery?key=${process.env.firebase_api_key}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'users' }],
          },
        }),
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    const users: UserProfile[] = [];

    if (Array.isArray(data)) {
      data.forEach((doc: any) => {
        if (doc.document) {
          const user = convertFirestoreDoc(doc.document) as UserProfile;
          if (
            !blockedUserIds.includes(user.uid) &&
            (!excludePrivate || user.isPublic) &&
            user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
          ) {
            users.push(user);
          }
        }
      });
    }

    return users.slice(0, limit);
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
    const profile = await getUserProfile(uid);
    return !!profile;
  } catch (error) {
    console.error('Error checking user profile:', error);
    return false;
  }
};

/**
 * Get all discoverable profiles (for discovery) - paginated
 */
export const getPublicProfiles = async (
  limit: number = 20,
  blockedUserIds: string[] = [],
  excludePrivate: boolean = false
): Promise<UserProfile[]> => {
  try {
    const idToken = await getIdToken();

    const response = await fetch(
      `${FIRESTORE_API_URL}:runQuery?key=${process.env.firebase_api_key}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'users' }],
            where: {
              fieldFilter: {
                field: { fieldPath: 'isPublic' },
                op: 'EQUAL',
                value: { booleanValue: true },
              },
            },
          },
        }),
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    const users: UserProfile[] = [];

    if (Array.isArray(data)) {
      data.forEach((doc: any) => {
        if (doc.document) {
          const user = convertFirestoreDoc(doc.document) as UserProfile;
          if (
            !blockedUserIds.includes(user.uid) &&
            (!excludePrivate || user.isPublic)
          ) {
            users.push(user);
          }
        }
      });
    }

    return users.slice(0, limit);
  } catch (error) {
    console.error('Error getting public profiles:', error);
    return [];
  }
};

/**
 * Follow a user - creates a document in the follows collection
 */
export const followUser = async (
  currentUserId: string,
  targetUserId: string
): Promise<void> => {
  try {
    const idToken = await getIdToken();
    const followId = `${currentUserId}_${targetUserId}`;

    await fetch(
      `${FIRESTORE_API_URL}/follows/${followId}?key=${process.env.firebase_api_key}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          fields: {
            follower: { stringValue: currentUserId },
            following: { stringValue: targetUserId },
            createdAt: { timestampValue: new Date().toISOString() },
          },
        }),
      }
    );
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

/**
 * Unfollow a user
 */
export const unfollowUser = async (
  currentUserId: string,
  targetUserId: string
): Promise<void> => {
  try {
    const idToken = await getIdToken();
    const followId = `${currentUserId}_${targetUserId}`;

    await fetch(
      `${FIRESTORE_API_URL}/follows/${followId}?key=${process.env.firebase_api_key}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

/**
 * Check if current user is following target user
 */
export const isFollowing = async (
  currentUserId: string,
  targetUserId: string
): Promise<boolean> => {
  try {
    const idToken = await getIdToken();
    const followId = `${currentUserId}_${targetUserId}`;

    const response = await fetch(
      `${FIRESTORE_API_URL}/follows/${followId}?key=${process.env.firebase_api_key}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    return response.ok;
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
    const idToken = await getIdToken();

    const response = await fetch(
      `${FIRESTORE_API_URL}:runQuery?key=${process.env.firebase_api_key}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'follows' }],
            where: {
              fieldFilter: {
                field: { fieldPath: 'following' },
                op: 'EQUAL',
                value: { stringValue: userId },
              },
            },
          },
        }),
      }
    );

    if (!response.ok) return 0;

    const data = await response.json();
    return Array.isArray(data) ? data.length : 0;
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
    const idToken = await getIdToken();

    const response = await fetch(
      `${FIRESTORE_API_URL}:runQuery?key=${process.env.firebase_api_key}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'follows' }],
            where: {
              fieldFilter: {
                field: { fieldPath: 'follower' },
                op: 'EQUAL',
                value: { stringValue: userId },
              },
            },
          },
        }),
      }
    );

    if (!response.ok) return 0;

    const data = await response.json();
    return Array.isArray(data) ? data.length : 0;
  } catch (error) {
    console.error('Error getting following count:', error);
    return 0;
  }
};

/**
 * Get list of users following a specific user (followers)
 */
export const getFollowersList = async (
  userId: string
): Promise<UserProfile[]> => {
  try {
    const idToken = await getIdToken();

    const response = await fetch(
      `${FIRESTORE_API_URL}:runQuery?key=${process.env.firebase_api_key}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'follows' }],
            where: {
              fieldFilter: {
                field: { fieldPath: 'following' },
                op: 'EQUAL',
                value: { stringValue: userId },
              },
            },
          },
        }),
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    const profiles: UserProfile[] = [];

    if (Array.isArray(data)) {
      for (const doc of data) {
        if (doc.document?.fields?.follower?.stringValue) {
          const profile = await getUserProfile(doc.document.fields.follower.stringValue);
          if (profile) {
            profiles.push(profile);
          }
        }
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
export const getFollowingList = async (
  userId: string
): Promise<UserProfile[]> => {
  try {
    const idToken = await getIdToken();

    const response = await fetch(
      `${FIRESTORE_API_URL}:runQuery?key=${process.env.firebase_api_key}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'follows' }],
            where: {
              fieldFilter: {
                field: { fieldPath: 'follower' },
                op: 'EQUAL',
                value: { stringValue: userId },
              },
            },
          },
        }),
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    const profiles: UserProfile[] = [];

    if (Array.isArray(data)) {
      for (const doc of data) {
        if (doc.document?.fields?.following?.stringValue) {
          const profile = await getUserProfile(doc.document.fields.following.stringValue);
          if (profile) {
            profiles.push(profile);
          }
        }
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
export const getSuggestedUsers = async (
  currentUserId: string,
  limit: number = 20
): Promise<UserProfile[]> => {
  try {
    const idToken = await getIdToken();

    // Get all public users
    const usersResponse = await fetch(
      `${FIRESTORE_API_URL}:runQuery?key=${process.env.firebase_api_key}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'users' }],
            where: {
              fieldFilter: {
                field: { fieldPath: 'isPublic' },
                op: 'EQUAL',
                value: { booleanValue: true },
              },
            },
          },
        }),
      }
    );

    const allUsers: UserProfile[] = [];
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      if (Array.isArray(usersData)) {
        usersData.forEach((doc: any) => {
          if (doc.document) {
            const user = convertFirestoreDoc(doc.document) as UserProfile;
            allUsers.push(user);
          }
        });
      }
    }

    // Get current user's following list
    const followingResponse = await fetch(
      `${FIRESTORE_API_URL}:runQuery?key=${process.env.firebase_api_key}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'follows' }],
            where: {
              fieldFilter: {
                field: { fieldPath: 'follower' },
                op: 'EQUAL',
                value: { stringValue: currentUserId },
              },
            },
          },
        }),
      }
    );

    const followingIds = new Set<string>();
    if (followingResponse.ok) {
      const followingData = await followingResponse.json();
      if (Array.isArray(followingData)) {
        followingData.forEach((doc: any) => {
          if (doc.document?.fields?.following?.stringValue) {
            followingIds.add(doc.document.fields.following.stringValue);
          }
        });
      }
    }

    // Filter out current user and users already followed
    const suggested = allUsers
      .filter(user => user.uid !== currentUserId && !followingIds.has(user.uid))
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);

    return suggested;
  } catch (error) {
    console.error('Error getting suggested users:', error);
    return [];
  }
};

// Helper to convert Firestore REST API doc format to JS object
const convertFirestoreDoc = (doc: any): any => {
  const fields = doc.fields || {};
  const result: any = { uid: doc.name.split('/').pop() };

  for (const [key, field] of Object.entries(fields)) {
    const value = field as any;
    if (value.stringValue) {
      result[key] = value.stringValue;
    } else if (value.integerValue) {
      result[key] = parseInt(value.integerValue);
    } else if (value.booleanValue !== undefined) {
      result[key] = value.booleanValue;
    } else if (value.timestampValue) {
      result[key] = new Date(value.timestampValue);
    } else if (value.arrayValue) {
      result[key] = (value.arrayValue.values || []).map((v: any) => {
        if (v.stringValue) return v.stringValue;
        if (v.integerValue) return parseInt(v.integerValue);
        return v;
      });
    } else if (value.mapValue) {
      result[key] = convertFirestoreDoc({ fields: value.mapValue.fields });
    }
  }

  return result;
};
