import type { Ctx } from 'boardgame.io';
import type { Card, CardBase, GameState, PlayerID } from '../../../types';

import { counts } from '../../state';
import { CardBaseRarity, CardBaseType } from '../../../enums';
import { aiSpreadEventStreamAndOnPlayBoolean, createCardObject, isBotTurn, pushEventStream } from '../../../utils';

import setsCore from '../../data/setsCore.json';
const db = [...setsCore];

/**
 * on play: add a random legendary to your hand
 */
const core011 = {
  exec: (
    G: GameState,
    ctx: Ctx,
    player: PlayerID,
    zoneNumber: number,
    playedCard: Card
  ) => {
    const { numerics } = G.gameConfig;
    const cardsArr = db.filter((c: CardBase) => {
      return (
        c.key !== playedCard.key &&
        c.rarity === CardBaseRarity.Mythic &&
        c.type === CardBaseType.Minion
      );
    });

    if (G.players[player].cards.hand.length < numerics.cardsPerHand) {
      const randomCardBase = ctx.random!.Shuffle(cardsArr)[0];

      if (randomCardBase) {
        const randomCard = createCardObject(randomCardBase);

        G.players[player].cards.hand.push(randomCard);
        counts.incrementHand(G, player);

        if (isBotTurn(ctx)) {
          aiSpreadEventStreamAndOnPlayBoolean(
            G,
            ctx,
            player,
            zoneNumber,
            playedCard,
            playedCard,
            'onPlayWasTriggered'
          );
        } else {
          playedCard.booleans.onPlayWasTriggered = true;
          pushEventStream(playedCard, playedCard, 'onPlayWasTriggered');
        }
      }
    }
  },
};

export default core011;
