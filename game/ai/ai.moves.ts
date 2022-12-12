import { current }from 'immer'
import { Ctx, LongFormMove } from 'boardgame.io';
import { CardPlayType, LastMoveMade, Mechanics } from '../../enums';
import { Card, GameState, PlayerID } from '../../types';
import { filterArray, getCardPower, initActivateEventListeners, removeLastPlayedCardFromHand } from '../../utils';
import {
  actionPoints,
  counts,
  lastCardPlayed,
  playedCards,
  playerTurnDone,
} from '../state';
import { fxEnd } from '../config.bgio-effects';
import { INVALID_MOVE } from 'boardgame.io/core';
import { gte, lt, lte } from 'lodash';
import { determineOnPlayGlobalMechanic, determineTargetedOnPlayContext } from '../moves/on-play.move.methods';

export const aiPlayCard: LongFormMove = {
  client: false,
  noLimit: true,
  ignoreStaleStateID: true,
  undoable: false,
  move: (G: GameState, ctx: Ctx, { ...args }: AiPlayCardMove) => {
    return aiPlayCardMove(G, ctx, { ...args });
  },
};

export interface AiPlayCardMove {
  aiID: PlayerID;
  zoneNumber: number;
  card: Card;
  cardIndex: number;
}

export const aiPlayCardMove = (
  G: GameState,
  ctx: Ctx,
  { ...args }: AiPlayCardMove
) => {
  const { currentPlayer } = ctx;
  const player = currentPlayer;
  const slotsPerZone = G.gameConfig.numerics.numberOfSlotsPerZone;

  const { aiID, zoneNumber, card, cardIndex } = args;

  const ap = G.actionPoints;
  const zone = G.zones[zoneNumber];
  const cantAffordCard = !gte(ap[player].current, card.currentCost);
  const zoneIsDisabled = zone.disabled[player];
  const zoneIsFull = zone.sides[player].length > slotsPerZone;
  const hasOnPlayMechanic = card.mechanics?.includes(Mechanics.OnPlay);
  const playTypeIsTargeted = card.playType === CardPlayType.Targeted;
  const playTypeIsGlobal = card.playType === CardPlayType.Global;

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
  if (hasOnPlayMechanic && playTypeIsTargeted) {
    determineTargetedOnPlayContext(G, ctx, card);
  } else if (hasOnPlayMechanic && playTypeIsGlobal) {
    determineOnPlayGlobalMechanic(G, ctx, zoneNumber, card, player);
    initActivateEventListeners(G, ctx);
  } else {
    initActivateEventListeners(G, ctx);
  }
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
