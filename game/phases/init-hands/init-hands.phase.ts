import type { Ctx, PhaseConfig } from 'boardgame.io';
import type { GameState } from '../../../types';
import { fxEnd } from '../../config.bgio-effects';
import {
  drawCardFromPlayersDeck,
  logPhaseToConsole,
  createCardObject,
} from '../../../utils';

import setsCore from '../../../data/setsCore.json';

const db = [
  ...setsCore
]

export default<PhaseConfig> {
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
          debugOpponentBoardCardKeyAmount
        },
      },
    } = G;

    logPhaseToConsole(G.turn, ctx.phase);

    // [your side] debug card or side interactions
    if (useDebugBoardCardKey) {
      for (let index = 0; index < debugBoardCardKeyAmount; index++) {
        let debugCardBase = db.find(o => o.key === debugBoardCardKey);
        let debugCard = createCardObject(debugCardBase!);
        G.zones[0].sides['0'].push({ ...debugCard, revealed: true });
        G.zonesCardsReference[0]['0'].push({ ...debugCard, revealed: true });
      }
    }

    // [their side] debug card or side interactions
    if (useDebugOpponentBoardCardKey) {
      for (let index = 0; index < debugOpponentBoardCardKeyAmount; index++) {
        let debugCardBase = db.find(o => o.key === debugOpponentBoardCardKey);
        let debugCard = createCardObject(debugCardBase!);
        G.zones[0].sides['1'].push({ ...debugCard, revealed: true });
        G.zonesCardsReference[0]['1'].push({ ...debugCard, revealed: true });
      }
    }

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
