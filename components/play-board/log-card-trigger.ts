import { useEffect, useState } from 'react';

/**
 * How a card name in the log opens the collection's big card view: a right-click (the default, so a plain click stays free) or a single
 * left-click. A player's choice, kept in this browser; the menu and the log both read it through `useLogCardTrigger`.
 */
export type LogCardTrigger = 'rightClick' | 'click';
const KEY = 'ccg.logCardTrigger.v1';
const EVENT = 'ccg-log-card-trigger';

export const loadLogCardTrigger = (): LogCardTrigger => {
  try {
    return window.localStorage.getItem(KEY) === 'click' ? 'click' : 'rightClick';
  } catch {
    return 'rightClick';
  }
};

export const saveLogCardTrigger = (trigger: LogCardTrigger): void => {
  try {
    window.localStorage.setItem(KEY, trigger);
  } catch {
    /* storage unavailable: the choice just lasts this page view */
  }
  window.dispatchEvent(new Event(EVENT));
};

export const useLogCardTrigger = (): LogCardTrigger => {
  const [trigger, setTrigger] = useState<LogCardTrigger>('rightClick');
  useEffect(() => {
    const read = () => setTrigger(loadLogCardTrigger());
    read();
    window.addEventListener(EVENT, read);
    window.addEventListener('storage', read);
    return () => {
      window.removeEventListener(EVENT, read);
      window.removeEventListener('storage', read);
    };
  }, []);
  return trigger;
};
