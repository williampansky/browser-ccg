import type { ParsedUrlQuery } from 'querystring';
import { useEffect, useState } from 'react';
import { END_KNOBS } from '../play-board/end-celebration';
import { SWINGS } from '../play-board/hero-swing-tune';
import { ENERGY_COLOURS, MID_KNOBS } from '../play-board/layout-css';
import { one } from './lab-model';
import { labLayout } from './lab-tier';

/**
 * The URL params each accordion section owns, for its Copy / Paste config
 * buttons. (Presets has none.)
 */
const SHADOW_KEYS = ['def', 'rdy', 'sel', 'aim', 'hov'].flatMap((st) =>
  ['y', 'b', 'a'].map((k) => `lsh${st}${k}`),
);
const slotKeys = (n: string) =>
  ['lsf', 'lsg', 'lsj', 'lsm'].map((k) => `${k}_${n}`);
const MID_KEYS = [
  ...MID_KNOBS.map((k) => k.key),
  ...Object.keys(ENERGY_COLOURS).filter((k) => k.startsWith('lmd')),
  'lmdtpv',
  'lmdj',
  'lmdtpos',
  'lmdba',
  'lmdta',
];
const swingKeys = (kind: 'hero' | 'minion') =>
  SWINGS[kind].knobs.map((k) => k.key);
export const SECTION_KEYS: Record<string, string[]> = {
  'hero-swing': swingKeys('hero'),
  'minion-swing': swingKeys('minion'),
  endgame: [
    'leno',
    'lenf',
    'lenbs',
    'lenbc',
    'lenlc',
    'lenol',
    'lenon',
    'lenw',
    'lenm',
    'lenp',
    ...END_KNOBS.map((k) => k.key),
  ],
  middle: MID_KEYS,
  board: ['b0', 'b1', 'e0', 'e1', 'turn'],
  restart: [
    'p0',
    'p1',
    'hn0',
    'hn1',
    'w0',
    'w1',
    'h0',
    'h1',
    'first',
    'herofig',
  ],
  minions: [
    'lm',
    'lg',
    'lml',
    'lms',
    'lmh',
    'lmpv',
    'lpsh',
    'lpss',
    'lpsm',
    'lpsy',
  ],
  shadows: SHADOW_KEYS,
  table: ['ls', 'lw', 'lbx', 'lfelt'],
  hands: [
    'lhw0',
    'lhw1',
    'lhs',
    'lsel',
    'lpv',
    'lhpv',
    'lhrt',
    'lhrt1',
    'lhrt2',
    'lhrt3',
    'lhrt4',
    'lhrt5',
    'lhrt6',
    'lhrt7',
    'lhrt8',
    'lhrt9',
    'lhrt10',
    'lhdp',
    'lhdp1',
    'lhdp2',
    'lhdp3',
    'lhdp4',
    'lhdp5',
    'lhdp6',
    'lhdp7',
    'lhdp8',
    'lhdp9',
    'lhdp10',
    'lhdc',
    'lhsw',
    'lhsh',
    'lhse',
    'lhsx',
    'lhsd',
    'lhspv',
    'lhol',
    'lhol1',
    'lhol2',
    'lhol3',
    'lhol4',
    'lhol5',
    'lhol6',
    'lhol7',
    'lhol8',
    'lhol9',
    'lhol10',
    'lhov',
    'lhoy',
    'lhot',
    'lhom',
    'lhpa',
    'lhpb',
    'lhpm',
    'lhha',
    'lhhs',
    'lhfl',
    'lhsm',
    'lhst',
    'lhdr',
    'lxgh',
    'lxgb',
    'lxga',
    'lxgo',
    'lxgd',
    'lxgk',
    'lxgg',
  ],
  play: [
    'lpoc',
    'lpoo',
    'lpow',
    'lpor',
    'lpoi',
    'lpoh',
    'lpog',
    'lpogw',
    'lpos',
    'lpoga',
    'lpopv',
    'lpoac',
    'lpoahc',
    'lpozc',
    'lpozhc',
    'lpogc',
    'lpoge',
    'lpoao',
    'lpoai',
    'lpoah',
    'lpoahw',
    'lpoahg',
    'lpoat',
    'lpozo',
    'lpozi',
    'lpozh',
    'lpozhw',
    'lpozhg',
    'lpozt',
    'lpogo',
    'lpogb',
    'lpogd',
    'lpogs',
    'lpogp',
    'lpogq',
  ],
  cast: ['lcx', 'lcy', 'lcs', 'lcms', 'lcpeak', 'lcglow', 'lcring', 'lcpv'],
  choose: [
    'lcmw',
    'lcmg',
    'lcmd',
    'lcmt',
    'lcmhs',
    'lcmhl',
    'lcmglow',
    'lcmc',
    'lcmpv',
  ],
  energy: [
    'les',
    'lex',
    'ley',
    'leo',
    'leg',
    'legt',
    'lecs',
    'lecv',
    'lect',
    'lebr',
    'lebb',
    'lebg',
    'lecr',
    'lecb',
    'lecn',
    'lebpv',
  ],
  panels: [
    'lpan',
    'lsplit',
    'lsbw',
    'lsbh',
    'lsbd',
    'lgw',
    'ldw',
    'lgx',
    'lgy',
    'ldx',
    'ldy',
  ],
  logtext: ['lgfs', 'lglh', 'lgft', 'lgpd', 'lgrd', 'lgbg', 'lgfg'],
  logblocks: ['lgsw', 'lgbr', 'lgbp', 'lgis', 'lgico', 'lgcw', 'lgbb', 'lgcc'],
  logchips: [
    'lgsi',
    'lgcm',
    'lgcr',
    'lgnt',
    'lgcd',
    'lgch',
    'lgca',
    'lgcx',
    'lgcb',
    'lgcu',
    'lgsc',
    'lgnc',
  ],
  logbreaks: [
    'lggp',
    'lgtg',
    'lgbw',
    'lgts',
    'lgtw',
    'lgtu',
    'lgbs',
    'lgbc',
    'lgtc',
    'lgtbg',
  ],
  logtest: ['llpv'],
  heroes: [
    'herotype',
    'lfz0',
    'lfz1',
    'lfw0',
    'lfw1',
    'lfx0',
    'lfy0',
    'lfx1',
    'lfy1',
    'lrx0',
    'lry0',
    'lrx1',
    'lry1',
    'lfs',
  ],
  'snd-cardPlay': slotKeys('cardPlay'),
  'snd-draw': slotKeys('draw'),
  'snd-cardHover': slotKeys('cardHover'),
  'snd-hold': slotKeys('hold'),
  'snd-gap': ['lsgap'],
  background: [
    'lbgf',
    'lbgt',
    'lbgm',
    'lbgs',
    'lbgd',
    'lbgb',
    'lbgx',
    'lbgy',
    'lpgcb',
    'lpgc1',
    'lpgc2',
    'lpgc3',
    'lpgw',
    'lpgm',
    'lflc',
    'lflgc',
    'lflrc',
    'lflt',
    'lfla',
    'lflra',
    'lflw',
    'lflr',
    'lfli',
    'lflo',
    'lflx',
    'lfly',
  ],
};

export const SECTION_IDS = [
  'endgame',
  'presets',
  'board',
  'restart',
  'minions',
  'table',
  'middle',
  'hands',
  'play',
  'cast',
  'choose',
  'energy',
  'panels',
  'heroes',
  'snd-cardPlay',
  'snd-draw',
  'snd-cardHover',
  'snd-hold',
  'snd-gap',
  'background',
  'shadows',
];

/**
 * Which accordion sections are open (default: Presets and Board); remembered in
 * localStorage.
 */
export const useLabSections = () => {
  const [sections, setSections] = useState<Record<string, boolean>>({
    presets: true,
    board: true,
  });
  useEffect(() => {
    try {
      const saved = JSON.parse(
        window.localStorage.getItem('ccg.boardlab.sections') ?? 'null',
      );
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
      window.localStorage.setItem(
        'ccg.boardlab.sections',
        JSON.stringify(next),
      );
      return next;
    });

  return { sections, setAllSections, toggleSection };
};

/**
 * What a section's controls hold right now: the URL's values, else /play's
 * saved ones (`labLayout`), as `key=value&...`.
 */
const sectionConfig = (keys: string[], q: ParsedUrlQuery): string => {
  const u = new URLSearchParams();
  keys.forEach((k) => {
    const v = one(q[k]) || labLayout()[k] || '';
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
  /**
   * The section's keys and the lab's URL state, to show Copy / Paste config
   * buttons
   */
  config?: {
    keys: string[];
    q: ParsedUrlQuery;
    setParams: (changes: Record<string, string | null>) => void;
  };
  children: React.ReactNode;
}) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!config) return;
    navigator.clipboard
      ?.writeText(sectionConfig(config.keys, config.q))
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      });
  };
  const paste = () => {
    if (!config) return;
    const text = window.prompt(
      `Paste ${title} config (like lg=33&lm=100); only this section's values are applied`,
    );
    if (!text) return;
    const incoming = new URLSearchParams(text.trim().replace(/^[?&]/, ''));
    const changes: Record<string, string | null> = {};
    config.keys.forEach(
      (k) => incoming.has(k) && (changes[k] = incoming.get(k)),
    );
    config.setParams(changes);
  };
  return (
    <details
      open={open}
      onToggle={(e) =>
        onToggle(id, (e.currentTarget as HTMLDetailsElement).open)
      }
      style={{ borderTop: '1px solid #3a4052', padding: '6px 0' }}
    >
      <summary style={{ cursor: 'pointer', userSelect: 'none' }}>
        <b>{title}</b>{' '}
        <span style={{ color: '#9aa3b8', fontSize: 11 }}>({note})</span>
      </summary>
      {config && (
        <div style={{ margin: '4px 0' }}>
          <button
            onClick={copy}
            title="Copy this section's values as key=value pairs"
          >
            {copied ? 'Copied!' : 'Copy config'}
          </button>{' '}
          <button onClick={paste} title="Paste values for this section">
            Paste config
          </button>
        </div>
      )}
      {children}
    </details>
  );
};

export interface LabSubTab {
  id: string;
  label: string;
  sections: string[];
}

/**
 * The top-level groups: a tab each, with the accordion sections inside it. A
 * tab with `subtabs` shows a second row of buttons and the sections of the
 * chosen sub-tab instead.
 */
export const LAB_TABS: {
  id: string;
  label: string;
  sections: string[];
  subtabs?: LabSubTab[];
}[] = [
  { id: 'setup', label: 'Setup', sections: ['presets', 'board', 'restart'] },
  {
    id: 'board',
    label: 'Board',
    sections: ['minions', 'shadows', 'table', 'middle', 'energy', 'background'],
  },
  { id: 'hand', label: 'Hand', sections: ['hands', 'play', 'cast', 'choose'] },
  {
    id: 'panels',
    label: 'Log/deck',
    sections: [
      'panels',
      'logtext',
      'logblocks',
      'logchips',
      'logbreaks',
      'logtest',
    ],
  },
  { id: 'heroes', label: 'Heroes', sections: ['heroes'] },
  {
    id: 'animations',
    label: 'Animations',
    sections: [],
    subtabs: [
      {
        id: 'hero-attack',
        label: 'Hero attack',
        sections: ['hero-swing-preview', 'hero-swing'],
      },
      {
        id: 'minion-attack',
        label: 'Minion attack',
        sections: ['minion-swing-preview', 'minion-swing'],
      },
    ],
  },
  { id: 'end', label: 'End game', sections: ['endgame'] },
  {
    id: 'sounds',
    label: 'Sounds',
    sections: [
      'snd-cardPlay',
      'snd-draw',
      'snd-cardHover',
      'snd-hold',
      'snd-gap',
    ],
  },
];

/** Which tab is showing; remembered in localStorage. */
export const useLabTab = () => {
  const [tab, setTabState] = useState('setup');
  const [subtab, setSubtabState] = useState('');
  useEffect(() => {
    const saved = window.localStorage.getItem('ccg.boardlab.tab');
    if (saved && LAB_TABS.some((t) => t.id === saved)) setTabState(saved);
    setSubtabState(window.localStorage.getItem('ccg.boardlab.subtab') ?? '');
  }, []);
  const setTab = (id: string) => {
    setTabState(id);
    window.localStorage.setItem('ccg.boardlab.tab', id);
  };
  const setSubtab = (id: string) => {
    setSubtabState(id);
    window.localStorage.setItem('ccg.boardlab.subtab', id);
  };
  return { tab, setTab, subtab, setSubtab };
};

/**
 * The sections to show for a tab: its own, or, for a tab with sub-tabs, those
 * of the chosen sub-tab (the first one if the saved choice no longer exists).
 */
export const sectionsFor = (tabId: string, subtabId: string): string[] => {
  const tab = LAB_TABS.find((t) => t.id === tabId);
  if (!tab?.subtabs) return tab?.sections ?? [];
  const subtab = tab.subtabs.find((s) => s.id === subtabId) ?? tab.subtabs[0];
  return subtab.sections;
};

/** The second row of buttons for a tab with sub-tabs (nothing otherwise). */
export const LabSubTabBar = ({
  tab,
  subtab,
  onSubtab,
}: {
  tab: string;
  subtab: string;
  onSubtab: (id: string) => void;
}) => {
  const subtabs = LAB_TABS.find((t) => t.id === tab)?.subtabs;
  if (!subtabs) return null;
  const current = subtabs.some((s) => s.id === subtab) ? subtab : subtabs[0].id;
  return (
    <div
      role="tablist"
      aria-label="Sub-tabs"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 4,
        margin: '-2px 0 8px 12px',
        paddingLeft: 8,
        borderLeft: '2px solid #3d5afe',
      }}
    >
      {subtabs.map((s) => (
        <button
          key={s.id}
          role="tab"
          aria-selected={current === s.id}
          onClick={() => onSubtab(s.id)}
          style={{
            padding: '2px 9px',
            borderRadius: 12,
            border: '1px solid #3a4052',
            cursor: 'pointer',
            color: '#fff',
            fontSize: 12,
            background: current === s.id ? '#3d5afe' : '#232634',
          }}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
};

export const LabTabBar = ({
  tab,
  onTab,
}: {
  tab: string;
  onTab: (id: string) => void;
}) => (
  <div
    role="tablist"
    style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}
  >
    {LAB_TABS.map((t) => (
      <button
        key={t.id}
        role="tab"
        aria-selected={tab === t.id}
        onClick={() => onTab(t.id)}
        style={{
          padding: '3px 10px',
          borderRadius: 6,
          border: '1px solid #3a4052',
          cursor: 'pointer',
          color: '#fff',
          background: tab === t.id ? '#3d5afe' : '#232634',
        }}
      >
        {t.label}
      </button>
    ))}
  </div>
);
