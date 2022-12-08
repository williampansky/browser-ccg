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

export const determineOnPlayGlobalMechanic = (
  G: GameState,
  ctx: Ctx,
  zoneNumber: number,
  card: Card,
  player: PlayerID
) => {
  switch (card.mechanicsContext) {
    case Mechanics.AddCard:
      console.log('@todo init global AddCard');
      break;
    case Mechanics.Boon:
      console.log('@todo init global Boon');
      break;
    case Mechanics.Buff:
      console.log('@todo init global Buff');
      break;
    case Mechanics.Bulwark:
      console.log('@todo init global Bulwark');
      break;
    case Mechanics.Damage:
      console.log('@todo init global Damage');
      break;
    case Mechanics.Debuff:
      initGlobalDebuffMechanicByCardKey(G, ctx, zoneNumber, card, player);
      break;
    case Mechanics.Destroy:
      console.log('@todo init global Destroy');
      break;
    case Mechanics.Disable:
      console.log('@todo init global Disable');
      break;
    case Mechanics.DiscardCard:
      console.log('@todo init global DiscardCard');
      break;
    case Mechanics.Heal:
      console.log('@todo init global Heal');
      break;
    case Mechanics.Summon:
      console.log('@todo init global Summon');
      break;
    default:
      break;
  }
};

/**
 * 
 */
export const initGlobalDebuffMechanicByCardKey = (
  G: GameState,
  ctx: Ctx,
  zoneNumber: number,
  card: Card,
  player: PlayerID
) => {
  switch (card.key) {
    default:
      debuffPowerOfCardsInZone(G, ctx, zoneNumber, card, player);
      break;
  }
};

/**
 * 
 */
export const determineTargetedOnPlayContext = (
  G: GameState,
  ctx: Ctx,
  card: Card
) => {
  // prettier-ignore
  switch (card.mechanicsContext) {
    case Mechanics.Buff:    return initTargetedOnPlayBuffStage(G, ctx);
    case Mechanics.Damage:  return initTargetedOnPlayDamageStage(G, ctx);
    case Mechanics.Destroy: return initTargetedOnPlayDestroyStage(G, ctx);
    case Mechanics.Heal:    return initTargetedOnPlayHealStage(G, ctx);
  }
};

/**
 * 
 */
export const initTargetedOnPlayBuffStage = (G: GameState, ctx: Ctx) => {
  const { currentPlayer } = ctx;
  determineBuffableMinions(G, currentPlayer);
  const noTargetsAvailable = noBuffableMinionsAvailable(G, currentPlayer);

  if (noTargetsAvailable) {
    return determinePlayableCards(G, ctx, currentPlayer);
  } else {
    unsetPlayableCards(G, currentPlayer);
    return ctx.events?.setStage('buffMinion');
  }
};

/**
 * 
 */
export const initTargetedOnPlayDamageStage = (G: GameState, ctx: Ctx) => {
  const { currentPlayer } = ctx;
  determineAttackableMinions(G, currentPlayer);
  const noTargetsAvailable = noAttackableMinionsAvailable(G, currentPlayer);

  if (noTargetsAvailable) {
    return determinePlayableCards(G, ctx, currentPlayer);
  } else {
    unsetPlayableCards(G, currentPlayer);
    return ctx.events?.setStage('attackMinion');
  }
};

/**
 * 
 */
export const initTargetedOnPlayDestroyStage = (G: GameState, ctx: Ctx) => {
  const { currentPlayer } = ctx;
  determineDestroyableMinions(G, currentPlayer);
  const noTargetsAvailable = noDestroyableMinionsAvailable(G, currentPlayer);

  if (noTargetsAvailable) {
    return determinePlayableCards(G, ctx, currentPlayer);
  } else {
    unsetPlayableCards(G, currentPlayer);
    return ctx.events?.setStage('destroyMinion');
  }
};

/**
 * 
 */
export const initTargetedOnPlayHealStage = (G: GameState, ctx: Ctx) => {
  const { currentPlayer } = ctx;
  determineHealableMinions(G, currentPlayer);
  const noTargetsAvailable = noHealableMinionsAvailable(G, currentPlayer);

  if (noTargetsAvailable) {
    return determinePlayableCards(G, ctx, currentPlayer);
  } else {
    unsetPlayableCards(G, currentPlayer);
    return ctx.events?.setStage('healMinion');
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
