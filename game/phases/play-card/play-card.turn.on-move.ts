import type { Ctx } from 'boardgame.io';
import type { GameState } from '../../../types';
import { LastMoveMade } from '../../../enums';
import {
  determinePlayableCards,
  handleZonePowersCalculations,
  noStageActive,
  removeLastPlayedCardFromHand,
} from '../../../utils';

const { PlayCard } = LastMoveMade;

export default function playCardTurnOnMove(G: GameState, ctx: Ctx) {
  if (G.lastMoveMade === PlayCard) {
    lastMoveWasPlayCardFlow(G, ctx);
  }
}

export const lastMoveWasPlayCardFlow = (G: GameState, ctx: Ctx) => {
  handleZonePowersCalculations(G, ctx);
  if (noStageActive(ctx)) noStageActiveFlow(G, ctx);
}

export const noStageActiveFlow = (G: GameState, ctx: Ctx) => {
  removeLastPlayedCardFromHand(G, ctx.currentPlayer);
  determinePlayableCards(G, ctx, ctx.currentPlayer);
}
