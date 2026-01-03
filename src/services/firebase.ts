import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "pubs-tagram.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "pubs-tagram",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "pubs-tagram.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "905466838608",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:905466838608:web:bcb99968896eef9893db55"
};

console.log('[Firebase] Module loading - projectId:', firebaseConfig.projectId);

// Initialize Firebase synchronously
let app: any;
let auth: any;

try {
  console.log('[Firebase] Calling initializeApp...');
  app = initializeApp(firebaseConfig);
  console.log('[Firebase] initializeApp successful');
  
  // Initialize auth - Firebase 10+ handles persistence automatically on React Native
  try {
    console.log('[Firebase] Initializing auth...');
    auth = getAuth(app);
    console.log('[Firebase] Auth initialized');
  } catch (authError: any) {
    console.error('[Firebase] Auth init failed:', authError?.message);
  }
} catch (error: any) {
  console.error('[Firebase] CRITICAL:', error?.message || JSON.stringify(error));
  console.error('[Firebase] Stack:', error?.stack);
}

const db = getFirestore(app);
const storage = getStorage(app);

console.log('[Firebase] Exports - auth:', !!auth, 'db:', !!db, 'storage:', !!storage);

export { app, auth, db, storage };
export default app;
