import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

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
    // Convert URIs to blobs for web
    const [photoBlob, thumbnailBlob] = await Promise.all([
      fetch(photoUri).then(r => r.blob()),
      fetch(thumbnailUri).then(r => r.blob()),
    ]);

    // Create storage references
    const photoRef = ref(
      storage,
      `users/${userId}/pubs/${pubId}/photo${index}.jpg`
    );
    const thumbnailRef = ref(
      storage,
      `users/${userId}/pubs/${pubId}/thumb${index}.jpg`
    );

    // Upload both images
    await Promise.all([
      uploadBytes(photoRef, photoBlob),
      uploadBytes(thumbnailRef, thumbnailBlob),
    ]);

    // Get download URLs
    const [fullUrl, thumbnailUrl] = await Promise.all([
      getDownloadURL(photoRef),
      getDownloadURL(thumbnailRef),
    ]);

    return { fullUrl, thumbnailUrl };
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};
