import { getApps, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
} from 'firebase/firestore';

// ponytail: analytics skipped — no value in a personal checklist, breaks in Capacitor webview
// Config comes from .env.local (NEXT_PUBLIC_* vars are inlined at build time)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const app = getApps()[0] ?? initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Offline-first: render instantly from IndexedDB cache, sync in background.
// Also survives ad-blockers throttling the Firestore stream on first paint.
function makeDb() {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  } catch {
    return getFirestore(app); // already initialized (dev fast-refresh)
  }
}
export const db = makeDb();
export const googleProvider = new GoogleAuthProvider();
