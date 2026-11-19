import type { ParsedUrlQuery } from 'querystring';
import { useEffect, useState } from 'react';
import { END_KNOBS } from '../play-board/end-celebration';
import { ENERGY_COLOURS, MID_KNOBS, PLAY_LAYOUT } from '../play-board/layout-css';
import { one } from './lab-model';

/** The URL params each accordion section owns, for its Copy / Paste config buttons. (Presets has none.) */
const SHADOW_KEYS = ['def', 'rdy', 'sel', 'aim', 'hov'].flatMap((st) => ['y', 'b', 'a'].map((k) => `lsh${st}${k}`));
const slotKeys = (n: string) => ['lsf', 'lsg', 'lsj', 'lsm'].map((k) => `${k}_${n}`);
const MID_KEYS = [...MID_KNOBS.map((k) => k.key), ...Object.keys(ENERGY_COLOURS).filter((k) => k.startsWith('lmd')), 'lmdtpv', 'lmdj', 'lmdtpos', 'lmdba', 'lmdta'];
export const SECTION_KEYS: Record<string, string[]> = {
  endgame: ['leno', 'lenf', 'lenbs', 'lenbc', 'lenlc', 'lenol', 'lenon', 'lenw', 'lenm', 'lenp', ...END_KNOBS.map((k) => k.key)],
  middle: MID_KEYS,
  board: ['b0', 'b1', 'e0', 'e1', 'turn'],
  restart: ['p0', 'p1', 'hn0', 'hn1', 'w0', 'w1', 'h0', 'h1', 'first', 'herofig'],
  minions: ['lm', 'lg', 'lml', 'lms', 'lmh', 'lmpv', 'lpsh', 'lpss', 'lpsm', 'lpsy'],
  shadows: SHADOW_KEYS,
  table: ['ls', 'lw', 'lfelt'],
  hands: ['lhw0', 'lhw1', 'lhs', 'lsel', 'lpv', 'lhpv', 'lhrt', 'lhdp', 'lhdc', 'lhol', 'lhov', 'lhoy', 'lhot', 'lhom', 'lhpa', 'lhpb', 'lhpm', 'lhha', 'lhhs', 'lhfl', 'lhsm', 'lhst', 'lhdr'],
  play: ['lpoc', 'lpoo', 'lpow', 'lpor', 'lpoi', 'lpoh', 'lpog', 'lpogw', 'lpos', 'lpoga', 'lpopv', 'lpoac', 'lpoahc', 'lpozc', 'lpozhc', 'lpogc', 'lpoge', 'lpoao', 'lpoai', 'lpoah', 'lpoahw', 'lpoahg', 'lpoat', 'lpozo', 'lpozi', 'lpozh', 'lpozhw', 'lpozhg', 'lpozt', 'lpogo', 'lpogb', 'lpogd', 'lpogs', 'lpogp', 'lpogq'],
  cast: ['lcx', 'lcy', 'lcs', 'lcms', 'lcpeak', 'lcglow', 'lcring', 'lcpv'],
  energy: ['les', 'lex', 'ley', 'leo', 'leg', 'legt', 'lecs', 'lecv', 'lect', 'lebr', 'lebb', 'lebg', 'lecr', 'lecb', 'lecn', 'lebpv'],
  panels: ['lpan', 'lsplit', 'lgw', 'ldw', 'lgx', 'lgy', 'ldx', 'ldy'],
  heroes: ['herotype', 'lfw0', 'lfw1', 'lfx0', 'lfy0', 'lfx1', 'lfy1', 'lrx0', 'lry0', 'lrx1', 'lry1', 'lfs'],
  'snd-cardPlay': slotKeys('cardPlay'),
  'snd-draw': slotKeys('draw'),
  'snd-cardHover': slotKeys('cardHover'),
  'snd-hold': slotKeys('hold'),
  'snd-gap': ['lsgap'],
  background: ['lbgf', 'lbgt', 'lbgm', 'lbgs', 'lbgd', 'lbgb', 'lbgx', 'lbgy', 'lpgcb', 'lpgc1', 'lpgc2', 'lpgc3', 'lpgw', 'lpgm', 'lflc', 'lflgc', 'lflrc', 'lflt', 'lfla', 'lflra', 'lflw', 'lflr', 'lfli', 'lflo', 'lflx', 'lfly'],
};

export const SECTION_IDS = ['endgame', 'presets', 'board', 'restart', 'minions', 'table', 'middle', 'hands', 'play', 'cast', 'energy', 'panels', 'heroes', 'snd-cardPlay', 'snd-draw', 'snd-cardHover', 'snd-hold', 'snd-gap', 'background', 'shadows'];

/** Which accordion sections are open (default: Presets and Board); remembered in localStorage. */
export const useLabSections = () => {
  const [sections, setSections] = useState<Record<string, boolean>>({ presets: true, board: true });
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem('ccg.boardlab.sections') ?? 'null');
      if (saved && typeof saved === 'object') setSections(saved);
    } catch {
      /* no saved sections */
    }
  }, []);
  const setAllSections = (open: boolean) => {
    const next = Object.fromEntries(SECTION_IDS.map((id) => [id, open]));
    setSections(next);
    window.localStorage.setItem('ccg.boardlab.sections', JSON.stringify(next));
  };
  const toggleSection = (id: string, isOpen: boolean) =>
    setSections((old) => {
      if (!!old[id] === isOpen) return old;
      const next = { ...old, [id]: isOpen };
      window.localStorage.setItem('ccg.boardlab.sections', JSON.stringify(next));
      return next;
    });

  return { sections, setAllSections, toggleSection };
};

/** What a section's controls hold right now: the URL's values, else /play's saved ones (PLAY_LAYOUT), as `key=value&...`. */
const sectionConfig = (keys: string[], q: ParsedUrlQuery): string => {
  const u = new URLSearchParams();
  keys.forEach((k) => {
    const v = one(q[k]) || PLAY_LAYOUT[k] || '';
    if (v !== '') u.set(k, v);
  });
  return u.toString();
};

export const LabSection = ({
  id,
  title,
  note,
  open,
  onToggle,
  config,
  children,
}: {
  id: string;
  title: string;
  note: string;
  open: boolean;
  onToggle: (id: string, open: boolean) => void;
  /** The section's keys and the lab's URL state, to show Copy / Paste config buttons */
  config?: { keys: string[]; q: ParsedUrlQuery; setParams: (changes: Record<string, string | null>) => void };
  children: React.ReactNode;
}) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!config) return;
    navigator.clipboard?.writeText(sectionConfig(config.keys, config.q)).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    });
  };
  const paste = () => {
    if (!config) return;
    const text = window.prompt(`Paste ${title} config (like lg=33&lm=100); only this section's values are applied`);
    if (!text) return;
    const incoming = new URLSearchParams(text.trim().replace(/^[?&]/, ''));
    const changes: Record<string, string | null> = {};
    config.keys.forEach((k) => incoming.has(k) && (changes[k] = incoming.get(k)));
    config.setParams(changes);
  };
  return (
    <details open={open} onToggle={(e) => onToggle(id, (e.currentTarget as HTMLDetailsElement).open)} style={{ borderTop: '1px solid #3a4052', padding: '6px 0' }}>
      <summary style={{ cursor: 'pointer', userSelect: 'none' }}>
        <b>{title}</b> <span style={{ color: '#9aa3b8', fontSize: 11 }}>({note})</span>
      </summary>
      {config && (
        <div style={{ margin: '4px 0' }}>
          <button onClick={copy} title="Copy this section's values as key=value pairs">{copied ? 'Copied!' : 'Copy config'}</button>{' '}
          <button onClick={paste} title="Paste values for this section">Paste config</button>
        </div>
      )}
      {children}
    </details>
  );
};

/** The top-level groups: a tab each, with the accordion sections inside it. */
export const LAB_TABS: { id: string; label: string; sections: string[] }[] = [
  { id: 'setup', label: 'Setup', sections: ['presets', 'board', 'restart'] },
  { id: 'board', label: 'Board', sections: ['minions', 'shadows', 'table', 'middle', 'energy', 'background'] },
  { id: 'hand', label: 'Hand', sections: ['hands', 'play', 'cast'] },
  { id: 'panels', label: 'Log/deck', sections: ['panels'] },
  { id: 'heroes', label: 'Heroes', sections: ['heroes'] },
  { id: 'end', label: 'End game', sections: ['endgame'] },
  { id: 'sounds', label: 'Sounds', sections: ['snd-cardPlay', 'snd-draw', 'snd-cardHover', 'snd-hold', 'snd-gap'] },
];

/** Which tab is showing; remembered in localStorage. */
export const useLabTab = () => {
  const [tab, setTabState] = useState('setup');
  useEffect(() => {
    const saved = window.localStorage.getItem('ccg.boardlab.tab');
    if (saved && LAB_TABS.some((t) => t.id === saved)) setTabState(saved);
  }, []);
  const setTab = (id: string) => {
    setTabState(id);
    window.localStorage.setItem('ccg.boardlab.tab', id);
  };
  return { tab, setTab };
};

export const LabTabBar = ({ tab, onTab }: { tab: string; onTab: (id: string) => void }) => (
  <div role="tablist" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
    {LAB_TABS.map((t) => (
      <button
        key={t.id}
        role="tab"
        aria-selected={tab === t.id}
        onClick={() => onTab(t.id)}
        style={{ padding: '3px 10px', borderRadius: 6, border: '1px solid #3a4052', cursor: 'pointer', color: '#fff', background: tab === t.id ? '#3d5afe' : '#232634' }}
      >
        {t.label}
      </button>
    ))}
  </div>
);
