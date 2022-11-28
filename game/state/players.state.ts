import { Ctx } from 'boardgame.io';
import { GameState, Player, PlayerID } from '../../types';

const players = {
  defaultState: {
    '0': {
      _account: undefined,
      actionPoints: { current: 0, total: 0 },
      cards: { deck: [], hand: [], discarded: [], destroyed: [], played: [] },
      displayName: '',
      playerId: '',
    },
    '1': {
      _account: undefined,
      actionPoints: { current: 0, total: 0 },
      cards: { deck: [], hand: [], discarded: [], destroyed: [], played: [] },
      displayName: '',
      playerId: '',
    },
  },

  set: (G: GameState, ctx: Ctx, playerId: PlayerID, playerData: Player) => {
    G.players[playerId] = playerData;

    // @ts-ignore
    ctx.effects?.fxEnd();
  },

  reset: (G: GameState) => {
    G.players = players.defaultState;
  },
};

export default players;
