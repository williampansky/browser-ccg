import type { Ctx } from 'boardgame.io';
import { LastMoveMade } from '../../../enums';
import type { GameState } from '../../../types';
import {
  determinePlayableCards,
  handleZonePowersCalculations,
  handleActiveCardBoons
} from '../../../utils';
import handleZoneMechanics from '../../mechanics/handle-zone-mechanics';

export default function playCardTurnOnMove(G: GameState, ctx: Ctx) {
  const { currentPlayer } = ctx;
  handleZoneMechanics(G, ctx);
  handleZonePowersCalculations(G, ctx);
  // handleActiveCardBoons.init(G, ctx); // @todo
  determinePlayableCards(G, ctx, currentPlayer);

  if (G.lastMoveMade === LastMoveMade.PlayCard) {
    handleZoneMechanics(G, ctx, 'onPlayCard');
  }
}
