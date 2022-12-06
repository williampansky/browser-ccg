import { gte } from 'lodash';
import { INVALID_MOVE } from 'boardgame.io/core';
import type { Ctx, LongFormMove } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../types';
import { CardPlayType, LastMoveMade, Mechanics } from '../../enums';
import { debuffPowerOfCardsInZone } from '../mechanics/on-play-mechanics';
import { actionPoints, lastCardPlayed, playedCards } from '../state';
import { deselectCardMove } from './deselect-card.move';
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
  const {
    gameConfig: {
      numerics: { numberOfSlotsPerZone },
    },
    players,
    zones,
  } = G;
  const { currentPlayer } = ctx;

  const player = currentPlayer;

  // validate selected card
  if (G.selectedCardData[player] === undefined) return INVALID_MOVE;
  if (G.selectedCardIndex[player] === undefined) return INVALID_MOVE;

  const ap = G.actionPoints;
  const playerObj = players[player];
  const card = G.selectedCardData[player]! as Card;
  const cardUuid = G.selectedCardData[player]!.uuid;
  const index = G.selectedCardIndex[player]!;
  const zone = zones[zoneNumber];
  const cantAffordCard = !gte(ap[player].current, card.currentCost);

  if (cantAffordCard) return INVALID_MOVE;

  // validate zone playability
  if (zone.disabled[player]) return INVALID_MOVE;
  if (zone.sides[player].length > numberOfSlotsPerZone) return INVALID_MOVE;

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

  G.lastMoveMade = LastMoveMade.PlayCard;
  lastCardPlayed.set(G, { card, index });
  deselectCardMove(G, ctx, { player });

  if (card.mechanics?.includes(Mechanics.OnPlay)) {
    switch (card.playType) {
      case CardPlayType.Targeted:
        determineTargetedOnPlayContext(G, ctx, card);
        break;

      default:
        initOnPlayGlobalMechanic(G, ctx, zoneNumber, card, player);
        removeCardFromHand(G, player, cardUuid, index);
        determinePlayableCards(G, ctx, player);
        break;
    }
  } else {
    removeCardFromHand(G, player, cardUuid, index);
    determinePlayableCards(G, ctx, player);
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
    default:                break;
  }
};

export const initOnPlayBuffStage = (G: GameState, ctx: Ctx) => {
  const { currentPlayer } = ctx;
  determineBuffableMinions(G, currentPlayer);

  if (noBuffableMinionsAvailable(G, currentPlayer)) {
    removeLastPlayedCardFromHand(G, currentPlayer);
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
    removeLastPlayedCardFromHand(G, currentPlayer);
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
    removeLastPlayedCardFromHand(G, currentPlayer);
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
    removeLastPlayedCardFromHand(G, currentPlayer);
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
