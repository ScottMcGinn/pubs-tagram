// Mock Firebase modules for unit testing
// This prevents actual Firebase calls during tests

export const mockAuth = {
  currentUser: null,
};

export const mockFirestore = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      onSnapshot: jest.fn(),
    })),
    add: jest.fn(),
    query: jest.fn(),
    getDocs: jest.fn(),
    onSnapshot: jest.fn(),
  })),
};

export const mockStorage = {
  ref: jest.fn(() => ({
    child: jest.fn(() => ({
      put: jest.fn(),
      getDownloadURL: jest.fn(),
      delete: jest.fn(),
    })),
    putFile: jest.fn(),
    getDownloadURL: jest.fn(),
    delete: jest.fn(),
  })),
};

// Mock firebase/auth
jest.mock('firebase/auth', () => ({
  initializeAuth: jest.fn(() => mockAuth),
  getAuth: jest.fn(() => mockAuth),
  onAuthStateChanged: jest.fn((auth, callback) => {
    // Simulate async auth check
    return jest.fn();
  }),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  setPersistence: jest.fn(),
  getReactNativePersistence: jest.fn(() => ({})),
}));

// Mock firebase/firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => mockFirestore),
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  onSnapshot: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
}));

// Mock firebase/storage
jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => mockStorage),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getBytes: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn(),
}));

// Mock firebase/app
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
}));
