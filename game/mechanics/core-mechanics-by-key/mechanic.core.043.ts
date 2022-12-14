import type { Ctx } from 'boardgame.io';
import type {
  Card,
  GameState,
  PlayerID,
} from '../../../types';
import { aiSpreadEventStreamAndOnPlayBoolean, cardUuidMatch, filterArray, getContextualPlayerIds, handleCardDestructionMechanics } from '../../../utils';
import { counts } from '../../state';

/**
 * destroy a minion
 */
const core043 = {
  execAi: (
    G: GameState,
    ctx: Ctx,
    aiID: PlayerID,
    zoneNumber: number,
    playedCard: Card,
    playedCardIdx: number
  ) => {
    const { numberPrimary } = playedCard;
    const { opponent } = getContextualPlayerIds(aiID);
    let possibleTargets: {
      zoneNumber: number;
      cardData: Card;
      cardIndex: number;
    }[] = [];

    G.zones[zoneNumber].sides[opponent].forEach((c, cI) => {
      if (!c.booleans.isDestroyed && c.baseCost === numberPrimary) {
        possibleTargets.push({
          zoneNumber,
          cardData: c,
          cardIndex: cI,
        });
      }
    });

    if (possibleTargets.length !== 0) {
      const choice = ctx?.random?.Shuffle(possibleTargets)[0]!;
      if (choice) {
        G.zones[zoneNumber].sides[opponent].forEach((c, cI) => {
          if (cardUuidMatch(c, choice.cardData)) {
            G.zones[zoneNumber].sides[opponent][cI] = {
              ...G.zones[zoneNumber].sides[opponent][cI],
              booleans: {
                ...G.zones[zoneNumber].sides[opponent][cI].booleans,
                isDestroyed: true
              }
            }
            
            handleCardDestructionMechanics(G, c, opponent);
          }
        });

        G.zones[zoneNumber].sides[aiID].forEach((ca, caI) => {
          if (cardUuidMatch(ca, playedCard)) {
            aiSpreadEventStreamAndOnPlayBoolean(
              G,
              ctx,
              aiID,
              zoneNumber,
              ca,
              caI,
              choice.cardData,
              'onPlayWasTriggered'
            );
          }
        });
      }
    }
  },
};

export default core043;
