import type { Ctx } from 'boardgame.io';
import type { Card, GameState, Zone } from '../../../types';
import { LastMoveMade, Mechanics } from '../../../enums';
import {
  determinePlayableCards,
  getContextualPlayerIds,
  handleDestroyedCards,
  handleZonePowersCalculations,
  noStageActive,
  removeLastPlayedCardFromHand,
  resetCardTargetBooleans,
} from '../../../utils';
import { initEvent, initEventMechanics, InitGameMechanic } from '../../mechanics';

export default function playCardTurnOnMove(G: GameState, ctx: Ctx) {
  const { currentPlayer } = ctx;
  handleZonePowersCalculations(G, ctx);
  determinePlayableCards(G, ctx, currentPlayer);
  // activateAnyEventListeners(G, ctx);
  
  
  switch (G.lastMoveMade) {
    case LastMoveMade.HealMinion:
      // resetCardTargetBooleans(G, ctx);
      // removeLastPlayedCardFromHand(G, currentPlayer);
      // if (noStageActive(ctx)) noStageActiveFlow(G, ctx);
      return;
    case LastMoveMade.PlayCard:
      // removeLastPlayedCardFromHand(G, currentPlayer);
      // if (noStageActive(ctx)) noStageActiveFlow(G, ctx);
      return;
  
    default:
      // activateAnyEventListeners(G, ctx);
      return;
  }
  
  // if (G.lastMoveMade === PlayCard) {
  //   removeLastPlayedCardFromHand(G, currentPlayer);

  //   if (noStageActive(ctx)) {
  //     determinePlayableCards(G, ctx, currentPlayer);
  //     activateAnyEventListeners(G, ctx);
  //   }
  // } else {
  //   activateAnyEventListeners(G, ctx);
  // }
}

// export const lastMoveWasPlayCardFlow = (G: GameState, ctx: Ctx) => {
//   if (noStageActive(ctx)) noStageActiveFlow(G, ctx);
// }

export const noStageActiveFlow = (G: GameState, ctx: Ctx) => {
  const { currentPlayer } = ctx;
  determinePlayableCards(G, ctx, currentPlayer);
  handleDestroyedCards(G, ctx);
  // activateAnyEventListeners(G, ctx);
}

export const activateAnyEventListeners = (G: GameState, ctx: Ctx) => {
  const { currentPlayer } = ctx;
  const { opponent } = getContextualPlayerIds(currentPlayer);
  
  G.zones.forEach((z, zI) => {
    z.sides[currentPlayer].forEach((c, cI) => {
      // const props: InitGameMechanic = {
      //   G,
      //   ctx,
      //   zone: z,
      //   zoneIdx: zI,
      //   card: c,
      //   cardIdx: cI,
      //   player: currentPlayer,
      // };

      // const onEvent = (cb?: () => void) => initEvent({ ...props }, cb);
      // onEvent();
      const { opponent } = getContextualPlayerIds(currentPlayer);
      const hasEvent = c.mechanics?.includes(Mechanics.Event);
      // const hasNotTriggered = c.booleans.eventWasTriggered === false;

      if (hasEvent) {
        initEventMechanics(
          G,
          ctx,
          G.gameConfig,
          z,
          zI,
          c,
          cI,
          currentPlayer,
          opponent
        );


        // c.booleans.eventWasTriggered = false;
      }

      // G.zones[zI].sides[currentPlayer][cI].booleans.eventWasTriggered = false;
    });

    // z.sides[opponent].forEach((c: Card, cI) => {
    //   const props: InitGameMechanic = {
    //     G,
    //     ctx,
    //     zone: z,
    //     zoneIdx: zI,
    //     card: c,
    //     cardIdx: cI,
    //     player: opponent,
    //   };

    //   const onEvent = (cb?: () => void) => initEvent({ ...props }, cb);
    //   onEvent(() => c.booleans.eventWasTriggered = false);
    // });
  });

  // G.zones.forEach((z, zI) => {
  //   z.sides[currentPlayer].forEach((c, cI) => {c.booleans.eventWasTriggered = false})
  //   z.sides[currentPlayer].forEach((c, cI) => {c.booleans.eventWasTriggered = false})
  // });
}
