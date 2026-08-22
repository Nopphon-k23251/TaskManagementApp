import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppUser } from '../types/task';
import { 
  loginWithGoogle as fbLoginWithGoogle, 
  logoutUser as fbLogoutUser, 
  subscribeToAuthChanges, 
  isFirebaseConfigured 
} from '../services/firebase';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isFirebaseActive: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  loginAsDemo: () => void;
  logout: () => Promise<void>;
  clearError: () => void;
}

const DEMO_USER: AppUser = {
  uid: 'demo-user-123',
  displayName: 'Alex Demo',
  email: 'alex.demo@example.com',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  isDemo: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(() => {
    const cached = localStorage.getItem('tm_user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return DEMO_USER;
      }
    }
    return DEMO_USER; // Default to demo user for immediate full functionality
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToAuthChanges((fbUser) => {
      if (fbUser) {
        const appUser: AppUser = {
          uid: fbUser.uid,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          email: fbUser.email,
          photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUser.uid}`,
          isDemo: false,
        };
        setUser(appUser);
        localStorage.setItem('tm_user', JSON.stringify(appUser));
      } else {
        // If logged out from Firebase and not using explicit demo mode
        const cached = localStorage.getItem('tm_user');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (!parsed.isDemo) {
            setUser(null);
            localStorage.removeItem('tm_user');
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!isFirebaseConfigured) {
        throw new Error('Firebase configuration missing in .env');
      }
      const fbUser = await fbLoginWithGoogle();
      if (fbUser) {
        const appUser: AppUser = {
          uid: fbUser.uid,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          email: fbUser.email,
          photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUser.uid}`,
          isDemo: false,
        };
        setUser(appUser);
        localStorage.setItem('tm_user', JSON.stringify(appUser));
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in with Google');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = () => {
    setUser(DEMO_USER);
    localStorage.setItem('tm_user', JSON.stringify(DEMO_USER));
    setError(null);
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && !user?.isDemo) {
        await fbLogoutUser();
      }
      setUser(null);
      localStorage.removeItem('tm_user');
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseActive: isFirebaseConfigured,
        error,
        loginWithGoogle,
        loginAsDemo,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
