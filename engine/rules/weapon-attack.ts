import { produce } from 'immer';
import type { CardCatalog } from '../cards/types';
import { ActionError, GameEvent, GameState, TargetRef } from '../state/types';
import { getCardDef } from '../definitions';
import type { DefLookup } from '../definitions/define-card';
import type { EngineContext } from './apply-action';
import { damageHero, damageMinion } from './damage';
import { opponentOf } from './lookup';
import { mysteryBeforeAttack } from './mystery';
import { isLegalTarget, legalTargets } from './targeting';

const SINGLE_SWING = 1;
const DOUBLE_SWING = 2;

/** How many times a turn the hero may swing this weapon (Onslaught: twice). */
export const weaponSwings = (
  cardId: string,
  catalog?: CardCatalog,
  defs: DefLookup = getCardDef,
): number => {
  const card = catalog?.get(cardId);
  const def = card && defs(card);

  return def?.weaponDoubleAttack ? DOUBLE_SWING : SINGLE_SWING;
};

/**
 * The active hero attacks with its weapon (RULES Q9). One attack per turn, 1
 * durability each.
 * Against a hero: damage only. Against a minion: the hero takes the minion's
 * attack as
 * counter-damage and the minion takes the weapon's attack, at the same time.
 * Guard applies (Q10).
 * Deaths and triggers are settled by the caller.
 */
export const weaponAttack = (
  state: GameState,
  { target: chosen }: { target: TargetRef },
  events: GameEvent[],
  ctx?: EngineContext,
): GameState | ActionError => {
  const me = state.activePlayer;
  const foe = opponentOf(me);
  const weapon = state.players[me].weapon;
  if (!weapon) return { error: 'NO_WEAPON' };
  if (state.players[me].heroDisabledOnTurn === state.turn)
    return { error: 'HERO_CANT_ATTACK' };
  const swings = weaponSwings(weapon.cardId, ctx?.catalog, ctx?.defs);
  if (weapon.attack < 1 || state.players[me].weaponAttacksThisTurn >= swings)
    return { error: 'HERO_CANT_ATTACK' };
  if (!isLegalTarget(legalTargets(state, { kind: 'weapon' }), chosen))
    return { error: 'ILLEGAL_TARGET' };

  return produce(state, (g) => {
    const p = g.players[me];
    const w = p.weapon!;
    p.weaponAttacksThisTurn += 1;
    // The defender's Mystery may react first and redirect the attack (hero
    // attacks have no attacker minion).
    const target = ctx
      ? mysteryBeforeAttack(g, ctx, events, {
          attackerPlayer: me,
          target: chosen,
        })
      : chosen;
    events.push({ type: 'WeaponAttacked', target });
    // "Before every attack" effects of the weapon itself (CORE_081 heals first)
    const card = ctx?.catalog.get(w.cardId);
    const def = card && ctx && (ctx.defs ?? getCardDef)(card);
    for (const effect of def?.beforeAttack ?? []) {
      effect({
        g,
        caster: me,
        target,
        rng: ctx!.rng,
        catalog: ctx!.catalog,
        events,
        sourceCardId: w.cardId,
      });
    }
    if (target.kind === 'hero') {
      damageHero(g, foe, w.attack, events);
    } else {
      const victim = g.players[foe].board.find(
        (m) => m.instanceId === target.instanceId,
      );
      if (victim) {
        const counter = victim.attack;
        damageMinion(victim, w.attack, events, foe);
        if (counter > 0 && !def?.heroImmuneWhileAttacking)
          damageHero(g, me, counter, events);
      }
    }
    // PRIME_243 wears down in Attack instead of Durability
    if (def?.wearsAttack) w.attack -= 1;
    else w.durability -= 1;
    if (w.durability <= 0 || w.attack <= 0) {
      p.weapon = null;
      events.push({ type: 'WeaponBroke', player: me });
    }
  });
};
