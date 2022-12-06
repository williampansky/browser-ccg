import { Ctx, LongFormMove } from 'boardgame.io';
import { LastMoveMade, Mechanics } from '../../enums';
import { Card, GameState, PlayerID } from '../../types';
import { filterArray, getCardPower } from '../../utils';
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
  const {
    gameConfig: {
      numerics: { numberOfSlotsPerZone },
    },
    players,
    zones,
  } = G;

  const { aiID, zoneNumber, card, cardIndex } = args;

  const player = aiID;
  const ap = G.actionPoints;
  const playerObj = players[player];
  const cardUuid = card.uuid;
  const zone = zones[zoneNumber];
  const cantAffordCard = !gte(ap[player].current, card.currentCost);

  if (cantAffordCard) return INVALID_MOVE;
  if (zone.disabled[player]) return INVALID_MOVE;
  if (zone.sides[player].length > numberOfSlotsPerZone) return INVALID_MOVE;

  // lastCardPlayed.set(G, { card, index: cardIndex });

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

  // remove card from hand
  // const newHand = G.players[aiID].cards.hand.filter(o => o.uuid !== cardUuid);
  // G.players[aiID].cards.hand = newHand;
  filterArray(G.players[aiID].cards.hand, cardUuid, cardIndex);

  // recount cards in hand
  counts.decrementHand(G, player);

  G.lastMoveMade = 'aiPlayCard';
  fxEnd(ctx);

  // if (card.mechanics?.includes(Mechanics.OnPlay)) {
  // ctx.events?.setPhase('healMinion');
  // }

  // temp test
  // G.players[aiID].cards.hand.forEach((c) => {
  //   if (c.canPlay) G.aiPossibleCards.push(c);
  // });
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
  { aiID }: AiSetDoneMove
) => {
  G.lastMoveMade = LastMoveMade.AiSetDone;
  G.aiPossibleCards = [];
  playerTurnDone.set(G, aiID);
  // ctx.events?.endTurn();
  if (G.gameConfig.debugConfig.logPhaseToConsole) {
    console.log(`--- setDoneMove(${aiID}) ---`);
  }
};
