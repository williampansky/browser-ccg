import { current } from 'immer';
import { Ctx, LongFormMove } from 'boardgame.io';
import { CardPlayType, CardRace, LastMoveMade, Mechanics } from '../../enums';
import { Card, GameState, PlayerID } from '../../types';
import {
  cardUuidMatch,
  filterArray,
  getCardPower,
  initActivateEventListeners,
  pushEventStream,
  pushEventStreamAndSetBoolean,
  pushPowerStreamAndSetDisplay,
  removeLastPlayedCardFromHand,
} from '../../utils';
import {
  actionPoints,
  counts,
  lastCardPlayed,
  playedCards,
  playerTurnDone,
} from '../state';
import { fxEnd } from '../config.bgio-effects';
import { INVALID_MOVE } from 'boardgame.io/core';
import { gte, lt, lte, set } from 'lodash';
import {
  determineOnPlayGlobalMechanic,
  determineTargetedOnPlayContext,
} from '../moves/on-play.move.methods';
import { add } from 'mathjs';
import core031 from '../mechanics/core-mechanics-by-key/mechanic.core.031';
import core005 from '../mechanics/core-mechanics-by-key/mechanic.core.005';
import core004 from '../mechanics/core-mechanics-by-key/mechanic.core.004';
import core006 from '../mechanics/core-mechanics-by-key/mechanic.core.006';
import core007 from '../mechanics/core-mechanics-by-key/mechanic.core.007';
import core011 from '../mechanics/core-mechanics-by-key/mechanic.core.011';
import core019 from '../mechanics/core-mechanics-by-key/mechanic.core.019';
import core029 from '../mechanics/core-mechanics-by-key/mechanic.core.029';

export const aiPlayCard: LongFormMove = {
  client: false,
  noLimit: true,
  ignoreStaleStateID: true,
  undoable: false,
  move: (
    G: GameState,
    ctx: Ctx,
    aiID: PlayerID,
    zoneNumber: number,
    card: Card,
    cardIndex: number
  ) => {
    return aiPlayCardMove(G, ctx, aiID, zoneNumber, card, cardIndex);
  },
};

export interface AiPlayCardMove {
  G: GameState;
  ctx: Ctx;
  aiID: PlayerID;
  zoneNumber: number;
  card: Card;
  cardIndex: number;
}

export const aiPlayCardMove = (
  G: GameState,
  ctx: Ctx,
  aiID: PlayerID,
  zoneNumber: number,
  card: Card,
  cardIndex: number
) => {
  const { currentPlayer } = ctx;
  const player = currentPlayer;
  const slotsPerZone = G.gameConfig.numerics.numberOfSlotsPerZone;
  const ap = G.actionPoints;
  const zone = G.zones[zoneNumber];
  const cantAffordCard = !gte(ap[player].current, card.currentCost);
  const zoneIsDisabled = zone.disabled[player];
  const zoneIsFull = lt(zone.sides[player].length, slotsPerZone);

  // validate move
  if (cantAffordCard) {
    console.error('INVALID_MOVE(cantAffordCard)', 'apC: ' + ap[player].current, 'cost: ' + card.currentCost);
    return INVALID_MOVE;
  }

  if (zoneIsDisabled) {
    console.error('INVALID_MOVE(zoneIsDisabled)', 'zone ' + zoneNumber, 'disabled: ' + zone.disabled[player]);
    return INVALID_MOVE;
  }

  // if (zoneIsFull) {
  //   console.error('INVALID_MOVE(zoneIsFull)', 'zone ' + zoneNumber, 'length: ' + zone.sides[player].length);
  //   return INVALID_MOVE;
  // }

  // add card to PlayedCards array
  playedCards.push(G, player, card);

  // remove cost from current action points
  actionPoints.subtract(G, player, card.currentCost);

  // push card to zone side array
  zone.sides[player].push({
    ...card,
    revealed: true, // reveal card
    displayPower: getCardPower(card), // set display power
    revealedOnTurn: G.turn, // set revealedOnTurn value
  });

  // reset datas
  lastCardPlayed.set(G, { card, index: cardIndex });
  removeLastPlayedCardFromHand(G, player);

  // set last move
  G.lastMoveMade = LastMoveMade.aiPlayCard;

  // get played card index in zone
  const playedCardIdx = G.zones[zoneNumber].sides[player].findIndex((o) => {
    return o.uuid === card.uuid;
  });

  // init card mechs
  switch (card.key) {
    case 'SET_CORE_004':
      core004.execAi(G, ctx, aiID, zoneNumber, card, playedCardIdx);
      break;
    case 'SET_CORE_005':
      core005.execAi(G, ctx, aiID, zoneNumber, card);
      break;
    case 'SET_CORE_006':
      core006.execAi(G, ctx, aiID, zoneNumber, card, playedCardIdx);
      break;
    case 'SET_CORE_007':
      core007.execAi(G, ctx, aiID, zoneNumber, card, playedCardIdx);
      break;
    case 'SET_CORE_011':
      core011.execAi(G, ctx, aiID, zoneNumber, card, playedCardIdx);
      break;
    case 'SET_CORE_019':
      core019.execAi(G, ctx, aiID, zoneNumber, card, playedCardIdx);
      break;
    case 'SET_CORE_029':
      core029.execAi(G, ctx, aiID, zoneNumber, card, playedCardIdx);
      break;
    case 'SET_CORE_031':
      core031.execAi(G, ctx, aiID, card);
      break;
    default:
      break;
  }

  // check active listeners
  initActivateEventListeners(G, ctx);
};

export const aiSetDone: LongFormMove = {
  client: false,
  noLimit: true,
  ignoreStaleStateID: true,
  undoable: false,
  move: (G: GameState, ctx: Ctx, { aiID }: AiPlayCardMove) => {
    return aiSetDoneMove(G, ctx, { aiID });
  },
};

export interface AiSetDoneMove {
  aiID: PlayerID;
}

export const aiSetDoneMove = (
  G: GameState,
  ctx: Ctx,
  { ...args }: AiSetDoneMove
) => {
  // const { aiID } = args;
  const aiID = '1';
  G.lastMoveMade = LastMoveMade.AiSetDone;
  playerTurnDone.set(G, aiID);

  if (G.gameConfig.debugConfig.logPhaseToConsole) {
    console.log(`--- setDoneMove(${aiID}) ---`);
  }
};
