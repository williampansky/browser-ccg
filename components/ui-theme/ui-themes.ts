/**
 * Interface themes: the look of the site chrome and the /play menus (panels, buttons, toggles, fields, links, page background). NOT
 * the cards, minions or heroes, and not the player's side colour (that is `ColorTheme` in `player-profile/profile.ts`).
 *
 * How it fits together (see `styles/themes/`):
 *  - The chosen id is set as `data-ui-theme` on `<html>` (any element can carry one, so the theme lab shows them side by side).
 *  - `styles/themes/_<id>.scss` gives that id a set of `--ui-*` custom properties (colours, radii, fonts and optional 9-slice art).
 *  - `styles/site-styles/_ui-kit.scss` has the shared pieces (`ui-panel`, `ui-btn`, `ui-toggle`, ...) that read only those properties.
 * So a new theme is one id here + one SCSS block (+ an art folder and a sound folder if it has any). Nothing else changes.
 */

export interface UiTheme {
  id: string;
  label: string;
  blurb: string;
  /** Folder under `public/sounds/` with this theme's UI sounds (see `ui-sfx.ts`); none means the theme is silent. */
  sfx?: string;
}

/** The first one is the default, and is what a server render and an unknown stored value use. */
export const UI_THEMES: UiTheme[] = [
  { id: 'classic', label: 'Classic', blurb: 'The look the site had before themes: flat slate blue, no art, no sounds.' },
  { id: 'emberhold', label: 'Emberhold', blurb: 'Dark fantasy: gold-trimmed panels and buttons from the Emberhold kit, with its sounds.', sfx: 'emberhold' },
  { id: 'frostforged', label: 'Frostforged', blurb: 'The same kit in steel and ice, with the same sounds.', sfx: 'emberhold' },
];

export const DEFAULT_UI_THEME = UI_THEMES[0].id;

export const uiThemeOf = (id: unknown): UiTheme => UI_THEMES.find((t) => t.id === id) ?? UI_THEMES[0];

export const KEY = 'ccg.uiTheme.v1';
/** A page can force a theme for a quick comparison: `/play?ui=frostforged`. It is saved like a pick. */
export const URL_PARAM = 'ui';
export const CHANGE_EVENT = 'ccg-ui-theme';

export const loadUiTheme = (): string => {
  try {
    return uiThemeOf(window.localStorage.getItem(KEY)).id;
  } catch {
    return DEFAULT_UI_THEME;
  }
};

/** The theme named in a query string (`?ui=...`), or undefined if absent or unknown. */
export const themeFromSearch = (search: string): string | undefined => {
  const v = new URLSearchParams(search).get(URL_PARAM);
  return v && UI_THEMES.some((t) => t.id === v) ? v : undefined;
};

/** Sets the theme on `<html>` (no storage). */
export const applyUiTheme = (id: string): void => {
  if (typeof document !== 'undefined') document.documentElement.setAttribute('data-ui-theme', uiThemeOf(id).id);
};

/** Saves, applies and announces a pick. */
export const setUiTheme = (id: string): void => {
  const clean = uiThemeOf(id).id;
  try {
    window.localStorage.setItem(KEY, clean);
  } catch {
    /* storage unavailable: the pick just lasts this page view */
  }
  applyUiTheme(clean);
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: clean }));
};

/**
 * Runs in `<head>` before the first paint, so a saved theme never flashes the default. Keep it in step with the functions above
 * (a test compares it with them).
 */
export const NO_FLASH_SCRIPT = `(function(){try{var q=new URLSearchParams(location.search).get('${URL_PARAM}');var ids=${JSON.stringify(
  UI_THEMES.map((t) => t.id)
)};var s=localStorage.getItem('${KEY}');var t=ids.indexOf(q)>=0?q:ids.indexOf(s)>=0?s:ids[0];if(ids.indexOf(q)>=0)localStorage.setItem('${KEY}',q);document.documentElement.setAttribute('data-ui-theme',t)}catch(e){}})()`;
