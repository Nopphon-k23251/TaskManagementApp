import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppUser } from '../types/task';
import { 
  loginWithGoogle as fbLoginWithGoogle, 
  loginWithGoogleRedirect as fbLoginWithGoogleRedirect,
  checkRedirectAuth,
  logoutUser as fbLogoutUser, 
  subscribeToAuthChanges, 
  isFirebaseConfigured 
} from '../services/firebase';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isFirebaseActive: boolean;
  error: string | null;
  errorCode: string | null;
  loginWithGoogle: () => Promise<void>;
  loginWithRedirect: () => Promise<void>;
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

function mapAuthError(err: any): { message: string; code: string } {
  const code = err?.code || 'auth/unknown';
  let message = err?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google';

  switch (code) {
    case 'auth/unauthorized-domain':
      message = 'โดเมนปัจจุบันยังไม่ได้รับอนุญาตใน Firebase! กรุณาไปที่ Firebase Console -> Authentication -> Settings -> Authorized Domains แล้วกด Add Domain (เช่น localhost หรือโดเมนเว็บของคุณ)';
      break;
    case 'auth/operation-not-allowed':
      message = 'Google Sign-in ยังไม่ได้เปิดใช้งานใน Firebase Console! กรุณาไปที่ Authentication -> Sign-in method -> กดเปิดใช้งาน Google Provider';
      break;
    case 'auth/popup-closed-by-user':
      message = 'หน้าต่างยืนยันตัวตน Google ถูกปิดก่อนล็อกอินเสร็จสมบูรณ์ หากต้องการล็อกอินกรุณากดใหม่อีกครั้ง';
      break;
    case 'auth/popup-blocked':
      message = 'เบราว์เซอร์บล็อกหน้าต่าง Pop-up สำหรับ Google Login กรุณากดอนุญาต Pop-up หรือเข้าสู่ระบบด้วยโหมด Redirect';
      break;
    case 'auth/cancelled-popup-request':
      message = 'มีการเปิดหน้าต่างล็อกอินซ้อนกัน กรุณากดลองใหม่อีกครั้ง';
      break;
    case 'auth/network-request-failed':
      message = 'ไม่สามารถเชื่อมต่อไปยังเซิร์ฟเวอร์ Firebase Auth ได้ กรุณาตรวจสอบอินเทอร์เน็ต';
      break;
  }

  return { message, code };
}

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
    return DEMO_USER;
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    // Check if coming back from redirect login
    checkRedirectAuth()
      .then((fbUser) => {
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
      })
      .catch((err) => {
        console.warn('Redirect auth check notice:', err);
      });

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
        const cached = localStorage.getItem('tm_user');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (!parsed.isDemo) {
              setUser(null);
              localStorage.removeItem('tm_user');
            }
          } catch {
            // fallback
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setError(null);
    setErrorCode(null);
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
      console.error('Google login failed:', err);
      const parsed = mapAuthError(err);
      setError(parsed.message);
      setErrorCode(parsed.code);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithRedirect = async () => {
    setError(null);
    setErrorCode(null);
    try {
      await fbLoginWithGoogleRedirect();
    } catch (err: any) {
      const parsed = mapAuthError(err);
      setError(parsed.message);
      setErrorCode(parsed.code);
    }
  };

  const loginAsDemo = () => {
    setUser(DEMO_USER);
    localStorage.setItem('tm_user', JSON.stringify(DEMO_USER));
    setError(null);
    setErrorCode(null);
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

  const clearError = () => {
    setError(null);
    setErrorCode(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseActive: isFirebaseConfigured,
        error,
        errorCode,
        loginWithGoogle,
        loginWithRedirect,
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
