import { Ctx } from 'boardgame.io';
import { GameState } from '../../../types';
import { selectedCardData, selectedCardIndex } from '../../state';

export interface DeselectCardMove {
  G: GameState;
  ctx: Ctx;
}

export const deselectCard = ({ ...props }: DeselectCardMove) => {
  const {
    G,
    ctx: { currentPlayer },
  } = props;

  selectedCardData.reset(G, currentPlayer);
  selectedCardIndex.reset(G, currentPlayer);
  G.lastMoveMade = 'deselectCard';
};
