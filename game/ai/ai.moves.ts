import { Ctx } from 'boardgame.io';
import { Mechanics } from '../../enums';
import { Card, GameState, PlayerID } from '../../types';
import { filterArray, getCardPower } from '../../utils';
import { actionPoints, counts, playedCards, playerTurnDone } from '../state';
import { fxEnd } from '../config.bgio-effects';
import { INVALID_MOVE } from 'boardgame.io/core';
import { gte, lt, lte } from 'lodash';

export interface AiPlayCardMove {
  G: GameState;
  ctx: Ctx;
  aiID: PlayerID;
  zoneNumber: number;
  card: Card;
  cardIndex: number;
}

export const aiPlayCard = ({ ...props }: AiPlayCardMove) => {
  const {
    G,
    G: {
      gameConfig: {
        numerics: { numberOfSlotsPerZone },
      },
      players,
      zones,
    },
    ctx,
    aiID,
    zoneNumber,
    card,
    cardIndex,
  } = props;

  const player = aiID;
  const ap = G.actionPoints;
  const playerObj = players[player];
  const cardUuid = card.uuid;
  const zone = zones[zoneNumber];

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
  const newHand = G.players[aiID].cards.hand.filter(o => o.uuid !== cardUuid);
  G.players[aiID].cards.hand = newHand;

  // recount cards in hand
  counts.decrementHand(G, player);

  G.lastMoveMade = 'aiPlayCard';
  fxEnd(ctx);

  if (card.mechanics?.includes(Mechanics.OnPlay)) {
    // ctx.events?.setPhase('healMinion');
  }

  // temp test
  G.aiPossibleCards = []
  // G.players[aiID].cards.hand.forEach((c) => {
  //   if (c.canPlay) G.aiPossibleCards.push(c);
  // });
};

export const aiSetDone = (G: GameState, ctx: Ctx, aiID: PlayerID) => {
  G.lastMoveMade = 'aiSetDone';
  G.aiPossibleCards = [];
  playerTurnDone.set(G, aiID);
};
