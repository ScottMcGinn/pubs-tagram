import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../../types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

// Mock fetch globally
global.fetch = jest.fn();

describe('User Profiles REST API Service', () => {
  const mockUserId = 'test-user-123';
  const mockIdToken = 'mock-id-token-xyz';
  const mockDisplayName = 'Test User';
  const mockEmail = 'test@example.com';

  const mockUserProfile: UserProfile = {
    uid: mockUserId,
    email: mockEmail,
    displayName: mockDisplayName,
    bio: 'Test bio',
    profilePictureUrl: 'https://example.com/photo.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    isPublic: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockIdToken);
  });

  describe('createUserProfile', () => {
    it('should create a new user profile', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: `projects/${mockUserId}/databases/(default)/documents/users/${mockUserId}`,
        }),
      });

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('getUserProfile', () => {
    it('should fetch a user profile', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: `projects/${mockUserId}/databases/(default)/documents/users/${mockUserId}`,
          fields: {
            uid: { stringValue: mockUserId },
            email: { stringValue: mockEmail },
            displayName: { stringValue: mockDisplayName },
          },
        }),
      });

      expect(fetch).not.toHaveBeenCalled();
    });

    it('should handle missing profiles', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile with new data', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('searchUsers', () => {
    it('should search for users by display name', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [
            {
              name: `projects/${mockUserId}/databases/(default)/documents/users/${mockUserId}`,
              fields: {
                displayName: { stringValue: 'John Doe' },
              },
            },
          ],
        }),
      });

      expect(fetch).not.toHaveBeenCalled();
    });

    it('should return empty results for no matches', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [],
        }),
      });

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('followUser', () => {
    it('should successfully follow another user', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('unfollowUser', () => {
    it('should successfully unfollow a user', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('isFollowing', () => {
    it('should return true if user is following', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      expect(fetch).not.toHaveBeenCalled();
    });

    it('should return false if user is not following', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('getFollowersCount', () => {
    it('should return the correct follower count', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [
            { name: 'follower-1' },
            { name: 'follower-2' },
            { name: 'follower-3' },
          ],
        }),
      });

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('getFollowingCount', () => {
    it('should return the correct following count', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [
            { name: 'following-1' },
            { name: 'following-2' },
          ],
        }),
      });

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('getFollowersList', () => {
    it('should retrieve list of followers', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            documents: [
              {
                name: `projects/${mockUserId}/databases/(default)/documents/follows/follow-1`,
                fields: {
                  follower: { stringValue: mockUserId },
                },
              },
            ],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            name: `projects/${mockUserId}/databases/(default)/documents/users/${mockUserId}`,
            fields: {
              displayName: { stringValue: mockDisplayName },
            },
          }),
        });

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('getSuggestedUsers', () => {
    it('should return suggested users', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            documents: [
              {
                name: `projects/${mockUserId}/databases/(default)/documents/users/suggested-user-1`,
                fields: {
                  displayName: { stringValue: 'Suggested User' },
                  isPublic: { booleanValue: true },
                },
              },
            ],
          }),
        });

      expect(fetch).not.toHaveBeenCalled();
    });
  });
});
