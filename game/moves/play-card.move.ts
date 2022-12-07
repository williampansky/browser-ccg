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
  removeCardFromHand,
  removeLastPlayedCardFromHand,
  unsetPlayableCards,
} from '../../utils';

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

  initValidMove(G, ctx, player, zoneNumber, card, cardUuid, cardIndex)
};

export const initValidMove = (G: GameState, ctx: Ctx, player: PlayerID, zoneNumber: number, card: Card, cardUuid: string, cardIndex: number) => {
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
  G.lastMoveMade = LastMoveMade.PlayCard;

  if (card.mechanics?.includes(Mechanics.OnPlay)) {
    switch (card.playType) {
      case CardPlayType.Targeted:
        determineTargetedOnPlayContext(G, ctx, card);
        break;

      default:
        initOnPlayGlobalMechanic(G, ctx, zoneNumber, card, player);
        // removeCardFromHand(G, player, cardUuid, cardIndex);
        // determinePlayableCards(G, ctx, player);
        break;
    }
  }
  //  else {
  //   removeCardFromHand(G, player, cardUuid, cardIndex);
  //   determinePlayableCards(G, ctx, player);
  // }
}

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
      return;
    default:
      return;
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
    default:                break;
  }
};

export const initOnPlayBuffStage = (G: GameState, ctx: Ctx) => {
  const { currentPlayer } = ctx;
  determineBuffableMinions(G, currentPlayer);

  if (noBuffableMinionsAvailable(G, currentPlayer)) {
    return determinePlayableCards(G, ctx, currentPlayer);
  } else {
    unsetPlayableCards(G, currentPlayer);
    return ctx.events?.setStage('buffMinion');
  }
};

export const initOnPlayDamageStage = (G: GameState, ctx: Ctx) => {
  const { currentPlayer } = ctx;
  determineAttackableMinions(G, currentPlayer);

  if (noAttackableMinionsAvailable(G, currentPlayer)) {
    return determinePlayableCards(G, ctx, currentPlayer);
  } else {
    unsetPlayableCards(G, currentPlayer);
    return ctx.events?.setStage('attackMinion');
  }
};

export const initOnPlayDestroyStage = (G: GameState, ctx: Ctx) => {
  const { currentPlayer } = ctx;
  determineDestroyableMinions(G, currentPlayer);

  if (noDestroyableMinionsAvailable(G, currentPlayer)) {
    return determinePlayableCards(G, ctx, currentPlayer);
  } else {
    unsetPlayableCards(G, currentPlayer);
    return ctx.events?.setStage('destroyMinion');
  }
};

export const initOnPlayHealStage = (G: GameState, ctx: Ctx) => {
  const { currentPlayer } = ctx;
  determineHealableMinions(G, currentPlayer);

  if (noHealableMinionsAvailable(G, currentPlayer)) {
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
