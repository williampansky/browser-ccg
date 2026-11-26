import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import { PLAY_LAYOUT, buildLayoutCss } from './layout-css';
import { lpanFor, useSidebarMode } from './sidebar-mode';

/**
 * The saved board layout (`PLAY_LAYOUT`, the board lab's "wip" preset) as a
 * style block around a play screen. An `l...` knob in the URL (the lab's
 * names, e.g. `?lw=1000`) overrides one of its values.
 */
export const PlayLayout = ({ children }: { children: ReactNode }) => {
  const { query, isReady } = useRouter();
  const sidebar = useSidebarMode();
  if (!isReady) return null;
  const params: Record<string, string> = { ...PLAY_LAYOUT };
  Object.entries(query).forEach(([key, value]) => {
    if (/^l[a-z0-9]+$/.test(key))
      params[key] = Array.isArray(value) ? value[0] : (value ?? '');
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
      {children}
    </>
  );
};
