import { useEffect, useState } from 'react';
import type { CSSProperties, ReactElement } from 'react';
import {
  boardViewportContent,
  isPhone,
  NORMAL_VIEWPORT,
} from './phone-viewport';
import type { PhoneScreen } from './phone-viewport';

/** The browser's window size lags these events, so measure after a pause. */
const SETTLE_MS = 250;
const DEBUG_TEXT_PX = 14;

export const readScreen = (): PhoneScreen => {
  const { width, height } = window.screen;

  return {
    shortSide: Math.min(width, height),
    aspect: window.innerWidth / window.innerHeight,
    isPortrait: window.matchMedia('(orientation: portrait)').matches,
  };
};

const setViewport = (content: string): void => {
  let tag = document.querySelector('meta[name="viewport"]');

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', 'viewport');
    document.head.appendChild(tag);
  }

  if (tag.getAttribute('content') !== content) {
    tag.setAttribute('content', content);
  }
};

const overlay: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  textAlign: 'center',
  fontSize: '1.25rem',
  color: '#fff',
  background: 'rgb(20 22 32 / 97%)',
};

/**
 * On a phone, scales the board screens to fit (see `boardViewportContent`) and
 * asks for landscape while the phone is held upright. Renders nothing
 * elsewhere. `?mdebug=1` shows the numbers it worked from.
 */
export const PhoneFit = (): ReactElement | null => {
  const [isUpright, setIsUpright] = useState(false);
  const [debug, setDebug] = useState('');
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const apply = (): void => {
      const screen = readScreen();
      const isOnPhone = isPhone(screen);
      const content = boardViewportContent(screen);
      const { innerWidth, innerHeight } = window;
      const { width, height } = window.screen;
      setViewport(content);
      setIsUpright(isOnPhone && screen.isPortrait);
      // How much smaller the page draws than real pixels.
      setScale(isOnPhone && !screen.isPortrait ? innerWidth / width : 1);

      if (window.location.search.includes('mdebug=1')) {
        setDebug(
          `inner ${innerWidth}x${innerHeight} screen ${width}x${height} ` +
            `aspect ${screen.aspect.toFixed(2)} ${content}`,
        );
      }
    };

    let timer: ReturnType<typeof setTimeout> | undefined;
    const applyWhenSettled = (): void => {
      clearTimeout(timer);
      timer = setTimeout(apply, SETTLE_MS);
    };

    apply();
    window.addEventListener('orientationchange', applyWhenSettled);
    window.addEventListener('resize', applyWhenSettled);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('orientationchange', applyWhenSettled);
      window.removeEventListener('resize', applyWhenSettled);
      setViewport(NORMAL_VIEWPORT);
      // An installed app can keep the board's layout height after leaving it,
      // so ask for a fresh layout once the tag has settled.
      setTimeout(() => window.dispatchEvent(new Event('resize')), SETTLE_MS);
    };
  }, []);

  if (isUpright) {
    return (
      <div role="alert" style={overlay}>
        Turn your phone sideways to play.
      </div>
    );
  }

  if (!debug) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        zIndex: 1000,
        padding: 4,
        fontSize: DEBUG_TEXT_PX * scale,
        color: '#fff',
        background: 'rgb(0 0 0 / 80%)',
      }}
    >
      {debug}
    </div>
  );
};
