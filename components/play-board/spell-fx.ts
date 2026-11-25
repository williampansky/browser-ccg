import type { Action } from '../../engine';

import type { SpellFxTune } from './spell-fx-tune';

/**
 * The look of a spell's effect. Add a kind here and in `pixi-fx.ts` (its
 * drawing and its `SPELL_FX_MS` entry) to give a spell its own show.
 */
export type SpellFxKind = 'orb' | 'lightning';

/** Milliseconds from the cast to the hit landing, per kind (from the tune). */
export const spellFxMs = (kind: SpellFxKind, tune: SpellFxTune): number =>
  kind === 'lightning' ? tune.lightningMs : tune.orbMs;

/**
 * Hero skills with their own effect, keyed `<CLASS>:<skill number>` (the first
 * skill is 1). A skill never borrows a card's look.
 */
export const SKILL_FX: Record<string, SpellFxKind> = {
  'WIZARD:1': 'lightning',
};

/**
 * One-off effects for a single card, keyed by card id. Empty for now: every
 * card falls back to the orb.
 */
export const CARD_FX: Record<string, SpellFxKind> = {};

/** The effect a spell plays, by its key (a card id or `CLASS:n` skill). */
export const spellFxForKey = (key: string): SpellFxKind =>
  SKILL_FX[key] ?? CARD_FX[key] ?? 'orb';

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
  if (!key) return 'orb';
  // A skill never borrows a card's look, and a card never a skill's.
  const isSkill = action.type === 'HeroSkill';
  return (isSkill ? SKILL_FX[key] : CARD_FX[key]) ?? 'orb';
};
