'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { basePrice, fmt, parseProductInput, productLinks, RECS, Tier } from '@/lib/recs';
import { itemForecast, useApp } from '../providers';
import { PriceChart } from '../price-chart';
import { DatePicker, Dropdown } from '../ui';

const BUY_LABEL = { IN: '🇮🇳 Buy in India', DE: '🇩🇪 Buy in Germany', HAVE: 'Already own it' } as const;
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

export default function ProductPage() {
  return (
    <Suspense>
      <ProductDetail />
    </Suspense>
  );
}

function ProductDetail() {
  const { items, patchItem } = useApp();
  const id = useSearchParams().get('product_id') ?? '';
  // product_id is the item's id; a plain number is also accepted as a list index
  const item = items?.find((i) => i.id === id) ?? (/^\d+$/.test(id) ? items?.[+id] : undefined);
  const [draft, setDraft] = useState<string | null>(null);
  const [tier, setTier] = useState<Tier | 'All'>('All');

  if (!items) return null; // shell skeleton covers loading
  if (!item) {
    return (
      <main>
        <div className="page-title">Product not found</div>
        <p className="meta-line">This item isn’t in your list (it may have been removed).</p>
        <p style={{ marginTop: 12 }}><Link className="link-btn" href="/">← Back to the list</Link></p>
      </main>
    );
  }

  const { base, fc } = itemForecast(item);
  const bestEst = fc.length ? Math.min(...fc.map((f) => f.est)) : 0;
  const recs = RECS[item.name] ?? [];
  const shownRecs = tier === 'All' ? recs : recs.filter((r) => r.tier === tier);
  const parsed = parseProductInput(item.link ?? '');

  return (
    <main>
      <p style={{ margin: '4px 0 14px' }}><Link className="detail-link" href="/">← Back to the list</Link></p>

      <div className="progress-wrap" style={{ marginBottom: 12 }}>
        <div className="page-title" style={{ marginBottom: 4 }}>{item.name}</div>
        <div className="meta-line">
          {item.category} · <span className={`badge ${item.buy}`}>{BUY_LABEL[item.buy]}</span>
          {item.qty && item.qty !== '1' ? ` · qty: ${item.qty}` : ''}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {(item.priceINR || item.priceEUR) && (
          <div className="meta-line"><b>Est. price:</b> {[item.priceINR, item.priceEUR].filter(Boolean).join(' / ')}</div>
        )}
        {item.bestTime && <div className="meta-line"><b>Best time to buy:</b> {item.bestTime}</div>}
        {item.notes && <div className="meta-line"><b>Note:</b> {item.notes}</div>}
        {item.options && <div className="meta-line"><b>Where:</b> {item.options}</div>}

        {item.buy !== 'HAVE' && (
          <>
            <form
              className="prod-form"
              onSubmit={(e) => { e.preventDefault(); patchItem(item.id, { link: (draft ?? '').trim() }); }}
            >
              <input
                placeholder="Brand, product, or paste any link (Amazon, Flipkart, Google, …)"
                value={draft ?? item.link ?? ''}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => { if (draft != null && draft.trim() !== (item.link ?? '')) patchItem(item.id, { link: draft.trim() }); }}
                onPaste={(e) => patchItem(item.id, { link: e.clipboardData.getData('text').trim() })}
              />
              <button type="submit">Save</button>
            </form>
            {parsed.platform && <div className="meta-line">Linked product on <b>{parsed.platform}</b></div>}
            {parsed.query && <div className="meta-line">Tracking searches for <b>{parsed.query}</b></div>}

            {/* live store prices need a backend price API — until then, the price on the
                linked page goes here and the whole forecast recomputes from it */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <input
                className="price-input"
                inputMode="decimal"
                placeholder={item.buy === 'DE' ? 'Price on that page (€)' : 'Price on that page (₹)'}
                value={item.customPrice ?? ''}
                onChange={(e) => patchItem(item.id, { customPrice: e.target.value })}
              />
              <span className="meta-line">
                {Number((item.customPrice ?? '').replace(/[^\d.]/g, '')) > 0
                  ? 'Graph & windows use your price'
                  : 'Enter the price shown on the store page — the graph updates from it'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <DatePicker
                value={item.targetDate ?? ''}
                placeholder="Buy before…"
                onChange={(d) => patchItem(item.id, { targetDate: d })}
              />
              <span className="meta-line">
                {item.targetDate ? `Showing sale windows before ${fmtDate(item.targetDate)}` : 'Pick a deadline to narrow the sale windows'}
              </span>
            </div>

            {base && fc.length > 0 && <PriceChart base={base.v} cur={base.cur} fc={fc} />}

            {fc.length > 0 && (
              <div className="forecast">
                <div className="forecast-head">Price-drop windows</div>
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
            )}
            {!fc.length && (
              <div className="meta-line">
                {item.targetDate
                  ? `No sale windows before ${fmtDate(item.targetDate)} — clear the date to see all upcoming sales.`
                  : 'No price data for this item yet — sale forecasts need an estimated price.'}
              </div>
            )}

            {recs.length > 0 && (
              <div className="recs">
                <div className="recs-head">
                  <span>Best picks</span>
                  <Dropdown value={tier} options={['All', 'Budget', 'Mid', 'Premium']} onChange={(t) => setTier(t as Tier | 'All')} />
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

            <div>
              <div className="chart-title" style={{ margin: '4px 0 8px' }}>Buy from</div>
              <div className="links">
                {productLinks(item.name, item.buy, item.link).map((l) => (
                  <a key={l.label} className="link-btn" href={l.url} target="_blank" rel="noreferrer">🔍 {l.label}</a>
                ))}
              </div>
            </div>

            <p className="disclaimer">
              Price timeline is estimated from typical sale discounts, not live store data —
              live price tracking needs a backend price API. Use the buy links to check current prices.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
