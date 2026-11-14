import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { heroes, loadHsCards } from '../engine';

// The real /play board (client only, like /play itself).
const PlayBoard = dynamic(() => import('../components/play-board/PlayBoard').then((m) => m.PlayBoard), { ssr: false });

/**
 * PROTOTYPE page (dev only, not linked): the real /play board, frozen into a setup you choose, with an overlay of layout knobs.
 * Everything is in the URL, so a layout can be shared or bookmarked:
 *  - setup (the same debug params as /play): b0 b1 (board minion ids), turn (0 = player, 1 = enemy; applied live), p0 p1 (hand ids), w0 w1, e0 e1, h0 h1, first, herofig
 *  - layout (CSS overrides over the real stylesheet): lm minion height px, lg minion gap px, ls section gap px, lw table max width px,
 *    lhs hand sink px, lhw0 / lhw1 my hand / enemy hand card width px, lfw0 / lfw1 my / enemy hero figure width px, lfs hero figure side (left|right), lfx0/lfy0/lfx1/lfy1 hero figure X/Y offsets px,
 *    lsel clicked-card scale, lpv=1 previews it on the first card, lpan log/deck arrangement (swap|stackL|stackR), lsplit stacked log share %,
 *    lgw/ldw log/deck width px, les energy bar scale, lex/ley its X/Y offsets px, leo=h horizontal energy bar, lgx/lgy/ldx/ldy their X/Y offsets px, lfelt=0 hides the felt panel
 * Changing a setup param restarts the board (it is a fresh game each time, not a live one); layout knobs apply instantly.
 */
const { cards } = loadHsCards();

type Num = {
  key: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  css: (v: number) => string;
  /** Reads the board's current value for this knob from the DOM (used for the slider's default while no override is set). */
  read: () => number | undefined;
};

const px = (v: string | undefined) => {
  const n = parseFloat(v ?? '');
  return Number.isNaN(n) ? undefined : Math.round(n);
};
const first = (name: string) => document.querySelector<HTMLElement>(`[class*="play-board_${name}__"]`);
const cs = (name: string) => {
  const el = first(name);
  return el ? getComputedStyle(el) : undefined;
};

const CLS = (name: string) => `[class*="play-board_${name}__"]`;
const BAR = '[class*="energy-bar_bar__"]';
const ORBS = '[class*="energy-bar_orbs__"]';

const NUMS: Num[] = [
  { key: 'lm', label: 'Minion height (px)', min: 70, max: 200, css: (v) => `${CLS('row')}{--m-h:${v}px !important}`, read: () => px(cs('row')?.getPropertyValue('--m-h')) },
  { key: 'lg', label: 'Minion gap (px)', min: 0, max: 40, css: (v) => `${CLS('row')}{gap:${v}px !important}`, read: () => px(cs('row')?.columnGap) },
  { key: 'ls', label: 'Section gap (px)', min: 0, max: 60, css: (v) => `${CLS('table')},${CLS('center')}{gap:${v}px !important}`, read: () => px(cs('center')?.rowGap) },
  { key: 'lw', label: 'Table max width (px)', min: 300, max: 2000, step: 10, css: (v) => `${CLS('table')}{max-width:${v}px !important}`, read: () => px(cs('table')?.maxWidth) ?? px(String(first('table')?.offsetWidth)) },
  { key: 'lhs', label: 'Hand sink (px)', min: 0, max: 160, css: (v) => `${CLS('hand')}{--hand-sink:${v}px !important}`, read: () => px(cs('hand')?.getPropertyValue('--hand-sink')) },
  // Your hand: the cards are 144 px wide at zoom 1 (the board computes a smaller zoom to fit a big hand), so width = 144 x zoom.
  { key: 'lhw0', label: 'My hand card width (px)', min: 60, max: 260, css: (v) => `${CLS('hand')}{--hand-zoom:${v / 144} !important}`, read: () => { const z = parseFloat(cs('hand')?.getPropertyValue('--hand-zoom') ?? ''); return Number.isNaN(z) ? undefined : Math.round(z * 144); } },
  // The enemy's hand: card backs (144 x 152 px by default, overlapping by 40 px each side), scaled together.
  { key: 'lhw1', label: 'Enemy hand card width (px)', min: 40, max: 260, css: (v) => `${CLS('cardBack')}{width:${v}px !important;height:${(v * 9.5) / 9}px !important;margin-left:${(-v * 2.5) / 9}px !important;margin-right:${(-v * 2.5) / 9}px !important}`, read: () => px(cs('cardBack')?.width) },
  { key: 'lfw0', label: 'My hero width (px)', min: 110, max: 320, css: (v) => `${CLS('figMe')}{width:${v}px !important;--figW:${v}px !important}`, read: () => px(cs('figMe')?.width) },
  { key: 'lfw1', label: 'Enemy hero width (px)', min: 110, max: 320, css: (v) => `${CLS('figFoe')}{width:${v}px !important;--figW:${v}px !important}`, read: () => px(cs('figFoe')?.width) },
  // Hero figure position: an offset from where /play puts it (via the individual `translate` property, so it composes with the rest).
  { key: 'lfx0', label: 'My hero X offset (px)', min: -2000, max: 2000, css: (v) => `${CLS('figMe')}{--lab-x:${v}px}`, read: () => 0 },
  { key: 'lfy0', label: 'My hero Y offset (px)', min: -2000, max: 2000, css: (v) => `${CLS('figMe')}{--lab-y:${v}px}`, read: () => 0 },
  { key: 'lfx1', label: 'Enemy hero X offset (px)', min: -2000, max: 2000, css: (v) => `${CLS('figFoe')}{--lab-x:${v}px}`, read: () => 0 },
  { key: 'lfy1', label: 'Enemy hero Y offset (px)', min: -2000, max: 2000, css: (v) => `${CLS('figFoe')}{--lab-y:${v}px}`, read: () => 0 },
  // The clicked (selected) hand card: /play scales it 2x (hand zoom on top) and lifts it so it stays on screen.
  { key: 'lsel', label: 'Clicked card scale (x)', min: 1, max: 3, step: 0.05, css: () => '', read: () => 2 },
  // The log and deck panels. Their presets are in `panelCss`; these are size and offset.
  { key: 'lsplit', label: 'Stacked: log share of height (%)', min: 15, max: 85, css: () => '', read: () => 50 },
  { key: 'lgw', label: 'Log width (px)', min: 120, max: 700, css: (v) => `${CLS('log')}{width:${v}px !important}`, read: () => px(cs('log')?.width) },
  { key: 'ldw', label: 'Deck width (px)', min: 120, max: 700, css: (v) => `${CLS('deckView')}{width:${v}px !important}`, read: () => px(cs('deckView')?.width) },
  { key: 'lgx', label: 'Log X offset (px)', min: -2000, max: 2000, css: (v) => `${CLS('log')}{--lab-x:${v}px}`, read: () => 0 },
  { key: 'lgy', label: 'Log Y offset (px)', min: -2000, max: 2000, css: (v) => `${CLS('log')}{--lab-y:${v}px}`, read: () => 0 },
  { key: 'ldx', label: 'Deck X offset (px)', min: -2000, max: 2000, css: (v) => `${CLS('deckView')}{--lab-x:${v}px}`, read: () => 0 },
  { key: 'ldy', label: 'Deck Y offset (px)', min: -2000, max: 2000, css: (v) => `${CLS('deckView')}{--lab-y:${v}px}`, read: () => 0 },
  // The energy bar: scale and an X / Y offset from where /play puts it (just outside the table's right edge).
  { key: 'les', label: 'Energy bar scale (x)', min: 0.5, max: 3, step: 0.05, css: (v) => `${BAR}{scale:${v} !important}`, read: () => 1 },
  { key: 'lex', label: 'Energy bar X offset (px)', min: -2000, max: 2000, css: (v) => `${BAR}{--lab-x:${v}px}`, read: () => 0 },
  { key: 'ley', label: 'Energy bar Y offset (px)', min: -2000, max: 2000, css: (v) => `${BAR}{--lab-y:${v}px}`, read: () => 0 }
];

const SETUP_KEYS = ['b0', 'b1', 'p0', 'p1', 'w0', 'w1', 'e0', 'e1', 'h0', 'h1', 'first', 'herofig', 'turn'];
/** The setup params that need a new game (heroes are chosen at deal time, hands are dealt). Boards and energy are applied live. */
const RESTART_KEYS = ['p0', 'p1', 'w0', 'w1', 'h0', 'h1', 'first', 'herofig'];
const HEROES = ['', ...heroes().map((h) => h.id), 'none'];

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

const BoardLab = () => {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const q = router.query;

  // The overlay's position (top-left corner, px); null = docked top right. Dragged by its header, remembered in localStorage.
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem('ccg.boardlab.pos') ?? 'null');
      if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') setPos(saved);
    } catch {
      /* no saved position */
    }
  }, []);
  // Which accordion sections are open (default: just "Board"); remembered in localStorage.
  const [sections, setSections] = useState<Record<string, boolean>>({ presets: true, board: true });
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem('ccg.boardlab.sections') ?? 'null');
      if (saved && typeof saved === 'object') setSections(saved);
    } catch {
      /* no saved sections */
    }
  }, []);
  const toggleSection = (id: string, isOpen: boolean) =>
    setSections((old) => {
      if (!!old[id] === isOpen) return old;
      const next = { ...old, [id]: isOpen };
      window.localStorage.setItem('ccg.boardlab.sections', JSON.stringify(next));
      return next;
    });

  // Presets: a name plus a saved URL param string (everything, or only the layout params: all of them start with "l").
  // Loading one replaces the URL; the board restarts only if a restart-needing param (heroes, hand) differs.
  type Preset = { name: string; qs: string; layoutOnly: boolean };
  const PRESET_KEY = 'ccg.boardlab.presets';
  const [presets, setPresets] = useState<Preset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [layoutOnly, setLayoutOnly] = useState(false);
  const [prevQs, setPrevQs] = useState<string | null>(null); // the URL before the last load, for the A/B flip
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(PRESET_KEY) ?? '[]');
      if (Array.isArray(saved)) setPresets(saved.filter((x) => x && typeof x.name === 'string' && typeof x.qs === 'string'));
    } catch {
      /* no saved presets */
    }
  }, []);
  const storePresets = (next: Preset[]) => {
    setPresets(next);
    window.localStorage.setItem(PRESET_KEY, JSON.stringify(next));
  };
  const qsOf = (only: boolean) => {
    const u = new URLSearchParams();
    Object.entries(router.query)
      .filter(([k]) => !only || k.startsWith('l'))
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .forEach(([k, v]) => u.set(k, Array.isArray(v) ? v[0] : (v ?? '')));
    return u.toString();
  };
  const applyQs = (qs: string, only: boolean) => {
    setPrevQs(qsOf(false));
    const next: Record<string, string> = {};
    if (only) Object.entries(router.query).forEach(([k, v]) => !k.startsWith('l') && (next[k] = Array.isArray(v) ? v[0] : (v ?? '')));
    new URLSearchParams(qs).forEach((v, k) => (next[k] = v));
    router.replace({ pathname: router.pathname, query: next }, undefined, { shallow: true });
  };
  const savePreset = (name: string, only: boolean) => {
    const n = name.trim();
    if (!n) return;
    const entry = { name: n, qs: qsOf(only), layoutOnly: only };
    storePresets(presets.some((x) => x.name === n) ? presets.map((x) => (x.name === n ? entry : x)) : [...presets, entry]);
    setPresetName('');
  };
  const exportPresets = () => navigator.clipboard?.writeText(JSON.stringify(presets, null, 1));
  const importPresets = () => {
    const text = window.prompt('Paste presets JSON (same names are replaced)');
    if (!text) return;
    try {
      const incoming = JSON.parse(text);
      if (!Array.isArray(incoming)) throw new Error('not a list');
      const ok: Preset[] = incoming.filter((x) => x && typeof x.name === 'string' && typeof x.qs === 'string').map((x) => ({ name: x.name, qs: x.qs, layoutOnly: !!x.layoutOnly }));
      storePresets([...presets.filter((x) => !ok.some((y) => y.name === x.name)), ...ok]);
    } catch {
      window.alert('That is not a presets list.');
    }
  };

  // What the board uses when a knob has no override: measured from the DOM, so an untouched slider sits at the real default.
  const [defaults, setDefaults] = useState<Record<string, number>>({});
  useEffect(() => {
    const measure = () =>
      setDefaults((old) => {
        const next = { ...old };
        let changed = false;
        NUMS.forEach((n) => {
          if (one(router.query[n.key]) !== '') return; // overridden: keep the last default we saw
          const v = n.read();
          if (v !== undefined && next[n.key] !== v) {
            next[n.key] = v;
            changed = true;
          }
        });
        return changed ? next : old;
      });
    measure();
    const t = setInterval(measure, 400); // the board mounts late and resizes with the window
    return () => clearInterval(t);
  }, [router.query]);
  const clamp = (x: number, y: number) => ({
    x: Math.min(Math.max(0, x), Math.max(0, window.innerWidth - 60)),
    y: Math.min(Math.max(0, y), Math.max(0, window.innerHeight - 30))
  });
  const startDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const r = boxRef.current!.getBoundingClientRect();
    drag.current = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const moveDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current) setPos(clamp(e.clientX - drag.current.dx, e.clientY - drag.current.dy));
  };
  const endDrag = () => {
    if (!drag.current) return;
    drag.current = null;
    if (pos) window.localStorage.setItem('ccg.boardlab.pos', JSON.stringify(pos));
  };

  // A stable list of real CORE minions to build boards from.
  const minionIds = useMemo(
    () => cards.filter((c) => c.source === 'core' && !c.isToken && c.type === 'minion' && c.name).map((c) => c.id),
    []
  );
  const pick = (n: number, offset: number) =>
    Array.from({ length: n }, (_, i) => minionIds[(i * 7 + offset) % minionIds.length]).join(',');

  const setParams = (changes: Record<string, string | null>) => {
    const next: Record<string, string | string[] | undefined> = { ...router.query };
    Object.entries(changes).forEach(([k, v]) => (v === null || v === '' ? delete next[k] : (next[k] = v)));
    router.replace({ pathname: router.pathname, query: next }, undefined, { shallow: true });
  };

  // First visit with no setup in the URL: a full-looking board, you going first, the figure heroes.
  useEffect(() => {
    if (!router.isReady) return;
    if (SETUP_KEYS.some((k) => k in router.query)) return;
    setParams({ first: '0', b0: pick(4, 1), b1: pick(3, 2), h0: heroes()[0].id, h1: heroes()[1].id, herofig: '1' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  // Log / deck presets. Stacked: both in one column (left or right), each scrolling on its own, sharing the height by `lsplit`.
  const preset = one(q.lpan);
  const split = Math.min(85, Math.max(15, +one(q.lsplit) || 50)) / 100;
  const stackSide = (left: boolean) =>
    `${left ? 'left:1rem !important;right:auto !important' : 'right:1rem !important;left:auto !important'}`;
  const panelCss =
    preset === 'swap'
      ? `${CLS('log')}{left:auto !important;right:1rem !important}${CLS('deckView')}{right:auto !important;left:1rem !important}`
      : preset === 'stackL' || preset === 'stackR'
        ? `${CLS('log')}{${stackSide(preset === 'stackL')};top:1rem !important;bottom:auto !important;height:calc((100vh - 3rem) * ${split}) !important}` +
          `${CLS('deckView')}{${stackSide(preset === 'stackL')};top:calc(1rem + (100vh - 3rem) * ${split} + 1rem) !important;bottom:1rem !important;height:auto !important}`
        : '';
  // Offsets (hero figures and panels) ride on --lab-x / --lab-y so X and Y can be set separately.
  const offsetCss = [CLS('figMe'), CLS('figFoe'), CLS('log'), CLS('deckView'), BAR]
    .map((sel) => `${sel}{translate:var(--lab-x,0px) var(--lab-y,0px) !important}`)
    .join('');
  // The clicked card's size. `lpv` previews it on the first card in hand without clicking.
  const sel = Math.min(3, Math.max(1, +one(q.lsel) || 2));
  const selTransform = `transform:translate(var(--x),calc(var(--y-comp) + (${-(110 * sel + 5)}px + var(--hand-sink)) * var(--zoom))) rotate(0deg) scale(calc(${sel} * var(--zoom))) !important`;
  const slotSel = `${CLS('handSlot')}${CLS('slotSelected')}`;
  const selCss =
    (one(q.lsel) ? `${slotSel},${slotSel}:hover{${selTransform}}` : '') +
    (one(q.lpv) ? `${CLS('handSlot')}:nth-child(1){${selTransform};z-index:20 !important;filter:drop-shadow(0 0 8px #ffd45e) drop-shadow(0 0 3px #ffd45e) !important}` : '');

  const css = [
    panelCss,
    // Horizontal energy bar: the orbs were listed bottom-first for the column, so row-reverse puts the first one on the left.
    one(q.leo) === 'h' ? `${ORBS}{flex-direction:row-reverse !important}` : '',
    offsetCss,
    selCss,
    ...NUMS.filter((n) => one(q[n.key]) !== '' && !Number.isNaN(+one(q[n.key]))).map((n) => n.css(+one(q[n.key]))),
    one(q.lfs) === 'right' ? `${CLS('figSlot')}{left:auto !important;right:0.5rem !important}` : '',
    one(q.lfelt) === '0' ? `${CLS('table')}::before{display:none !important}` : ''
  ].join('\n');

  const boardKey = RESTART_KEYS.map((k) => one(q[k])).join('|');
  const ids = (k: string) => one(q[k]).split(',').filter(Boolean);
  const energy = (k: string) => (one(q[k]) === '' || Number.isNaN(+one(q[k])) ? undefined : Math.min(10, Math.max(0, +one(q[k]))));
  const lab = {
    boards: { '0': ids('b0'), '1': ids('b1') },
    energy: { '0': energy('e0'), '1': energy('e1') },
    active: (one(q.turn) === '0' || one(q.turn) === '1' ? one(q.turn) : undefined) as '0' | '1' | undefined
  };
  const count = (k: string) => (one(q[k]) ? one(q[k]).split(',').length : 0);

  if (!router.isReady) return null;

  const row = { display: 'block', margin: '6px 0' } as const;
  const wide = { display: 'block', width: '100%' } as const;
  // A render helper, not a component: a component defined here would remount (and drop a slider drag) on every render.
  const section = (id: string, title: string, note: string, children: React.ReactNode) => (
    <details key={id} open={!!sections[id]} onToggle={(e) => toggleSection(id, (e.currentTarget as HTMLDetailsElement).open)} style={{ borderTop: '1px solid #3a4052', padding: '6px 0' }}>
      <summary style={{ cursor: 'pointer', userSelect: 'none' }}>
        <b>{title}</b> <span style={{ color: '#9aa3b8', fontSize: 11 }}>({note})</span>
      </summary>
      {children}
    </details>
  );
  const sliders = (keys: string[]) =>
    NUMS.filter((n) => keys.includes(n.key)).map((n) => {
      const raw = one(q[n.key]);
      return (
        <label key={n.key} style={row}>
          {n.label}: <b>{raw || (defaults[n.key] ?? '...')}</b>{!raw && defaults[n.key] !== undefined && <span style={{ color: '#9aa3b8' }}> (default)</span>}
          {raw && <a style={{ marginLeft: 6, cursor: 'pointer', color: '#7aa2ff' }} onClick={() => setParams({ [n.key]: null })}>reset</a>}
          <input type="range" min={Math.min(n.min, defaults[n.key] ?? n.min)} max={Math.max(n.max, defaults[n.key] ?? n.max)} step={n.step ?? 1} value={raw || (defaults[n.key] ?? n.min)} style={wide}
            onChange={(e) => setParams({ [n.key]: e.target.value })} />
        </label>
      );
    });
  const box = { position: 'fixed', zIndex: 2000, ...(pos ? { left: pos.x, top: pos.y } : { top: 8, right: 8 }), font: '13px system-ui, sans-serif', color: '#e8eaf2' } as const;
  return (
    <>
      <style>{css}</style>
      <PlayBoard key={boardKey} lab={lab} />
      <div ref={boxRef} style={box}>
        <div
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onDoubleClick={() => {
            setPos(null);
            window.localStorage.removeItem('ccg.boardlab.pos');
          }}
          title="Drag to move; double-click to dock top right"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '4px 6px 4px 10px', borderRadius: 6, border: '1px solid #3a4052', background: '#232634', cursor: 'grab', touchAction: 'none', userSelect: 'none' }}
        >
          <span>⠿ Board lab</span>
          <button
            onClick={() => setOpen(!open)}
            style={{ padding: '2px 8px', borderRadius: 4, border: '1px solid #3a4052', background: '#14161c', color: '#fff', cursor: 'pointer' }}
          >
            {open ? 'Hide' : 'Show'}
          </button>
        </div>
        {open && (
          <div
            style={{
              marginTop: 6,
              width: 250,
              maxHeight: pos ? `calc(100vh - ${pos.y + 50}px)` : 'calc(100vh - 60px)',
              overflow: 'auto',
              padding: 12,
              borderRadius: 10,
              border: '1px solid #3a4052',
              background: 'rgba(20,22,28,0.94)',
              boxShadow: '0 6px 24px #000a'
            }}
          >
            {section('presets', 'Presets', 'saved in this browser', <>
              <div style={row}>
                <input
                  placeholder="Preset name"
                  value={presetName}
                  style={{ width: 130 }}
                  onChange={(e) => setPresetName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && savePreset(presetName, layoutOnly)}
                />{' '}
                <button disabled={!presetName.trim()} onClick={() => savePreset(presetName, layoutOnly)}>Save</button>
              </div>
              <label style={row}>
                <input type="checkbox" checked={layoutOnly} onChange={(e) => setLayoutOnly(e.target.checked)} /> Layout only (keeps whatever board you have)
              </label>
              {presets.length === 0 && <div style={{ color: '#9aa3b8', fontSize: 11 }}>None yet. Save the current URL to compare it later.</div>}
              {presets.map((pr) => {
                const active = qsOf(pr.layoutOnly) === pr.qs;
                return (
                  <div key={pr.name} style={{ display: 'flex', alignItems: 'center', gap: 4, margin: '4px 0' }}>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: active ? 700 : 400, color: active ? '#8ff0a4' : undefined }} title={pr.qs}>
                      {pr.name}
                      {pr.layoutOnly && <span style={{ color: '#9aa3b8', fontSize: 10 }}> layout</span>}
                    </span>
                    <button onClick={() => applyQs(pr.qs, pr.layoutOnly)}>Load</button>
                    <button title="Overwrite this preset with the current URL" onClick={() => savePreset(pr.name, pr.layoutOnly)}>Update</button>
                    <button title="Delete" onClick={() => storePresets(presets.filter((x) => x.name !== pr.name))}>✕</button>
                  </div>
                );
              })}
              <div style={row}>
                <button disabled={prevQs === null} title="Go back to the URL from before the last Load (press again to come back)" onClick={() => prevQs !== null && applyQs(prevQs, false)}>
                  Flip A/B
                </button>{' '}
                <button onClick={exportPresets}>Export</button> <button onClick={importPresets}>Import</button>
              </div>
            </>)}
            {section('board', 'Board', 'live', <>
              <label style={row}>
                My minions: <b>{count('b0')}</b>
                <input type="range" min={0} max={7} value={count('b0')} style={wide}
                  onChange={(e) => setParams({ b0: +e.target.value ? pick(+e.target.value, 1) : null })} />
              </label>
              <label style={row}>
                Their minions: <b>{count('b1')}</b>
                <input type="range" min={0} max={7} value={count('b1')} style={wide}
                  onChange={(e) => setParams({ b1: +e.target.value ? pick(+e.target.value, 2) : null })} />
              </label>
              <div style={row}>
                Turn{' '}
                {([['0', 'Player'], ['1', 'Enemy']] as const).map(([v, name]) => (
                  <button
                    key={v}
                    onClick={() => setParams({ turn: v })}
                    style={{ marginRight: 4, padding: '3px 10px', borderRadius: 6, border: '1px solid #3a4052', cursor: 'pointer', color: '#fff', background: one(q.turn) === v ? '#3d5afe' : '#232634' }}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <label style={row}>
                Energy (mine) <input type="number" min={0} max={10} style={{ width: 50 }} value={one(q.e0)} onChange={(e) => setParams({ e0: e.target.value })} />
              </label>
            </>)}
            {section('restart', 'Heroes and hand', 'restarts the board, same deck each time', <>
              {(['h0', 'h1'] as const).map((k) => (
                <label key={k} style={row}>
                  {k === 'h0' ? 'My hero' : 'Their hero'}{' '}
                  <select value={one(q[k])} onChange={(e) => setParams({ [k]: e.target.value })}>
                    {HEROES.map((h) => <option key={h} value={h}>{h || 'default'}</option>)}
                  </select>
                </label>
              ))}
              <label style={row}>
                <input type="checkbox" checked={'herofig' in q} onChange={(e) => setParams({ herofig: e.target.checked ? '1' : null })} /> Hero figure UI
              </label>
              <label style={row}>
                My hand ids <input style={{ width: '100%' }} placeholder="CORE_045,CORE_051" value={one(q.p0)} onChange={(e) => setParams({ p0: e.target.value })} />
              </label>
            </>)}
            {section('minions', 'Minions', 'live', <>{sliders(['lm', 'lg'])}</>)}
            {section('table', 'Table', 'live', <>
              {sliders(['ls', 'lw'])}
              <label style={row}>
                <input type="checkbox" checked={one(q.lfelt) !== '0'} onChange={(e) => setParams({ lfelt: e.target.checked ? null : '0' })} /> Felt panel
              </label>
            </>)}
            {section('hands', 'Hands', 'live', <>
              {sliders(['lhw0', 'lhw1', 'lhs', 'lsel'])}
              <label style={row}>
                <input type="checkbox" checked={'lpv' in q} onChange={(e) => setParams({ lpv: e.target.checked ? '1' : null })} /> Preview clicked card (first card)
              </label>
            </>)}
            {section('energy', 'Energy bar', 'live', <>
              <div style={row}>
                Orientation{' '}
                {([['v', 'Vertical'], ['h', 'Horizontal']] as const).map(([v, name]) => (
                  <button
                    key={v}
                    onClick={() => setParams({ leo: v === 'v' ? null : v })}
                    style={{ marginRight: 4, padding: '3px 10px', borderRadius: 6, border: '1px solid #3a4052', cursor: 'pointer', color: '#fff', background: (one(q.leo) === 'h') === (v === 'h') ? '#3d5afe' : '#232634' }}
                  >
                    {name}
                  </button>
                ))}
              </div>
              {sliders(['les', 'lex', 'ley'])}
            </>)}
            {section('panels', 'Log and deck', 'live', <>
              <label style={row}>
                Arrangement{' '}
                <select value={one(q.lpan) || 'default'} onChange={(e) => setParams({ lpan: e.target.value === 'default' ? null : e.target.value })}>
                  <option value="default">Log left, deck right</option>
                  <option value="swap">Deck left, log right</option>
                  <option value="stackL">Stacked on the left</option>
                  <option value="stackR">Stacked on the right</option>
                </select>
              </label>
              {sliders(['lsplit', 'lgw', 'ldw', 'lgx', 'lgy', 'ldx', 'ldy'])}
            </>)}
            {section('heroes', 'Hero figures', 'live', <>
              {sliders(['lfw0', 'lfw1', 'lfx0', 'lfy0', 'lfx1', 'lfy1'])}
              <label style={row}>
                Figure side{' '}
                <select value={one(q.lfs) || 'left'} onChange={(e) => setParams({ lfs: e.target.value === 'left' ? null : e.target.value })}>
                  <option value="left">left</option>
                  <option value="right">right</option>
                </select>
              </label>
            </>)}
            <button onClick={() => router.replace(router.pathname, undefined, { shallow: true })} style={{ marginTop: 8 }}>
              Reset everything
            </button>
            <p style={{ color: '#9aa3b8', fontSize: 11 }}>The URL holds all of it: copy it to keep a layout.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default BoardLab;
