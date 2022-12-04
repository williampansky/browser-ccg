import type { Ctx, PlayerID } from "boardgame.io";
import type { GameState } from "../../../../types";
import { playerTurnDone } from "../../../state";

export interface SetDoneMove {
  G: GameState;
  ctx: Ctx;
  player: PlayerID;
}

export default function({ ...props }: SetDoneMove) {
  const { G, ctx, player } = props;
  // const { opponent } = getContextualPlayerIds(player);

  G.lastMoveMade = 'setDone';
  playerTurnDone.set(G, player);

  // ctx.events?.setActivePlayers({
  //   currentPlayer: opponent,
  //   value: {
  //     '0': 'drawCard',
  //     '1': 'drawCard'
  //   }
  // });

  // events?.setActivePlayers({ currentPlayer: currentPlayer === '0' ? '1' : '0' });
  // events?.endTurn({ next: opponent });
  // events?.setPhase('drawCard');
  // events?.endPhase();
};
