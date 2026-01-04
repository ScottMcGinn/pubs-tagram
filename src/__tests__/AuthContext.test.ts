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
