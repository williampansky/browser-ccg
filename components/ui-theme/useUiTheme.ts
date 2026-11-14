import { useEffect, useState } from 'react';
import { CHANGE_EVENT, DEFAULT_UI_THEME, loadUiTheme, setUiTheme } from './ui-themes';

/** The current interface theme id and a setter; every user of the hook follows a change made anywhere on the page. */
export const useUiTheme = (): [string, (id: string) => void] => {
  // The server render and the first client render both use the default, so hydration matches; the real value follows.
  const [id, setId] = useState(DEFAULT_UI_THEME);
  useEffect(() => {
    setId(loadUiTheme());
    const on = (e: Event) => setId((e as CustomEvent<string>).detail);
    window.addEventListener(CHANGE_EVENT, on);
    return () => window.removeEventListener(CHANGE_EVENT, on);
  }, []);
  return [id, setUiTheme];
};
