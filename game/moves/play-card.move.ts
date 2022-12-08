import { gte } from 'lodash';
import { current } from 'immer';
import { INVALID_MOVE } from 'boardgame.io/core';
import type { Ctx, Game, LongFormMove } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../types';
import { CardPlayType, LastMoveMade, Mechanics } from '../../enums';
import { debuffPowerOfCardsInZone } from '../mechanics/on-play-mechanics';
import {
  actionPoints,
  lastCardPlayed,
  playedCards,
  selectedCardData,
  selectedCardIndex,
} from '../state';
import {
  determineAttackableMinions,
  determineBuffableMinions,
  determineDestroyableMinions,
  determineHealableMinions,
  determinePlayableCards,
  getCardPower,
  initActivateEventListeners,
  noAttackableMinionsAvailable,
  noBuffableMinionsAvailable,
  noDestroyableMinionsAvailable,
  noHealableMinionsAvailable,
  removeLastPlayedCardFromHand,
  unsetPlayableCards,
} from '../../utils';
import {
  determineOnPlayGlobalMechanic,
  determineTargetedOnPlayContext,
} from './on-play.move.methods';

export interface PlayCardMove {
  zoneNumber: number;
}

/**
 *
 */
export const playCardMove = (
  G: GameState,
  ctx: Ctx,
  { zoneNumber }: PlayCardMove
) => {
  const { currentPlayer } = ctx;
  const player = currentPlayer;
  const slotsPerZone = G.gameConfig.numerics.numberOfSlotsPerZone;
  const noSelectedCardData = G.selectedCardData[player] === undefined;
  const noSelectedCardIndex = G.selectedCardIndex[player] === undefined;

  // validate selected card
  if (noSelectedCardData) return INVALID_MOVE;
  if (noSelectedCardIndex) return INVALID_MOVE;

  const ap = G.actionPoints;
  const card = G.selectedCardData[player]!;
  const cardInHandIndex = G.selectedCardIndex[player]!;
  const zone = G.zones[zoneNumber];
  const cantAffordCard = !gte(ap[player].current, card.currentCost);
  const zoneIsDisabled = zone.disabled[player];
  const zoneIsFull = zone.sides[player].length > slotsPerZone;

  // validate move playability
  if (cantAffordCard) return INVALID_MOVE;
  if (zoneIsDisabled) return INVALID_MOVE;
  if (zoneIsFull) return INVALID_MOVE;

  // if valid, init move
  initValidPlayCardMove(G, ctx, player, zoneNumber, card, cardInHandIndex);
};

/**
 *
 */
export const initValidPlayCardMove = (
  G: GameState,
  ctx: Ctx,
  player: PlayerID,
  zoneNumber: number,
  card: Card,
  cardInHandIndex: number
) => {
  const hasOnPlayMechanic = card.mechanics?.includes(Mechanics.OnPlay);
  const playTypeIsTargeted = card.playType === CardPlayType.Targeted;
  const playTypeIsGlobal = card.playType === CardPlayType.Global;

  // add card to PlayedCards array
  playedCards.push(G, player, card);

  // remove cost from current action points
  actionPoints.subtract(G, player, card.currentCost);

  // push card to zone side array
  G.zones[zoneNumber].sides[player].push({
    ...card,
    revealed: true, // reveal card
    displayPower: getCardPower(card), // set display power
    revealedOnTurn: G.turn, // set revealedOnTurn value
  });

  // reset datas
  selectedCardData.reset(G, player);
  selectedCardIndex.reset(G, player);
  lastCardPlayed.set(G, { card, index: cardInHandIndex });
  removeLastPlayedCardFromHand(G, player);

  // set last move
  G.lastMoveMade = LastMoveMade.PlayCard;

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

/**
 *
 */
export const playCard: LongFormMove = {
  client: false,
  noLimit: true,
  ignoreStaleStateID: false,
  undoable: true,
  move: (G: GameState, ctx: Ctx, { ...args }: PlayCardMove) => {
    return playCardMove(G, ctx, { ...args });
  },
};
