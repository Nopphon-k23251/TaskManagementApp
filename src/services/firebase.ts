import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  limit,
  onSnapshot, 
  query, 
  where,
  Firestore
} from 'firebase/firestore';
import { Task } from '../types/task';

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
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (error) {
    console.warn('Firebase initialization warning:', error);
  }
}

export { app, auth, db, googleProvider };

export async function loginWithGoogle(): Promise<FirebaseUser | null> {
  if (!auth || !googleProvider) {
    throw new Error('Firebase Auth is not configured. Please check your credentials in .env');
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
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

// Test Firestore and Auth Connection
export async function testFirestoreConnection(): Promise<{ success: boolean; message: string; latencyMs?: number }> {
  if (!isFirebaseConfigured || !db) {
    return {
      success: false,
      message: 'Firebase configuration is missing or incomplete in .env',
    };
  }

  const startTime = Date.now();
  try {
    const testRef = collection(db, 'tasks');
    const q = query(testRef, limit(1));
    await getDocs(q);
    const latencyMs = Date.now() - startTime;
    return {
      success: true,
      message: `Connected successfully to Firestore (Project: ${firebaseConfig.projectId})`,
      latencyMs,
    };
  } catch (error: any) {
    console.error('Firestore connection test error:', error);
    return {
      success: false,
      message: error.message || 'Failed to communicate with Firestore',
    };
  }
}

// Firestore Realtime Task Subscription
export function subscribeToTasks(
  userId: string, 
  onTasksUpdate: (tasks: Task[]) => void, 
  onError?: (err: Error) => void
) {
  if (!db || !userId) {
    return () => {};
  }

  const tasksRef = collection(db, 'tasks');
  const q = query(tasksRef, where('userId', '==', userId));

  return onSnapshot(q, (snapshot) => {
    const tasks: Task[] = [];
    snapshot.forEach((docSnap) => {
      tasks.push({
        id: docSnap.id,
        ...docSnap.data()
      } as Task);
    });
    onTasksUpdate(tasks);
  }, (err) => {
    console.error('Firestore snapshot error:', err);
    if (onError) onError(err);
  });
}

export async function syncCreateTaskToFirestore(task: Omit<Task, 'id'>): Promise<string | null> {
  if (!db) return null;
  const docRef = await addDoc(collection(db, 'tasks'), task);
  return docRef.id;
}

export async function syncUpdateTaskToFirestore(id: string, updates: Partial<Task>): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'tasks', id);
  await updateDoc(docRef, updates);
}

export async function syncDeleteTaskFromFirestore(id: string): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'tasks', id);
  await deleteDoc(docRef);
}
