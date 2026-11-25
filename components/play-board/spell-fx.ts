import type { Action } from '../../engine';

/**
 * The look of a spell's effect. Add a kind here and in `pixi-fx.ts` (its
 * drawing and its `SPELL_FX_MS` entry) to give a spell its own show.
 */
export type SpellFxKind = 'orb' | 'lightning';

/** Milliseconds from the cast to the hit landing, per kind. */
export const SPELL_FX_MS: Record<SpellFxKind, number> = {
  orb: 280,
  lightning: 160,
};

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

/** The effect an action plays: its skill's, its card's, or the default orb. */
export const spellFxFor = (
  action: Action,
  heroId: string | undefined,
  handCardId: string | undefined,
): SpellFxKind => {
  if (action.type === 'HeroSkill') {
    return SKILL_FX[`${heroId}:${action.skill + 1}`] ?? 'orb';
  }
  if (action.type === 'PlayCard' && handCardId) {
    return CARD_FX[handCardId] ?? 'orb';
  }
  return 'orb';
};
