import type { Ctx } from 'boardgame.io';
import { gte, lt } from 'lodash';
import type { Card, GameState, PlayerID, Zone } from '../types';
import { getRandomNumberBetween } from '../utils';

interface PushPlayCardToZoneMove {
  aiID: PlayerID;
  card: Card;
  cardIndex: number;
  currentAp: number;
  moves: any;
  perZone: number;
  zoneNumber: number;
  zones: Zone[];
}

const aiEnumeration = {
  enumerate: (G: GameState, ctx: Ctx) => {
    const { players, zones, gameConfig } = G;
    const aiID = '1';
    const perZone = gameConfig.numerics.numberOfSlotsPerZone;
    const aiPlayer = players[aiID];
    const aiHand = aiPlayer.cards.hand;
    const ap = G.actionPoints[aiID].current;

    const playableCards: Card[] = [];
    let moves: any[] = [];

    if (gameConfig.ai.enableBotAiMoves === false) {
      if (G.playerTurnDone[aiID] === false) pushSetDoneMove(moves, aiID);
      return moves;
    }

    // avoids onslaught of INVALID_MOVE errors
    // prettier-ignore
    if (G.playerTurnDone[aiID] === false) {
      pushPlayCardMoves(moves, aiID, ap, aiHand, playableCards, perZone, zones);
      pushInteractionMoves(G, moves, aiID);
      pushSetDoneMove(moves, aiID);
    }

    logBotAiMovesToConsole(moves, gameConfig.ai.logBotAiMovesToConsole);
    return moves;
  },
};

export const determinePlayableCards = (hand: Card[], playableCards: Card[]) => {
  hand.forEach((c: Card) => {
    if (c.canPlay) playableCards.push(c);
  });
};

export const pushPlayCardToZoneMoves = ({
  aiID,
  card,
  cardIndex,
  currentAp,
  moves,
  perZone,
  zoneNumber,
  zones,
}: PushPlayCardToZoneMove) => {
  const zoneSideLength = zones[zoneNumber].sides[aiID].length;
  const slotsAvailableInZone = lt(zoneSideLength, perZone);
  const zoneIsNotDisabled = !zones[zoneNumber].disabled[aiID];
  const canAfford = gte(currentAp, card.currentCost);

  if (canAfford && zoneIsNotDisabled && slotsAvailableInZone)
    // for (let i = 0; i < slotsAvailableInZone; i++) {
    moves.push({
      move: 'playAiCard',
      args: [aiID, zoneNumber, card, cardIndex],
    });
  // }
};

export const pushPlayCardMoves = (
  moves: any,
  aiID: PlayerID,
  currentAp: number,
  hand: Card[],
  playableCards: Card[],
  perZone: number,
  zones: Zone[]
) => {
  const handHasAtLeastOneCard = hand.length >= 1;
  const movesArrIsAtOrBelow = (n: number) => moves.length <= n;

  if (handHasAtLeastOneCard && movesArrIsAtOrBelow(20)) {
    determinePlayableCards(hand, playableCards);

    for (let i = 0; i < playableCards.length; i++) {
      const rngIdx = getRandomNumberBetween(0, playableCards.length - 1);
      const rngCard = playableCards[rngIdx];
      const props = {
        aiID,
        card: rngCard,
        cardIndex: rngIdx,
        currentAp,
        moves,
        perZone,
        zones,
      };

      pushPlayCardToZoneMoves({ ...props, zoneNumber: 0 });
      pushPlayCardToZoneMoves({ ...props, zoneNumber: 1 });
      pushPlayCardToZoneMoves({ ...props, zoneNumber: 2 });
    }
  }
};

export const pushInteractionMoves = (
  G: GameState,
  moves: any,
  aiID: PlayerID
) => {
  G.zones.forEach((z, zI) => {
    z.sides['0'].forEach((c, cI) => {
      if (c.booleans.canBeDestroyed) {
        moves.push({
          move: 'destroyMinion',
          args: [aiID, c.uuid, zI],
        });
      }
    });

    z.sides['1'].forEach((c, cI) => {
      if (c.booleans.canBeBuffed) {
        moves.push({
          move: 'buffMinion',
          args: [aiID, c.uuid, zI],
        });
      }
    });
  });
};

export const pushSetDoneMove = (moves: any, aiID: PlayerID) => {
  moves.push({ move: 'setDone', args: [aiID] });
};

export const logBotAiMovesToConsole = (moves: any, perConfig: boolean) => {
  if (perConfig === true && moves.length !== 0) console.log(moves);
};

export default aiEnumeration;
