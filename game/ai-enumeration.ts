import { gte, lt } from 'lodash';
import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID, Zone } from '../types';
import { getContextualPlayerIds, getRandomNumberBetween } from '../utils';
import { gameConfig } from '../app.config';

const {
  debugConfig: { useDebugOpponentHandCardKey },
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

    let moves: any[] = [];

    if (gameConfig.ai.enableBotAiMoves === false) {
      if (G.playerTurnDone[aiID] === false) pushSetDoneMove(moves, aiID);
      return moves;
    }

    // avoids onslaught of INVALID_MOVE errors
    // prettier-ignore
    if (G.playerTurnDone[aiID] === false) {
      pushPlayCardMovesV2(G, moves, aiID, ap, aiHand, perZone, zones);
      pushSetDoneMove(moves, aiID);
    }

    logBotAiMovesToConsole(moves, gameConfig.ai.logBotAiMovesToConsole);
    return moves;
  },
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
  // const zoneSideLength = zones[zoneNumber].sides[aiID].length;
  // const slotsAvailableInZone = lt(zoneSideLength, perZone);
  // const zoneIsNotDisabled = !zones[zoneNumber].disabled[aiID];
  // const canAfford = gte(currentAp, card.currentCost);

  // if (canAfford && zoneIsNotDisabled && slotsAvailableInZone)
  moves.push({
    move: 'aiPlayCard',
    args: [aiID, zoneNumber, card, cardIndex],
  });
  // else
  //   moves.push({
  //     move: 'setDone',
  //     args: [aiID],
  //   });
};

export const pushPlayCardMoves = (
  G: GameState,
  moves: any,
  aiID: PlayerID,
  currentAp: number,
  hand: Card[],
  perZone: number,
  zones: Zone[]
) => {
  const handHasAtLeastOneCard = hand.length >= 1;
  const movesArrIsAtOrBelow = (n: number) => moves.length <= n;

  // if (handHasAtLeastOneCard && movesArrIsAtOrBelow(2)) {
  const amountToPlay = useDebugOpponentHandCardKey ? 1 : hand.length;
  let rngIdx = getRandomNumberBetween(0, hand.length - 1);
  let rngCard = hand[rngIdx];

  interface target {
    zoneNumber: number;
    cardData: Card;
    cardIndex: number;
  }

  let possibleTargets: target[] = [];

  // for (let i = 0; i < amountToPlay; i++) {
  if (rngCard.canPlay) {
    // const props = {
    //   aiID,
    //   card: useDebugOpponentHandCardKey
    //     ? hand[0]
    //     : rngCard,
    //   cardIndex: useDebugOpponentHandCardKey ? 0 : rngIdx,
    //   currentAp,
    //   moves,
    //   perZone,
    //   zones,
    // };
    possibleTargets.push({
      zoneNumber: getRandomNumberBetween(0, 2),
      cardData: rngCard,
      cardIndex: rngIdx,
    });

    // if (useDebugOpponentHandCardKey) {
    //   pushPlayCardToZoneMoves({ ...props, zoneNumber: 0 });
    // } else {
    //   pushPlayCardToZoneMoves({ ...props, zoneNumber: 0 });
    //   pushPlayCardToZoneMoves({ ...props, zoneNumber: 1 });
    //   pushPlayCardToZoneMoves({ ...props, zoneNumber: 2 });
    // }
    let choice: target | undefined;

    if (possibleTargets.length !== 0) {
      choice = possibleTargets[0];

      if (choice !== undefined) {
        moves.push({
          move: 'aiPlayCard',
          args: [aiID, choice.zoneNumber, choice.cardData, choice.cardIndex],
        });

        choice = undefined;
        possibleTargets = [];
      }
    }
  }
  // }
  // } else {
  // moves.push({
  //   move: 'setDone',
  //   args: [aiID],
  // });
  // }
};

export const pushPlayCardMovesV2 = (
  G: GameState,
  moves: any,
  aiID: PlayerID,
  currentAp: number,
  hand: Card[],
  perZone: number,
  zones: Zone[]
) => {
  const {
    gameConfig: {
      numerics: { numberOfSlotsPerZone },
    },
  } = G;

  const move = (zoneNum: number, card: Card, cardIdx: number) => {
    let notDisabled = !G.zones[zoneNum].disabled[aiID];
    let notFull = lt(G.zones[zoneNum].sides[aiID].length, numberOfSlotsPerZone);

    if (notDisabled && notFull)
      moves.push({
        move: 'aiPlayCard',
        args: [aiID, zoneNum, card, cardIdx],
      });
  };

  if (G.aiPossibleCards.length !== 0) {
    let rngIdx = getRandomNumberBetween(0, G.aiPossibleCards.length - 1);
    let rngCard = G.aiPossibleCards[rngIdx];
    G.zones.forEach((_, zi) => {
      move(zi, rngCard, rngIdx);
    });
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
  moves.push({ move: 'aiSetDone', args: [aiID] });
};

export const logBotAiMovesToConsole = (moves: any, perConfig: boolean) => {
  if (perConfig === true && moves.length !== 0) console.log(moves);
};

export default aiEnumeration;
