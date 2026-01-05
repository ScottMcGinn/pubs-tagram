import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUserProfile } from '../services/userProfiles';

const FIREBASE_API_KEY = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
const AUTH_URL = 'https://identitytoolkit.googleapis.com/v1/accounts';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string | null;
  idToken: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore auth state from AsyncStorage on app load
  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('authUser');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('[AuthContext] Error restoring auth:', error);
      } finally {
        setLoading(false);
      }
    };

    restoreAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] Starting signIn with email:', email);
      // Sign in via Firebase Auth REST API
      const signInResponse = await fetch(
        `${AUTH_URL}:signInWithPassword?key=${FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        }
      );

      console.log(
        '[AuthContext] signIn response status:',
        signInResponse.status
      );

      if (!signInResponse.ok) {
        const error = await signInResponse.json();
        console.error('[AuthContext] signIn error response:', error);
        throw new Error(error.error?.message || 'Sign in failed');
      }

      const signInData = await signInResponse.json();
      const { localId: uid, idToken, displayName } = signInData;
      console.log('[AuthContext] signIn successful, uid:', uid);

      const authUser: AuthUser = {
        uid,
        email,
        displayName: displayName || null,
        idToken,
      };

      setUser(authUser);
      await AsyncStorage.setItem('authUser', JSON.stringify(authUser));
      await AsyncStorage.setItem('idToken', idToken);
      console.log('[AuthContext] User stored in AsyncStorage');
    } catch (error) {
      console.error('[AuthContext] Sign in exception:', error);
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    try {
      console.log('[AuthContext] Starting signUp with email:', email);
      // Create user account via Firebase Auth REST API
      const signUpResponse = await fetch(
        `${AUTH_URL}:signUp?key=${FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        }
      );

      console.log(
        '[AuthContext] signUp response status:',
        signUpResponse.status
      );

      if (!signUpResponse.ok) {
        const error = await signUpResponse.json();
        console.error('[AuthContext] signUp error response:', error);
        throw new Error(error.error?.message || 'Sign up failed');
      }

      const signUpData = await signUpResponse.json();
      const { localId: uid, idToken } = signUpData;
      console.log('[AuthContext] signUp successful, uid:', uid);

      // Save idToken to AsyncStorage first (needed by createUserProfile)
      await AsyncStorage.setItem('idToken', idToken);

      // Create user profile in Firestore
      await createUserProfile(uid, {
        email,
        displayName,
        photoUrl: null,
        createdAt: new Date(),
      });
      console.log('[AuthContext] User profile created');

      const authUser: AuthUser = {
        uid,
        email,
        displayName,
        idToken,
      };

      setUser(authUser);
      await AsyncStorage.setItem('authUser', JSON.stringify(authUser));
    } catch (error) {
      console.error('[AuthContext] Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem('authUser');
      await AsyncStorage.removeItem('idToken');
    } catch (error) {
      console.error('[AuthContext] Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
