// Firebase configuration for REST API calls
// Using Firestore REST API instead of Firebase SDK

export const FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
};

export const FIRESTORE_API_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents`;
export const STORAGE_API_URL = `https://storage.googleapis.com/storage/v1/b/${FIREBASE_CONFIG.storageBucket}`;

