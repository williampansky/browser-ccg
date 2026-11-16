/**
 * The crop maths and file naming for `npm run art` (scripts/art/art.node.ts): one square master per card becomes the three files the
 * game reads (`NNN-CARD.jpg`, `NNN-DECK.jpg`, `NNN-MINION.jpg`). Plain functions, so they are unit tested; the script only adds the image work.
 */
export type ArtKind = 'card' | 'deck' | 'minion';

/** The sizes the game reads: card 1000 x 1000, deck strip 600 x 75 (8 : 1), board minion 640 x 800 (4 : 5). */
export const OUTPUTS: Record<ArtKind, { width: number; height: number; suffix: string }> = {
  card: { width: 1000, height: 1000, suffix: 'CARD' },
  deck: { width: 600, height: 75, suffix: 'DECK' },
  minion: { width: 640, height: 800, suffix: 'MINION' },
};

/** Where the crop sits: x and y are 0 to 1 across the picture (0.5, 0.4 = centred, a little above the middle), zoom 1 = as wide as it can be. */
export interface Focus {
  x: number;
  y: number;
  zoom: number;
}
export const DEFAULT_FOCUS: Focus = { x: 0.5, y: 0.4, zoom: 1 };

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * The biggest box with this width : height ratio that fits the picture, made smaller by `zoom` (1 or more), centred on the focus point
 * and pushed back inside the picture if it would hang over an edge. Whole pixels.
 */
export const cropBox = (srcW: number, srcH: number, aspect: number, focus: Focus = DEFAULT_FOCUS): Box => {
  const zoom = Math.max(1, focus.zoom);
  const fullW = srcW / srcH > aspect ? srcH * aspect : srcW;
  const fullH = srcW / srcH > aspect ? srcH : srcW / aspect;
  const width = Math.min(srcW, Math.round(fullW / zoom));
  const height = Math.min(srcH, Math.round(fullH / zoom));
  const left = Math.min(srcW - width, Math.max(0, Math.round(focus.x * srcW - width / 2)));
  const top = Math.min(srcH - height, Math.max(0, Math.round(focus.y * srcH - height / 2)));
  return { left, top, width, height };
};

export interface ArtName {
  /** `CORE_117` */
  id: string;
  /** `CORE`, `PRIME` or `GAME` (the folder is `SET_<set>`) */
  set: string;
  /** `117`, or `099a` for a variant */
  num: string;
}

/** `CORE_117.png` -> the card it is for; null for any other file name. */
export const parseArtName = (file: string): ArtName | null => {
  const m = /^(CORE|PRIME|GAME)_(\d+[a-z]*)\.(png|jpe?g|webp|tiff?)$/i.exec(file);
  return m ? { id: `${m[1].toUpperCase()}_${m[2]}`, set: m[1].toUpperCase(), num: m[2] } : null;
};

export const outputPath = (name: ArtName, kind: ArtKind): string =>
  `public/images/sets/SET_${name.set}/${name.num}-${OUTPUTS[kind].suffix}.jpg`;
