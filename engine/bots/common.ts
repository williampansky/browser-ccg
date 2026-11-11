import type { CardCatalog } from '../cards/types';
import type { DefLookup } from '../definitions/define-card';
import { applyAction } from '../rules/apply-action';
import { legalActions } from '../rules/legal-actions';
import { createSeededRng } from '../rng';
import type { Action, GameState, PlayerId, TargetRef } from '../state/types';

export const findMinion = (state: GameState, id: number) => {
  for (const p of ['0', '1'] as PlayerId[]) {
    const m = state.players[p].board.find((x) => x.instanceId === id);
    if (m) return m;
  }
  return undefined;
};
const isFriendly = (state: GameState, t: TargetRef): boolean =>
  t.kind === 'hero' ? t.player === state.activePlayer : state.players[state.activePlayer].board.some((m) => m.instanceId === t.instanceId);

/** True when `after` is worse for the target than `before`: less health, less attack, a lost keyword, newly disabled, or dead. */
const targetWorse = (before: GameState, after: GameState, t: TargetRef): boolean => {
  if (t.kind === 'hero') {
    const [b, a] = [before.players[t.player], after.players[t.player]];
    return a.health + a.armor < b.health + b.armor || (a.heroDisabledOnTurn !== b.heroDisabledOnTurn && a.heroDisabledOnTurn !== undefined);
  }
  const b = findMinion(before, t.instanceId);
  const a = findMinion(after, t.instanceId);
  if (!b || !a) return !a; // gone: it died
  const lostKeyword = (Object.keys(b.keywords) as (keyof typeof b.keywords)[]).some((k) => b.keywords[k] && !a.keywords[k]);
  const newlyDisabled = a.disabledOnTurn !== undefined && a.disabledOnTurn !== b.disabledOnTurn;
  return a.health < b.health || a.attack < b.attack || lostKeyword || newlyDisabled;
};

/** True when `after` is strictly better for the target than `before` (more health or attack, or a gained keyword) and not worse in any way. */
const targetBetter = (before: GameState, after: GameState, t: TargetRef): boolean => {
  if (targetWorse(before, after, t)) return false;
  if (t.kind === 'hero') {
    const [b, a] = [before.players[t.player], after.players[t.player]];
    return a.health + a.armor > b.health + b.armor;
  }
  const b = findMinion(before, t.instanceId);
  const a = findMinion(after, t.instanceId);
  if (!b || !a) return false;
  const gainedKeyword = (Object.keys(a.keywords) as (keyof typeof a.keywords)[]).some((k) => a.keywords[k] && !b.keywords[k]);
  return a.health > b.health || a.attack > b.attack || gainedKeyword;
};

/** What a spell or item can change, flattened so two states can be compared. `handDelta` adjusts one player's hand size. */
const snapshot = (s: GameState, handDelta: { player: PlayerId; by: number }) =>
  JSON.stringify(
    (['0', '1'] as PlayerId[]).map((p) => {
      const pl = s.players[p];
      const hand = pl.hand.length + (handDelta.player === p ? handDelta.by : 0);
      return [pl.board, pl.health, pl.armor, pl.weapon, pl.deck.length, hand, pl.energy.total, pl.heroDisabledOnTurn];
    })
  );

/**
 * True when the action would be a bad play a person would not make: a targeted card that hurts the bot's
 * own character (a damage spell or Disable on its own minion) or buffs an enemy one, or a spell or item that changes nothing
 * (a weapon buff with no weapon). It plays the action on a copy with a throwaway rng and compares.
 */
export const isBadPlay = (state: GameState, a: Action, catalog: CardCatalog, defs?: DefLookup): boolean => {
  if (a.type !== 'PlayCard') return false;
  const result = applyAction(state, a, { rng: createSeededRng(1), catalog, defs });
  if ('error' in result) return false;
  if (a.target && isFriendly(state, a.target) && targetWorse(state, result.state, a.target)) return true;
  // Buffing or healing one of the opponent's characters helps the opponent.
  if (a.target && !isFriendly(state, a.target) && targetBetter(state, result.state, a.target)) return true;
  // A temporary weapon (Steel Gauntlet) is only worth playing if the hero can then swing it this turn.
  const me = state.activePlayer;
  const weapon = result.state.players[me].weapon;
  if (weapon?.temporary && !legalActions(result.state, me, catalog, defs).some((x) => x.type === 'WeaponAttack')) return true;
  const played = catalog.get(state.players[state.activePlayer].hand[a.handIndex]?.cardId ?? '');
  if (played && played.type !== 'minion') {
    // The played card leaves the hand, so the "before" hand is counted one card shorter.
    return snapshot(state, { player: me, by: -1 }) === snapshot(result.state, { player: me, by: 0 });
  }
  return false;
};
