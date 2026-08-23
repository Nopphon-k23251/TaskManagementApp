import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection, 
  doc, 
  setDoc,
  deleteDoc, 
  getDocs, 
  limit, 
  onSnapshot, 
  query, 
  where,
  Firestore
} from 'firebase/firestore';
import { Task, CategoryItem } from '../types/task';

// Read config from Vite env variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.apiKey !== 'your_api_key_here'
);

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    
    // Enable Multi-tab Offline Persistence Cache if available, with graceful fallback
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    } catch {
      db = getFirestore(app);
    }

    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (error) {
    console.warn('Firebase initialization warning:', error);
  }
}

export { app, auth, db, googleProvider };

/**
 * Recursively removes `undefined` properties from objects to prevent Firestore `setDoc` errors.
 */
export function cleanFirestoreData<T>(obj: T): T {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => cleanFirestoreData(item)) as unknown as T;
  }

  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = cleanFirestoreData(value);
    }
  }
  return cleaned as T;
}

export async function loginWithGoogle(): Promise<FirebaseUser | null> {
  if (!auth || !googleProvider) {
    throw new Error('Firebase Auth is not configured. Please check your credentials in .env');
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function loginWithGoogleRedirect(): Promise<void> {
  if (!auth || !googleProvider) {
    throw new Error('Firebase Auth is not configured');
  }
  await signInWithRedirect(auth, googleProvider);
}

export async function checkRedirectAuth(): Promise<FirebaseUser | null> {
  if (!auth) return null;
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (error) {
    console.error('Redirect auth result error:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  if (!auth) return;
  await fbSignOut(auth);
}

export function subscribeToAuthChanges(callback: (user: FirebaseUser | null) => void) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// Test Firestore and Auth Connection Diagnostic
export async function testFirestoreConnection(userId?: string): Promise<{ 
  success: boolean; 
  message: string; 
  latencyMs?: number;
  mode?: 'authenticated' | 'unauthenticated' | 'demo';
}> {
  if (!isFirebaseConfigured || !db) {
    return {
      success: false,
      message: 'Firebase configuration is missing or incomplete in .env',
      mode: 'unauthenticated'
    };
  }

  const startTime = Date.now();
  const currentUid = userId || auth?.currentUser?.uid;

  try {
    if (currentUid && !currentUid.startsWith('demo-user')) {
      // Authenticated query matching security rules
      const testRef = collection(db, 'tasks');
      const q = query(testRef, where('userId', '==', currentUid), limit(1));
      await getDocs(q);
      const latencyMs = Date.now() - startTime;
      return {
        success: true,
        message: `เชื่อมต่อ Firestore Cloud สำเร็จ (User: ${currentUid.substring(0, 8)}..., Project: ${firebaseConfig.projectId})`,
        latencyMs,
        mode: 'authenticated',
      };
    } else {
      // Demo / Unauthenticated Mode - Firebase is ready and initialized
      const latencyMs = Date.now() - startTime;
      return {
        success: true,
        message: `Firebase Project (${firebaseConfig.projectId}) พร้อมใช้งาน (เข้าสู่ระบบด้วย Google เพื่อซิงก์คลาวด์แบบเรียลไทม์)`,
        latencyMs,
        mode: currentUid?.startsWith('demo-user') ? 'demo' : 'unauthenticated',
      };
    }
  } catch (error: any) {
    console.error('Firestore connection test error:', error);
    return {
      success: false,
      message: error.message || 'ไม่สามารถสื่อสารกับ Firestore ได้',
    };
  }
}

// Firestore Realtime Task Subscription
export function subscribeToTasks(
  userId: string, 
  onTasksUpdate: (tasks: Task[]) => void, 
  onError?: (err: Error) => void
) {
  if (!db || !userId || userId.startsWith('demo-user')) {
    return () => {};
  }

  const tasksRef = collection(db, 'tasks');
  const q = query(tasksRef, where('userId', '==', userId));

  return onSnapshot(q, (snapshot) => {
    const tasks: Task[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      tasks.push({
        id: docSnap.id,
        ...data
      } as Task);
    });
    
    // Sort tasks by custom order (asc) if present, else fallback to createdAt desc
    tasks.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
    
    onTasksUpdate(tasks);
  }, (err) => {
    console.error('Firestore task snapshot error:', err);
    if (onError) onError(err);
  });
}

// Write/Save task to Firestore using setDoc with exact ID (Safe for creates & updates)
export async function syncSaveTaskToFirestore(task: Task): Promise<void> {
  if (!db || !task.userId || task.userId.startsWith('demo-user')) return;
  const docRef = doc(db, 'tasks', task.id);
  const cleanData = cleanFirestoreData(task);
  await setDoc(docRef, cleanData, { merge: true });
}

export async function syncDeleteTaskFromFirestore(id: string): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'tasks', id);
  await deleteDoc(docRef);
}

// User Categories Realtime Sync
export function subscribeToCategories(
  userId: string,
  onCategoriesUpdate: (categories: CategoryItem[]) => void,
  onError?: (err: Error) => void
) {
  if (!db || !userId || userId.startsWith('demo-user')) return () => {};

  const catDocRef = doc(db, 'user_settings', userId);
  return onSnapshot(catDocRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data?.categories) && data.categories.length > 0) {
        onCategoriesUpdate(data.categories);
      }
    }
  }, (err) => {
    console.error('Firestore categories snapshot error:', err);
    if (onError) onError(err);
  });
}

export async function syncCategoriesToFirestore(userId: string, categories: CategoryItem[]): Promise<void> {
  if (!db || !userId || userId.startsWith('demo-user')) return;
  const catDocRef = doc(db, 'user_settings', userId);
  const cleanData = cleanFirestoreData({ categories, updatedAt: new Date().toISOString() });
  await setDoc(catDocRef, cleanData, { merge: true });
}
