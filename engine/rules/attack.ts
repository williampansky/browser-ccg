import { produce } from 'immer';
import { ActionError, AttackTarget, GameEvent, GameState, MinionInstance, PlayerId } from '../state/types';
import { damageHero } from './damage';
import { settleDeaths } from './death';
import { checkWin } from './win';

/** True if this minion may not attack right now (no attack, already attacked, or summoning sick). */
export const cantAttack = (m: MinionInstance, turn: number): boolean => {
  if (m.attack < 1) return true;
  if (m.attacksThisTurn >= 1) return true;
  return !m.keywords.rush && m.playedOnTurn === turn; // summoning sickness
};

/** Guard rule: while the defender has any Guard minion, only Guard minions may be attacked. */
const targetAllowed = (defenderBoard: MinionInstance[], target: AttackTarget): boolean => {
  const hasGuard = defenderBoard.some((m) => m.keywords.guard);
  if (target.kind === 'hero') return !hasGuard;
  const t = defenderBoard.find((m) => m.instanceId === target.instanceId);
  return !!t && (!hasGuard || t.keywords.guard);
};

export const attack = (
  state: GameState,
  args: { attackerId: number; target: AttackTarget },
  events: GameEvent[]
): GameState | ActionError => {
  const me = state.activePlayer;
  const foe: PlayerId = me === '0' ? '1' : '0';
  const attacker = state.players[me].board.find((m) => m.instanceId === args.attackerId);
  if (!attacker) return { error: 'UNKNOWN_ATTACKER' };
  if (cantAttack(attacker, state.turn)) return { error: 'MINION_CANT_ATTACK' };
  if (!targetAllowed(state.players[foe].board, args.target)) return { error: 'ILLEGAL_TARGET' };

  return produce(state, (g) => {
    const a = g.players[me].board.find((m) => m.instanceId === args.attackerId)!;
    a.attacksThisTurn += 1;
    events.push({ type: 'MinionAttacked', attackerId: a.instanceId, target: args.target });
    if (args.target.kind === 'hero') {
      damageHero(g, foe, a.attack, events);
    } else {
      const id = args.target.instanceId;
      const d = g.players[foe].board.find((m) => m.instanceId === id)!;
      // Simultaneous damage (RULES Q15): read both attack values before applying either.
      const [dealt, taken] = [a.attack, d.attack];
      d.health = Math.max(0, d.health - dealt);
      a.health = Math.max(0, a.health - taken);
    }
    settleDeaths(g, events);
    checkWin(g, events);
  });
};
