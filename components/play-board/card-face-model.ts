/**
 * How each rarity looks on a card: the colour of its frame and rarity gem. The art files are named by colour
 * (`public/images/frames/<COLOR>.png`, `public/images/ui/gem-<COLOR>.png`), so this table is the one place that says which
 * rarity gets which colour (they were keyed by hsclone's rarity names before, which did not match: a Common card had a blue gem).
 *
 *   FREE       steel frame, no gem
 *   COMMON     green
 *   SUPERIOR   blue
 *   REMARKABLE purple
 *   MYTHIC     red
 */
export const FRAME_COLORS = ['STEEL', 'GREEN', 'BLUE', 'PURPLE', 'RED'] as const;
export type FrameColor = typeof FRAME_COLORS[number];

export interface RarityStyle {
  color: FrameColor;
  /** Whether the card shows a rarity gem on its top edge (Free cards show none) */
  gem: boolean;
}

export const RARITY_STYLE: Record<string, RarityStyle> = {
  FREE: { color: 'STEEL', gem: false },
  COMMON: { color: 'GREEN', gem: true },
  SUPERIOR: { color: 'BLUE', gem: true },
  REMARKABLE: { color: 'PURPLE', gem: true },
  MYTHIC: { color: 'RED', gem: true },
};

/** The look of a rarity; `NONE`, missing and unknown rarities look like a Free card (steel frame, no gem). */
export const rarityStyle = (rarity?: string): RarityStyle => RARITY_STYLE[rarity ?? ''] ?? RARITY_STYLE.FREE;

/**
 * The banner under the top edge: always the card's TYPE ("minion", "spell", ...). hsclone showed a minion's race there instead
 * when it had one, so some minions read "Creature" and others "Minion" (playtest, 2026-11-12); the race is shown on its own
 * tag now (see `raceLabel`).
 */
export const typeLabel = (card: { type: string }): string => card.type;

/** A minion's race ("Creature", "Sprite", ...) for its tag at the bottom of the art, or undefined when it has none (or is not a minion). */
export const raceLabel = (card: { type: string; race?: string; raceName?: string }): string | undefined =>
  card.type === 'minion' && card.race && card.race !== 'NONE' ? card.raceName ?? card.race : undefined;

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

/** Shown for any card whose own art file is missing. */
export const PLACEHOLDER_ART = '/images/sets/PLACEHOLDER.jpg';

/**
 * A CSS `background-image` for a card: its art, then any `fallbackIds`' art, then the placeholder as the last layer. Layers
 * stack, so a layer whose file is missing (404) shows the next one down; no check for the file is needed.
 */
export const artBackground = (id?: string, ...fallbackIds: (string | undefined)[]): string =>
  [id, ...fallbackIds]
    .filter((x, i, all) => x !== undefined && all.indexOf(x) === i)
    .map(artUrl)
    .filter((u): u is string => !!u)
    .concat(PLACEHOLDER_ART)
    .map((u) => `url(${u})`)
    .join(', ');

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

/** Groups parsed parts into lines, splitting at each break (a line is drawn as its own block so its wrapping is balanced alone). */
export const textLines = (parts: RichPart[]): Exclude<RichPart, { kind: 'br' }>[][] =>
  parts.reduce<Exclude<RichPart, { kind: 'br' }>[][]>(
    (lines, part) => {
      if (part.kind === 'br') lines.push([]);
      else lines[lines.length - 1].push(part);
      return lines;
    },
    [[]]
  );

/**
 * Card text from Airtable has `<br>`s in two roles: real structure (after a keyword, around a small explanatory line, after a
 * finished sentence or clause) and hand-wrapping in the middle of a sentence (hsclone had to wrap by hand). The face now wraps
 * and balances lines itself, so a break in the middle of a sentence is just a space; the structural ones are kept.
 * (Input is `sanitizeRichText` output, so breaks are exactly `<br>`.)
 */
export const softenBreaks = (html: string): string =>
  html.split('<br>').reduce((out, next, i) => {
    if (i === 0) return next;
    const before = out.trimEnd();
    const visibleEnd = before.replace(/<[^>]+>\s*$/, '').trimEnd();
    const hard = /<\/(strong|small)>$/.test(before) || /[.:;!?]$/.test(visibleEnd) || /^\s*<(strong|small)>/.test(next);
    return before + (hard ? '<br>' : ' ') + next.trimStart();
  }, '');

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
