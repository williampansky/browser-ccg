/** Frame images that exist in `public/images/hs/frames/` (the `hsclone` card frames). */
export const FRAME_RARITIES = ['COMMON', 'REMARKABLE', 'SUPERIOR', 'MYTHIC', 'FREE'] as const;
export type FrameRarity = typeof FRAME_RARITIES[number];

/** The frame for a rarity; `NONE`, missing and unknown rarities use the plain `FREE` frame. */
export const frameFor = (rarity?: string): FrameRarity =>
  (FRAME_RARITIES as readonly string[]).includes(rarity ?? '') ? (rarity as FrameRarity) : 'FREE';

/** Rarity gems only exist for the rarities that have a frame. */
export const gemFor = frameFor;

/** The banner under the top edge: a minion's race, else its type ("Minion", "Spell"...). */
export const typeLabel = (card: { type: string; race?: string }): string =>
  card.type === 'minion' && card.race && card.race !== 'NONE' ? card.race : card.type;

/** Minions and weapons show an attack and a health/durability badge; spells and items don't. */
export const showsStats = (type: string): boolean => type === 'minion' || type === 'weapon';

/** Design size of a card face; everything inside is laid out in these units and scaled to the real width. */
export const FACE_WIDTH = 178;
export const FACE_HEIGHT = 250;
/** Pixel size of one design unit when the card is drawn `width` pixels wide. */
export const faceUnit = (width: number): number => width / FACE_WIDTH;

/** `CORE_012` -> `/images/sets/SET_CORE/012-CARD.jpg`, `GAME_001` -> `/images/sets/SET_GAME/001-CARD.jpg`. */
export const artUrl = (id?: string): string | undefined => {
  const m = /^([A-Z]+)_(\w+)$/.exec(id ?? '');
  return m ? `/images/sets/SET_${m[1]}/${m[2]}-CARD.jpg` : undefined;
};
