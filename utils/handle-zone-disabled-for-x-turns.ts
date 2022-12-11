import { gt } from 'lodash';
import { subtract } from 'mathjs';
import type { Ctx } from 'boardgame.io';
import type { GameState, PlayerID, Zone } from '../types';
import getContextualPlayerIds from './get-contextual-player-ids';

export default function handleZoneDisabledForXTurns(G: GameState, ctx: Ctx) {
  const { opponent, player } = getContextualPlayerIds(ctx.currentPlayer);

  const init = (z: Zone, player: PlayerID) => {
    if (gt(z.disabledForXTurns[player], 0)) {
      z.disabledForXTurns[player] = subtract(z.disabledForXTurns[player], 1);
    }

    if (z.disabled[player] === true && z.disabledForXTurns[player] === 0) {
      z.disabled[player] = false;
    }
  };

  G.zones.forEach((z) => {
    init(z, player);
    init(z, opponent);
  });
}
