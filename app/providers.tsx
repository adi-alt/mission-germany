'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, recoverFromCacheError } from '@/lib/firebase';
import type { SeedItem } from '@/lib/seed'; // type only — item data lives in Firestore
import { basePrice, forecast } from '@/lib/recs';

export type Item = SeedItem & { id: string; starred?: boolean; link?: string; targetDate?: string; customPrice?: string };

// forecast windows, cut down to sales that start before the item's target date.
// A user-entered price (from the store page they linked) overrides the estimate.
export function itemForecast(it: Item) {
  const custom = Number((it.customPrice ?? '').replace(/[^\d.]/g, ''));
  const base = custom > 0
    ? { v: custom, cur: (it.buy === 'DE' ? '€' : '₹') as '₹' | '€' }
    : basePrice(it.name, it.priceINR, it.priceEUR);
  if (!base || it.buy === 'HAVE') return { base, fc: [] };
  const fc = forecast(base.v, it.buy === 'DE' ? 'DE' : 'IN', it.category)
    .filter((f) => !it.targetDate || +new Date(f.sale.start) <= +new Date(it.targetDate + 'T23:59'));
  return { base, fc };
}

type Ctx = {
  user: User | null;
  role: string;
  authReady: boolean;
  myEmail: string;
  items: Item[] | null;
  save: (next: Item[]) => Promise<void>;
  patchItem: (id: string, patch: Partial<Item>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
};

const AppCtx = createContext<Ctx>(null!);
export const useApp = () => useContext(AppCtx);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState('member');
  const [authReady, setAuthReady] = useState(false);
  const [items, setItems] = useState<Item[] | null>(null);

  const myEmail = (user?.email ?? '').toLowerCase();

  // Invite-gated login: the users doc (keyed by email) IS the invite.
  // No doc → not invited → signed out. First sign-in flips status to 'joined'.
  useEffect(() => onAuthStateChanged(auth, async (u) => {
    if (!u) { setUser(null); setAuthReady(true); return; }
    try {
      const em = (u.email ?? '').toLowerCase();
      const uref = doc(db, 'users', em);
      const snap = await getDoc(uref);
      if (!snap.exists()) throw new Error('You are not invited to this app. Ask an admin to invite you.');
      setRole(snap.data().type ?? 'member');
      // First join: flip invited → joined and create this user's list at the same
      // instant, copied from the config/seedList starter template
      if (snap.data().status !== 'joined') {
        const lref = doc(db, 'lists', em);
        if (!(await getDoc(lref)).exists()) {
          const tpl = await getDoc(doc(db, 'config', 'seedList'));
          await setDoc(lref, { items: tpl.data()?.items ?? [] });
        }
      }
      await setDoc(uref, {
        status: 'joined', name: u.displayName, profileImage: u.photoURL, lastSeen: serverTimestamp(),
      }, { merge: true });
      setUser(u);
    } catch (e: any) {
      if (recoverFromCacheError(e)) return; // broken IndexedDB cache — clearing + reloading
      await signOut(auth);
      setUser(null);
      alert(e.message);
    }
    setAuthReady(true);
  }), []);

  // The whole packing list lives in one doc: lists/{email} { items: [...] }
  useEffect(() => {
    if (!myEmail) { setItems(null); return; }
    return onSnapshot(doc(db, 'lists', myEmail), (snap) => {
      const list = ((snap.data()?.items ?? []) as Item[]).slice();
      list.sort((a, b) => a.order - b.order);
      setItems(list);
    }, (e) => recoverFromCacheError(e));
  }, [myEmail]);

  const save = async (next: Item[]) => { await setDoc(doc(db, 'lists', myEmail), { items: next }); };
  const patchItem = (id: string, patch: Partial<Item>) =>
    save((items ?? []).map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const removeItem = (id: string) => save((items ?? []).filter((i) => i.id !== id));

  return (
    <AppCtx.Provider value={{ user, role, authReady, myEmail, items, save, patchItem, removeItem }}>
      {children}
    </AppCtx.Provider>
  );
}
