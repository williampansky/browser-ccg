import { useEffect, useState } from 'react';

export const SECTION_IDS = ['presets', 'board', 'restart', 'minions', 'table', 'hands', 'energy', 'panels', 'heroes', 'sounds'];

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
