import type { Action } from '../../engine';

import type { SpellFxTune } from './spell-fx-tune';

/**
 * The base of a spell's effect: where it is anchored. Each base is built on
 * with options (flags and numbers in `SpellFxTune`) and, later, styles:
 *
 * - `travel`: flies from the caster (a hand card or the hero) to each target
 *   the spell damages.
 * - `strike`: falls from above onto each target the spell damages.
 * - `spot`: plays once, centred on the spell's target or, with none, on the
 *   caster's hero, and needs no damage to happen (armor, a summon, a buff).
 *
 * Add a base here, in `pixi-fx.ts` (its drawing) and in `spellFxMs`.
 */
export type SpellFxKind = 'travel' | 'strike' | 'spot';

/** Every base, in the order the lab lists them. */
export const SPELL_FX_KINDS: { kind: SpellFxKind; label: string }[] = [
  { kind: 'travel', label: 'Travel (caster to target)' },
  { kind: 'strike', label: 'Strike (from above)' },
  { kind: 'spot', label: 'Spot (centred on a place)' },
];

/** Milliseconds from the cast to the hit landing, per kind (from the tune). */
export const spellFxMs = (kind: SpellFxKind, tune: SpellFxTune): number => {
  if (kind === 'strike') return tune.strikeMs;
  // A spot effect starts at the cast, so there is nothing to wait for.
  return kind === 'spot' ? 0 : tune.travelMs;
};

/**
 * Hero skills with their own effect, keyed `<CLASS>:<skill number>` (the first
 * skill is 1). A skill never borrows a card's look.
 */
export const SKILL_FX: Record<string, SpellFxKind> = {
  'CLERIC:1': 'spot',
  'FIGHTER:1': 'spot',
  'WIZARD:1': 'strike',
};

/**
 * One-off effects for a single card, keyed by card id. Empty for now: every
 * card falls back to the travel base.
 */
export const CARD_FX: Record<string, SpellFxKind> = {};

/** The effect a spell plays, by its key (a card id or `CLASS:n` skill). */
export const spellFxForKey = (key: string): SpellFxKind =>
  SKILL_FX[key] ?? CARD_FX[key] ?? 'travel';

/**
 * The key of the spell an action casts: `<CLASS>:<skill number>` for a hero
 * skill, the card id for a card from hand, null for anything else.
 */
export const spellKeyFor = (
  action: Action,
  heroId: string | undefined,
  handCardId: string | undefined,
): string | null => {
  if (action.type === 'HeroSkill') return `${heroId}:${action.skill + 1}`;
  if (action.type === 'PlayCard' && handCardId) return handCardId;
  return null;
};

/** The effect an action plays: its skill's, its card's, or the default orb. */
export const spellFxFor = (
  action: Action,
  heroId: string | undefined,
  handCardId: string | undefined,
): SpellFxKind => {
  const key = spellKeyFor(action, heroId, handCardId);
  if (!key) return 'travel';
  // A skill never borrows a card's look, and a card never a skill's.
  const isSkill = action.type === 'HeroSkill';
  return (isSkill ? SKILL_FX[key] : CARD_FX[key]) ?? 'travel';
};
