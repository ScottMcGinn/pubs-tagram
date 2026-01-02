import React, { createContext, useContext, useState } from 'react';
import { UserProfile } from '../types';
import { getCurrentUserProfile, updateUserProfile, uploadProfilePicture, deleteProfilePicture, followUser, unfollowUser, isFollowing } from '../services/userProfiles';
import { useAuth } from './AuthContext';

interface UserContextType {
  currentUserProfile: UserProfile | null;
  otherUserProfile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  isFollowingUser: boolean;
  
  // Actions
  loadCurrentUserProfile: () => Promise<void>;
  loadUserProfile: (uid: string) => Promise<void>;
  updateProfile: (updates: Partial<Omit<UserProfile, 'uid' | 'email' | 'createdAt'>>) => Promise<void>;
  uploadPicture: (uri: string) => Promise<void>;
  deletePicture: () => Promise<void>;
  toggleFollowUser: (targetUserId: string) => Promise<void>;
  clearError: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [otherUserProfile, setOtherUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isFollowingUser, setIsFollowingUser] = useState(false);

  const loadCurrentUserProfile = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);
      const profile = await getCurrentUserProfile(user.uid);
      setCurrentUserProfile(profile);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load profile');
      setError(error);
      console.error('Error loading current user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (uid: string) => {
    try {
      setLoading(true);
      setError(null);
      const profile = await getCurrentUserProfile(uid);
      setOtherUserProfile(profile);
      
      // Check follow status if current user is logged in
      if (user?.uid && uid !== user.uid) {
        const following = await isFollowing(user.uid, uid);
        setIsFollowingUser(following);
      } else {
        setIsFollowingUser(false);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load user profile');
      setError(error);
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Omit<UserProfile, 'uid' | 'email' | 'createdAt'>>) => {
    if (!user?.uid) {
      throw new Error('No user logged in');
    }

    try {
      setLoading(true);
      setError(null);
      
      await updateUserProfile(user.uid, updates);
      
      // Update local state
      setCurrentUserProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update profile');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const uploadPicture = async (uri: string) => {
    if (!user?.uid) {
      throw new Error('No user logged in');
    }

    try {
      setLoading(true);
      setError(null);
      
      const downloadUrl = await uploadProfilePicture(user.uid, uri);
      
      // Update local state
      setCurrentUserProfile(prev => prev ? { ...prev, profilePictureUrl: downloadUrl } : null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to upload picture');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deletePicture = async () => {
    if (!user?.uid) {
      throw new Error('No user logged in');
    }

    try {
      setLoading(true);
      setError(null);
      
      await deleteProfilePicture(user.uid);
      
      // Update local state
      setCurrentUserProfile(prev => prev ? { ...prev, profilePictureUrl: undefined } : null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete picture');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const toggleFollowUser = async (targetUserId: string) => {
    if (!user?.uid) {
      throw new Error('No user logged in');
    }

    try {
      setLoading(true);
      setError(null);

      // Check current follow status from Firestore (not from state)
      const currentFollowStatus = await isFollowing(user.uid, targetUserId);

      if (currentFollowStatus) {
        // Unfollow
        await unfollowUser(user.uid, targetUserId);
        setIsFollowingUser(false);
        
        // Update local state
        if (otherUserProfile) {
          setOtherUserProfile({
            ...otherUserProfile,
            followers: (otherUserProfile.followers || []).filter(id => id !== user.uid),
          });
        }
        if (currentUserProfile) {
          setCurrentUserProfile({
            ...currentUserProfile,
            following: (currentUserProfile.following || []).filter(id => id !== targetUserId),
          });
        }
      } else {
        // Follow
        await followUser(user.uid, targetUserId);
        setIsFollowingUser(true);
        
        // Update local state
        if (otherUserProfile) {
          setOtherUserProfile({
            ...otherUserProfile,
            followers: [...(otherUserProfile.followers || []), user.uid],
          });
        }
        if (currentUserProfile) {
          setCurrentUserProfile({
            ...currentUserProfile,
            following: [...(currentUserProfile.following || []), targetUserId],
          });
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update follow status');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: UserContextType = {
    currentUserProfile,
    otherUserProfile,
    loading,
    error,
    isFollowingUser,
    loadCurrentUserProfile,
    loadUserProfile,
    updateProfile,
    uploadPicture,
    deletePicture,
    toggleFollowUser,
    clearError,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
