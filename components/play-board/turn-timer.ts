/**
 * Turn timer for `/play` (a local stand-in: see `turnSeconds` in the engine for why a networked game needs a server-side clock).
 * The option is saved in localStorage and is on by default.
 */
const KEY = 'ccg-turn-timer';

export const isTimerOn = (): boolean => {
  try {
    return typeof window === 'undefined' || window.localStorage.getItem(KEY) !== '0';
  } catch {
    return true;
  }
};

export const setTimerOn = (on: boolean): void => {
  try {
    window.localStorage.setItem(KEY, on ? '1' : '0');
  } catch {
    /* storage unavailable: the choice just lasts this page view */
  }
};

/** Whole seconds left (rounded up, so "0:01" shows until the very end), never below 0. */
export const secondsLeft = (startedAt: number, now: number, limitSeconds: number): number =>
  Math.max(0, Math.ceil(limitSeconds - (now - startedAt) / 1000));

/** 75 -> "1:15", 9 -> "0:09". */
export const formatClock = (seconds: number): string => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
