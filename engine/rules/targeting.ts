import type { CardCatalog } from '../cards/types';
import { getCardDef } from '../definitions';
import type { DefLookup } from '../definitions/define-card';
import { GameState, PlayerId, TargetRef } from '../state/types';
import { opponentOf } from './lookup';

export type TargetSource =
  | { kind: 'attack'; attackerId: number }
  | { kind: 'weapon' }
  | { kind: 'card'; handIndex: number; choice?: number };

export const sameTarget = (a: TargetRef, b: TargetRef): boolean =>
  a.kind === 'hero' ? b.kind === 'hero' && a.player === b.player : b.kind === 'minion' && a.instanceId === b.instanceId;

export const isLegalTarget = (legal: TargetRef[], target: TargetRef | undefined): boolean =>
  !!target && legal.some((t) => sameTarget(t, target));

/** Every visible character: both heroes and all minions that are not hidden. */
const visibleCharacters = (state: GameState): TargetRef[] => {
  const out: TargetRef[] = [];
  for (const player of ['0', '1'] as PlayerId[]) {
    out.push({ kind: 'hero', player });
    for (const m of state.players[player].board) {
      if (!m.keywords.hidden) out.push({ kind: 'minion', instanceId: m.instanceId });
    }
  }
  return out;
};

/**
 * The one place that decides what may be targeted. The UI uses it to highlight, and `applyAction`
 * uses it to validate. Attacks (minion or weapon): enemy characters, narrowed to Guard minions while any is present
 * (RULES Q10: Guard restricts attacks only). Cards: whatever the card's own filter allows.
 */
export const legalTargets = (
  state: GameState,
  source: TargetSource,
  catalog?: CardCatalog,
  defs: DefLookup = getCardDef
): TargetRef[] => {
  const me = state.activePlayer;
  if (source.kind === 'attack' || source.kind === 'weapon') {
    const foe = opponentOf(me);
    const minions = state.players[foe].board.filter((m) => !m.keywords.hidden);
    const guards = minions.filter((m) => m.keywords.guard);
    if (guards.length > 0) return guards.map((m) => ({ kind: 'minion', instanceId: m.instanceId }));
    return [...minions.map((m): TargetRef => ({ kind: 'minion', instanceId: m.instanceId })), { kind: 'hero', player: foe }];
  }
  const inHand = state.players[me].hand[source.handIndex];
  const card = inHand && catalog?.get(inHand.cardId);
  const def = card ? defs(card) : undefined;
  const filter = def?.choices ? def.choices[source.choice ?? -1]?.target : def?.target;
  if (!filter) return [];
  return visibleCharacters(state).filter((candidate) => filter({ state, caster: me, candidate, catalog }));
};
