import type { Draft } from 'immer';
import { GameEvent, GameState, MAX_HAND, PlayerId } from '../state/types';
import { damageHero } from './damage';

/**
 * Draws one card. Full hand: the card is burned (removed from the deck, not added).
 * Empty deck: fatigue, escalating 1, 2, 3... damage to the hero. Call inside `produce`.
 */
export const drawCard = (g: Draft<GameState>, player: PlayerId, events: GameEvent[]): void => {
  const p = g.players[player];
  const card = p.deck.shift();
  if (!card) {
    p.fatigue += 1;
    events.push({ type: 'Fatigue', player, damage: p.fatigue });
    damageHero(g, player, p.fatigue, events);
    return;
  }
  if (p.hand.length >= MAX_HAND) {
    events.push({ type: 'Burned', player, instanceId: card.instanceId });
    return;
  }
  p.hand.push(card);
  events.push({ type: 'Drew', player, instanceId: card.instanceId });
};
