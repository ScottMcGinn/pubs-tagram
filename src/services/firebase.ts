import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "pubs-tagram.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "pubs-tagram",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "pubs-tagram.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "905466838608",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:905466838608:web:ddf687816379658d93db55"
};

console.log('Initializing Firebase with config:', {
  apiKey: firebaseConfig.apiKey ? 'SET' : 'MISSING',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId
});

// Initialize Firebase
let app;
let auth;

try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');
  
  // Try to initialize auth with persistence first
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
    console.log('Auth initialized with AsyncStorage persistence');
  } catch (authError) {
    console.warn('AsyncStorage persistence failed, falling back to default auth:', authError);
    auth = getAuth(app);
    console.log('Auth initialized with default persistence');
  }
} catch (firebaseError) {
  console.error('Firebase initialization failed:', firebaseError);
  throw firebaseError;
}

export { auth };

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
