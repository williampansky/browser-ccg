import type { Ctx } from 'boardgame.io';
import type { GameState } from '../../../types';
import {
  determinePlayableCards,
  handleZonePowersCalculations,
  handleActiveCardBoons
} from '../../../utils';

export default function playCardTurnOnMove(G: GameState, ctx: Ctx) {
  const { currentPlayer } = ctx;
  handleZonePowersCalculations(G, ctx);
  // handleActiveCardBoons.init(G, ctx); // @todo
  determinePlayableCards(G, ctx, currentPlayer);
}
