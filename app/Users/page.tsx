'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

type Profile = { id: string; email?: string; name?: string; profileImage?: string; type?: string; status?: string; lastSeen?: any; invitedBy?: string };

export default function UsersPage() {
  const [me, setMe] = useState<User | null>(null);
  const [role, setRole] = useState('');

  useEffect(() => onAuthStateChanged(auth, async (u) => {
    setMe(u);
    if (u) setRole((await getDoc(doc(db, 'users', (u.email ?? '').toLowerCase()))).data()?.type ?? 'member');
    else setRole('none');
  }), []);

  if (!role) return null; // auth still resolving
  if (!me || role !== 'admin') {
    return (
      <div className="login">
        <h1>Users</h1>
        <p>Admins only.</p>
        <Link className="link-btn" href="/">← Back to the list</Link>
      </div>
    );
  }

  return (
    <div className="shell">
      <div />
      <div>
        <div className="topbar">
          <Link className="hamburger" href="/">←</Link>
          <h1>Users</h1>
        </div>
        <main>
          <div className="progress-wrap">
            <div className="page-title">Users</div>
          </div>
          <UsersPanel me={me} />
        </main>
      </div>
    </div>
  );
}

function UsersPanel({ me }: { me: User }) {
  const [users, setUsers] = useState<Profile[]>([]);
  const [presence, setPresence] = useState<Record<string, any>>({});
  const [email, setEmail] = useState('');
  const [type, setType] = useState('member');

  useEffect(() => {
    const subs = [
      onSnapshot(collection(db, 'users'), (s) => setUsers(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
      onSnapshot(collection(db, 'presence'), (s) => setPresence(Object.fromEntries(s.docs.map((d) => [d.id, d.data()])))),
    ];
    return () => subs.forEach((u) => u());
  }, []);

  const online = (em: string) => {
    const p = presence[em];
    return p?.state === 'online' && p.lastActive?.toMillis?.() > Date.now() - 2 * 60_000;
  };

  // Inviting = creating the users doc; it flips to 'joined' on their first sign-in
  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    if (!em) return;
    await setDoc(doc(db, 'users', em), { email: em, type, status: 'invited', invitedBy: me.email, invitedAt: serverTimestamp() });
    setEmail('');
  };

  const joined = users.filter((u) => u.status === 'joined');
  const pending = users.filter((u) => u.status !== 'joined');

  return (
    <>
      <form className="add-form" onSubmit={invite}>
        <input type="email" placeholder="Invite by email…" value={email} onChange={(e) => setEmail(e.target.value)} />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="member">member</option>
          <option value="admin">admin</option>
        </select>
        <button type="submit">Invite</button>
      </form>

      {joined.map((u) => (
        <div className="watch-card" key={u.id}>
          <div className="watch-top">
            {u.profileImage && <img src={u.profileImage} alt="" width={32} height={32} style={{ borderRadius: '50%' }} referrerPolicy="no-referrer" />}
            <h3>
              <span style={{ color: online(u.id) ? '#22c55e' : 'var(--muted)', marginRight: 6 }}>●</span>
              {u.name ?? u.email}
            </h3>
            <select
              value={u.type ?? 'member'}
              disabled={u.id === me.email?.toLowerCase()} // don't demote yourself
              onChange={(e) => updateDoc(doc(db, 'users', u.id), { type: e.target.value })}
            >
              <option value="member">member</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div className="meta-line">
            {u.email} · {online(u.id) ? 'online now' : u.lastSeen?.toDate ? `last seen ${u.lastSeen.toDate().toLocaleString()}` : 'never seen'}
          </div>
          {u.id !== me.email?.toLowerCase() && (
            <button
              className="delete-btn"
              onClick={() => { deleteDoc(doc(db, 'users', u.id)); deleteDoc(doc(db, 'lists', u.id)); }}
            >Remove user</button>
          )}
        </div>
      ))}

      {pending.length > 0 && <div className="side-label">Pending invites</div>}
      {pending.map((u) => (
        <div className="watch-card" key={u.id}>
          <div className="watch-top">
            <h3>{u.id}</h3>
            <span className="badge">{u.type}</span>
          </div>
          <div className="meta-line">invited by {u.invitedBy ?? '—'} · not signed in yet</div>
          <button className="delete-btn" onClick={() => deleteDoc(doc(db, 'users', u.id))}>Revoke invite</button>
        </div>
      ))}
    </>
  );
}
