import { Ctx, PhaseConfig } from 'boardgame.io';
import tempCardsDatabase from '../../tempCardsDatabase';
import { GameState } from '../../types';
import { createRandomDeck, logPhaseToConsole } from '../../utils';
import { actionPoints, playerNames, players } from '../state';

const initPlayersPhase: PhaseConfig = {
  onBegin(G: GameState, ctx: Ctx) {
    if (G.gameConfig.debugConfig.logPhaseToConsole) {
      console.clear();
      logPhaseToConsole(G.turn, ctx.phase);
    }

    playerNames.set(G, '0', 'Player');
    players.set(G, '0', {
      actionPoints: actionPoints.defaultState['0'],
      cards: {
        deck: createRandomDeck(G, ctx, tempCardsDatabase),
        destroyed: [],
        discarded: [],
        hand: [],
        played: [],
      },
      displayName: 'Player',
      playerId: '0',
    });

    playerNames.set(G, '1', 'Opponent');
    players.set(G, '1', {
      actionPoints: actionPoints.defaultState['1'],
      cards: {
        deck: createRandomDeck(G, ctx, tempCardsDatabase),
        destroyed: [],
        discarded: [],
        hand: [],
        played: [],
      },
      displayName: 'Opponent',
      playerId: '1',
    });

    // ctx.events?.endPhase();
  },
  endIf(G, ctx) {
    const { cardsPerDeck } = G.gameConfig.numerics;

    return (
      G.players['0'].cards.deck.length === cardsPerDeck &&
      G.players['1'].cards.deck.length === cardsPerDeck &&
      G.players['0'].displayName !== '' &&
      G.players['1'].displayName !== '' &&
      G.players['0'].playerId !== '' &&
      G.players['1'].playerId !== ''
    );
  },
};

export default initPlayersPhase;
