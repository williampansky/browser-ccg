import { Ctx, PhaseConfig } from 'boardgame.io';
import { GameState } from '../../../types';
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

    // debug opponents side interactions of CARD_10
    if (G.gameConfig.debugConfig.debugCardId !== '') {
      let randomCard3 = random!.Shuffle(CARD_DATABASE)[0];
      let randomCard3Obj = createCardObject(randomCard3);
      for (let index = 0; index < 2; index++) {
        G.zones[0].sides['1'].push(randomCard3Obj);
      }
    }

    // set decks
    G.players['0'].cards.deck = createRandomDeck(G, ctx, CARD_DATABASE);
    G.players['1'].cards.deck = createRandomDeck(G, ctx, CARD_DATABASE);

    // init hands
    [...Array(G.gameConfig.numerics.cardsPerStartingHand)].forEach(() => {
      drawCardFromPlayersDeck(G, '0');
      drawCardFromPlayersDeck(G, '1');
    });
  },
  endIf: (G: GameState) => {
    // end phase when both players have cards in hand and in deck
    const perDeck = G.gameConfig.numerics.cardsPerDeck;
    const perStartingHand = G.gameConfig.numerics.cardsPerStartingHand;
    const startingDeckLength = Math.abs(perDeck - perStartingHand);

    return (
      G.players['0'].cards.deck.length === startingDeckLength &&
      G.players['0'].cards.hand.length === perStartingHand &&
      G.players['1'].cards.deck.length === startingDeckLength &&
      G.players['1'].cards.hand.length === perStartingHand
    );
  },
};

export default initStartingHandsPhase;
