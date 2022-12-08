import type { Ctx } from 'boardgame.io';
import type { GameState } from '../../../types';
import {
  determinePlayableCards,
  handleZonePowersCalculations,
} from '../../../utils';

export default function playCardTurnOnMove(G: GameState, ctx: Ctx) {
  const { currentPlayer } = ctx;
  handleZonePowersCalculations(G, ctx);
  determinePlayableCards(G, ctx, currentPlayer);
}
