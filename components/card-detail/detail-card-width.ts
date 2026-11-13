import { useEffect, useState } from 'react';
import { FACE_HEIGHT, FACE_WIDTH } from '../play-board/card-face-model';

/** The backdrop's padding (32px a side), plus the detail's own (8px above and below, 20px each side). The card's gem and badges overhang into these. */
const PAD_V = 32 * 2 + 8 * 2;
const PAD_H = 32 * 2 + 20 * 2;
/** The text column beside the card (and the gap), when the window is wide enough to put it there. */
const TEXT_COLUMN = 340;
/** Below this the text wraps under the card instead of sitting beside it. */
const SIDE_BY_SIDE_FROM = 700;
const MIN_WIDTH = 240;
const MAX_WIDTH = 560;

/** The width of the enlarged card in a detail window: as tall as the window allows, within the width left beside the text. */
export const detailCardWidth = (viewW: number, viewH: number): number => {
  const byHeight = (viewH - PAD_V) * (FACE_WIDTH / FACE_HEIGHT);
  const roomW = viewW - PAD_H;
  const byWidth = viewW < SIDE_BY_SIDE_FROM ? roomW : roomW - TEXT_COLUMN;
  return Math.round(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, byHeight, byWidth)));
};

/** `detailCardWidth` for the current window, kept up to date on resize. */
export const useDetailCardWidth = (): number => {
  const [width, setWidth] = useState(() => (typeof window === 'undefined' ? 420 : detailCardWidth(window.innerWidth, window.innerHeight)));
  useEffect(() => {
    const update = () => setWidth(detailCardWidth(window.innerWidth, window.innerHeight));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return width;
};
