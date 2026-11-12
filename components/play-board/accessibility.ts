/**
 * Accessibility mode for /play (off by default): turns the hover `title` tooltips back on, draws a clear keyboard focus
 * outline and shows explicit "Play" buttons after selecting a card. It is the start of a WCAG-friendly mode (ROADMAP), not the whole of it. The choice is kept in localStorage.
 */
const KEY = 'ccg-a11y';

export const isAccessible = (): boolean => {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};

export const setAccessible = (on: boolean): void => {
  try {
    window.localStorage.setItem(KEY, on ? '1' : '0');
  } catch {
    /* storage unavailable: the choice just lasts this page view */
  }
};

/** A `title` that only exists in accessibility mode: `undefined` leaves the attribute off. */
export const titleIf = (on: boolean, text: string | undefined): string | undefined => (on ? text : undefined);
