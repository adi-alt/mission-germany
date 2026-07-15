'use client';

// Price-timeline line chart: today's price + estimated price in each upcoming
// sale window, from the sale-calendar forecast engine in lib/recs.
import { useRef, useState } from 'react';
import { fmt, Forecast } from '@/lib/recs';

type Pt = { x: number; y: number; date: Date; est: number; label: string; sub: string };

const W = 560, H = 220, L = 48, R = 16, T = 16, B = 30;

export function PriceChart({ base, cur, fc }: { base: number; cur: '₹' | '€'; fc: Forecast[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const raw = [
    { date: new Date(), est: base, label: 'Today', sub: 'current estimate' },
    ...fc.map((f) => ({
      date: new Date(f.sale.start),
      est: f.est,
      label: f.sale.name,
      sub: f.live ? 'live now' : `in ${f.days} days`,
    })),
  ].sort((a, b) => +a.date - +b.date);
  if (raw.length < 2) return null;

  const [x0, x1] = [+raw[0].date, +raw[raw.length - 1].date];
  const ys = raw.map((p) => p.est);
  // clean y ticks: pad the range, round to a tidy step
  const rough = (Math.max(...ys) - Math.min(...ys)) / 3 || Math.max(...ys) / 4;
  const step = [1, 2, 5, 10].map((m) => m * 10 ** Math.floor(Math.log10(rough))).find((s) => s >= rough)!;
  const yMin = Math.floor((Math.min(...ys) * 0.97) / step) * step;
  const yMax = Math.ceil((Math.max(...ys) * 1.03) / step) * step;
  const ticks = [];
  for (let v = yMin; v <= yMax; v += step) ticks.push(v);

  const X = (d: Date) => L + ((+d - x0) / (x1 - x0 || 1)) * (W - L - R);
  const Y = (v: number) => T + (1 - (v - yMin) / (yMax - yMin || 1)) * (H - T - B);
  const pts: Pt[] = raw.map((p) => ({ ...p, x: X(p.date), y: Y(p.est) }));
  const best = pts.reduce((m, p) => (p.est < m.est ? p : m));

  const nearest = (clientX: number) => {
    const rect = wrap.current!.getBoundingClientRect();
    const mx = ((clientX - rect.left) / rect.width) * W;
    let idx = 0;
    pts.forEach((p, i) => { if (Math.abs(p.x - mx) < Math.abs(pts[idx].x - mx)) idx = i; });
    return idx;
  };

  const h = hover != null ? pts[hover] : null;
  const fmtD = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  return (
    <div className="chart-card">
      <div className="chart-title">Price timeline</div>
      <div
        ref={wrap} style={{ position: 'relative' }} tabIndex={0}
        onPointerMove={(e) => setHover(nearest(e.clientX))}
        onPointerLeave={() => setHover(null)}
        onFocus={() => setHover(pts.indexOf(best))}
        onBlur={() => setHover(null)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') setHover((v) => Math.min((v ?? 0) + 1, pts.length - 1));
          if (e.key === 'ArrowLeft') setHover((v) => Math.max((v ?? 0) - 1, 0));
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }} role="img" aria-label="Estimated price over upcoming sales">
          {ticks.map((v) => (
            <g key={v}>
              <line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} stroke="var(--border)" strokeWidth={1} />
              <text x={L - 8} y={Y(v) + 3.5} textAnchor="end" fontSize={10} fill="var(--muted)">{v.toLocaleString('en-IN')}</text>
            </g>
          ))}
          {pts.map((p, i) => (
            <text key={i} x={p.x} y={H - 10} textAnchor="middle" fontSize={10} fill="var(--muted)">
              {i % 2 === 0 || pts.length <= 6 ? fmtD(p.date) : ''}
            </text>
          ))}
          {h && <line x1={h.x} x2={h.x} y1={T} y2={H - B} stroke="var(--border)" strokeWidth={1} />}
          <polyline
            points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none" stroke="var(--black)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          />
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={4.5} fill="var(--black)" stroke="var(--card)" strokeWidth={2} />
          ))}
          {/* direct label on the cheapest point only */}
          <text x={best.x} y={best.y - 12} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--text)">
            {fmt(best.est, cur)}
          </text>
          <text x={best.x} y={best.y + 20} textAnchor="middle" fontSize={9} fill="var(--muted)">best</text>
        </svg>
        {h && (
          <div className="chart-tip" style={{ left: `${(h.x / W) * 100}%`, top: `${(h.y / H) * 100}%` }}>
            <b>{fmt(h.est, cur)}</b><br />{h.label} · {fmtD(h.date)} ({h.sub})
          </div>
        )}
      </div>
    </div>
  );
}
