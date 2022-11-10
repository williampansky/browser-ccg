import { Ctx, PhaseConfig } from 'boardgame.io';
import { CardBase, GameState } from '../../../types';
import {
  drawCardFromPlayersDeck,
  logPhaseToConsole,
  createRandomDeck,
  createCardObject,
} from '../../../utils';

import CARD_DATABASE from '../../../tempCardsDatabase';

const initStartingHandsPhase: PhaseConfig = {
  onBegin(G: GameState, ctx: Ctx) {
    const { random } = ctx;
    logPhaseToConsole(G.turn, ctx.phase);

    // debug opponents side interactions of CARD_002
    if (G.gameConfig.debugConfig.debugCardId !== '') {
      for (let index = 0; index < 1; index++) {
        // let debugCardBase = random!.Shuffle(CARD_DATABASE)[index];
        let debugCardBase = CARD_DATABASE.find(obj => obj.id === 'CORE_008') as CardBase;
        let debugCard = createCardObject(debugCardBase);
        G.zones[0].sides['0'].push({ ...debugCard, revealed: true });
      }
    }

    // set decks
    // G.players['0'].cards.deck = createRandomDeck(G, ctx, CARD_DATABASE);
    // G.players['1'].cards.deck = createRandomDeck(G, ctx, CARD_DATABASE);

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
