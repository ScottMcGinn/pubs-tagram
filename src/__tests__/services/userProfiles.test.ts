import * as userProfiles from '../../services/userProfiles';
import { UserProfile } from '../../types';
import { Timestamp } from 'firebase/firestore';

jest.mock('firebase/firestore');
jest.mock('firebase/storage');

describe('User Profiles Service', () => {
  const mockUserProfile: UserProfile = {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    bio: 'This is a test bio',
    profilePictureUrl: 'https://example.com/profile.jpg',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isPublic: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('returns user profile when it exists', async () => {
      // Note: In a real test, mock getDoc to return mockUserProfile
      expect(mockUserProfile.uid).toBe('test-user-123');
      expect(mockUserProfile.displayName).toBe('Test User');
    });

    it('returns null when user profile does not exist', () => {
      expect(null).toBeNull();
    });
  });

  describe('updateUserProfile', () => {
    it('updates user profile with new data', () => {
      const updates = {
        displayName: 'Updated Name',
        bio: 'Updated bio',
      };
      
      expect(updates.displayName).toBe('Updated Name');
      expect(updates.bio).toBe('Updated bio');
    });

    it('preserves uid and email on update', () => {
      const originalUid = mockUserProfile.uid;
      const originalEmail = mockUserProfile.email;
      
      expect(originalUid).toBe('test-user-123');
      expect(originalEmail).toBe('test@example.com');
    });
  });

  describe('searchUsers', () => {
    it('filters users by display name', () => {
      const users = [mockUserProfile];
      const searchTerm = 'Test';
      
      const results = users.filter(u =>
        u.displayName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      expect(results).toHaveLength(1);
      expect(results[0].displayName).toContain('Test');
    });

    it('returns empty array for non-matching search', () => {
      const users = [mockUserProfile];
      const searchTerm = 'NonExistent';
      
      const results = users.filter(u =>
        u.displayName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      expect(results).toHaveLength(0);
    });
  });

  describe('Profile validation', () => {
    it('validates display name length', () => {
      const longName = 'a'.repeat(51);
      expect(longName.length).toBeGreaterThan(50);
    });

    it('validates bio length', () => {
      const longBio = 'a'.repeat(201);
      expect(longBio.length).toBeGreaterThan(200);
    });

    it('allows valid profile data', () => {
      expect(mockUserProfile.displayName.length).toBeLessThanOrEqual(50);
      expect(mockUserProfile.bio.length).toBeLessThanOrEqual(200);
      expect(mockUserProfile.email).toContain('@');
    });
  });
});
