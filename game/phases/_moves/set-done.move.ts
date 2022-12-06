import type { Ctx, PlayerID } from 'boardgame.io';
import { LastMoveMade } from '../../../enums';
import type { GameState } from '../../../types';
import { playerTurnDone } from '../../state';

export interface SetDoneMove {
  player: PlayerID;
}

export const setDoneMove = (
  G: GameState,
  ctx: Ctx,
  { player }: SetDoneMove
) => {
  G.lastMoveMade = LastMoveMade.SetDone;
  playerTurnDone.set(G, player);
  // ctx.events?.endTurn();

  if (G.gameConfig.debugConfig.logPhaseToConsole) {
    console.log(`--- setDoneMove(${player}) ---`);
  }
};
