'use client';

// Users admin section — table layout modeled on the internal-platform Users page:
// search pill, inline invite row, Email · Name · Status · Role · Actions columns.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useApp } from '../providers';
import { Dropdown } from '../ui';

type Profile = { id: string; email?: string; name?: string; profileImage?: string; type?: string; status?: string; lastSeen?: any; invitedBy?: string };

export default function UsersPage() {
  const { user, role, authReady } = useApp();

  if (!authReady) return null;
  if (!user || role !== 'admin') {
    return (
      <main>
        <div className="page-title">Users</div>
        <p className="meta-line">Admins only.</p>
        <p style={{ marginTop: 12 }}><Link className="link-btn" href="/">← Back to the list</Link></p>
      </main>
    );
  }
  return <UsersTable myEmail={(user.email ?? '').toLowerCase()} />;
}

function UsersTable({ myEmail }: { myEmail: string }) {
  const [users, setUsers] = useState<Profile[]>([]);
  const [presence, setPresence] = useState<Record<string, any>>({});
  const [search, setSearch] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState('member');
  const [inviting, setInviting] = useState(false);

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
    setInviting(true);
    try {
      await setDoc(doc(db, 'users', em), { email: em, type, status: 'invited', invitedBy: myEmail, invitedAt: serverTimestamp() });
      setEmail('');
    } finally { setInviting(false); }
  };

  const q = search.trim().toLowerCase();
  const shown = users.filter((u) => !q || u.id.includes(q) || (u.name ?? '').toLowerCase().includes(q));

  return (
    <main style={{ maxWidth: 900 }}>
      <div className="page-title" style={{ margin: '10px 0 14px' }}>Users</div>

      <form className="invite-row" onSubmit={invite}>
        <input type="email" required placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Dropdown value={type} options={['member', 'admin']} onChange={setType} />
        <button type="submit" disabled={inviting}>{inviting ? 'Inviting…' : 'Send invite'}</button>
      </form>

      <div className="search-pill">
        <span>🔍</span>
        <input placeholder="Search by email or name…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="table-wrap">
        <table className="users-table">
          <thead>
            <tr>
              <th>Email</th><th>Name</th><th>Status</th><th>Role</th><th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((u) => (
              <tr key={u.id}>
                <td>
                  <span className="avatar-wrap">
                    {u.profileImage
                      ? <img src={u.profileImage} alt="" referrerPolicy="no-referrer" />
                      : <span className="avatar-fallback">{(u.name ?? u.id).slice(0, 2).toUpperCase()}</span>}
                    <span className={`presence-dot${online(u.id) ? ' on' : ''}`} />
                  </span>
                  {u.id}
                </td>
                <td className="td-muted">{u.name ?? '—'}</td>
                <td>
                  <span className={`status-chip ${u.status === 'joined' ? 'joined' : 'pending'}`}>
                    {u.status === 'joined' ? (online(u.id) ? 'online' : 'joined') : 'invited'}
                  </span>
                </td>
                <td>
                  {u.id === myEmail
                    ? <span className="status-chip">admin (you)</span>
                    : <Dropdown value={u.type ?? 'member'} options={['member', 'admin']} onChange={(t) => updateDoc(doc(db, 'users', u.id), { type: t })} />}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {u.id !== myEmail && (
                    <button
                      className="delete-btn"
                      title={u.status === 'joined' ? 'Remove user' : 'Revoke invite'}
                      onClick={() => { deleteDoc(doc(db, 'users', u.id)); deleteDoc(doc(db, 'lists', u.id)); }}
                    >{u.status === 'joined' ? 'Remove' : 'Revoke'}</button>
                  )}
                </td>
              </tr>
            ))}
            {!shown.length && (
              <tr><td colSpan={5} className="td-muted" style={{ textAlign: 'center', padding: 28 }}>No users match.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="disclaimer">
        Invited people sign in with Google using the invited email — their account and packing list are created on first sign-in.
      </p>
    </main>
  );
}
