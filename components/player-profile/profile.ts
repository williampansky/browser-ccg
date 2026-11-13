/**
 * The player's profile: a display name and a colour theme. Stored in this browser's localStorage for now (one load / save pair,
 * so swapping in accounts later means replacing `loadProfile` and `saveProfile` and nothing else). The profile is only ever
 * read through `normalizeProfile`, so a hand-edited or old value can never break the board.
 */

export interface ColorTheme {
  id: string;
  label: string;
  /** The side colour: the hero bar's ring and glow, the log name, the "your turn" highlight */
  color: string;
}

export const THEMES: ColorTheme[] = [
  { id: 'green', label: 'Green', color: '#5fd16a' },
  { id: 'blue', label: 'Blue', color: '#5aa9ff' },
  { id: 'purple', label: 'Purple', color: '#b48cff' },
  { id: 'pink', label: 'Pink', color: '#ff7eb6' },
  { id: 'orange', label: 'Orange', color: '#ffa545' },
  { id: 'gold', label: 'Gold', color: '#ffd45e' },
  { id: 'teal', label: 'Teal', color: '#3fd6c6' },
  { id: 'red', label: 'Red', color: '#ff7b7b' },
];

export interface PlayerProfile {
  name: string;
  /** A `ColorTheme.id` */
  theme: string;
}

export const MAX_NAME_LENGTH = 20;
export const DEFAULT_NAME = 'Player 1';
export const DEFAULT_PROFILE: PlayerProfile = { name: DEFAULT_NAME, theme: 'green' };
/** The opponent's colour unless the player picked it, then the next best. */
const FOE_THEME = 'red';
const FOE_THEME_IF_RED = 'blue';

/** A name as it is shown: control characters and extra spaces removed, trimmed, at most `MAX_NAME_LENGTH`; empty becomes the default. */
export const cleanName = (raw: unknown): string => {
  const s = typeof raw === 'string' ? raw.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LENGTH).trim() : '';
  return s || DEFAULT_NAME;
};

export const themeOf = (id: unknown): ColorTheme => THEMES.find((t) => t.id === id) ?? THEMES[0];

/** Any stored value as a valid profile (a missing or unknown field falls back to the default). */
export const normalizeProfile = (raw: unknown): PlayerProfile => {
  const o = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  return { name: cleanName(o.name), theme: themeOf(o.theme).id };
};

/** The opponent's side colour: red, or blue when the player chose red (so the two sides never match). */
export const foeTheme = (mine: string): ColorTheme => themeOf(mine === FOE_THEME ? FOE_THEME_IF_RED : FOE_THEME);

/** Log markup names a player `Player 1` / `Player 2`; this shows the profile's name for Player 1 (and leaves anything else alone). */
export const logName = (markup: string, myName: string): string => (markup === 'Player 1' ? myName : markup);

const KEY = 'ccg.profile.v1';

export const loadProfile = (): PlayerProfile => {
  try {
    return normalizeProfile(JSON.parse(window.localStorage.getItem(KEY) ?? 'null'));
  } catch {
    return DEFAULT_PROFILE;
  }
};

export const saveProfile = (profile: PlayerProfile): void => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(normalizeProfile(profile)));
  } catch {
    /* storage unavailable: the profile just lasts this page view */
  }
};
