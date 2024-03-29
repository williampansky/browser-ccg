import type { Ctx } from 'boardgame.io';
import { CardType } from '../../../enums';
import type { Card, GameState, PlayerID } from '../../../types';
import {
  cardIsNotSelf,
  getContextualPlayerIds,
  handleCardDestructionMechanics,
  initActivateEventListeners,
  isBotTurn,
  pushEventStream,
} from '../../../utils';

/**
 * destroy random enemy minion
 */
const core041 = {
  exec: (
    G: GameState,
    ctx: Ctx,
    player: PlayerID,
    zoneNumber: number,
    playedCard: Card
  ) => {
    const { opponent } = getContextualPlayerIds(player);

    let possibleTargets: {
      zoneNumber: number;
      cardData: Card;
      cardIndex: number;
    }[] = [];

    G.zones.forEach((z, zI) => {
      z.sides[opponent].forEach((c, cI) => {
        const isNotSelf = cardIsNotSelf(c, playedCard);
        const isNotDestroyed = c.booleans.isDestroyed === false;
        const isMinion = c.type === CardType.Minion;

        if (isNotSelf && isMinion && isNotDestroyed) {
          possibleTargets.push({
            zoneNumber: zI,
            cardData: c,
            cardIndex: cI,
          });
        }
      });
    });

    for (let index = 0; index < playedCard.numberPrimary; index++) {
      // if there is a target
      if (possibleTargets.length !== 0) {
        // get a random one from the list
        const choice = ctx?.random?.Shuffle(possibleTargets)[0]!;

        if (choice) {
          if (isBotTurn(ctx, player)) {
            aiSpreadMove(G, ctx, player, zoneNumber, playedCard);
          } else {
            playedCard.booleans.onPlayWasTriggered = true;
            pushEventStream(playedCard, playedCard, 'onPlayWasTriggered');
          }

          choice.cardData.booleans.isDestroyed = true;
          choice.cardData.booleans.canBeDestroyed = false;
          choice.cardData.destroyedOnTurn = G.turn;
          pushEventStream(choice.cardData, playedCard, 'wasDestroyed');
          handleCardDestructionMechanics(G, choice.cardData, opponent);
          initActivateEventListeners(G, ctx);
        }
      }
    }
  },
};

function aiSpreadMove(
  G: GameState,
  ctx: Ctx,
  player: PlayerID,
  zoneNumber: number,
  playedCard: Card
) {
  const zoneSide = G.zones[zoneNumber].sides[player];
  const playedCardIdx = zoneSide.findIndex((o) => o.uuid === playedCard.uuid);

  if (playedCardIdx) {
    G.zones[zoneNumber].sides[player][playedCardIdx] = {
      ...G.zones[zoneNumber].sides[player][playedCardIdx],
      booleans: {
        ...G.zones[zoneNumber].sides[player][playedCardIdx].booleans,
        onPlayWasTriggered: true,
      },
      eventStream: [
        ...G.zones[zoneNumber].sides[player][playedCardIdx].eventStream,
        {
          blame: playedCard.name,
          event: 'onPlayWasTriggered',
          uuid: playedCard.uuid,
        },
      ],
    };
  }
}

export default core041;
