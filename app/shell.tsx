'use client';

import { createContext, useContext, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useApp } from './providers';

export const VIEWS = [
  { id: 'all', label: 'All items', icon: '📦' },
  { id: 'starred', label: 'Watchlist', icon: '⭐' },
  { id: 'in', label: 'Buy in India', icon: '🇮🇳' },
  { id: 'de', label: 'Buy in Germany', icon: '🇩🇪' },
  { id: 'packed', label: 'Done', icon: '✅' },
] as const;

// Home-page view selection lives here so the sidebar works from any route
const ViewCtx = createContext<{ view: string; setView: (v: string) => void }>(null!);
export const useView = () => useContext(ViewCtx);

export function Shell({ children }: { children: React.ReactNode }) {
  const { user, role, authReady, items } = useApp();
  const [view, setView] = useState('all');
  const [sideOpen, setSideOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  if (!authReady) return <Skeleton />;

  if (!user) {
    return (
      <motion.div className="login" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1>Mission Germany 🇩🇪</h1>
        <p>Your RWTH Aachen packing & shopping list — best product picks, live search, and sale-calendar price forecasts.</p>
        <button className="google-btn" onClick={() => signInWithPopup(auth, googleProvider).catch((e) => alert(e.message))}>
          Continue with Google
        </button>
      </motion.div>
    );
  }

  const list = items ?? [];
  const packed = list.filter((i) => i.packed).length;
  const cats = list.map((i) => i.category).filter((c, i, a) => a.indexOf(c) === i);

  const nav = (id: string) => {
    setView(id);
    setSideOpen(false);
    if (pathname !== '/') router.push('/'); // client-side nav — the sidebar never remounts
  };

  const sidebar = (
    <aside>
      <div className="side-title">Mission Germany 🇩🇪</div>
      <div className="side-mail">{user.email}</div>
      {VIEWS.map((v) => (
        <button key={v.id} className={`nav-btn${pathname === '/' && view === v.id ? ' active' : ''}`} onClick={() => nav(v.id)}>
          <span>{v.icon}</span> {v.label}
          <span className="count">
            {v.id === 'all' ? list.length
              : v.id === 'starred' ? list.filter((i) => i.starred).length
              : v.id === 'in' ? list.filter((i) => i.buy === 'IN' && !i.packed).length
              : v.id === 'de' ? list.filter((i) => i.buy === 'DE' && !i.packed).length
              : packed}
          </span>
        </button>
      ))}
      {role === 'admin' && (
        <Link
          className={`nav-btn${pathname.startsWith('/Users') ? ' active' : ''}`}
          href="/Users"
          onClick={() => setSideOpen(false)}
        >
          <span>👥</span> Users
        </Link>
      )}
      <div className="side-label">Categories</div>
      {cats.map((c) => (
        <button key={c} className={`nav-btn${pathname === '/' && view === c ? ' active' : ''}`} onClick={() => nav(c)}>
          {c}
          <span className="count">{list.filter((i) => i.category === c && i.packed).length}/{list.filter((i) => i.category === c).length}</span>
        </button>
      ))}
      <div className="side-foot">
        <button className="signout" onClick={() => signOut(auth)}>Sign out</button>
      </div>
    </aside>
  );

  return (
    <ViewCtx.Provider value={{ view, setView }}>
      <div className="shell">
        <div className="side-desktop">{sidebar}</div>

        <AnimatePresence>
          {sideOpen && (
            <>
              <motion.div className="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSideOpen(false)} />
              <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: 'tween', duration: 0.22 }} style={{ position: 'fixed', zIndex: 40 }}>
                {sidebar}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div>
          <div className="topbar">
            <button className="hamburger" onClick={() => setSideOpen(true)}>☰</button>
            <h1>Mission Germany 🇩🇪</h1>
          </div>
          {children}
        </div>
      </div>
    </ViewCtx.Provider>
  );
}

function Skeleton() {
  return (
    <div className="shell">
      <aside>
        <div className="sk" style={{ height: 22, width: 160, margin: '0 10px 10px' }} />
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="sk" style={{ height: 30, margin: '3px 10px' }} />
        ))}
      </aside>
      <main>
        <div className="sk" style={{ height: 28, width: 180, marginBottom: 16 }} />
        <div className="sk" style={{ height: 8, marginBottom: 24 }} />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="sk" style={{ height: 46, marginBottom: 8, borderRadius: 12 }} />
        ))}
      </main>
    </div>
  );
}
