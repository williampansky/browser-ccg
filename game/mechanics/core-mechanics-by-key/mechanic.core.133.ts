import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import { discardCardFromHandOnPlay } from '../on-play-mechanics';

/**
 * discard most expensive-costing card from hand
 */
const core133 = {
  sortHandByCost: (G: GameState, player: PlayerID) => {
    return G.players[player].cards.hand
      .map((c) => c)
      .sort((a: Card, b: Card) => b.currentCost - a.currentCost);
  },
  getMostExpensiveCardInHand: (G: GameState, player: PlayerID) => {
    const sortedHandByCost = core133.sortHandByCost(G, player);
    return sortedHandByCost[0];
  },
  exec: (G: GameState, ctx: Ctx, card: Card, player: PlayerID) => {
    const choice = core133.getMostExpensiveCardInHand(G, player);
    if (choice) discardCardFromHandOnPlay(G, ctx, player, card, choice);
  },
};

export default core133;
