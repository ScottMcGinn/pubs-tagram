import React, { createContext, useState, useContext, useEffect } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { createUserProfile } from '../services/userProfiles';

console.log(
  '[AuthContext] Module loading - React Native Firebase auth available:',
  !!auth
);

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
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
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    // Set a timeout to force loading to false after 15 seconds as a fallback
    timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('[AuthContext] Auth check timed out - forcing completion');
        setLoading(false);
      }
    }, 15000);

    try {
      console.log('[AuthContext] Setting up onAuthStateChanged listener');
      const unsubscribe = auth().onAuthStateChanged(userState => {
        if (isMounted) {
          console.log('[AuthContext] Auth state changed:', !!userState);
          setUser(userState);
          setLoading(false);
          clearTimeout(timeoutId);
        }
      });

      return () => {
        isMounted = false;
        clearTimeout(timeoutId);
        unsubscribe();
      };
    } catch (error) {
      console.error('[AuthContext] Auth listener setup error:', error);
      if (isMounted) {
        setLoading(false);
        clearTimeout(timeoutId);
      }
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('[AuthContext] signIn attempt for:', email);
    try {
      await auth().signInWithEmailAndPassword(email, password);
      console.log('[AuthContext] signIn successful');
    } catch (error: any) {
      console.error('[AuthContext] signIn error:', error?.message);
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    console.log('[AuthContext] signUp attempt for:', email);
    try {
      const result = await auth().createUserWithEmailAndPassword(
        email,
        password
      );
      console.log('[AuthContext] signUp successful, creating profile');
      // Create user profile after successful sign up with chosen display name
      await createUserProfile(result.user.uid, displayName, email);
      console.log('[AuthContext] User profile created');
    } catch (error: any) {
      console.error('[AuthContext] signUp error:', error?.message);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('[AuthContext] signOut attempt');
    try {
      await auth().signOut();
      console.log('[AuthContext] signOut successful');
    } catch (error: any) {
      console.error('[AuthContext] signOut error:', error?.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
