import { produce } from 'immer';
import { heroSkill } from '../heroes';
import { ActionError, GameEvent, GameState, PlayerId, TargetRef } from '../state/types';
import type { EngineContext } from './apply-action';
import { isLegalTarget, legalTargets } from './targeting';

/** Is this skill off cooldown and (for a one-use ultimate) not yet used? Says nothing about energy or targets. */
export const skillReady = (state: GameState, player: PlayerId, skill: number): boolean => {
  const hero = state.players[player].hero;
  const def = heroSkill(hero?.id, skill);
  if (!hero || !def) return false;
  return def.cooldown === undefined ? !hero.spent[skill] : (hero.cooldowns[skill] ?? 0) <= 0;
};

/**
 * The active player uses one of their hero's skills: pays its energy, starts its cooldown (or spends a one-use ultimate)
 * and runs its effects. Deaths and triggers are settled by the caller. Skills are not spells: Spell Damage and
 * "when you cast a spell" effects do not apply to them.
 */
export const useHeroSkill = (
  state: GameState,
  { skill, target }: { skill: number; target?: TargetRef },
  ctx: EngineContext,
  events: GameEvent[]
): GameState | ActionError => {
  const me = state.activePlayer;
  const hero = state.players[me].hero;
  const def = heroSkill(hero?.id, skill);
  if (!hero || !def) return { error: 'BAD_SKILL' };
  if (!skillReady(state, me, skill)) return { error: 'SKILL_UNAVAILABLE' };
  if (def.cost > state.players[me].energy.current) return { error: 'CANT_AFFORD' };
  if (def.target && !isLegalTarget(legalTargets(state, { kind: 'skill', skill }), target)) return { error: 'ILLEGAL_TARGET' };

  return produce(state, (g) => {
    const p = g.players[me];
    p.energy.current -= def.cost;
    if (def.cooldown === undefined) p.hero!.spent[skill] = true;
    else p.hero!.cooldowns[skill] = def.cooldown;
    events.push({ type: 'HeroSkillUsed', player: me, skill, ...(def.target && target ? { target } : {}) });
    for (const effect of def.effects) {
      effect({ g, caster: me, target: def.target ? target : undefined, rng: ctx.rng, catalog: ctx.catalog, events });
    }
  });
};
