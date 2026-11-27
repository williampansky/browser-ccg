import { useEffect, useState } from 'react';
import { isPhone } from './phone-viewport';
import { readScreen } from './RotatePrompt';

/** The browser's window size lags these events, so measure after a pause. */
const SETTLE_MS = 250;

/** `?device=phone` pretends to be a phone (the board lab's preview uses it). */
export const PHONE_PARAM = 'device';

const detect = (): boolean => {
  const isForced = new URLSearchParams(window.location.search).get(PHONE_PARAM);

  return isForced === 'phone' || isPhone(readScreen());
};

/**
 * Whether this is a phone (a short physical screen), or null until it has been
 * measured. The layout waits for the answer so a phone never flashes the desktop
 * layout.
 */
export const useIsPhone = (): boolean | null => {
  const [isOnPhone, setIsOnPhone] = useState<boolean | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const measure = (): void => setIsOnPhone(detect());
    const settle = (): void => {
      clearTimeout(timer);
      timer = setTimeout(measure, SETTLE_MS);
    };
    measure();
    window.addEventListener('resize', settle);
    window.addEventListener('orientationchange', settle);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', settle);
      window.removeEventListener('orientationchange', settle);
    };
  }, []);

  return isOnPhone;
};
