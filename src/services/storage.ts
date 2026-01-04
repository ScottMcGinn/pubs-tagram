import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_BUCKET = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET;
const STORAGE_API_URL = `https://storage.googleapis.com/storage/v1/b/${STORAGE_BUCKET}/o`;

export interface UploadResult {
  fullUrl: string;
  thumbnailUrl: string;
}

// Get ID token from AsyncStorage
const getIdToken = async (): Promise<string> => {
  const token = await AsyncStorage.getItem('idToken');
  if (!token) throw new Error('No authentication token found');
  return token;
};

// Upload a photo and its thumbnail to Firebase Storage via REST API
export const uploadPubPhoto = async (
  userId: string,
  pubId: string,
  photoUri: string,
  thumbnailUri: string,
  index: number
): Promise<UploadResult> => {
  try {
    const idToken = await getIdToken();

    // For now, return mock URLs
    // TODO: Implement actual file upload when image handling is ready
    const mockFullUrl = `gs://${STORAGE_BUCKET}/users/${userId}/pubs/${pubId}/photo${index}.jpg`;
    const mockThumbnailUrl = `gs://${STORAGE_BUCKET}/users/${userId}/pubs/${pubId}/thumb${index}.jpg`;

    return {
      fullUrl: mockFullUrl,
      thumbnailUrl: mockThumbnailUrl,
    };
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};
