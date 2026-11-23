/**
 * The nine hero classes, as the `CLASS_` symbols in Airtable without the
 * prefix. A class owns the skills and the class cards; a hero is a cosmetic
 * skin on a class.
 */
export const CLASS_KEYS = [
  'FIGHTER',
  'WIZARD',
  'RANGER',
  'CLERIC',
  'CRUSADER',
  'ASSASSIN',
  'MYSTIC',
  'NECROMANCER',
  'WARDEN',
] as const;

/**
 * Hero keys from before heroes became cosmetic, so a saved deck, a saved
 * choice or a `?h0=` param keeps working.
 */
export const RENAMED_HERO: Record<string, string> = {
  FORSAKEN_DRUID: 'WARDEN',
  WILDCALLER: 'WARDEN',
  ZEUS: 'WIZARD',
  WARRIOR: 'FIGHTER',
  SAGE: 'CLERIC',
  EXILE: 'RANGER',
  ASAR: 'ASSASSIN',
};

/**
 * What a card's old `CLASS_HERO_<X>` value stands for (Airtable still has
 * `CLASS_HERO_WARRIOR` on PRIME_255).
 */
export const LEGACY_HERO_CLASS: Record<string, string> = {
  WARRIOR: 'FIGHTER',
};

/** `%CLASS_WIZARD%` or `CLASS_WIZARD` -> `WIZARD`. */
export const classKey = (symbol: string): string =>
  symbol.replace(/%/g, '').replace(/^CLASS_/, '');

/** A hero key in its current form (an old key becomes its class key). */
export const currentHeroKey = (key: string): string => RENAMED_HERO[key] ?? key;
