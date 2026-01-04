import storage from '@react-native-firebase/storage';
import RNFS from 'react-native-fs';

export interface UploadResult {
  fullUrl: string;
  thumbnailUrl: string;
}

// Upload a photo and its thumbnail to Firebase Storage
export const uploadPubPhoto = async (
  userId: string,
  pubId: string,
  photoUri: string,
  thumbnailUri: string,
  index: number
): Promise<UploadResult> => {
  try {
    // Read files from disk for React Native
    const [photoData, thumbnailData] = await Promise.all([
      RNFS.readFile(photoUri, 'base64'),
      RNFS.readFile(thumbnailUri, 'base64'),
    ]);

    // Create storage references
    const photoRef = storage().ref(
      `users/${userId}/pubs/${pubId}/photo${index}.jpg`
    );
    const thumbnailRef = storage().ref(
      `users/${userId}/pubs/${pubId}/thumb${index}.jpg`
    );

    // Upload both images
    await Promise.all([
      photoRef.putString(photoData, 'base64', { contentType: 'image/jpeg' }),
      thumbnailRef.putString(thumbnailData, 'base64', {
        contentType: 'image/jpeg',
      }),
    ]);

    // Get download URLs
    const [fullUrl, thumbnailUrl] = await Promise.all([
      photoRef.getDownloadURL(),
      thumbnailRef.getDownloadURL(),
    ]);

    return { fullUrl, thumbnailUrl };
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};
