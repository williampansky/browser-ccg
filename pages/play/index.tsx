import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import type { FunctionComponent } from 'react';
import {
  PLAY_LAYOUT,
  buildLayoutCss,
} from '../../components/play-board/layout-css';
import {
  lpanFor,
  useSidebarMode,
} from '../../components/play-board/sidebar-mode';

// The board starts its game from the clock, so it renders on the client only.
const PlayBoard = dynamic(
  () =>
    import('../../components/play-board/PlayBoard').then((m) => m.PlayBoard),
  {
    ssr: false,
  },
);

/**
 * Hot-seat board for the new Hearthstone-style engine (see ROADMAP Milestone
 * 2). The layout is the board lab's saved "wip" preset
 * (`PLAY_LAYOUT`); an `l...` knob in the URL (the lab's names, e.g. `?lw=1000`)
 * overrides one of its values.
 */
const PlayPage: FunctionComponent = () => {
  const { query, isReady } = useRouter();
  const sidebar = useSidebarMode();
  if (!isReady) return null;
  const params: Record<string, string> = { ...PLAY_LAYOUT };
  Object.entries(query).forEach(([k, v]) => {
    if (/^l[a-z0-9]+$/.test(k)) params[k] = Array.isArray(v) ? v[0] : (v ?? '');
  });
  // The player's own choice of connected or separate log and deck (the menu)
  // wins over the saved layout, but not over an `lpan` in the URL.
  if (query.lpan === undefined) {
    const lpan = lpanFor(params.lpan, sidebar);
    if (lpan) params.lpan = lpan;
  }
  return (
    <>
      <style>{buildLayoutCss(params)}</style>
      <PlayBoard />
    </>
  );
};

export default PlayPage;
