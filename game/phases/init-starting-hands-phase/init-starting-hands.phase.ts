import { Ctx, PhaseConfig } from 'boardgame.io';
import { CardBase, GameState } from '../../../types';
import {
  drawCardFromPlayersDeck,
  logPhaseToConsole,
  createRandomDeck,
  createCardObject,
} from '../../../utils';

import setsCore from '../../data/setsCore.json'

const initStartingHandsPhase: PhaseConfig = {
  onBegin(G: GameState, ctx: Ctx) {
    const { random } = ctx;
    logPhaseToConsole(G.turn, ctx.phase);

    // debug card or side interactions
    if (G.gameConfig.debugConfig.debugCardId !== '') {
      for (let index = 0; index < 4; index++) {
        let debugCardBase = random!.Shuffle(setsCore)[index];
        let debugCard = createCardObject(debugCardBase);
        G.zones[0].sides['1'].push({ ...debugCard, revealed: true });
      }
    }

    // init hands
    [...Array(G.gameConfig.numerics.cardsPerStartingHand)].forEach(() => {
      drawCardFromPlayersDeck(G, '0');
      drawCardFromPlayersDeck(G, '1');
    });
  },
  endIf: (G: GameState) => {
    // end phase when both players have cards in hand
    const perStartingHand = G.gameConfig.numerics.cardsPerStartingHand;

    return (
      G.players['0'].cards.hand.length === perStartingHand &&
      G.players['1'].cards.hand.length === perStartingHand
    );
  },
};

export default initStartingHandsPhase;
