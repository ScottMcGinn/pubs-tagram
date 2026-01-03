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
let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;
let initError: string = '';

try {
  console.log('[Firebase] Calling initializeApp...');
  app = initializeApp(firebaseConfig);
  console.log('[Firebase] initializeApp successful');
  
  if (!app) {
    throw new Error('initializeApp returned null/undefined');
  }
  
  // Initialize auth
  try {
    console.log('[Firebase] Initializing auth...');
    auth = getAuth(app);
    console.log('[Firebase] Auth initialized:', !!auth);
  } catch (authError: any) {
    console.error('[Firebase] Auth init failed:', authError?.message);
    initError = `Auth init failed: ${authError?.message}`;
  }
  
  // Initialize Firestore
  try {
    db = getFirestore(app);
    console.log('[Firebase] Firestore initialized');
  } catch (dbError: any) {
    console.error('[Firebase] Firestore init failed:', dbError?.message);
    initError = initError || `Firestore init failed: ${dbError?.message}`;
  }
  
  // Initialize Storage
  try {
    storage = getStorage(app);
    console.log('[Firebase] Storage initialized');
  } catch (storageError: any) {
    console.error('[Firebase] Storage init failed:', storageError?.message);
    initError = initError || `Storage init failed: ${storageError?.message}`;
  }
  
} catch (error: any) {
  console.error('[Firebase] CRITICAL:', error?.message || JSON.stringify(error));
  console.error('[Firebase] Stack:', error?.stack);
  initError = error?.message || 'Firebase initialization failed';
}

console.log('[Firebase] Final state - app:', !!app, 'auth:', !!auth, 'db:', !!db, 'storage:', !!storage);

if (!app) {
  console.error('[Firebase] FATAL: app is null/undefined after initialization');
}

export { app, auth, db, storage };
export default app;
