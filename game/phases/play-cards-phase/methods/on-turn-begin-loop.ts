import { gt } from 'lodash';
import { subtract as sub } from 'mathjs';
import type { Ctx } from 'boardgame.io';
import type { GameState, PlayerID } from '../../../../types';
import { drawCardFromPlayersDeck } from '../../../../utils';
import { fxEnd } from '../../../config.bgio-effects';
import addDebugCardToHand from './add-debug-card-to-hand';
import incrementActionPointsTotal from './increment-action-points-total';
import initZoneOnTurnStartInteractions from './init-zone-on-turn-start-interactions';
import setActionPointsToTotal from './set-action-points-to-total';
import setPlayableCardsInHand from './set-playable-cards-in-hand';

const loop = (G: GameState, ctx: Ctx, playerId: PlayerID) => {
  // decrement zone.disabledForXTurns values
  G.zones.forEach((z, zI) => {
    if (gt(z.disabledForXTurns[playerId], 0)) {
      z.disabledForXTurns[playerId] = sub(z.disabledForXTurns[playerId], 1);
    }

    if (z.disabled[playerId] === true && z.disabledForXTurns[playerId] === 0) {
      z.disabled[playerId] = false;
    }
  });
};

const onTurnBeginLoop = (G: GameState, ctx: Ctx) => {
  const { currentPlayer } = ctx;

  drawCardFromPlayersDeck(G, currentPlayer);
  incrementActionPointsTotal(G, currentPlayer);
  setActionPointsToTotal(G, currentPlayer);
  setPlayableCardsInHand(G, currentPlayer);
  initZoneOnTurnStartInteractions(G, currentPlayer);
  addDebugCardToHand(G, currentPlayer);
  fxEnd(ctx);

  G.zones.forEach((_, zoneIdx) => {
    loop(G, ctx, '0');
    loop(G, ctx, '1');
  });
};

export default onTurnBeginLoop;
