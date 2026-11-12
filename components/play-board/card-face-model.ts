/** Frame images that exist in `public/images/hs/frames/` (the `hsclone` card frames). */
export const FRAME_RARITIES = ['COMMON', 'REMARKABLE', 'SUPERIOR', 'MYTHIC', 'FREE'] as const;
export type FrameRarity = typeof FRAME_RARITIES[number];

/** The frame for a rarity; `NONE`, missing and unknown rarities use the plain `FREE` frame. */
export const frameFor = (rarity?: string): FrameRarity =>
  (FRAME_RARITIES as readonly string[]).includes(rarity ?? '') ? (rarity as FrameRarity) : 'FREE';

/** Rarity gems only exist for the rarities that have a frame. */
export const gemFor = frameFor;

/** The banner under the top edge: a minion's race, else its type ("Minion", "Spell"...). */
export const typeLabel = (card: { type: string; race?: string; raceName?: string }): string =>
  card.type === 'minion' && card.race && card.race !== 'NONE' ? card.raceName ?? card.race : card.type;

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

export type RichPart = { kind: 'text' | 'strong' | 'em' | 'small' | 'boost'; text: string } | { kind: 'br' };

/** Splits card text (`<br>`, `<strong>`, `<em>`, `<small>` only; see `sanitizeRichText`) into parts to render. */
export const parseRichText = (html: string): RichPart[] => {
  const parts: RichPart[] = [];
  let style: 'text' | 'strong' | 'em' | 'small' | 'boost' = 'text';
  for (const tok of html.split(/(<\/?(?:strong|em|small|boost)>|<br>)/)) {
    if (!tok) continue;
    if (tok === '<br>') parts.push({ kind: 'br' });
    else if (/^<(strong|em|small|boost)>$/.test(tok)) style = tok.slice(1, -1) as typeof style;
    else if (/^<\/(strong|em|small|boost)>$/.test(tok)) style = 'text';
    else parts.push({ kind: style, text: tok });
  }
  return parts;
};

/**
 * Shows what a spell will really deal with `bonus` spell damage: each "N damage" in the text becomes "N+bonus damage",
 * the new number wrapped in `<boost>` so the face can colour it. No bonus, no change.
 */
export const withSpellDamageText = (html: string, bonus: number): string =>
  bonus > 0 ? html.replace(/(\d+)(?= damage)/g, (_m, n: string) => `<boost>${Number(n) + bonus}</boost>`) : html;

/**
 * The largest text scale (1, then down in `step`s to `min`) at which `fits` is true; `min` if none fits. Used to shrink a
 * card's description until it sits inside its box (hsclone only scaled the name; its text was written with line breaks to fit).
 */
export const fitScale = (fits: (scale: number) => boolean, min = 0.55, step = 0.05): number => {
  for (let scale = 1; scale > min + 1e-9; scale = Math.round((scale - step) * 1000) / 1000) {
    if (fits(scale)) return scale;
  }
  return min;
};
