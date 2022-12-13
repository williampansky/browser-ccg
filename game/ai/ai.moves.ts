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
  const zoneIsFull = zone.sides[player].length > slotsPerZone;

  // validate move
  if (cantAffordCard) return INVALID_MOVE;
  if (zoneIsDisabled) return INVALID_MOVE;
  if (zoneIsFull) return INVALID_MOVE;

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

  // init card mechs
  switch (card.key) {
    case 'SET_CORE_005':
      core005.execAi(G, ctx, aiID, zoneNumber, card);
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
