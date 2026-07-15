'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  collection, deleteDoc, doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import type { SeedItem } from '@/lib/seed'; // type only — data lives in the /seedItems collection
import { basePrice, fmt, forecast, RECS, searchLinks, Tier } from '@/lib/recs';

type Item = SeedItem & { id: string; starred?: boolean };

const BUY_LABEL = { IN: '🇮🇳 India', DE: '🇩🇪 Germany', HAVE: 'Own it' } as const;
const VIEWS = [
  { id: 'all', label: 'All items', icon: '📦' },
  { id: 'starred', label: 'Watchlist', icon: '⭐' },
  { id: 'in', label: 'Buy in India', icon: '🇮🇳' },
  { id: 'de', label: 'Buy in Germany', icon: '🇩🇪' },
  { id: 'packed', label: 'Done', icon: '✅' },
] as const;
type ViewId = string;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState('member');
  const [authReady, setAuthReady] = useState(false);
  const [items, setItems] = useState<Item[] | null>(null);
  const [view, setView] = useState<ViewId>('all');
  const [sideOpen, setSideOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [tier, setTier] = useState<Tier | 'All'>('All');
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('');

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
      // First join: flip invited → joined and create this user's list at the same instant
      // (skip if a list was pre-provisioned, e.g. the bootstrap admin's seeded list)
      if (snap.data().status !== 'joined') {
        const lref = doc(db, 'lists', em);
        if (!(await getDoc(lref)).exists()) await setDoc(lref, { items: [] });
      }
      await setDoc(uref, {
        status: 'joined', name: u.displayName, profileImage: u.photoURL, lastSeen: serverTimestamp(),
      }, { merge: true });
      setUser(u);
    } catch (e: any) {
      await signOut(auth);
      setUser(null);
      alert(e.message);
    }
    setAuthReady(true);
  }), []);

  // Presence: heartbeat while the tab is open, offline on leave.
  // ponytail: 60s polling instead of RTDB onDisconnect — "online" = beat within 2 min
  useEffect(() => {
    if (!myEmail) return;
    const pref = doc(db, 'presence', myEmail);
    const beat = (state: string) => setDoc(pref, { state, lastActive: serverTimestamp() }).catch(() => {});
    beat('online');
    const id = setInterval(() => beat('online'), 60_000);
    const off = () => beat('offline');
    window.addEventListener('pagehide', off);
    return () => { clearInterval(id); window.removeEventListener('pagehide', off); off(); };
  }, [myEmail]);

  // The whole packing list lives in one doc: lists/{email} { items: [...] },
  // created at the moment the user first joins.
  useEffect(() => {
    if (!myEmail) { setItems(null); return; }
    return onSnapshot(doc(db, 'lists', myEmail), (snap) => {
      const list = ((snap.data()?.items ?? []) as Item[]).slice();
      list.sort((a, b) => a.order - b.order);
      setItems(list);
    });
  }, [myEmail]);

  if (!authReady) return <Shell skeleton />;

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

  if (!items) return <Shell skeleton />;

  const save = (next: Item[]) => setDoc(doc(db, 'lists', myEmail), { items: next });
  const patchItem = (id: string, patch: Partial<Item>) => save(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const removeItem = (id: string) => save(items.filter((i) => i.id !== id));

  const packed = items.filter((i) => i.packed).length;
  const cats = items.map((i) => i.category).filter((c, i, a) => a.indexOf(c) === i);

  const filtered =
    view === 'all' ? items
    : view === 'starred' ? items.filter((i) => i.starred)
    : view === 'in' ? items.filter((i) => i.buy === 'IN' && !i.packed)
    : view === 'de' ? items.filter((i) => i.buy === 'DE' && !i.packed)
    : view === 'packed' ? items.filter((i) => i.packed)
    : items.filter((i) => i.category === view);

  const viewLabel = view === 'users' ? 'Users' : VIEWS.find((v) => v.id === view)?.label ?? view;

  const toggleOpen = (id: string) => { setTier('All'); setOpenId(openId === id ? null : id); };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await save([...items, {
      id: crypto.randomUUID(), name: newName.trim(), category: newCat || cats[0], qty: '1', buy: 'IN',
      priceINR: '', priceEUR: '', options: '', bestTime: '', notes: '',
      packed: false, starred: false, order: (items.at(-1)?.order ?? 0) + 1,
    }]);
    setNewName('');
  };

  const nav = (id: ViewId) => { setView(id); setSideOpen(false); };

  const sidebar = (
    <aside>
      <div className="side-title">Mission Germany 🇩🇪</div>
      <div className="side-mail">{user.email}</div>
      {VIEWS.map((v) => (
        <button key={v.id} className={`nav-btn${view === v.id ? ' active' : ''}`} onClick={() => nav(v.id)}>
          <span>{v.icon}</span> {v.label}
          <span className="count">
            {v.id === 'all' ? items.length
              : v.id === 'starred' ? items.filter((i) => i.starred).length
              : v.id === 'in' ? items.filter((i) => i.buy === 'IN' && !i.packed).length
              : v.id === 'de' ? items.filter((i) => i.buy === 'DE' && !i.packed).length
              : packed}
          </span>
        </button>
      ))}
      {role === 'admin' && (
        <button className={`nav-btn${view === 'users' ? ' active' : ''}`} onClick={() => nav('users')}>
          <span>👥</span> Users
        </button>
      )}
      <div className="side-label">Categories</div>
      {cats.map((c) => (
        <button key={c} className={`nav-btn${view === c ? ' active' : ''}`} onClick={() => nav(c)}>
          {c}
          <span className="count">{items.filter((i) => i.category === c && i.packed).length}/{items.filter((i) => i.category === c).length}</span>
        </button>
      ))}
      <div className="side-foot">
        <button className="signout" onClick={() => signOut(auth)}>Sign out</button>
      </div>
    </aside>
  );

  return (
    <div className="shell">
      {/* desktop sidebar */}
      <div className="side-desktop">{sidebar}</div>

      {/* mobile sidebar */}
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
          <h1>{viewLabel}</h1>
        </div>

        <main>
          {view !== 'users' && (
            <div className="progress-wrap">
              <div className="page-title">{viewLabel}</div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${(packed / items.length) * 100}%` }} /></div>
              <div className="progress-label">{packed} of {items.length} items done</div>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
              {view === 'users'
                ? <UsersPanel me={user} />
                : view === 'starred'
                ? <Watchlist items={filtered} onPatch={patchItem} />
                : <GroupedList items={filtered} cats={cats} onPatch={patchItem} onRemove={removeItem} openId={openId} toggleOpen={toggleOpen} tier={tier} setTier={setTier} grouped={view === 'all' || view === 'in' || view === 'de' || view === 'packed'} />}
            </motion.div>
          </AnimatePresence>

          {view !== 'users' && (
          <form className="add-form" onSubmit={addItem}>
            <input placeholder="Add an item…" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <select value={newCat || cats[0]} onChange={(e) => setNewCat(e.target.value)}>
              {cats.map((c) => <option key={c}>{c}</option>)}
            </select>
            <button type="submit">Add</button>
          </form>
          )}

          <p className="disclaimer">
            Prices are typical market estimates; sale dates are expected windows based on previous years.
            Use the search buttons on each item to check live prices before buying.
          </p>
        </main>
      </div>
    </div>
  );
}

/* ---------- Admin: users, invites, presence ---------- */
type Profile = { id: string; email?: string; name?: string; profileImage?: string; type?: string; status?: string; lastSeen?: any; invitedBy?: string };

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

/* ---------- Grouped item list ---------- */
function GroupedList(props: {
  items: Item[]; cats: string[]; onPatch: (id: string, patch: Partial<Item>) => void; onRemove: (id: string) => void;
  openId: string | null; toggleOpen: (id: string) => void; tier: Tier | 'All'; setTier: (t: Tier | 'All') => void; grouped: boolean;
}) {
  const { items, cats, grouped } = props;
  if (!items.length) return <div className="empty">Nothing here yet.</div>;
  const groups = grouped ? cats.map((c) => [c, items.filter((i) => i.category === c)] as const).filter(([, l]) => l.length) : [['', items] as const];
  return (
    <>
      {groups.map(([cat, list]) => (
        <section className="category" key={cat || 'flat'}>
          {cat && (
            <div className="category-head">
              <h2>{cat}</h2>
              <span>{list.filter((i) => i.packed).length}/{list.length}</span>
            </div>
          )}
          {list.map((it) => <ItemCard key={it.id} it={it} {...props} />)}
        </section>
      ))}
    </>
  );
}

/* ---------- Single item ---------- */
function ItemCard({ it, onPatch, onRemove, openId, toggleOpen, tier, setTier }: {
  it: Item; onPatch: (id: string, patch: Partial<Item>) => void; onRemove: (id: string) => void;
  openId: string | null; toggleOpen: (id: string) => void;
  tier: Tier | 'All'; setTier: (t: Tier | 'All') => void;
}) {
  const open = openId === it.id;
  const recs = RECS[it.name] ?? [];
  const shownRecs = tier === 'All' ? recs : recs.filter((r) => r.tier === tier);
  const base = basePrice(it.name, it.priceINR, it.priceEUR);
  const market = it.buy === 'DE' ? 'DE' : 'IN';
  const fc = base && it.buy !== 'HAVE' ? forecast(base.v, market, it.category) : [];
  const best = fc.length ? fc.reduce((m, f) => (f.est < m.est ? f : m)) : null;

  return (
    <motion.div className="item" layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="item-row" onClick={() => toggleOpen(it.id)}>
        <input
          type="checkbox" checked={it.packed}
          onClick={(e) => e.stopPropagation()}
          onChange={() => onPatch(it.id, { packed: !it.packed })}
        />
        <span className={`item-name${it.packed ? ' done' : ''}`}>{it.name}</span>
        {it.qty && it.qty !== '1' && <span className="item-qty">{it.qty}</span>}
        <span className={`badge ${it.buy}`}>{BUY_LABEL[it.buy]}</span>
        {it.buy !== 'HAVE' && (
          <button
            className={`star-btn${it.starred ? ' on' : ''}`}
            title="Watch price"
            onClick={(e) => { e.stopPropagation(); onPatch(it.id, { starred: !it.starred }); }}
          >★</button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
            <div className="item-body">
              {(it.priceINR || it.priceEUR) && (
                <div className="meta-line"><b>Est. price:</b> {[it.priceINR, it.priceEUR].filter(Boolean).join(' / ')}</div>
              )}
              {it.bestTime && <div className="meta-line"><b>Best time:</b> {it.bestTime}</div>}
              {it.notes && <div className="meta-line"><b>Note:</b> {it.notes}</div>}

              {recs.length > 0 && (
                <div className="recs">
                  <div className="recs-head">
                    <span>Best picks</span>
                    <div className="tiers">
                      {(['All', 'Budget', 'Mid', 'Premium'] as const).map((t) => (
                        <button key={t} className={`tier-chip${tier === t ? ' active' : ''}`} onClick={() => setTier(t)}>{t}</button>
                      ))}
                    </div>
                  </div>
                  {shownRecs.length ? shownRecs.map((r) => (
                    <div className="rec-row" key={r.name}>
                      <span className="rec-name">{r.name}<span className="rec-where">{r.where}</span></span>
                      <span className="rec-tier">{r.tier}</span>
                      <span className="rec-price">{fmt(r.price, r.cur)}</span>
                    </div>
                  )) : <div className="rec-row" style={{ color: 'var(--muted)' }}>No picks in this range</div>}
                </div>
              )}

              {best && (
                <div className="meta-line">
                  <b>Cheapest upcoming:</b> ~{fmt(best.est, base!.cur)} during {best.sale.name}{' '}
                  ({fmtDate(best.sale.start)}–{fmtDate(best.sale.end)}{best.live ? ', live now' : `, in ${best.days} days`})
                  {!it.starred && ' — star ★ to watch'}
                </div>
              )}

              {it.buy !== 'HAVE' && (
                <div className="links">
                  {searchLinks(it.name, it.buy).map((l) => (
                    <a key={l.label} className="link-btn" href={l.url} target="_blank" rel="noreferrer">🔍 {l.label}</a>
                  ))}
                </div>
              )}

              <button className="delete-btn" onClick={() => onRemove(it.id)}>Remove item</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ---------- Watchlist with price forecasts ---------- */
function Watchlist({ items, onPatch }: { items: Item[]; onPatch: (id: string, patch: Partial<Item>) => void }) {
  if (!items.length) {
    return <div className="empty">Your watchlist is empty.<br />Star ★ any product to track when it will be cheapest.</div>;
  }
  return (
    <>
      {items.map((it) => {
        const base = basePrice(it.name, it.priceINR, it.priceEUR);
        const fc = base ? forecast(base.v, it.buy === 'DE' ? 'DE' : 'IN', it.category) : [];
        const bestEst = fc.length ? Math.min(...fc.map((f) => f.est)) : 0;
        return (
          <motion.div className="watch-card" key={it.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <div className="watch-top">
              <h3>{it.name}</h3>
              {base && <span className="now">now ~{fmt(base.v, base.cur)}</span>}
              <button className="star-btn on" title="Unwatch" onClick={() => onPatch(it.id, { starred: false })}>★</button>
            </div>
            {fc.length ? (
              <div className="forecast">
                <div className="forecast-head">Upcoming price windows</div>
                {fc.map((f) => (
                  <div className="sale-row" key={f.sale.name}>
                    <span className="sale-name">
                      {f.sale.name}
                      <span className="sale-when">{fmtDate(f.sale.start)} – {fmtDate(f.sale.end)}{f.live ? '' : ` · in ${f.days} days`}</span>
                    </span>
                    {f.live && <span className="live-tag">LIVE</span>}
                    {f.est === bestEst && <span className="best-tag">BEST</span>}
                    <span className="sale-price">~{fmt(f.est, base!.cur)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="meta-line">No price data for this item — add it to a search below.</div>
            )}
            <div className="links" style={{ marginTop: 10 }}>
              {searchLinks(it.name, it.buy).map((l) => (
                <a key={l.label} className="link-btn" href={l.url} target="_blank" rel="noreferrer">🔍 {l.label}</a>
              ))}
            </div>
          </motion.div>
        );
      })}
    </>
  );
}

/* ---------- Skeleton shell ---------- */
function Shell({ skeleton }: { skeleton: boolean }) {
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
