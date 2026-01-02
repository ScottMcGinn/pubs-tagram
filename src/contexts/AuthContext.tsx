import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { createUserProfile } from '../services/userProfiles';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    // Set a timeout to force loading to false after 15 seconds as a fallback
    timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Auth check timed out - forcing completion');
        setLoading(false);
      }
    }, 15000);

    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        userState => {
          if (isMounted) {
            setUser(userState);
            setLoading(false);
            clearTimeout(timeoutId);
          }
        },
        error => {
          console.error('Auth state error:', error);
          if (isMounted) {
            setLoading(false);
            clearTimeout(timeoutId);
          }
        }
      );

      return () => {
        isMounted = false;
        clearTimeout(timeoutId);
        unsubscribe();
      };
    } catch (error) {
      console.error('Auth listener setup error:', error);
      if (isMounted) {
        setLoading(false);
        clearTimeout(timeoutId);
      }
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Create user profile after successful sign up with chosen display name
      await createUserProfile(userCredential.user.uid, displayName, email);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
