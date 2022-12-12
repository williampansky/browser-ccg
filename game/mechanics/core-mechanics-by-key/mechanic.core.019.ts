import { current } from 'immer';
import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import { getContextualPlayerIds, pushEventStream } from '../../../utils';
import { counts } from '../../state';

/**
 * add card(s) opponent played to your deck
 */
const core019 = {
  exec: (
    G: GameState,
    ctx: Ctx,
    player: PlayerID,
    zoneNumber: number,
    playedCard: Card
  ) => {
    const { opponent } = getContextualPlayerIds(player);
    const { numberPrimary } = playedCard;
    const zoneSide = G.zones[zoneNumber].sides[player];
    const playedCardIdx = zoneSide.findIndex((o) => o.uuid === playedCard.uuid);
    // const playedCardNode = current(G.zones[zoneNumber].sides[player][playedCardIdx]);
    // const playedCardNode = current(playedCard);

    for (let index = 0; index < numberPrimary; index++) {
      if (G.playedCards[opponent].length !== 0) {
        const choice = ctx?.random?.Shuffle(G.playedCards[opponent])[0]!;

        if (choice) {
          G.players[player].cards.deck.push(choice);
          counts.incrementDeck(G, player);

          G.zones[zoneNumber].sides[player][playedCardIdx] = {
            ...G.zones[zoneNumber].sides[player][playedCardIdx],
            booleans: {
              ...G.zones[zoneNumber].sides[player][playedCardIdx].booleans,
              onPlayWasTriggered: true
            },
            eventStream: [
              ...G.zones[zoneNumber].sides[player][playedCardIdx].eventStream,
              {
                blame: playedCard.name,
                event: 'onPlayWasTriggered',
                uuid: playedCard.uuid,
              }
            ]
          }
          // current(playedCard.booleans.onPlayWasTriggered = true);
          // pushEventStream(playedCard, playedCard, 'onPlayWasTriggered');
        }
      }
    }
  },
};

export default core019;
