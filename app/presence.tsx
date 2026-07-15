'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// Presence heartbeat, mounted in the root layout so it runs on every route.
// ponytail: 60s polling instead of RTDB onDisconnect — "online" = beat within 2 min
export default function Presence() {
  useEffect(() => {
    let cleanup = () => {};
    const unsub = onAuthStateChanged(auth, (u) => {
      cleanup();
      cleanup = () => {};
      if (!u?.email) return;
      const pref = doc(db, 'presence', u.email.toLowerCase());
      const beat = (state: string) => setDoc(pref, { state, lastActive: serverTimestamp() }).catch(() => {});
      beat('online');
      const id = setInterval(() => beat('online'), 60_000);
      const off = () => beat('offline');
      window.addEventListener('pagehide', off);
      cleanup = () => { clearInterval(id); window.removeEventListener('pagehide', off); off(); };
    });
    return () => { unsub(); cleanup(); };
  }, []);
  return null;
}
