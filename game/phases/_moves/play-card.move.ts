import { Ctx } from 'boardgame.io';
import { INVALID_MOVE } from 'boardgame.io/core';
import { gte } from 'lodash';
import { CardPlayType, Mechanics } from '../../../enums';
import { Card, GameState, PlayerID } from '../../../types';
import { filterArray, getCardPower } from '../../../utils';
import { fxEnd } from '../../config.bgio-effects';
import { actionPoints, counts, lastCardPlayed, playedCards } from '../../state';
import { determinePlayableCards } from '../_utils/determine-playable-cards';
import removeCardFromHand from '../_utils/remove-card-from-hand';
import { deselectCard } from './deselect-card.move';

export interface PlayCardMove {
  G: GameState;
  ctx: Ctx;
  zoneNumber: number;
}

export const playCard = ({ ...props }: PlayCardMove) => {
  const {
    G,
    G: {
      gameConfig: {
        numerics: { numberOfSlotsPerZone },
      },
      players,
      zones
    },
    ctx,
    ctx: { currentPlayer },
    zoneNumber,
  } = props;

  const player = currentPlayer;

  // validate selected card
  if (G.selectedCardData[player] === undefined) return INVALID_MOVE;

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

  G.lastMoveMade = 'playCard';
  lastCardPlayed.set(G, { card, index });
  deselectCard({ G, ctx });
  
  if (card.mechanics?.includes(Mechanics.OnPlay)) {
    switch (card.playType) {
      case CardPlayType.Targeted:
        // --targeted
        switch (card.playContext) {
          case Mechanics.Buff:
            return ctx.events?.setPhase('buffMinion');
          case Mechanics.Damage:
            return ctx.events?.setPhase('attackMinion');
          case Mechanics.Destroy:
            return ctx.events?.setPhase('destroyMinion');
          case Mechanics.Heal:
            return ctx.events?.setPhase('healMinion');
          default:
            break;
        }
        // --targeted
        break;
    
      default:
        break;
    }
  } else {
    removeCardFromHand(G, player, cardUuid, index);
    determinePlayableCards(G, ctx, player);
  }
};
