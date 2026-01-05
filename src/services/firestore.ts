import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pub, UserProfile } from '../types';
import { createUserProfile, getUserProfile } from './userProfiles';

const PROJECT_ID = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
const FIRESTORE_API_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// Get ID token from AsyncStorage
const getIdToken = async (): Promise<string> => {
  const token = await AsyncStorage.getItem('idToken');
  if (!token) throw new Error('No authentication token found');
  return token;
};

// Create a new pub entry
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
    const idToken = await getIdToken();
    const pubId = `pub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const response = await fetch(
      `${FIRESTORE_API_URL}/pubs/${pubId}?key=${process.env.EXPO_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          fields: {
            userId: { stringValue: userId },
            pubName: { stringValue: pubData.pubName },
            location: { stringValue: pubData.location },
            whatYouHad: { stringValue: pubData.whatYouHad || '' },
            valueForMoney: { integerValue: pubData.valueForMoney },
            beerQuality: { integerValue: pubData.beerQuality },
            foodQuality: { integerValue: pubData.foodQuality || 0 },
            visitDate: {
              timestampValue: pubData.visitDate?.toISOString() || now,
            },
            photoUrls: {
              arrayValue: {
                values: pubData.photoUrls.map(url => ({ stringValue: url })),
              },
            },
            thumbnailUrls: {
              arrayValue: {
                values: pubData.thumbnailUrls.map(url => ({
                  stringValue: url,
                })),
              },
            },
            createdAt: { timestampValue: now },
            updatedAt: { timestampValue: now },
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create pub: ${response.statusText}`);
    }

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
    const idToken = await getIdToken();
    const response = await fetch(
      `${FIRESTORE_API_URL}:runQuery?key=${process.env.EXPO_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'pubs' }],
            where: {
              fieldFilter: {
                field: { fieldPath: 'userId' },
                op: 'EQUAL',
                value: { stringValue: userId },
              },
            },
            orderBy: [
              {
                field: { fieldPath: 'createdAt' },
                direction: 'DESCENDING',
              },
            ],
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch user pubs: ${response.statusText}`);
    }

    const data = await response.json();
    const pubs: Pub[] = [];

    // Get user profile
    let userProfile: UserProfile | null = null;
    try {
      userProfile = await getUserProfile(userId);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }

    if (data.document) {
      const pubData = convertFirestoreDoc(data.document);
      pubs.push({
        pubId: pubData.pubId,
        userId: pubData.userId,
        pubName: pubData.pubName,
        location: pubData.location,
        whatYouHad: pubData.whatYouHad,
        valueForMoney: pubData.valueForMoney,
        beerQuality: pubData.beerQuality,
        foodQuality: pubData.foodQuality,
        visitDate: pubData.visitDate,
        photoUrls: pubData.photoUrls,
        thumbnailUrls: pubData.thumbnailUrls,
        createdAt: pubData.createdAt,
        updatedAt: pubData.updatedAt,
        userProfile: userProfile
          ? {
              displayName: userProfile.displayName,
              profilePictureUrl: userProfile.profilePictureUrl,
            }
          : undefined,
      });
    }

    return pubs;
  } catch (error) {
    console.error('Error getting pubs:', error);
    throw error;
  }
};

// Helper to convert Firestore REST API doc format to JS object
const convertFirestoreDoc = (doc: any): any => {
  const fields = doc.fields || {};
  const result: any = { pubId: doc.name.split('/').pop() };

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

// Delete a pub
export const deletePub = async (pubId: string): Promise<void> => {
  try {
    const idToken = await getIdToken();
    const response = await fetch(
      `${FIRESTORE_API_URL}/pubs/${pubId}?key=${process.env.EXPO_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete pub: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting pub:', error);
    throw error;
  }
};
/**
 * Get explore pubs - pubs from users not followed by current user
 */
export const getExplorePubs = async (
  currentUserId: string,
  limit: number = 50
): Promise<Pub[]> => {
  try {
    const idToken = await getIdToken();

    // Get current user's following list
    const followResponse = await fetch(
      `${FIRESTORE_API_URL}:runQuery?key=${process.env.EXPO_PUBLIC_FIREBASE_API_KEY}`,
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

    const followData = await followResponse.json();
    const followingIds = new Set<string>();

    if (Array.isArray(followData)) {
      followData.forEach((doc: any) => {
        if (doc.document?.fields?.following?.stringValue) {
          followingIds.add(doc.document.fields.following.stringValue);
        }
      });
    }

    // Get all pubs ordered by visitDate
    const pubsResponse = await fetch(
      `${FIRESTORE_API_URL}:runQuery?key=${process.env.EXPO_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'pubs' }],
            orderBy: [
              {
                field: { fieldPath: 'visitDate' },
                direction: 'DESCENDING',
              },
            ],
          },
        }),
      }
    );

    const pubsData = await pubsResponse.json();
    const explorePubs: Pub[] = [];

    if (Array.isArray(pubsData)) {
      for (const doc of pubsData) {
        if (explorePubs.length >= limit) break;

        if (doc.document) {
          const pubData = convertFirestoreDoc(doc.document);
          const userId = pubData.userId;

          // Only include pubs from users not being followed and not from current user
          if (!followingIds.has(userId) && userId !== currentUserId) {
            try {
              const userProfile = await getUserProfile(userId);
              if (userProfile) {
                explorePubs.push({
                  pubId: pubData.pubId,
                  userId,
                  pubName: pubData.pubName || '',
                  location: pubData.location || '',
                  whatYouHad: pubData.whatYouHad || '',
                  valueForMoney: pubData.valueForMoney || 0,
                  beerQuality: pubData.beerQuality || 0,
                  foodQuality: pubData.foodQuality,
                  visitDate: pubData.visitDate,
                  photoUrls: pubData.photoUrls || [],
                  thumbnailUrls: pubData.thumbnailUrls || [],
                  createdAt: pubData.createdAt,
                  updatedAt: pubData.updatedAt,
                  userProfile: {
                    displayName: userProfile.displayName,
                    profilePictureUrl: userProfile.profilePictureUrl,
                  },
                });
              }
            } catch (error) {
              console.error('Error fetching user profile for pub:', error);
              continue;
            }
          }
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
    const idToken = await getIdToken();
    const likeId = `${userId}_${Date.now()}`;

    await fetch(
      `${FIRESTORE_API_URL}/pubs/${pubId}/likes/${likeId}?key=${process.env.EXPO_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          fields: {
            userId: { stringValue: userId },
            likedAt: { timestampValue: new Date().toISOString() },
          },
        }),
      }
    );
  } catch (error) {
    console.error('Error liking pub:', error);
    throw error;
  }
};

// Unlike a pub
export const unlikePub = async (
  userId: string,
  pubId: string
): Promise<void> => {
  try {
    const idToken = await getIdToken();
    const likeId = `${userId}_like`;

    await fetch(
      `${FIRESTORE_API_URL}/pubs/${pubId}/likes/${likeId}?key=${process.env.EXPO_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );
  } catch (error) {
    console.error('Error unliking pub:', error);
    throw error;
  }
};

// Check if user has liked a pub
export const hasLikedPub = async (
  userId: string,
  pubId: string
): Promise<boolean> => {
  try {
    const idToken = await getIdToken();
    const likeId = `${userId}_like`;

    const response = await fetch(
      `${FIRESTORE_API_URL}/pubs/${pubId}/likes/${likeId}?key=${process.env.EXPO_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Error checking if user liked pub:', error);
    return false;
  }
};

// Get like count for a pub
export const getLikeCount = async (pubId: string): Promise<number> => {
  try {
    const idToken = await getIdToken();

    const response = await fetch(
      `${FIRESTORE_API_URL}:runQuery?key=${process.env.EXPO_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          structuredQuery: {
            from: [
              {
                collectionId: 'pubs',
                allDescendants: false,
              },
              {
                collectionId: 'likes',
              },
            ],
          },
        }),
      }
    );

    if (!response.ok) return 0;

    const data = await response.json();
    return Array.isArray(data) ? data.length : 0;
  } catch (error) {
    console.error('Error getting like count:', error);
    return 0;
  }
};

// Dislike a pub
export const dislikePub = async (
  userId: string,
  pubId: string
): Promise<void> => {
  try {
    const idToken = await getIdToken();
    const dislikeId = `${userId}_${Date.now()}`;

    await fetch(
      `${FIRESTORE_API_URL}/pubs/${pubId}/dislikes/${dislikeId}?key=${process.env.EXPO_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          fields: {
            userId: { stringValue: userId },
            dislikedAt: { timestampValue: new Date().toISOString() },
          },
        }),
      }
    );
  } catch (error) {
    console.error('Error disliking pub:', error);
    throw error;
  }
};

// Remove dislike from a pub
export const undislikePub = async (
  userId: string,
  pubId: string
): Promise<void> => {
  try {
    const idToken = await getIdToken();
    const dislikeId = `${userId}_dislike`;

    await fetch(
      `${FIRESTORE_API_URL}/pubs/${pubId}/dislikes/${dislikeId}?key=${process.env.EXPO_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );
  } catch (error) {
    console.error('Error removing dislike from pub:', error);
    throw error;
  }
};

// Check if user has disliked a pub
export const hasDislikedPub = async (
  userId: string,
  pubId: string
): Promise<boolean> => {
  try {
    const idToken = await getIdToken();
    const dislikeId = `${userId}_dislike`;

    const response = await fetch(
      `${FIRESTORE_API_URL}/pubs/${pubId}/dislikes/${dislikeId}?key=${process.env.EXPO_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Error checking if user disliked pub:', error);
    return false;
  }
};

// Get dislike count for a pub
export const getDislikeCount = async (pubId: string): Promise<number> => {
  try {
    const idToken = await getIdToken();

    const response = await fetch(
      `${FIRESTORE_API_URL}:runQuery?key=${process.env.EXPO_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          structuredQuery: {
            from: [
              {
                collectionId: 'pubs',
                allDescendants: false,
              },
              {
                collectionId: 'dislikes',
              },
            ],
          },
        }),
      }
    );

    if (!response.ok) return 0;

    const data = await response.json();
    return Array.isArray(data) ? data.length : 0;
  } catch (error) {
    console.error('Error getting dislike count:', error);
    return 0;
  }
};
