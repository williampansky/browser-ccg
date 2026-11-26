import type { Action } from '../../engine';

import { SPELL_FX_PARENTS } from './spell-fx-tune';
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
 * - `area`: plays once over a side of the board (or both), for a global spell
 *   such as a damage-all.
 *
 * Add a base here, in `pixi-fx.ts` (its drawing) and in `spellFxMs`.
 */
export type SpellFxKind = 'travel' | 'strike' | 'spot' | 'area';

/** Every base, in the order the lab lists them. */
export const SPELL_FX_KINDS: { kind: SpellFxKind; label: string }[] = [
  { kind: 'travel', label: 'Travel (caster to target)' },
  { kind: 'strike', label: 'Strike (from above)' },
  { kind: 'spot', label: 'Spot (centred on a place)' },
  { kind: 'area', label: 'Area (over a side of the board)' },
];

/** Milliseconds from the cast to the hit landing, per kind (from the tune). */
export const spellFxMs = (kind: SpellFxKind, tune: SpellFxTune): number => {
  if (kind === 'strike') return tune.strikeMs;
  // A spot effect starts at the cast, so there is nothing to wait for.
  if (kind === 'spot') return 0;
  // An area effect lands its damage part-way through.
  return kind === 'area' ? tune.areaImpactMs : tune.travelMs;
};

/**
 * Milliseconds until the whole effect has played out: the hit landing for
 * `spellFxMs`, then the rest of its life, and the volley (`shots` animations
 * in all, each `volleyDelay` after the one before). Used to hold damage back
 * until an effect is over.
 */
export const spellFxTotalMs = (
  kind: SpellFxKind,
  tune: SpellFxTune,
  shots = 1,
): number => {
  const stagger = Math.max(0, shots - 1) * tune.volleyDelay;
  if (kind === 'spot') {
    const rings = Math.max(1, Math.round(tune.spotRings));
    return tune.spotLife + (rings - 1) * tune.spotRingGap + stagger;
  }
  if (kind === 'area') return tune.areaMs + stagger;
  if (kind === 'strike')
    return Math.max(tune.strikeMs, tune.strikeLife) + stagger;

  return tune.travelMs + stagger;
};

/**
 * Hero skills with their own effect, keyed `<CLASS>:<skill number>` (the first
 * skill is 1). A skill never borrows a card's look.
 */
export const SKILL_FX: Record<string, SpellFxKind> = {
  'ASSASSIN:1': 'spot',
  'CLERIC:1': 'spot',
  'FIGHTER:1': 'spot',
  'NECROMANCER:1': 'spot',
  'WARDEN:1': 'spot',
  'WIZARD:1': 'strike',
};

/**
 * One-off effects for a single card, keyed by card id. Empty for now: every
 * card falls back to the travel base.
 */
export const CARD_FX: Record<string, SpellFxKind> = {
  CORE_068: 'area',
  CORE_092: 'spot',
  CORE_098: 'area',
  CORE_115: 'spot',
  PRIME_116: 'area',
  PRIME_172: 'spot',
  PRIME_201: 'strike',
  PRIME_202: 'strike',
};

/**
 * The things that happen which can have an effect of their own, not tied to
 * one spell: a minion `summon`ed or played, a `heal`, a `buff` and a `death`.
 */
export const EVENT_KEYS = ['summon', 'heal', 'buff', 'death'];

/**
 * Which events play an effect, and its base. `summon` always plays; a heal,
 * buff or death plays only once it has an entry here (baking its look in the
 * spells lab adds one), so a new event stays off until you choose its look.
 */
export const EVENT_FX: Record<string, SpellFxKind> = {
  summon: 'spot',
};

/** The effect a spell plays, by its key (a card id, `CLASS:n` skill or event). */
export const spellFxForKey = (key: string): SpellFxKind => {
  const own = SKILL_FX[key] ?? CARD_FX[key] ?? EVENT_FX[key];
  if (own) return own;
  // An event with no entry yet shows as a spot effect in the lab.
  if (EVENT_KEYS.includes(key)) return 'spot';
  const parent = SPELL_FX_PARENTS[key];
  return parent ? spellFxForKey(parent) : 'travel';
};

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
