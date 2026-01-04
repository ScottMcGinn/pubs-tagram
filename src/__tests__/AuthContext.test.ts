// ====== DISABLED: Test for Firebase SDK Auth (migrated to REST API) ======
// AuthContext.tsx now uses Firebase Auth REST API instead of Firebase SDK.
// The context uses fetch() calls to https://identitytoolkit.googleapis.com/v1/accounts
// with idToken management via AsyncStorage.
//
// TODO: Rewrite tests to mock fetch() calls for:
// - /v1/accounts:signUp
// - /v1/accounts:signInWithPassword
// - idToken storage/retrieval from AsyncStorage
//
// Tests commented out to prevent compilation errors.

/*
import * as auth from 'firebase/auth';

// Mock Firebase auth
jest.mock('firebase/auth');

describe('Firebase Auth Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes auth correctly', () => {
    expect(auth).toBeDefined();
  });

  it('onAuthStateChanged can be mocked', () => {
    const mockCallback = jest.fn();
    const mockUnsubscribe = jest.fn();

    (auth.onAuthStateChanged as jest.Mock).mockReturnValue(mockUnsubscribe);

    // Simulate usage
    const unsubscribe = (auth.onAuthStateChanged as jest.Mock)(
      {},
      mockCallback
    );

    expect(auth.onAuthStateChanged).toHaveBeenCalled();
    expect(unsubscribe).toBe(mockUnsubscribe);
  });

  it('can simulate user authentication flow', () => {
    const mockCallback = jest.fn();

    (auth.onAuthStateChanged as jest.Mock).mockImplementation(
      (authInstance, callback) => {
        // Simulate async user check
        setTimeout(() => {
          callback({ uid: 'test-123', email: 'test@example.com' });
        }, 0);
        return jest.fn();
      }
    );

    (auth.onAuthStateChanged as jest.Mock)({}, mockCallback);

    expect(auth.onAuthStateChanged).toHaveBeenCalled();
  });
});
*/
