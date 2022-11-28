import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID, Zone } from '../types';

interface PushPlayCardToZoneMove {
  aiID: PlayerID;
  card: Card;
  cardIndex: number;
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

    const playableCards: Card[] = [];
    let moves: any[] = [];

    if (gameConfig.ai.enableBotAiMoves === false) {
      if (G.playerTurnDone[aiID] === false) pushSetDoneMove(moves, aiID);
      return moves;
    }

    // avoids onslaught of INVALID_MOVE errors
    // prettier-ignore
    if (G.playerTurnDone[aiID] === false) {
      pushPlayCardMoves(moves, aiID, aiHand, playableCards, perZone, zones);

      G.zones.forEach((z, zI) => {
        z.sides['0'].forEach((c, cI) => {
          if (c.booleans.canBeDestroyed) {
            moves.push({
              move: 'destroyMinion',
              args: [aiID, c.uuid, zI]
            })
          }
        })
      })

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
  moves,
  perZone,
  zoneNumber,
  zones,
}: PushPlayCardToZoneMove) => {
  const zoneSideLength = zones[zoneNumber].sides[aiID].length;
  const slotsAvailableInZone = perZone - zoneSideLength;

  if (!zones[zoneNumber].disabled[aiID])
    for (let i = 0; i < slotsAvailableInZone; i++) {
      moves.push({
        move: 'playAiCard',
        args: [aiID, zoneNumber, card, cardIndex],
      });
    }
};

export const pushPlayCardMoves = (
  moves: any,
  aiID: PlayerID,
  hand: Card[],
  playableCards: Card[],
  perZone: number,
  zones: Zone[]
) => {
  if (hand.length >= 1) {
    determinePlayableCards(hand, playableCards);

    for (let i = 0; i < playableCards.length; i++) {
      const props = {
        aiID,
        card: playableCards[0],
        cardIndex: 0,
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

export const pushSetDoneMove = (moves: any, aiID: PlayerID) => {
  moves.push({ move: 'setDone', args: [aiID] });
};

export const logBotAiMovesToConsole = (moves: any, perConfig: boolean) => {
  if (perConfig === true && moves.length !== 0) console.log(moves);
};

export default aiEnumeration;
