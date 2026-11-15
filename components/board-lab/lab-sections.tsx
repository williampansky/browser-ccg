import { useEffect, useState } from 'react';

export const SECTION_IDS = ['presets', 'board', 'restart', 'minions', 'table', 'hands', 'energy', 'panels', 'heroes', 'sounds', 'background', 'shadows'];

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

export const LabSection = ({ id, title, note, open, onToggle, children }: { id: string; title: string; note: string; open: boolean; onToggle: (id: string, open: boolean) => void; children: React.ReactNode }) => (
  <details open={open} onToggle={(e) => onToggle(id, (e.currentTarget as HTMLDetailsElement).open)} style={{ borderTop: '1px solid #3a4052', padding: '6px 0' }}>
    <summary style={{ cursor: 'pointer', userSelect: 'none' }}>
      <b>{title}</b> <span style={{ color: '#9aa3b8', fontSize: 11 }}>({note})</span>
    </summary>
    {children}
  </details>
);

/** The top-level groups: a tab each, with the accordion sections inside it. */
export const LAB_TABS: { id: string; label: string; sections: string[] }[] = [
  { id: 'setup', label: 'Setup', sections: ['presets', 'board', 'restart'] },
  { id: 'board', label: 'Board', sections: ['minions', 'shadows', 'table', 'energy', 'background'] },
  { id: 'hand', label: 'Hand', sections: ['hands'] },
  { id: 'panels', label: 'Log/deck', sections: ['panels'] },
  { id: 'heroes', label: 'Heroes', sections: ['heroes'] },
  { id: 'sounds', label: 'Sounds', sections: ['sounds'] },
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
