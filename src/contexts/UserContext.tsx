import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { getCurrentUserProfile, updateUserProfile, uploadProfilePicture, deleteProfilePicture } from '../services/userProfiles';
import { useAuth } from './AuthContext';

interface UserContextType {
  currentUserProfile: UserProfile | null;
  otherUserProfile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  
  // Actions
  loadCurrentUserProfile: () => Promise<void>;
  loadUserProfile: (uid: string) => Promise<void>;
  updateProfile: (updates: Partial<Omit<UserProfile, 'uid' | 'email' | 'createdAt'>>) => Promise<void>;
  uploadPicture: (uri: string) => Promise<void>;
  deletePicture: () => Promise<void>;
  clearError: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [otherUserProfile, setOtherUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load current user profile on auth state change
  useEffect(() => {
    if (user?.uid) {
      loadCurrentUserProfile();
    } else {
      setCurrentUserProfile(null);
    }
  }, [user?.uid]);

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

  const value: UserContextType = {
    currentUserProfile,
    otherUserProfile,
    loading,
    error,
    loadCurrentUserProfile,
    loadUserProfile,
    updateProfile,
    uploadPicture,
    deletePicture,
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
