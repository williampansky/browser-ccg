import { Ctx, PhaseConfig } from 'boardgame.io';
import { GameState } from '../../../types';
import {
  drawCardFromPlayersDeck,
  logPhaseToConsole,
  createCardObject,
} from '../../../utils';

import setsCore from '../../data/setsCore.json';

const db = [
  ...setsCore
]

const initStartingHandsPhase: PhaseConfig = {
  onBegin(G: GameState, ctx: Ctx) {
    const { random } = ctx;
    const {
      gameConfig: {
        debugConfig: {
          debugBoardCardKey,
          useDebugBoardCardKey,
          debugOpponentBoardCardKey,
          useDebugOpponentBoardCardKey,
        },
      },
    } = G;
    logPhaseToConsole(G.turn, ctx.phase);

    // debug card or side interactions
    if (useDebugOpponentBoardCardKey) {
      for (let index = 0; index < 4; index++) {
        // let debugCardBase = random!.Shuffle(db)[index];
        let debugCardBase = db.find(o => o.key === debugOpponentBoardCardKey);
        let debugCard = createCardObject(debugCardBase!);
        G.zones[0].sides['1'].push({ ...debugCard, revealed: true });
        G.zonesCardsReference[0]['1'].push({ ...debugCard, revealed: true });
      }

      // @ts-ignore
      ctx.effects?.fxEnd();
    }

    // debug card or side interactions
    if (useDebugBoardCardKey) {
      for (let index = 0; index < 1; index++) {
        let debugCardBase = db.find(o => o.key === debugBoardCardKey);
        let debugCard = createCardObject(debugCardBase!);
        G.zones[0].sides['0'].push({ ...debugCard, revealed: true });
        G.zonesCardsReference[0]['0'].push({ ...debugCard, revealed: true });
      }

      // @ts-ignore
      ctx.effects?.fxEnd();
    }

    // init hands
    [...Array(G.gameConfig.numerics.cardsPerStartingHand)].forEach(() => {
      drawCardFromPlayersDeck(G, '0');
      // @ts-ignore
      ctx.effects?.fxEnd();
      
      drawCardFromPlayersDeck(G, '1');
      // @ts-ignore
      ctx.effects?.fxEnd();
    });

    // @ts-ignore
    ctx.effects?.fxEnd(G);
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
    // @ts-ignore
    ctx.effects?.fxEnd(G);
  },
};

export default initStartingHandsPhase;
