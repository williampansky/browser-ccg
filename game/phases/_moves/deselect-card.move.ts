import { Ctx } from 'boardgame.io';
import { GameState } from '../../../types';
import { selectedCardData } from '../../state';

export interface DeselectCardMove {
  G: GameState;
  ctx: Ctx;
}

export const deselectCard = ({ ...props }: DeselectCardMove) => {
  const {
    G,
    ctx: { currentPlayer },
  } = props;

  if (G.lastMoveMade !== 'playCard') {
    selectedCardData.reset(G, currentPlayer);
    G.selectedCardIndex[currentPlayer] = undefined;
    G.lastMoveMade = 'deselectCard';
  }
};
