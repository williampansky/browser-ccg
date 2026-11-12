import { produce } from 'immer';
import { needsBehaviour } from '../decks';
import { getCardDef } from '../definitions';
import type { CardDef } from '../definitions/define-card';
import type { EngineContext } from './apply-action';
import { ActionError, GameEvent, GameState, MAX_BOARD, TargetRef } from '../state/types';
import { effectiveCost } from './cost';
import { mysteryBeforeSpell } from './mystery';
import { createMinion, minionDef } from './minion';
import { isLegalTarget, legalTargets } from './targeting';

export interface PlayCardArgs {
  handIndex: number;
  boardIndex?: number;
  target?: TargetRef;
  choice?: number;
}

/**
 * Plays a minion or a spell from the active player's hand. A minion is placed first, then its
 * warcry (`onPlay`) runs. Weapons come in a later slice. Deaths and triggers are settled by the caller.
 */
export const playCard = (
  state: GameState,
  { handIndex, boardIndex, target, choice }: PlayCardArgs,
  ctx: EngineContext,
  events: GameEvent[]
): GameState | ActionError => {
  const { catalog, rng } = ctx;
  const defs = ctx.defs ?? getCardDef;
  const me = state.activePlayer;
  const player = state.players[me];

  const inHand = player.hand[handIndex];
  if (!Number.isInteger(handIndex) || !inHand) return { error: 'BAD_HAND_INDEX' };
  const card = catalog.get(inHand.cardId);
  if (!card) return { error: 'UNKNOWN_CARD' };

  const def = defs(card);
  // Items (potions, scrolls, ...) are one-shot effects and play exactly like spells.
  const isSpellLike = card.type === 'spell' || card.type === 'item';
  // A card that needs behaviour but has none is refused, rather than silently played as vanilla.
  if (!def && (isSpellLike || needsBehaviour(card))) return { error: 'UNSUPPORTED_CARD' };
  const cost = effectiveCost(state, me, card, catalog, defs, inHand.costDelta ?? 0);
  if (cost > player.energy.current) return { error: 'CANT_AFFORD' };

  // A Mystery goes face down; only one at a time.
  if (def?.mystery && player.mystery) return { error: 'MYSTERY_ACTIVE' };

  // "Choose one" cards need a valid option; every other card refuses one. The chosen option's own
  // target and effects replace the card's.
  let play: { target?: CardDef['target']; onPlay?: CardDef['onPlay'] } | undefined = def;
  if (def?.choices) {
    if (!Number.isInteger(choice) || choice === undefined || choice < 0 || choice >= def.choices.length) {
      return { error: 'BAD_CHOICE' };
    }
    play = def.choices[choice];
  } else if (choice !== undefined) {
    return { error: 'BAD_CHOICE' };
  }

  let index = 0;
  if (card.type === 'minion') {
    index = boardIndex ?? player.board.length;
    if (!Number.isInteger(index) || index < 0 || index > player.board.length) return { error: 'BAD_BOARD_INDEX' };
    if (player.board.length >= MAX_BOARD) return { error: 'BOARD_FULL' };
  }

  // Targets. A spell that needs a target and has none is refused. A warcry with no legal target
  // still lets the minion be played; the warcry just does nothing.
  if (play?.target) {
    const legal = legalTargets(state, { kind: 'card', handIndex, choice }, catalog, defs);
    if (legal.length > 0 || isSpellLike) {
      if (!isLegalTarget(legal, target)) return { error: 'ILLEGAL_TARGET' };
    } else if (target) {
      return { error: 'ILLEGAL_TARGET' };
    }
  } else if (target) {
    return { error: 'ILLEGAL_TARGET' };
  }

  return produce(state, (g) => {
    const p = g.players[me];
    p.hand.splice(handIndex, 1);
    p.energy.current -= cost;
    if (def?.mystery && p.mysteryFreeOnTurn === g.turn) delete p.mysteryFreeOnTurn; // the free Mystery is used up
    const overcharge = card.mechanics.includes('OVERLOAD') ? card.numbers.overcharge ?? 0 : 0;
    if (overcharge > 0) {
      p.overcharge = (p.overcharge ?? 0) + overcharge;
      events.push({ type: 'OverchargeGained', player: me, amount: overcharge, cardId: card.id });
    }
    if (!def?.mystery) g.played[me].push(card.id);
    p.plays = { now: (p.plays?.now ?? 0) + 1, prev: p.plays?.prev ?? 0 };
    // Spell damage only counts for spells, not warcries (RULES 8.3, Q16)
    const spellDamage =
      card.type === 'spell' ? p.board.reduce((sum, m) => sum + (minionDef(m, catalog, defs)?.spellDamage ?? 0), 0) : 0;
    const spellHealing =
      card.type === 'spell' ? p.board.reduce((sum, m) => sum + (minionDef(m, catalog, defs)?.spellHealing ?? 0), 0) : 0;
    if (card.type === 'spell' && p.spellDiscount?.turn === g.turn) delete p.spellDiscount; // the discount is used up
    let self: number | undefined;
    if (card.type === 'weapon') {
      p.weapon = { instanceId: inHand.instanceId, cardId: card.id, attack: card.attack ?? 0, durability: card.health ?? 0 };
      events.push({ type: 'WeaponEquipped', player: me, cardId: card.id });
    } else if (card.type === 'minion') {
      const minion = createMinion(card, inHand.instanceId, g.turn, g.nextPlaySeq++);
      if (inHand.rushOnPlay) minion.keywords.rush = true;
      p.board.splice(index, 0, minion);
      self = minion.instanceId;
      events.push({ type: 'MinionPlayed', player: me, instanceId: self, boardIndex: index, ...(target ? { target } : {}) });
      events.push({ type: 'MinionSummoned', player: me, instanceId: self, cardId: card.id });
    } else if (def?.mystery) {
      // Placed face down. It still counts as casting a spell (the `mystery` flag keeps other Mysteries from reacting to it).
      p.mystery = { instanceId: inHand.instanceId, cardId: card.id };
      events.push({ type: 'MysteryPlaced', player: me });
      events.push({ type: 'CardPlayed', player: me, instanceId: inHand.instanceId, cardId: card.id, mystery: true });
      return;
    } else {
      events.push({ type: 'CardPlayed', player: me, instanceId: inHand.instanceId, cardId: card.id, ...(target ? { target } : {}) });
    }
    // The enemy's Mystery may react to a spell about to resolve, and may redirect it.
    let aim = target;
    if (card.type === 'spell') aim = mysteryBeforeSpell(g, ctx, events, { caster: me, cardId: card.id, target });
    for (const effect of play?.onPlay ?? []) {
      effect({ g, caster: me, target: aim, self, rng, catalog, events, sourceCardId: card.id, spellDamage, spellHealing });
    }
  });
};
