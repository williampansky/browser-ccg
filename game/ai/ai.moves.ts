import { Ctx } from "boardgame.io";
import { INVALID_MOVE } from "boardgame.io/core";
import { gte, lt } from "lodash";
import { Mechanics } from "../../enums";
import { Card, GameState, PlayerID } from "../../types";
import { filterArray, getCardPower } from "../../utils";
import { actionPoints, counts, playedCards, selectedCardData } from "../state";
import { aiOnPlayDestroy } from "./interactions/ai.on-play.destroy";

export const aiPlayCard = (
  G: GameState,
  ctx: Ctx,
  aiID: PlayerID,
  zoneNumber: number,
  card: Card,
  cardIndex: number
) => {
  const {
    zones,
    gameConfig: {
      numerics: { numberOfSlotsPerZone },
    },
  } = G;

  // set selected card
  G.selectedCardData[aiID] = card;
  G.selectedCardIndex[aiID] = cardIndex;

  const player = G.players[aiID];
  const cardUuid = card.uuid;
  const zone = zones[zoneNumber];
  const zoneSideLength = zone.sides[aiID].length;
  const currentAP = G.actionPoints[aiID].current;
  const cannotAffordCard = lt(currentAP, card.currentCost);
  const zoneHasNoAvailableSlots = gte(zoneSideLength, numberOfSlotsPerZone);
  const zoneIsDisabled = zone.disabled[aiID];

  // validate cost playability
  if (cannotAffordCard || zoneHasNoAvailableSlots || zoneIsDisabled) {
    return INVALID_MOVE;
  }

  // add card to PlayedCards array
  playedCards.push(G, aiID, card);

  // remove cost from current action points
  actionPoints.subtract(G, aiID, card.currentCost);

  // push card to zone side array
  zone.sides[aiID].push({
    ...card,
    revealed: true, // reveal card
    displayPower: getCardPower(card), // set display power
    revealedOnTurn: G.turn, // set revealedOnTurn value
  });

  // recount cards in hand
  counts.decrementHand(G, aiID);

  // re-evaluate cards in hand
  G.players[aiID].cards.hand.forEach((c: Card) => {
    if (G.actionPoints[aiID].current >= c.currentCost) {
      return (c.canPlay = true);
    } else {
      return (c.canPlay = false);
    }
  });

  filterArray(G.players[aiID].cards.hand, card.uuid, cardIndex);

  // if (card.mechanics?.includes(Mechanics.Destroy)) {
  //   aiOnPlayDestroy(G, ctx, aiID);
  // }

  // unset selectedCard
  selectedCardData.reset(G, aiID);
  G.selectedCardIndex[aiID] = undefined;
  G.lastMoveMade = 'playCard';
};
