import type { Ctx } from 'boardgame.io';
import type { Card, GameState, Zone } from '../../../types';
import { LastMoveMade } from '../../../enums';
import {
  determinePlayableCards,
  getContextualPlayerIds,
  handleZonePowersCalculations,
  noStageActive,
  removeLastPlayedCardFromHand,
} from '../../../utils';
import { initEvent, InitGameMechanic } from '../../mechanics';

const { PlayCard } = LastMoveMade;

export default function playCardTurnOnMove(G: GameState, ctx: Ctx) {
  const { currentPlayer } = ctx;
  handleZonePowersCalculations(G, ctx);

  switch (G.lastMoveMade) {
    case PlayCard:
      removeLastPlayedCardFromHand(G, currentPlayer);

      if (noStageActive(ctx)) {
        determinePlayableCards(G, ctx, currentPlayer);
        activeAnyEventListeners(G, ctx);
      }
      return;
  
    default:
      activeAnyEventListeners(G, ctx);
      return;
  }
  
  // if (G.lastMoveMade === PlayCard) {
  //   removeLastPlayedCardFromHand(G, currentPlayer);

  //   if (noStageActive(ctx)) {
  //     determinePlayableCards(G, ctx, currentPlayer);
  //     activeAnyEventListeners(G, ctx);
  //   }
  // } else {
  //   activeAnyEventListeners(G, ctx);
  // }
}

// export const lastMoveWasPlayCardFlow = (G: GameState, ctx: Ctx) => {
//   if (noStageActive(ctx)) noStageActiveFlow(G, ctx);
// }

// export const noStageActiveFlow = (G: GameState, ctx: Ctx) => {
//   const { currentPlayer } = ctx;
//   // removeLastPlayedCardFromHand(G, currentPlayer);
//   determinePlayableCards(G, ctx, currentPlayer);
//   activeAnyEventListeners(G, ctx);
// }

export const activeAnyEventListeners = (G: GameState, ctx: Ctx) => {
  const { currentPlayer } = ctx;
  const { opponent } = getContextualPlayerIds(currentPlayer);
  
  G.zones.forEach((zone: Zone, zoneIdx) => {
    zone.sides[currentPlayer].forEach((card: Card, cardIdx) => {
      const props: InitGameMechanic = {
        G,
        ctx,
        zone,
        zoneIdx,
        card,
        cardIdx,
        player: currentPlayer,
      };

      const onEvent = (cb?: () => void) => initEvent({ ...props }, cb);
      onEvent();
    });

    zone.sides[opponent].forEach((card: Card, cardIdx) => {
      const props: InitGameMechanic = {
        G,
        ctx,
        zone,
        zoneIdx,
        card,
        cardIdx,
        player: opponent,
      };

      const onEvent = (cb?: () => void) => initEvent({ ...props }, cb);
      onEvent();
    });
  });
}
