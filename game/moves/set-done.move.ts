import type { Ctx, LongFormMove, PlayerID } from 'boardgame.io';
import type { GameState } from '../../types';
import { LastMoveMade } from '../../enums';
import { playerTurnDone } from '../state';

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

export const setDone: LongFormMove = {
  client: false,
  noLimit: true,
  ignoreStaleStateID: true,
  undoable: true,
  move: (G: GameState, ctx: Ctx, { player }: SetDoneMove) => {
    return setDoneMove(G, ctx, { player });
  },
};
