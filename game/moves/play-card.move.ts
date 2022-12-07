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
  noAttackableMinionsAvailable,
  noBuffableMinionsAvailable,
  noDestroyableMinionsAvailable,
  noHealableMinionsAvailable,
  removeLastPlayedCardFromHand,
  unsetPlayableCards,
} from '../../utils';
import { activateAnyEventListeners } from '../phases/play-card/play-card.turn.on-move';

export interface PlayCardMove {
  zoneNumber: number;
}

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
  const card = current(G.selectedCardData[player]!) as Card;
  const cardUuid = G.selectedCardData[player]!.uuid!;
  const cardIndex = G.selectedCardIndex[player]!;
  const zone = G.zones[zoneNumber];
  const cantAffordCard = !gte(ap[player].current, card.currentCost);
  const zoneIsDisabled = zone.disabled[player];
  const zoneIsFull = zone.sides[player].length > slotsPerZone;

  // validate move playability
  if (cantAffordCard) return INVALID_MOVE;
  if (zoneIsDisabled) return INVALID_MOVE;
  if (zoneIsFull) return INVALID_MOVE;

  initValidPlayCardMove(G, ctx, player, zoneNumber, card, cardIndex);
};

export const initValidPlayCardMove = (
  G: GameState,
  ctx: Ctx,
  player: PlayerID,
  zoneNumber: number,
  card: Card,
  cardIndex: number
) => {
  const hasOnPlayMechanic = card.mechanics?.includes(Mechanics.OnPlay);
  const playTypeIsTargeted = card.playType === CardPlayType.Targeted;

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

  selectedCardData.reset(G, player);
  selectedCardIndex.reset(G, player);
  lastCardPlayed.set(G, { card, index: cardIndex });
  removeLastPlayedCardFromHand(G, player);
  G.lastMoveMade = LastMoveMade.PlayCard;

  if (hasOnPlayMechanic && playTypeIsTargeted) {
    determineTargetedOnPlayContext(G, ctx, card);
  } else {
    initOnPlayGlobalMechanic(G, ctx, zoneNumber, card, player);
    activateAnyEventListeners(G, ctx);
  }
};

export const initOnPlayGlobalMechanic = (
  G: GameState,
  ctx: Ctx,
  zoneNumber: number,
  card: Card,
  player: PlayerID
) => {
  switch (card.mechanicsContext) {
    case Mechanics.Debuff:
      debuffPowerOfCardsInZone(G, zoneNumber, card, player);
      break;
    default:
      break;
  }
};

export const determineTargetedOnPlayContext = (
  G: GameState,
  ctx: Ctx,
  card: Card
) => {
  // prettier-ignore
  switch (card.mechanicsContext) {
    case Mechanics.Buff:    return initOnPlayBuffStage(G, ctx);
    case Mechanics.Damage:  return initOnPlayDamageStage(G, ctx);
    case Mechanics.Destroy: return initOnPlayDestroyStage(G, ctx);
    case Mechanics.Heal:    return initOnPlayHealStage(G, ctx);
  }
};

export const initOnPlayBuffStage = (G: GameState, ctx: Ctx) => {
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

export const initOnPlayDamageStage = (G: GameState, ctx: Ctx) => {
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

export const initOnPlayDestroyStage = (G: GameState, ctx: Ctx) => {
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

export const initOnPlayHealStage = (G: GameState, ctx: Ctx) => {
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

export const playCard: LongFormMove = {
  client: false,
  noLimit: true,
  ignoreStaleStateID: false,
  undoable: true,
  move: (G: GameState, ctx: Ctx, { ...args }: PlayCardMove) => {
    return playCardMove(G, ctx, { ...args });
  },
};
