import { Ctx } from 'boardgame.io';
import { INVALID_MOVE } from 'boardgame.io/core';
import { gte } from 'lodash';
import { Mechanics } from '../../../../../enums';
import { Card, GameState, PlayerID } from '../../../../../types';
import { filterArray, getCardPower } from '../../../../../utils';
import { fxEnd } from '../../../../config.bgio-effects';
import { actionPoints, counts, playedCards, selectedCardData } from '../../../../state';

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

  // remove card from hand
  filterArray(G.players[player].cards.hand, cardUuid, G.selectedCardIndex[player]!);

  // recount cards in hand
  counts.decrementHand(G, player);

  // unset selected card
  // selectedCardData.reset(G, player);
  // G.selectedCardIndex[player] = undefined;
  G.lastMoveMade = 'playCard';
  fxEnd(ctx);
  
  if (card.mechanics?.includes(Mechanics.OnPlay)) {
    ctx.events?.setPhase('healMinion')
  }
};
