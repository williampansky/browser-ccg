import { Ctx } from 'boardgame.io';
import { INVALID_MOVE } from 'boardgame.io/core';
import { gte } from 'lodash';
import { CardPlayType, LastMoveMade, Mechanics } from '../../../enums';
import { Card, GameState, PlayerID } from '../../../types';
import { getCardPower } from '../../../utils';
import { debuffPowerOfCardsInZone } from '../../mechanics/on-play-mechanics';
import { actionPoints, lastCardPlayed, playedCards } from '../../state';
import { determineAttackableMinions } from '../attack-minion/methods/determine-attackable-minions';
import { noAttackableMinionsAvailable } from '../attack-minion/methods/no-attackable-minions-available';
import { determineBuffableMinions } from '../buff-minion/methods/determine-buffable-minions';
import { noBuffableMinionsAvailable } from '../buff-minion/methods/no-buffable-minions-available';
import { determinePlayableCards } from '../_utils/determine-playable-cards';
import removeCardFromHand from '../_utils/remove-card-from-hand';
import removeLastPlayedCardFromHand from '../_utils/remove-last-played-card-from-hand';
import { unsetPlayableCards } from '../_utils/unset-playable-cards';
import { deselectCardMove } from './deselect-card.move';

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
        initOnPlayTargetStage(G, ctx, card);
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

function initOnPlayGlobalMechanic(
  G: GameState,
  ctx: Ctx,
  zoneNumber: number,
  card: Card,
  player: PlayerID
) {
  switch (card.mechanicsContext) {
    case Mechanics.Debuff:
      debuffPowerOfCardsInZone(G, zoneNumber, card, player);
      break;
    default:
      break;
  }
}

function initOnPlayTargetStage(G: GameState, ctx: Ctx, card: Card) {
  const { currentPlayer } = ctx;

  switch (card.mechanicsContext) {
    case Mechanics.Buff:
      determineBuffableMinions(G, currentPlayer);
      if (noBuffableMinionsAvailable(G, currentPlayer)) {
        removeLastPlayedCardFromHand(G, currentPlayer)
        return determinePlayableCards(G, ctx, currentPlayer);
      } else {
        unsetPlayableCards(G, currentPlayer);
        return ctx.events?.setStage('buffMinion');
      }
    case Mechanics.Damage:
      determineAttackableMinions(G, currentPlayer);
      if (noAttackableMinionsAvailable(G, currentPlayer)) {
        removeLastPlayedCardFromHand(G, currentPlayer)
        return determinePlayableCards(G, ctx, currentPlayer);
      } else {
        unsetPlayableCards(G, currentPlayer);
        return ctx.events?.setStage('attackMinion');
      }
    case Mechanics.Destroy:
      return ctx.events?.setStage('destroyMinion');
    case Mechanics.Heal:
      return ctx.events?.setStage('healMinion');
    default:
      break;
  }
}
