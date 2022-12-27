import { v4 } from 'uuid';
import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import { counts } from '../../state';
import {
  aiSpreadEventStreamAndOnPlayBoolean,
  getContextualPlayerIds,
  pushEventStream,
  pushEventStreamAndSetBoolean,
} from '../../../utils';

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

    for (let index = 0; index < numberPrimary; index++) {
      if (G.playedCards[opponent].length !== 0) {
        const choice = ctx?.random?.Shuffle(G.playedCards[opponent])[0]!;

        if (choice) {
          const dupe = { ...choice, uuid: v4() };
          G.players[player].cards.deck.push(dupe);
          counts.incrementDeck(G, player);

          playedCard.booleans.onPlayWasTriggered = true;
          pushEventStream(playedCard, playedCard, 'onPlayWasTriggered');
        }
      }
    }
  },

  execAi: (
    G: GameState,
    ctx: Ctx,
    player: PlayerID,
    zoneNumber: number,
    playedCard: Card,
    playedCardIdx: number
  ) => {
    const { opponent } = getContextualPlayerIds(player);
    const { numberPrimary } = playedCard;

    for (let index = 0; index < numberPrimary; index++) {
      if (G.playedCards[opponent].length !== 0) {
        const choice = ctx?.random?.Shuffle(G.playedCards[opponent])[0]!;

        if (choice) {
          const dupe = { ...choice, uuid: v4() };
          G.players[player].cards.deck.push(dupe);
          counts.incrementDeck(G, player);

          G.zones[zoneNumber].sides[player].forEach((c, ci) => {
            if (playedCard.uuid === c.uuid && playedCardIdx === ci) {
              pushEventStreamAndSetBoolean(
                G,
                ctx,
                player,
                zoneNumber,
                c,
                c,
                'onPlayWasTriggered'
              );
            }
          });
        }
      }
    }
  },
};

export default core019;
