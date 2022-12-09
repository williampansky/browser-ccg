import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import {
  getContextualPlayerIds,
  handleCardDestructionMechanics,
  initActivateEventListeners,
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
        if (!c.booleans.isDestroyed) {
          possibleTargets.push({
            zoneNumber: zI,
            cardData: c,
            cardIndex: cI,
          });
        }
      });
    })

    for (let index = 0; index < playedCard.numberPrimary; index++) {
      // if there is a target
      if (possibleTargets.length !== 0) {
        // get a random one from the list
        const choice = ctx?.random?.Shuffle(possibleTargets)[0]!;

        if (choice) {
          pushEventStream(playedCard, playedCard, 'onPlayWasTriggered');
          playedCard.booleans.onPlayWasTriggered = true;

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

export default core041;
