import { isMuted } from '../play-board/sounds';
import { uiThemeOf } from './ui-themes';

/**
 * Menu sounds that come from the interface theme's sound folder (`public/sounds/<theme.sfx>/ui_<name>.ogg`). Separate from the board's
 * synthesised game sounds in `play-board/sounds.ts`, but they share its mute switch. A theme with no `sfx` folder is silent.
 */
export type UiSound = 'click' | 'toggleOn' | 'toggleOff' | 'open' | 'close' | 'confirm' | 'cancel' | 'error' | 'select';

const FILE: Record<UiSound, string> = {
  click: 'ui_click',
  toggleOn: 'ui_toggle_on',
  toggleOff: 'ui_toggle_off',
  open: 'ui_panel_open',
  close: 'ui_panel_close',
  confirm: 'ui_confirm',
  cancel: 'ui_cancel',
  error: 'ui_error',
  select: 'ui_choice_select',
};

const VOLUME = 0.5;
const cache = new Map<string, HTMLAudioElement>();

export const uiSoundUrl = (folder: string, sound: UiSound) => `/sounds/${folder}/${FILE[sound]}.ogg`;

const currentThemeId = () => document.documentElement.getAttribute('data-ui-theme');

export const playUiSound = (sound: UiSound): void => {
  if (typeof window === 'undefined' || isMuted()) return;
  const folder = uiThemeOf(currentThemeId()).sfx;
  if (!folder) return;
  const url = uiSoundUrl(folder, sound);
  let base = cache.get(url);
  if (!base) {
    base = new Audio(url);
    base.preload = 'auto';
    cache.set(url, base);
  }
  // A clone, so quick repeats overlap instead of cutting each other off.
  const a = base.cloneNode() as HTMLAudioElement;
  a.volume = VOLUME;
  void a.play().catch(() => undefined); // autoplay rules: a play before any click is simply skipped
};

/**
 * One document-level listener: a click on a button inside any `[data-ui-sfx]` area plays its sound (a switch plays on or off, a disabled
 * button plays the error). Areas opt in, so the board's own buttons stay quiet. Returns the cleanup.
 */
export const installUiSfx = (): (() => void) => {
  const onClick = (e: MouseEvent) => {
    const el = (e.target as Element | null)?.closest?.('button, a[href], [role="switch"], [role="radio"]');
    if (!el || !el.closest('[data-ui-sfx]')) return;
    if (el instanceof HTMLButtonElement && el.disabled) return playUiSound('error');
    const role = el.getAttribute('role');
    // The click runs before React re-renders, so aria-checked still holds the old value.
    if (role === 'switch') return playUiSound(el.getAttribute('aria-checked') === 'true' ? 'toggleOff' : 'toggleOn');
    if (role === 'radio') return playUiSound('select');
    playUiSound('click');
  };
  document.addEventListener('click', onClick, true);
  return () => document.removeEventListener('click', onClick, true);
};
