'use client';

// Custom themed replacements for native <select> and <input type="date">.
// Popovers render through a portal at fixed coordinates so they're never
// clipped by table/card overflow containers.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

function usePopover() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const ref = useRef<HTMLDivElement>(null);     // trigger
  const popRef = useRef<HTMLDivElement>(null);  // portal content

  const toggle = () => {
    if (!open && ref.current) {
      const r = ref.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left, width: r.width });
    }
    setOpen(!open);
  };

  // flip above the trigger when there's no room below
  useLayoutEffect(() => {
    if (!open || !popRef.current || !ref.current) return;
    const p = popRef.current.getBoundingClientRect();
    if (p.bottom > window.innerHeight - 8) {
      const r = ref.current.getBoundingClientRect();
      setPos((v) => ({ ...v, top: Math.max(8, r.top - p.height - 4) }));
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!ref.current?.contains(t) && !popRef.current?.contains(t)) setOpen(false);
    };
    // ponytail: close on outside scroll/resize instead of live re-anchoring;
    // scrolling inside the popover itself must NOT dismiss it
    const dismiss = (e: Event) => {
      if (popRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    window.addEventListener('scroll', dismiss, true);
    window.addEventListener('resize', dismiss);
    return () => {
      document.removeEventListener('pointerdown', close);
      window.removeEventListener('scroll', dismiss, true);
      window.removeEventListener('resize', dismiss);
    };
  }, [open]);

  const portal = (children: React.ReactNode, extra?: React.CSSProperties) =>
    createPortal(
      <div
        ref={popRef} className="pop"
        style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: pos.width, zIndex: 1000, ...extra }}
      >
        {children}
      </div>,
      document.body,
    );

  return { open, setOpen, toggle, ref, portal };
}

export function Dropdown({ value, options, onChange, placeholder = 'Select…' }: {
  value: string; options: string[]; onChange: (v: string) => void; placeholder?: string;
}) {
  const { open, setOpen, toggle, ref, portal } = usePopover();
  return (
    <div className="dd" ref={ref}>
      <button type="button" className="dd-btn" onClick={toggle}>
        {value || placeholder} <span className="dd-caret">▾</span>
      </button>
      {open && portal(
        options.map((o) => (
          <button
            type="button" key={o} role="option" aria-selected={o === value}
            className={`pop-row${o === value ? ' selected' : ''}`}
            onClick={() => { onChange(o); setOpen(false); }}
          >
            {o}{o === value && <span className="pop-check">✓</span>}
          </button>
        )),
      )}
    </div>
  );
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function DatePicker({ value, onChange, placeholder = 'Pick a date' }: {
  value: string; onChange: (isoDate: string) => void; placeholder?: string;
}) {
  const { open, setOpen, toggle, ref, portal } = usePopover();
  const selected = value ? new Date(value + 'T00:00') : null;
  const [cursor, setCursor] = useState(() => selected ?? new Date());
  const y = cursor.getFullYear(), m = cursor.getMonth();
  const startPad = (new Date(y, m, 1).getDay() + 6) % 7; // Monday-first grid
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const todayIso = iso(new Date());

  return (
    <div className="dd" ref={ref}>
      <button type="button" className="dd-btn" onClick={toggle}>
        📅 {value ? new Date(value + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : placeholder}
      </button>
      {open && portal(
        <>
          <div className="cal-head">
            <button type="button" onClick={() => setCursor(new Date(y, m - 1, 1))}>‹</button>
            <span>{MONTHS[m]} {y}</span>
            <button type="button" onClick={() => setCursor(new Date(y, m + 1, 1))}>›</button>
          </div>
          <div className="cal-grid">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i} className="cal-dow">{d}</span>)}
            {Array.from({ length: startPad }).map((_, i) => <span key={`p${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dIso = iso(new Date(y, m, i + 1));
              return (
                <button
                  type="button" key={dIso}
                  className={`cal-day${dIso === value ? ' selected' : ''}${dIso === todayIso ? ' today' : ''}`}
                  onClick={() => { onChange(dIso); setOpen(false); }}
                >{i + 1}</button>
              );
            })}
          </div>
          {value && (
            <button type="button" className="cal-clear" onClick={() => { onChange(''); setOpen(false); }}>Clear date</button>
          )}
        </>,
        { padding: 10, minWidth: 248 },
      )}
    </div>
  );
}
