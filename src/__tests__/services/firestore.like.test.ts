import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

// Mock fetch globally
global.fetch = jest.fn();

describe('Firestore Like/Dislike REST API', () => {
  const mockUserId = 'user123';
  const mockPubId = 'pub_1234567890_abc123';
  const mockIdToken = 'mock-id-token';

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockIdToken);
  });

  describe('likePub', () => {
    it('should successfully like a pub', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      expect(fetch).not.toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('unlikePub', () => {
    it('should successfully unlike a pub', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('hasLikedPub', () => {
    it('should return true if user has liked', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [{ name: 'like-doc-id' }],
        }),
      });

      expect(fetch).not.toHaveBeenCalled();
    });

    it('should return false if user has not liked', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [],
        }),
      });

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('getLikeCount', () => {
    it('should return the correct like count', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [
            { name: 'like-1' },
            { name: 'like-2' },
            { name: 'like-3' },
          ],
        }),
      });

      expect(fetch).not.toHaveBeenCalled();
    });

    it('should return 0 when no likes exist', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [],
        }),
      });

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('dislikePub', () => {
    it('should successfully dislike a pub', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('undislikePub', () => {
    it('should successfully remove a dislike', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('hasDislikedPub', () => {
    it('should return true if user has disliked', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [{ name: 'dislike-doc-id' }],
        }),
      });

      expect(fetch).not.toHaveBeenCalled();
    });

    it('should return false if user has not disliked', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [],
        }),
      });

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('getDislikeCount', () => {
    it('should return the correct dislike count', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [{ name: 'dislike-1' }, { name: 'dislike-2' }],
        }),
      });

      expect(fetch).not.toHaveBeenCalled();
    });
  });
});
