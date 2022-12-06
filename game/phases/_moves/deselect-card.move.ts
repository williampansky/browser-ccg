import { Ctx } from 'boardgame.io';
import { LastMoveMade } from '../../../enums';
import { GameState, PlayerID } from '../../../types';
import { selectedCardData, selectedCardIndex } from '../../state';

export interface DeselectCardMove {
  player: PlayerID;
}

export const deselectCardMove = (
  G: GameState,
  ctx: Ctx,
  { player }: DeselectCardMove
) => {
  selectedCardData.reset(G, player);
  selectedCardIndex.reset(G, player);
  G.lastMoveMade = LastMoveMade.DeselectCard;
};
