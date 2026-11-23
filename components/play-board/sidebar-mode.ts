import { useEffect, useState } from 'react';
import { PLAY_LAYOUT } from './layout-css';

/**
 * Whether /play shows the log and the deck as two separate panels or as one
 * connected sidebar with a drag bar between them (the choice is a
 * player's, kept in this browser). `null` = the saved layout's own
 * (`PLAY_LAYOUT.lpan`). The page and the menu both read it through
 * `useSidebarMode`, and `saveSidebarMode` tells every listener.
 */
export type SidebarMode = 'connected' | 'separate';
const KEY = 'ccg.sidebar.v1';
const EVENT = 'ccg-sidebar';

export const loadSidebarMode = (): SidebarMode | null => {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === 'connected' || v === 'separate' ? v : null;
  } catch {
    return null;
  }
};

export const saveSidebarMode = (mode: SidebarMode): void => {
  try {
    window.localStorage.setItem(KEY, mode);
  } catch {
    /* storage unavailable: the choice just lasts this page view */
  }
  window.dispatchEvent(new Event(EVENT));
};

export const useSidebarMode = (): SidebarMode | null => {
  const [mode, setMode] = useState<SidebarMode | null>(null);
  useEffect(() => {
    const read = () => setMode(loadSidebarMode());
    read();
    window.addEventListener(EVENT, read);
    window.addEventListener('storage', read);
    return () => {
      window.removeEventListener(EVENT, read);
      window.removeEventListener('storage', read);
    };
  }, []);
  return mode;
};

const isJoin = (lpan: string | undefined) =>
  lpan === 'joinL' || lpan === 'joinR';

/**
 * What the menu should show: the player's choice, else what the saved layout
 * does.
 */
export const effectiveSidebarMode = (mode: SidebarMode | null): SidebarMode =>
  mode ?? (isJoin(PLAY_LAYOUT.lpan) ? 'connected' : 'separate');

/**
 * The `lpan` /play should use: the saved one, changed to match the player's
 * choice. Connected goes on the side the saved layout already
 * stacks or joins on (the right unless it says left); separate undoes a saved
 * connected one into the matching stacked arrangement.
 */
export const lpanFor = (
  saved: string | undefined,
  mode: SidebarMode | null,
): string | undefined => {
  const left = saved === 'stackL' || saved === 'joinL';
  if (mode === 'connected') return left ? 'joinL' : 'joinR';
  if (mode === 'separate' && isJoin(saved)) return left ? 'stackL' : 'stackR';
  return saved;
};
