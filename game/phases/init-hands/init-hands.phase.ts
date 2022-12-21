import type { Ctx, PhaseConfig } from 'boardgame.io';
import type { GameState } from '../../../types';
import { fxEnd } from '../../config.bgio-effects';
import { drawCardFromPlayersDeck, logPhaseToConsole } from '../../../utils';

export default <PhaseConfig>{
  next: 'initZones',
  onBegin(G: GameState, ctx: Ctx) {
    const {
      gameConfig: {
        debugConfig: {
          debugBoardCardKey,
          useDebugBoardCardKey,
          debugBoardCardKeyAmount,
          debugOpponentBoardCardKey,
          useDebugOpponentBoardCardKey,
          debugOpponentBoardCardKeyAmount,
        },
      },
    } = G;

    logPhaseToConsole(G.turn, ctx.phase);

    // init hands
    [...Array(G.gameConfig.numerics.cardsPerStartingHand)].forEach(() => {
      drawCardFromPlayersDeck(G, '0');
      drawCardFromPlayersDeck(G, '1');
    });

    fxEnd(ctx);
  },
  endIf: (G: GameState) => {
    // end phase when both players have cards in hand
    const perStartingHand = G.gameConfig.numerics.cardsPerStartingHand;

    return (
      G.players['0'].cards.hand.length === perStartingHand &&
      G.players['1'].cards.hand.length === perStartingHand
    );
  },
  onEnd(G: GameState, ctx: Ctx) {
    fxEnd(ctx);
  },
};
