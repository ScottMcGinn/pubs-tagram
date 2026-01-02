import {
  likePub,
  unlikePub,
  hasLikedPub,
  getLikeCount,
  dislikePub,
  undislikePub,
  hasDislikedPub,
  getDislikeCount,
} from '../../services/firestore';
import { db } from '../../services/firebase';
import { doc, setDoc, deleteDoc, getDoc, getDocs, collection } from 'firebase/firestore';

// Mock Firebase Firestore
jest.mock('firebase/firestore');
jest.mock('../../services/firebase', () => ({
  db: {}, // Mock db object
}));

describe('Firestore Like/Dislike Functions', () => {
  const mockUserId = 'user123';
  const mockPubId = 'pub_1234567890_abc123';
  const mockDocRef = { id: 'mock-ref' }; // Mock doc reference

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock doc() to return a consistent reference object
    (doc as jest.Mock).mockReturnValue(mockDocRef);
  });

  describe('likePub', () => {
    it('should successfully like a pub', async () => {
      const mockSetDoc = setDoc as jest.Mock;
      mockSetDoc.mockResolvedValue(undefined);

      await likePub(mockUserId, mockPubId);

      expect(mockSetDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          userId: mockUserId,
        })
      );
    });

    it('should throw error when like fails', async () => {
      const mockSetDoc = setDoc as jest.Mock;
      const mockError = new Error('Firebase error');
      mockSetDoc.mockRejectedValue(mockError);

      await expect(likePub(mockUserId, mockPubId)).rejects.toThrow();
    });

    it('should call setDoc with correct doc reference path', async () => {
      const mockSetDoc = setDoc as jest.Mock;
      mockSetDoc.mockResolvedValue(undefined);

      await likePub(mockUserId, mockPubId);

      // Verify doc() was called with the correct path
      const mockDoc = doc as jest.Mock;
      expect(mockDoc).toHaveBeenCalledWith(
        db,
        'pubs',
        mockPubId,
        'likes',
        mockUserId
      );
    });
  });

  describe('unlikePub', () => {
    it('should successfully unlike a pub', async () => {
      const mockDeleteDoc = deleteDoc as jest.Mock;
      mockDeleteDoc.mockResolvedValue(undefined);

      await unlikePub(mockUserId, mockPubId);

      expect(mockDeleteDoc).toHaveBeenCalledWith(mockDocRef);
    });

    it('should throw error when unlike fails', async () => {
      const mockDeleteDoc = deleteDoc as jest.Mock;
      const mockError = new Error('Firebase error');
      mockDeleteDoc.mockRejectedValue(mockError);

      await expect(unlikePub(mockUserId, mockPubId)).rejects.toThrow();
    });

    it('should call deleteDoc with correct doc reference path', async () => {
      const mockDeleteDoc = deleteDoc as jest.Mock;
      mockDeleteDoc.mockResolvedValue(undefined);

      await unlikePub(mockUserId, mockPubId);

      const mockDoc = doc as jest.Mock;
      expect(mockDoc).toHaveBeenCalledWith(
        db,
        'pubs',
        mockPubId,
        'likes',
        mockUserId
      );
      expect(mockDeleteDoc).toHaveBeenCalledWith(mockDocRef);
    });
  });

  describe('hasLikedPub', () => {
    it('should return true when user has liked the pub', async () => {
      const mockGetDoc = getDoc as jest.Mock;
      mockGetDoc.mockResolvedValue({
        exists: () => true,
      });

      const result = await hasLikedPub(mockUserId, mockPubId);

      expect(result).toBe(true);
    });

    it('should return false when user has not liked the pub', async () => {
      const mockGetDoc = getDoc as jest.Mock;
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      });

      const result = await hasLikedPub(mockUserId, mockPubId);

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      const mockGetDoc = getDoc as jest.Mock;
      mockGetDoc.mockRejectedValue(new Error('Firebase error'));

      const result = await hasLikedPub(mockUserId, mockPubId);

      expect(result).toBe(false);
    });
  });

  describe('getLikeCount', () => {
    it('should return correct like count', async () => {
      const mockGetDocs = getDocs as jest.Mock;
      mockGetDocs.mockResolvedValue({
        size: 5,
      });

      const result = await getLikeCount(mockPubId);

      expect(result).toBe(5);
    });

    it('should return 0 when no likes exist', async () => {
      const mockGetDocs = getDocs as jest.Mock;
      mockGetDocs.mockResolvedValue({
        size: 0,
      });

      const result = await getLikeCount(mockPubId);

      expect(result).toBe(0);
    });

    it('should return 0 on error', async () => {
      const mockGetDocs = getDocs as jest.Mock;
      mockGetDocs.mockRejectedValue(new Error('Firebase error'));

      const result = await getLikeCount(mockPubId);

      expect(result).toBe(0);
    });

    it('should query the correct collection path', async () => {
      const mockGetDocs = getDocs as jest.Mock;
      mockGetDocs.mockResolvedValue({ size: 0 });

      await getLikeCount(mockPubId);

      const mockCollection = collection as jest.Mock;
      expect(mockCollection).toHaveBeenCalledWith(
        db,
        'pubs',
        mockPubId,
        'likes'
      );
    });
  });

  describe('dislikePub', () => {
    it('should successfully dislike a pub', async () => {
      const mockSetDoc = setDoc as jest.Mock;
      mockSetDoc.mockResolvedValue(undefined);

      await dislikePub(mockUserId, mockPubId);

      expect(mockSetDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          userId: mockUserId,
        })
      );
    });

    it('should throw error when dislike fails', async () => {
      const mockSetDoc = setDoc as jest.Mock;
      const mockError = new Error('Firebase error');
      mockSetDoc.mockRejectedValue(mockError);

      await expect(dislikePub(mockUserId, mockPubId)).rejects.toThrow();
    });

    it('should call setDoc with dislikes path', async () => {
      const mockSetDoc = setDoc as jest.Mock;
      mockSetDoc.mockResolvedValue(undefined);

      await dislikePub(mockUserId, mockPubId);

      const mockDoc = doc as jest.Mock;
      expect(mockDoc).toHaveBeenCalledWith(
        db,
        'pubs',
        mockPubId,
        'dislikes',
        mockUserId
      );
    });
  });

  describe('undislikePub', () => {
    it('should successfully remove dislike from a pub', async () => {
      const mockDeleteDoc = deleteDoc as jest.Mock;
      mockDeleteDoc.mockResolvedValue(undefined);

      await undislikePub(mockUserId, mockPubId);

      expect(mockDeleteDoc).toHaveBeenCalledWith(mockDocRef);
    });

    it('should throw error when remove dislike fails', async () => {
      const mockDeleteDoc = deleteDoc as jest.Mock;
      const mockError = new Error('Firebase error');
      mockDeleteDoc.mockRejectedValue(mockError);

      await expect(undislikePub(mockUserId, mockPubId)).rejects.toThrow();
    });

    it('should call deleteDoc with dislikes path', async () => {
      const mockDeleteDoc = deleteDoc as jest.Mock;
      mockDeleteDoc.mockResolvedValue(undefined);

      await undislikePub(mockUserId, mockPubId);

      const mockDoc = doc as jest.Mock;
      expect(mockDoc).toHaveBeenCalledWith(
        db,
        'pubs',
        mockPubId,
        'dislikes',
        mockUserId
      );
      expect(mockDeleteDoc).toHaveBeenCalledWith(mockDocRef);
    });
  });

  describe('hasDislikedPub', () => {
    it('should return true when user has disliked the pub', async () => {
      const mockGetDoc = getDoc as jest.Mock;
      mockGetDoc.mockResolvedValue({
        exists: () => true,
      });

      const result = await hasDislikedPub(mockUserId, mockPubId);

      expect(result).toBe(true);
    });

    it('should return false when user has not disliked the pub', async () => {
      const mockGetDoc = getDoc as jest.Mock;
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      });

      const result = await hasDislikedPub(mockUserId, mockPubId);

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      const mockGetDoc = getDoc as jest.Mock;
      mockGetDoc.mockRejectedValue(new Error('Firebase error'));

      const result = await hasDislikedPub(mockUserId, mockPubId);

      expect(result).toBe(false);
    });
  });

  describe('getDislikeCount', () => {
    it('should return correct dislike count', async () => {
      const mockGetDocs = getDocs as jest.Mock;
      mockGetDocs.mockResolvedValue({
        size: 3,
      });

      const result = await getDislikeCount(mockPubId);

      expect(result).toBe(3);
    });

    it('should return 0 when no dislikes exist', async () => {
      const mockGetDocs = getDocs as jest.Mock;
      mockGetDocs.mockResolvedValue({
        size: 0,
      });

      const result = await getDislikeCount(mockPubId);

      expect(result).toBe(0);
    });

    it('should return 0 on error', async () => {
      const mockGetDocs = getDocs as jest.Mock;
      mockGetDocs.mockRejectedValue(new Error('Firebase error'));

      const result = await getDislikeCount(mockPubId);

      expect(result).toBe(0);
    });

    it('should query the correct collection path', async () => {
      const mockGetDocs = getDocs as jest.Mock;
      mockGetDocs.mockResolvedValue({ size: 0 });

      await getDislikeCount(mockPubId);

      const mockCollection = collection as jest.Mock;
      expect(mockCollection).toHaveBeenCalledWith(
        db,
        'pubs',
        mockPubId,
        'dislikes'
      );
    });
  });

  describe('Like/Dislike Integration Scenarios', () => {
    it('should handle liking a pub that was previously disliked', async () => {
      const mockGetDoc = getDoc as jest.Mock;
      const mockSetDoc = setDoc as jest.Mock;
      const mockDeleteDoc = deleteDoc as jest.Mock;

      // Simulate user removing dislike
      mockDeleteDoc.mockResolvedValue(undefined);
      await undislikePub(mockUserId, mockPubId);

      // Then liking the pub
      mockSetDoc.mockResolvedValue(undefined);
      await likePub(mockUserId, mockPubId);

      expect(mockDeleteDoc).toHaveBeenCalled();
      expect(mockSetDoc).toHaveBeenCalled();
    });

    it('should handle toggling like on and off', async () => {
      const mockSetDoc = setDoc as jest.Mock;
      const mockDeleteDoc = deleteDoc as jest.Mock;
      const mockGetDoc = getDoc as jest.Mock;

      mockSetDoc.mockResolvedValue(undefined);
      mockDeleteDoc.mockResolvedValue(undefined);
      mockGetDoc.mockResolvedValue({ exists: () => true });

      // Like the pub
      await likePub(mockUserId, mockPubId);
      expect(mockSetDoc).toHaveBeenCalledTimes(1);

      // Check if liked
      const hasLiked = await hasLikedPub(mockUserId, mockPubId);
      expect(hasLiked).toBe(true);

      // Unlike the pub
      await unlikePub(mockUserId, mockPubId);
      expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
    });
  });
});
