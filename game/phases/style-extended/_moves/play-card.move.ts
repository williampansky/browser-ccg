import { Ctx } from 'boardgame.io';
import { INVALID_MOVE } from 'boardgame.io/core';
import { gte } from 'lodash';
import { CardPlayType, Mechanics } from '../../../../enums';
import { Card, GameState, PlayerID } from '../../../../types';
import { filterArray, getCardPower } from '../../../../utils';
import { fxEnd } from '../../../config.bgio-effects';
import { actionPoints, counts, playedCards } from '../../../state';
import { determinePlayableCards } from '../play-card/methods/determine-playable-cards';
import removeCardFromHand from '../_utils/remove-card-from-hand';

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
  const cardIdx = G.selectedCardIndex[player]!;
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
  
  if (card.mechanics?.includes(Mechanics.OnPlay)) {
    switch (card.playType) {
      case CardPlayType.Targeted:
        // --targeted
        switch (card.playContext) {
          case Mechanics.Heal:
            return ctx.events?.setPhase('healMinion');
          case Mechanics.Damage:
            return ctx.events?.setPhase('attackMinion');
          default:
            break;
        }
        // --targeted
        break;
    
      default:
        break;
    }
  } else {
    removeCardFromHand(G, player, cardUuid, cardIdx);
    determinePlayableCards(G, player);
  }
};
