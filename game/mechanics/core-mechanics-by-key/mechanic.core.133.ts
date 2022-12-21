import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import { cardUuidMatch, filterArray } from '../../../utils';
import { counts } from '../../state';
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
  execAi: (G: GameState, ctx: Ctx, card: Card, aiID: PlayerID) => {
    const choice = core133.getMostExpensiveCardInHand(G, aiID);
    let choiceIdx: number;

    if (choice) {
      G.zones.forEach((z, zi) => {
        z.sides[aiID].forEach((c, ci) => {
          if (cardUuidMatch(c, card)) {
            const node = G.zones[zi].sides[aiID][ci];
            G.zones[zi].sides[aiID][ci] = {
              ...node,
              booleans: {
                ...node.booleans,
                onPlayWasTriggered: true
              },
              eventStream: [
                ...node.eventStream,
                {
                  blame: card.name,
                  event: 'onPlayWasTriggered',
                  uuid: card.uuid
                }
              ]
            }
          }
        })
      })

      G.players[aiID].cards.hand.forEach((c, ci) => {
        if (cardUuidMatch(c, choice)) {
          choiceIdx = ci;
          const node = G.players[aiID].cards.hand[ci];
          G.players[aiID].cards.hand[ci] = {
            ...node,
            booleans: {
              ...node.booleans,
              wasDiscarded: true
            }
          }
        }
      })

      G.players[aiID].cards.discarded.push(choice);
      counts.decrementHand(G, aiID);
      counts.incrementDiscarded(G, aiID);
      filterArray(G.players[aiID].cards.hand, choice.uuid, choiceIdx!);
    }
  },
};

export default core133;
