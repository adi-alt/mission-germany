'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { fmt, productLinks, RECS, Tier } from '@/lib/recs';
import { Item, itemForecast, useApp } from './providers';
import { useView, VIEWS } from './shell';
import { Dropdown, DatePicker } from './ui';

const BUY_LABEL = { IN: '🇮🇳 India', DE: '🇩🇪 Germany', HAVE: 'Own it' } as const;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

export default function Home() {
  const { items } = useApp();
  const { view } = useView();
  const [openId, setOpenId] = useState<string | null>(null);
  const [tier, setTier] = useState<Tier | 'All'>('All');
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('');
  const { save } = useApp();

  if (!items) return null; // shell shows the skeleton until auth+data resolve

  const packed = items.filter((i) => i.packed).length;
  const cats = items.map((i) => i.category).filter((c, i, a) => a.indexOf(c) === i);

  const inView =
    view === 'all' ? items
    : view === 'starred' ? items.filter((i) => i.starred)
    : view === 'in' ? items.filter((i) => i.buy === 'IN' && !i.packed)
    : view === 'de' ? items.filter((i) => i.buy === 'DE' && !i.packed)
    : view === 'packed' ? items.filter((i) => i.packed)
    : items.filter((i) => i.category === view);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? inView.filter((i) => [i.name, i.category, i.notes, i.link ?? ''].some((s) => s.toLowerCase().includes(q)))
    : inView;

  const viewLabel = VIEWS.find((v) => v.id === view)?.label ?? view;
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

  return (
    <main>
      <div className="progress-wrap">
        <div className="page-title">{viewLabel}</div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${(packed / (items.length || 1)) * 100}%` }} /></div>
        <div className="progress-label">{packed} of {items.length} items done</div>
      </div>

      <div className="search-pill">
        <span>🔍</span>
        <input placeholder="Search items…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
          {q && !filtered.length
            ? <div className="empty">No items match “{search.trim()}”.</div>
            : view === 'starred'
            ? <Watchlist items={filtered} />
            : <GroupedList items={filtered} cats={cats} openId={openId} toggleOpen={toggleOpen} tier={tier} setTier={setTier} grouped={view === 'all' || view === 'in' || view === 'de' || view === 'packed'} />}
        </motion.div>
      </AnimatePresence>

      <form className="add-form" onSubmit={addItem}>
        <input placeholder="Add an item…" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <Dropdown value={newCat || cats[0] || ''} options={cats} onChange={setNewCat} />
        <button type="submit">Add</button>
      </form>

      <p className="disclaimer">
        Prices are typical market estimates; sale dates are expected windows based on previous years.
        Use the search buttons on each item to check live prices before buying.
      </p>
    </main>
  );
}

/* ---------- Grouped item list ---------- */
function GroupedList(props: {
  items: Item[]; cats: string[]; openId: string | null;
  toggleOpen: (id: string) => void; tier: Tier | 'All'; setTier: (t: Tier | 'All') => void; grouped: boolean;
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
function ItemCard({ it, openId, toggleOpen, tier, setTier }: {
  it: Item; openId: string | null; toggleOpen: (id: string) => void;
  tier: Tier | 'All'; setTier: (t: Tier | 'All') => void;
}) {
  const { patchItem, removeItem } = useApp();
  const [draft, setDraft] = useState(it.link ?? '');
  const open = openId === it.id;
  const recs = RECS[it.name] ?? [];
  const shownRecs = tier === 'All' ? recs : recs.filter((r) => r.tier === tier);
  const { base, fc } = itemForecast(it);
  const best = fc.length ? fc.reduce((m, f) => (f.est < m.est ? f : m)) : null;

  return (
    <motion.div className="item" layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="item-row" onClick={() => toggleOpen(it.id)}>
        <input
          type="checkbox" checked={it.packed}
          onClick={(e) => e.stopPropagation()}
          onChange={() => patchItem(it.id, { packed: !it.packed })}
        />
        <span className={`item-name${it.packed ? ' done' : ''}`}>{it.name}</span>
        {it.qty && it.qty !== '1' && <span className="item-qty">{it.qty}</span>}
        <span className={`badge ${it.buy}`}>{BUY_LABEL[it.buy]}</span>
        {it.buy !== 'HAVE' && (
          <button
            className={`star-btn${it.starred ? ' on' : ''}`}
            title="Watch price"
            onClick={(e) => { e.stopPropagation(); patchItem(it.id, { starred: !it.starred }); }}
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

              {it.buy !== 'HAVE' && (
                <>
                  {/* brand / product name / any store link — powers the buy links below */}
                  <form
                    className="prod-form"
                    onSubmit={(e) => { e.preventDefault(); patchItem(it.id, { link: draft.trim() }); }}
                  >
                    <input
                      placeholder="Brand, product, or paste any link (Amazon, Flipkart, …)"
                      value={draft} onChange={(e) => setDraft(e.target.value)}
                      onBlur={() => { if (draft.trim() !== (it.link ?? '')) patchItem(it.id, { link: draft.trim() }); }}
                      onPaste={(e) => { const t = e.clipboardData.getData('text').trim(); setDraft(t); patchItem(it.id, { link: t }); }}
                    />
                    <button type="submit">Save</button>
                  </form>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <DatePicker
                      value={it.targetDate ?? ''}
                      placeholder="Buy before…"
                      onChange={(d) => patchItem(it.id, { targetDate: d })}
                    />
                    <Link className="detail-link" href={`/product?product_id=${it.id}`} onClick={(e) => e.stopPropagation()}>
                      Full details & price graph →
                    </Link>
                  </div>
                </>
              )}

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
                  <b>Cheapest{it.targetDate ? ` before ${fmtDate(it.targetDate)}` : ' upcoming'}:</b>{' '}
                  ~{fmt(best.est, base!.cur)} during {best.sale.name}{' '}
                  ({fmtDate(best.sale.start)}–{fmtDate(best.sale.end)}{best.live ? ', live now' : `, in ${best.days} days`})
                  {!it.starred && ' — star ★ to watch'}
                </div>
              )}
              {!fc.length && it.targetDate && it.buy !== 'HAVE' && (
                <div className="meta-line">No sale windows before {fmtDate(it.targetDate)} — clear the date to see all.</div>
              )}

              {it.buy !== 'HAVE' && (
                <div className="links">
                  {productLinks(it.name, it.buy, it.link).map((l) => (
                    <a key={l.label} className="link-btn" href={l.url} target="_blank" rel="noreferrer">🔍 {l.label}</a>
                  ))}
                </div>
              )}

              <button className="delete-btn" onClick={() => removeItem(it.id)}>Remove item</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ---------- Watchlist with price forecasts ---------- */
function Watchlist({ items }: { items: Item[] }) {
  const { patchItem } = useApp();
  if (!items.length) {
    return <div className="empty">Your watchlist is empty.<br />Star ★ any product to track when it will be cheapest.</div>;
  }
  return (
    <>
      {items.map((it) => {
        const { base, fc } = itemForecast(it);
        const bestEst = fc.length ? Math.min(...fc.map((f) => f.est)) : 0;
        return (
          <motion.div className="watch-card" key={it.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <div className="watch-top">
              <h3><Link className="detail-link" href={`/product?product_id=${it.id}`}>{it.name}</Link></h3>
              {base && <span className="now">now ~{fmt(base.v, base.cur)}</span>}
              <button className="star-btn on" title="Unwatch" onClick={() => patchItem(it.id, { starred: false })}>★</button>
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
              <div className="meta-line">No price data for this item — open the details page to add a link.</div>
            )}
            <div className="links" style={{ marginTop: 10 }}>
              {productLinks(it.name, it.buy, it.link).map((l) => (
                <a key={l.label} className="link-btn" href={l.url} target="_blank" rel="noreferrer">🔍 {l.label}</a>
              ))}
            </div>
          </motion.div>
        );
      })}
    </>
  );
}
