import { useRouter } from 'next/router';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  buildTieredLayoutCss,
  layoutForTier,
  type LayoutTier,
} from './layout-css';
import { PhoneFit } from './RotatePrompt';
import { lpanFor, useSidebarMode } from './sidebar-mode';
import { useIsPhone } from './use-is-phone';

/**
 * The saved board layout (`PLAY_LAYOUT`, the board lab's "wip" preset) as a
 * style block around a play screen. An `l...` knob in the URL (the lab's
 * names, e.g. `?lw=1000`) overrides one of its values.
 */
export const PlayLayout = ({ children }: { children: ReactNode }) => {
  const { query, isReady } = useRouter();
  const sidebar = useSidebarMode();
  const isPhone = useIsPhone();

  // The stylesheet's popup rules for a phone key off this (see the scss).
  useEffect(() => {
    if (isPhone) document.documentElement.setAttribute('data-phone', '');
    else document.documentElement.removeAttribute('data-phone');

    return () => document.documentElement.removeAttribute('data-phone');
  }, [isPhone]);

  if (!isReady || isPhone === null) return null;
  const overrides: Record<string, string> = {};
  Object.entries(query).forEach(([key, value]) => {
    if (/^l[a-z0-9]+$/.test(key))
      overrides[key] = Array.isArray(value) ? value[0] : (value ?? '');
  });
  // The player's own choice of connected or separate log and deck (the menu)
  // wins over the saved layout, but not over an `lpan` in the URL.
  const resolve = (tier: LayoutTier): Record<string, string> => {
    const params = { ...layoutForTier(tier), ...overrides };
    if (query.lpan === undefined) {
      const lpan = lpanFor(params.lpan, sidebar);
      if (lpan) params.lpan = lpan;
    }

    return params;
  };

  return (
    <>
      <style>{buildTieredLayoutCss(resolve, isPhone)}</style>
      <PhoneFit />
      {children}
    </>
  );
};
