import { useEffect } from 'react';

/**
 * Marks a tooltip element: `useKeepTipsInViewport` shifts every `[data-tip]`
 * back on screen when the pointer or focus moves.
 */
export const TIP_ATTR = 'data-tip';

/**
 * How far (px) a box must move to sit fully inside the viewport, keeping
 * `margin` px from the edges. The box wins over the margin if it is too big to
 * fit.
 */
export const viewportShift = (
  rect: { left: number; top: number; right: number; bottom: number },
  viewport: { width: number; height: number },
  margin = 8,
): { dx: number; dy: number } => {
  const axis = (lo: number, hi: number, size: number) => {
    if (hi - lo > size - 2 * margin) return -lo + margin; // too big: pin its start
    if (lo < margin) return margin - lo;
    if (hi > size - margin) return size - margin - hi;
    return 0;
  };
  return {
    dx: axis(rect.left, rect.right, viewport.width),
    dy: axis(rect.top, rect.bottom, viewport.height),
  };
};

/**
 * Moves `el` (a tooltip) back inside the window with the individual `translate`
 * property, which stacks with any `transform` the
 * stylesheet uses to centre it. Safe to call again: it undoes its own last
 * shift first. Does nothing for an element that is not laid out.
 */
export const nudgeIntoViewport = (el: HTMLElement, margin = 8): void => {
  el.style.translate = '';
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return;
  const { dx, dy } = viewportShift(
    r,
    {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    },
    margin,
  );
  if (dx || dy) el.style.translate = `${Math.round(dx)}px ${Math.round(dy)}px`;
};

/**
 * Keeps CSS-only tooltips (the ones that appear on :hover / :focus) on screen:
 * after each mouseover or focus change, every
 * `[data-tip]` element is nudged. They are few, so this is cheap, and it needs
 * no per-tooltip wiring beyond the attribute.
 */
export const useKeepTipsInViewport = (): void => {
  useEffect(() => {
    let frame = 0;
    const run = () => {
      cancelAnimationFrame(frame);
      // After the browser has applied the :hover styles that reveal the tip.
      frame = requestAnimationFrame(() =>
        document
          .querySelectorAll<HTMLElement>(`[${TIP_ATTR}]`)
          .forEach((el) => nudgeIntoViewport(el)),
      );
    };
    document.addEventListener('mouseover', run);
    document.addEventListener('focusin', run);
    window.addEventListener('resize', run);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('mouseover', run);
      document.removeEventListener('focusin', run);
      window.removeEventListener('resize', run);
    };
  }, []);
};
