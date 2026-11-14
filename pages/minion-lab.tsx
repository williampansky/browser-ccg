import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { loadHsCards } from '../engine';
import type { Card, MinionInstance } from '../engine';
import { createMinion } from '../engine/rules/minion';
import { MinionFace } from '../components/play-board/MinionFace';
import minionStyles from '../components/play-board/board-minion.module.scss';

/**
 * PROTOTYPE page (dev only, not linked): the board minion (MinionFace) on its own, a gallery of the different looks, with sliders for the
 * overall shape and for where each element sits. Static, like /hero-lab. Everything is in the URL, so a look can be shared:
 *  - shape: lm height px, la aspect (height / width), lr corner radius %, lbw border px, lot oval Y offset px, lgs guard shield scale
 *  - attack badge: lax / lay offset px, las size px, lanf numeral font size px, lanx / lany numeral position inside the badge px
 *  - health badge: lhx / lhy offset px, lhs size px, lhnf numeral font size px, lhnx / lhny numeral position inside the badge px
 *  - caption (name): lcx / lcy offset px, lcf font size px, lcshow=1 shows it (it is hidden by default);  keyword icons: lkx / lky offset px, lks scale
 *  - preview only: state (ready|selected|aim|aimHover), bg (felt|dark), lz zoom, labels=0 hides the gray words under each minion
 */
const { cards } = loadHsCards();

/** The top end of every slider (offsets run from minus this to plus it). Edit freely. */
const SLIDER_MAX = {
  lm: 300,
  la: 2,
  lr: 50,
  lbw: 12,
  lot: 60,
  lgs: 1.8,
  lax: 80,
  lay: 80,
  las: 90,
  lhx: 80,
  lhy: 80,
  lhs: 90,
  lanf: 48,
  lanx: 30,
  lany: 30,
  lhnf: 48,
  lhnx: 30,
  lhny: 30,
  lcx: 80,
  lcy: 60,
  lcf: 28,
  lkx: 80,
  lky: 60,
  lks: 2.5,
  lz: 3
};

const sel = (name: string) => `[class*="board-minion_${name}__"]`;
const SLOT = sel('slot');
const OVAL = sel('oval');
const SHIELD = sel('guardShield');
const ATTACK = `${sel('stat')}${sel('attack')}`;
const HEALTH = `${sel('stat')}${sel('health')}`;
const CAPTION = sel('caption');
const BADGES = sel('badges');

const first = (selector: string) => document.querySelector<HTMLElement>(selector);
const num = (v: string | undefined, decimals = 0) => {
  const n = parseFloat(v ?? '');
  const k = 10 ** decimals;
  return Number.isNaN(n) ? undefined : Math.round(n * k) / k;
};

type Knob = {
  key: keyof typeof SLIDER_MAX;
  label: string;
  /** Slider minimum (offsets are symmetric: leave `min` off and it is minus the max) */
  min?: number;
  step?: number;
  css: (v: number) => string;
  /** The real value on the first minion, measured from the DOM (the slider's default while unset) */
  read: () => number | undefined;
};

const computed = (selector: string) => {
  const e = first(selector);
  return e ? getComputedStyle(e) : undefined;
};
// The stylesheet reads --nudge-x / --nudge-y into `translate` (with the real default offsets), so each axis has its own slider.
const VARS = (selector: string, axis: 'x' | 'y', v: number) => `${selector}{--nudge-${axis}:${v}px}`;
/** The element's current offset on one axis, read from its computed `translate`. */
const nudge = (selector: string, axis: 'x' | 'y') => {
  const t = computed(selector)?.translate;
  if (!t || t === 'none') return 0;
  return num(t.split(' ')[axis === 'x' ? 0 : 1] ?? '0', 1) ?? 0;
};

const KNOBS: Knob[] = [
  // Overall shape
  { key: 'lm', label: 'Height (px)', min: 50, css: (v) => `${SLOT}{--m-h:${v}px !important}`, read: () => num(computed(OVAL)?.height) },
  {
    key: 'la',
    label: 'Aspect (height / width)',
    min: 0.6,
    step: 0.01,
    css: (v) => `${SLOT}{--m-w:calc(var(--m-h, 128px) / ${v}) !important}`,
    read: () => {
      const o = first(OVAL)?.getBoundingClientRect();
      return o ? num(String(o.height / o.width), 2) : undefined;
    }
  },
  { key: 'lr', label: 'Corner radius (%; 50 = oval)', min: 0, css: (v) => `${OVAL}{border-radius:${v}% !important}`, read: () => 50 },
  { key: 'lbw', label: 'Border width (px)', min: 0, css: (v) => `${OVAL}{border-width:${v}px !important}`, read: () => num(computed(OVAL)?.borderTopWidth) },
  { key: 'lot', label: 'Picture Y offset (px)', css: (v) => VARS(OVAL, 'y', v), read: () => nudge(OVAL, 'y') },
  { key: 'lgs', label: 'Guard shield scale (x)', min: 0.5, step: 0.01, css: (v) => `${SHIELD}{scale:${v}}`, read: () => 1 },
  // Attack badge (sword)
  { key: 'lax', label: 'Attack X offset (px)', css: (v) => VARS(ATTACK, 'x', v), read: () => nudge(ATTACK, 'x') },
  { key: 'lay', label: 'Attack Y offset (px)', css: (v) => VARS(ATTACK, 'y', v), read: () => nudge(ATTACK, 'y') },
  { key: 'las', label: 'Attack size (px)', min: 10, css: (v) => `${ATTACK}{width:${v}px !important;height:${v}px !important}`, read: () => num(computed(ATTACK)?.width) },
  { key: 'lanf', label: 'Attack numeral size (px)', min: 6, step: 0.5, css: (v) => `${ATTACK} b{font-size:${v}px !important}`, read: () => num(computed(`${ATTACK} b`)?.fontSize, 1) },
  { key: 'lanx', label: 'Attack numeral X (px, inside the badge)', step: 0.5, css: (v) => `${ATTACK} b{left:${v}px !important}`, read: () => num(computed(`${ATTACK} b`)?.left, 1) },
  { key: 'lany', label: 'Attack numeral Y (px, inside the badge)', step: 0.5, css: (v) => `${ATTACK} b{top:${v}px !important}`, read: () => num(computed(`${ATTACK} b`)?.top, 1) },
  // Health badge (shield)
  { key: 'lhx', label: 'Health X offset (px)', css: (v) => VARS(HEALTH, 'x', v), read: () => nudge(HEALTH, 'x') },
  { key: 'lhy', label: 'Health Y offset (px)', css: (v) => VARS(HEALTH, 'y', v), read: () => nudge(HEALTH, 'y') },
  { key: 'lhs', label: 'Health size (px)', min: 10, css: (v) => `${HEALTH}{width:${v}px !important;height:${v}px !important}`, read: () => num(computed(HEALTH)?.width) },
  { key: 'lhnf', label: 'Health numeral size (px)', min: 6, step: 0.5, css: (v) => `${HEALTH} b{font-size:${v}px !important}`, read: () => num(computed(`${HEALTH} b`)?.fontSize, 1) },
  { key: 'lhnx', label: 'Health numeral X (px, inside the badge)', step: 0.5, css: (v) => `${HEALTH} b{left:${v}px !important}`, read: () => num(computed(`${HEALTH} b`)?.left, 1) },
  { key: 'lhny', label: 'Health numeral Y (px, inside the badge)', step: 0.5, css: (v) => `${HEALTH} b{top:${v}px !important}`, read: () => num(computed(`${HEALTH} b`)?.top, 1) },
  // Name caption
  { key: 'lcx', label: 'Name X offset (px)', css: (v) => VARS(CAPTION, 'x', v), read: () => nudge(CAPTION, 'x') },
  { key: 'lcy', label: 'Name Y offset (px)', css: (v) => VARS(CAPTION, 'y', v), read: () => nudge(CAPTION, 'y') },
  { key: 'lcf', label: 'Name font size (px)', min: 4, step: 0.5, css: (v) => `${CAPTION}{font-size:${v}px !important}`, read: () => num(computed(CAPTION)?.fontSize, 1) },
  // Keyword icons along the top
  { key: 'lkx', label: 'Keyword icons X offset (px)', css: (v) => VARS(BADGES, 'x', v), read: () => nudge(BADGES, 'x') },
  { key: 'lky', label: 'Keyword icons Y offset (px)', css: (v) => VARS(BADGES, 'y', v), read: () => nudge(BADGES, 'y') },
  { key: 'lks', label: 'Keyword icons scale (x)', min: 0.4, step: 0.01, css: (v) => `${BADGES}{scale:${v}}`, read: () => 1 },
  // Preview only (not part of the minion)
  { key: 'lz', label: 'Preview zoom (x)', min: 0.4, step: 0.05, css: () => '', read: () => 1 }
];

const GROUPS: { id: string; title: string; keys: string[] }[] = [
  { id: 'shape', title: 'Overall shape', keys: ['lm', 'la', 'lr', 'lbw', 'lot', 'lgs'] },
  { id: 'attack', title: 'Attack badge', keys: ['lax', 'lay', 'las', 'lanf', 'lanx', 'lany'] },
  { id: 'health', title: 'Health badge', keys: ['lhx', 'lhy', 'lhs', 'lhnf', 'lhnx', 'lhny'] },
  { id: 'caption', title: 'Name', keys: ['lcx', 'lcy', 'lcf'] },
  { id: 'icons', title: 'Keyword icons', keys: ['lkx', 'lky', 'lks'] },
  { id: 'preview', title: 'Preview', keys: ['lz'] }
];

const STATES: [string, string][] = [
  ['', 'Resting'],
  ['ready', 'Ready to attack (green ring)'],
  ['selected', 'Selected (lifted)'],
  ['aim', 'Can be aimed at (red ring)'],
  ['aimHover', 'Aimed at (green ring)']
];

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

/** Real CORE minions for the gallery, each dressed up to show one thing. */
type Sample = { label: string; card: Card; m: MinionInstance; sick: boolean };
const buildSamples = (): Sample[] => {
  const pool = cards.filter((c) => c.source === 'core' && !c.isToken && c.type === 'minion' && c.name && (c.attack ?? 0) > 0);
  const make = (i: number): { card: Card; m: MinionInstance } => {
    const card = pool[(i * 9 + 4) % pool.length];
    return { card, m: createMinion(card, 900 + i, 3, 900 + i) };
  };
  const tweak = (i: number, f: (m: MinionInstance) => void) => {
    const s = make(i);
    f(s.m);
    return s;
  };
  return [
    { label: 'Plain', ...make(0), sick: false },
    { label: 'Guard', ...tweak(1, (m) => (m.keywords.guard = true)), sick: false },
    { label: 'Bubble', ...tweak(2, (m) => (m.keywords.bubble = true)), sick: false },
    { label: 'Concealed', ...tweak(3, (m) => (m.keywords.hidden = true)), sick: false },
    { label: 'Guard + Bubble', ...tweak(4, (m) => ((m.keywords.guard = true), (m.keywords.bubble = true))), sick: false },
    { label: 'Rush + Onslaught', ...tweak(5, (m) => ((m.keywords.rush = true), (m.keywords.doubleAttack = true))), sick: false },
    { label: 'Damaged', ...tweak(6, (m) => (m.health = Math.max(1, m.maxHealth - 2))), sick: false },
    { label: 'Buffed', ...tweak(7, (m) => ((m.attack += 3), (m.health += 3), (m.maxHealth += 3))), sick: false },
    { label: 'Not ready + suppressed', ...tweak(8, (m) => (m.silenced = true)), sick: true },
    { label: 'Expiring + disabled', ...tweak(9, (m) => ((m.expiresOnTurn = 5), (m.disabledOnTurn = 4))), sick: false }
  ];
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <details open style={{ borderTop: '1px solid #3a4052', padding: '6px 0' }}>
    <summary style={{ cursor: 'pointer', userSelect: 'none' }}>
      <b>{title}</b>
    </summary>
    {children}
  </details>
);

const MinionLab = () => {
  const router = useRouter();
  const q = router.query;
  const samples = useMemo(buildSamples, []);
  const [defaults, setDefaults] = useState<Record<string, number>>({});
  // Render only on the client: the URL params are not known on the server, so a first render there would not match.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // The control panel's width (px): dragged by its right edge, remembered in localStorage, double-click resets.
  const [panelW, setPanelW] = useState(290);
  const resize = useRef<{ x: number; w: number } | null>(null);
  useEffect(() => {
    const saved = parseInt(window.localStorage.getItem('ccg.minionlab.width') ?? '', 10);
    if (saved >= 220 && saved <= 900) setPanelW(saved);
  }, []);
  const startResize = (e: React.PointerEvent<HTMLDivElement>) => {
    resize.current = { x: e.clientX, w: panelW };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const moveResize = (e: React.PointerEvent<HTMLDivElement>) => {
    if (resize.current) setPanelW(Math.min(900, Math.max(220, resize.current.w + e.clientX - resize.current.x)));
  };
  const endResize = () => {
    if (!resize.current) return;
    resize.current = null;
    window.localStorage.setItem('ccg.minionlab.width', String(panelW));
  };

  const setParams = (changes: Record<string, string | null>) => {
    const next: Record<string, string | string[] | undefined> = { ...router.query };
    Object.entries(changes).forEach(([k, v]) => (v === null || v === '' ? delete next[k] : (next[k] = v)));
    router.replace({ pathname: router.pathname, query: next }, undefined, { shallow: true });
  };

  // The real value of each knob, measured from the first minion on screen (only while it has no override of its own).
  useEffect(() => {
    if (!router.isReady) return;
    const measure = () =>
      setDefaults((old) => {
        const next = { ...old };
        let changed = false;
        KNOBS.forEach((k) => {
          if (one(router.query[k.key]) !== '') return;
          const v = k.read();
          if (v !== undefined && next[k.key] !== v) {
            next[k.key] = v;
            changed = true;
          }
        });
        return changed ? next : old;
      });
    measure();
    const t = setInterval(measure, 400);
    return () => clearInterval(t);
  }, [router.isReady, router.query]);

  if (!mounted || !router.isReady) return null;

  const css = [
    ...KNOBS.filter((k) => one(q[k.key]) !== '' && !Number.isNaN(+one(q[k.key]))).map((k) => k.css(+one(q[k.key]))),
    one(q.lcshow) === '1' ? `${CAPTION}{opacity:1 !important}` : ''
  ].join('\n');

  const state = STATES.find(([v]) => v === one(q.state))?.[0] ?? '';
  const zoom = +one(q.lz) || 1;
  const felt = one(q.bg) !== 'dark';
  const row = { display: 'block', margin: '6px 0' } as const;

  const knob = (key: string) => {
    const k = KNOBS.find((x) => x.key === key)!;
    const max = SLIDER_MAX[k.key];
    const raw = one(q[key]);
    const def = defaults[key];
    const min = k.min ?? -max;
    return (
      <label key={key} style={row}>
        {k.label}{' '}
        <input
          type="number"
          step={k.step ?? 1}
          value={raw || (def ?? '')}
          style={{ width: 66 }}
          onChange={(e) => setParams({ [key]: e.target.value })}
        />
        {!raw && def !== undefined && <span style={{ color: '#9aa3b8' }}> (default)</span>}
        {raw && (
          <a style={{ marginLeft: 6, cursor: 'pointer', color: '#7aa2ff' }} onClick={() => setParams({ [key]: null })}>
            reset
          </a>
        )}
        <input
          type="range"
          min={Math.min(min, def ?? min)}
          max={Math.max(max, def ?? max)}
          step={k.step ?? 1}
          value={raw || (def ?? min)}
          style={{ display: 'block', width: '100%' }}
          onChange={(e) => setParams({ [key]: e.target.value })}
        />
      </label>
    );
  };

  return (
    <main style={{ position: 'fixed', inset: 0, display: 'flex', color: '#e8eaf2', background: '#14161c', font: '14px system-ui, sans-serif' }}>
      <style>{css}</style>
      <aside style={{ width: panelW, flex: 'none', overflow: 'auto', padding: 14, boxSizing: 'border-box', background: '#1b1e27' }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 20 }}>Minion lab</h1>
        <p style={{ color: '#9aa3b8', margin: '0 0 8px', fontSize: 12 }}>The board minion on its own. The URL holds every setting.</p>
        <label style={row}>
          State{' '}
          <select value={state} onChange={(e) => setParams({ state: e.target.value })}>
            {STATES.map(([v, name]) => (
              <option key={v} value={v}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label style={row}>
          Background{' '}
          <select value={felt ? 'felt' : 'dark'} onChange={(e) => setParams({ bg: e.target.value === 'felt' ? null : 'dark' })}>
            <option value="felt">Board felt</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        {GROUPS.map((g) => (
          <Section key={g.id} title={g.title}>
            {g.keys.map(knob)}
            {g.id === 'icons' && (
              <label style={row}>
                <input type="checkbox" checked={one(q.labels) !== '0'} onChange={(e) => setParams({ labels: e.target.checked ? null : '0' })} /> Show the gray words under each minion
              </label>
            )}
            {g.id === 'caption' && (
              <label style={row}>
                <input type="checkbox" checked={one(q.lcshow) === '1'} onChange={(e) => setParams({ lcshow: e.target.checked ? '1' : null })} /> Show the name (hidden by default)
              </label>
            )}
          </Section>
        ))}
        <button style={{ marginTop: 10 }} onClick={() => router.replace(router.pathname, undefined, { shallow: true })}>
          Reset everything
        </button>
      </aside>
      <div
        onPointerDown={startResize}
        onPointerMove={moveResize}
        onPointerUp={endResize}
        onPointerCancel={endResize}
        onDoubleClick={() => {
          setPanelW(290);
          window.localStorage.removeItem('ccg.minionlab.width');
        }}
        title="Drag to resize the controls; double-click to reset"
        style={{ width: 7, flex: 'none', cursor: 'ew-resize', touchAction: 'none', background: '#3a4052' }}
      />
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '40px 32px',
          background: felt ? 'radial-gradient(ellipse at 50% 42%, #24454a 0%, #162a31 52%, #0a1015 100%)' : '#14161c'
        }}
      >
        <div style={{ zoom, display: 'flex', flexWrap: 'wrap', gap: '36px 28px', justifyContent: 'center', alignContent: 'flex-start' }}>
          {samples.map((s) => (
            <figure key={s.label} style={{ margin: 0, textAlign: 'center' }}>
              <div className={[minionStyles.slot, state ? minionStyles[state] : ''].join(' ')} style={{ margin: '0 auto' }}>
                <MinionFace card={s.card} m={s.m} turn={3} sick={s.sick} />
              </div>
              {one(q.labels) !== '0' && <figcaption style={{ marginTop: 6, color: '#9aa3b8', fontSize: 12 }}>{s.label}</figcaption>}
            </figure>
          ))}
        </div>
      </div>
    </main>
  );
};

export default MinionLab;
