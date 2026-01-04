import '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

console.log('[Firebase] Initializing React Native Firebase');

try {
  console.log('[Firebase] Firebase services ready');
  console.log('[Firebase] Auth ready:', !!auth);
  console.log('[Firebase] Firestore ready:', !!firestore);
  console.log('[Firebase] Storage ready:', !!storage);
} catch (error: any) {
  console.error('[Firebase] CRITICAL:', error?.message || JSON.stringify(error));
}

export { auth, firestore, storage };
export default firestore;
