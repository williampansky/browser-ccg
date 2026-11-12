import { produce } from 'immer';
import { ActionError, GameEvent, GameState, MinionInstance, PlayerId, TargetRef } from '../state/types';
import { damageHero, damageMinion } from './damage';
import type { EngineContext } from './apply-action';
import { mysteryBeforeAttack } from './mystery';
import { isLegalTarget, legalTargets } from './targeting';

/** True if this minion may not attack right now (no attack, can't attack, disabled, out of attacks, or summoning sick). */
export const cantAttack = (m: MinionInstance, turn: number): boolean => {
  if (m.attack < 1 || m.keywords.noAttack) return true;
  if (m.disabledOnTurn === turn) return true;
  if (m.attacksThisTurn >= (m.keywords.doubleAttack ? 2 : 1)) return true;
  return !m.keywords.rush && m.playedOnTurn === turn; // summoning sickness
};

export const attack = (
  state: GameState,
  args: { attackerId: number; target: TargetRef },
  events: GameEvent[],
  ctx?: EngineContext
): GameState | ActionError => {
  const me = state.activePlayer;
  const foe: PlayerId = me === '0' ? '1' : '0';
  const attacker = state.players[me].board.find((m) => m.instanceId === args.attackerId);
  if (!attacker) return { error: 'UNKNOWN_ATTACKER' };
  if (cantAttack(attacker, state.turn)) return { error: 'MINION_CANT_ATTACK' };
  if (!isLegalTarget(legalTargets(state, { kind: 'attack', attackerId: args.attackerId }), args.target)) {
    return { error: 'ILLEGAL_TARGET' };
  }

  return produce(state, (g) => {
    const a = g.players[me].board.find((m) => m.instanceId === args.attackerId)!;
    a.attacksThisTurn += 1;
    a.keywords.hidden = false; // attacking reveals a hidden minion
    // The defender's Mystery may react first, and may redirect the attack or even kill the attacker.
    const target = ctx ? mysteryBeforeAttack(g, ctx, events, { attackerPlayer: me, attackerId: a.instanceId, target: args.target }) : args.target;
    events.push({ type: 'MinionAttacked', attackerId: a.instanceId, target });
    if (a.health <= 0) return;
    if (target.kind === 'hero') {
      damageHero(g, target.player, a.attack, events);
    } else {
      const id = target.instanceId;
      const d = g.players[foe].board.find((m) => m.instanceId === id);
      if (!d) return;
      // Simultaneous damage (RULES Q15): read both attack values before applying either.
      const [dealt, taken] = [a.attack, d.attack];
      damageMinion(d, dealt, events, foe);
      damageMinion(a, taken, events, me);
    }
  });
};
