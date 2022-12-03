import { gte, lt } from 'lodash';
import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID, Zone } from '../types';
import { getContextualPlayerIds, getRandomNumberBetween } from '../utils';
import { gameConfig } from '../app.config';

const {
  debugConfig: { debugOpponentHandCardKey, useDebugOpponentHandCardKey },
} = gameConfig;

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
  enumerate: (G: GameState, ctx: Ctx, player: PlayerID) => {
    const { players, zones, gameConfig } = G;
    const aiID = '1';
    const perZone = gameConfig.numerics.numberOfSlotsPerZone;
    const aiPlayer = players[aiID];
    const aiHand = aiPlayer.cards.hand;
    const ap = G.actionPoints[aiID].current;
    // const playableCards: Card[] = [];

    let moves: any[] = [];

    if (gameConfig.ai.enableBotAiMoves === false) {
      if (G.playerTurnDone[aiID] === false) pushSetDoneMove(moves, aiID);
      return moves;
    }

    // avoids onslaught of INVALID_MOVE errors
    // prettier-ignore
    if (G.playerTurnDone[aiID] === false) {
      // determinePlayableCards(aiHand, playableCards);
      pushPlayCardMoves(moves, aiID, ap, aiHand, perZone, zones);
      pushInteractionMoves(G, moves, aiID);
      pushSetDoneMove(moves, aiID);
    }

    logBotAiMovesToConsole(moves, gameConfig.ai.logBotAiMovesToConsole);
    return moves;
  },
};

// export const determinePlayableCards = (hand: Card[], playableCards: Card[]) => {
//   hand.forEach((c: Card) => {
//     if (c && c.canPlay) playableCards.push(c);
//   });
// };

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
    moves.push({
      move: 'playAiCard',
      args: [aiID, zoneNumber, card, cardIndex],
    });
};

export const pushPlayCardMoves = (
  moves: any,
  aiID: PlayerID,
  currentAp: number,
  hand: Card[],
  perZone: number,
  zones: Zone[]
) => {
  const handHasAtLeastOneCard = hand.length >= 1;
  const movesArrIsAtOrBelow = (n: number) => moves.length <= n;
  
  if (handHasAtLeastOneCard && movesArrIsAtOrBelow(20)) {
    const amountToPlay = useDebugOpponentHandCardKey ? 1 : hand.length;
    const rngIdx = getRandomNumberBetween(0, hand.length - 1);
    const rngCard = hand[rngIdx];

    for (let i = 0; i < amountToPlay; i++) {
      if (rngCard.canPlay) {
        const props = {
          aiID,
          card: useDebugOpponentHandCardKey
            ? hand[0]
            : rngCard,
          cardIndex: useDebugOpponentHandCardKey ? 0 : rngIdx,
          currentAp,
          moves,
          perZone,
          zones,
        };
  
        if (useDebugOpponentHandCardKey) {
          pushPlayCardToZoneMoves({ ...props, zoneNumber: 0 });
        } else {
          pushPlayCardToZoneMoves({ ...props, zoneNumber: 0 });
          pushPlayCardToZoneMoves({ ...props, zoneNumber: 1 });
          pushPlayCardToZoneMoves({ ...props, zoneNumber: 2 });
        }
      }
    }
  }
};

export const pushInteractionMoves = (
  G: GameState,
  moves: any,
  aiID: PlayerID
) => {
  const { player, opponent } = getContextualPlayerIds(aiID);
  const human = opponent;
  const bot = player;

  G.zones.forEach((z, zI) => {
    z.sides[human].forEach((c, cI) => {
      if (c.booleans.canBeAttackedBySpell) {
        moves.push({
          move: 'attackMinion',
          args: [aiID, human, c.uuid, zI],
        });
      }

      if (c.booleans.canBeDestroyed) {
        moves.push({
          move: 'destroyMinion',
          args: [aiID, human, c.uuid, zI],
        });
      }
    });

    z.sides[bot].forEach((c, cI) => {
      if (c.booleans.canBeBuffed) {
        moves.push({
          move: 'buffMinion',
          args: [aiID, bot, c.uuid, zI],
        });
      }
      if (c.booleans.canBeHealed) {
        moves.push({
          move: 'healMinion',
          args: [aiID, bot, c.uuid, zI],
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
