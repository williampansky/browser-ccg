import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import {
  aiSpreadEventStreamAndOnPlayBoolean,
  cardUuidMatch,
  getContextualPlayerIds,
  handleCardDestructionMechanics,
  initActivateEventListeners,
  isBotTurn,
  pushEventStream,
  pushEventStreamAndSetBoolean,
} from '../../../utils';

/**
 * destroy a random 1-cost on opponent's side
 */
const core006 = {
  exec: (
    G: GameState,
    ctx: Ctx,
    player: PlayerID,
    zoneNumber: number,
    playedCard: Card
  ) => {
    const { numberPrimary } = playedCard;
    const { opponent } = getContextualPlayerIds(player);
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
      // if there is a target
      // get a random one from the list
      const choice = ctx?.random?.Shuffle(possibleTargets)[0];

      if (choice) {
        const target = G.zones[zoneNumber].sides[opponent][choice.cardIndex];

        pushEventStream(playedCard, choice.cardData, 'onPlayWasTriggered');
        playedCard.booleans.onPlayWasTriggered = true;

        target.booleans.isDestroyed = true;
        target.booleans.canBeDestroyed = false;
        target.destroyedOnTurn = G.turn;
        pushEventStream(target, playedCard, 'wasDestroyed');
        handleCardDestructionMechanics(G, target, opponent);
        initActivateEventListeners(G, ctx);
      }
    }
  },

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

export default core006;
