import { Ctx, PhaseConfig } from 'boardgame.io';
import { Card, GameState } from '../../types';
import {
  createDebugDeck,
  createRandomDeck,
  logPhaseToConsole,
} from '../../utils';
import { actionPoints, playerNames, players } from '../state';
import setsCore from '../data/setsCore.json';

const initPlayersPhase: PhaseConfig = {
  onBegin(G: GameState, ctx: Ctx) {
    const {
      gameConfig: {
        debugConfig,
        debugConfig: { debugHandCardKey, debugOpponentHandCardKey },
      },
    } = G;

    if (debugConfig.logPhaseToConsole) {
      console.clear();
      logPhaseToConsole(G.turn, ctx.phase);
    }

    playerNames.set(G, '0', 'Player');
    players.set(G, '0', {
      actionPoints: actionPoints.defaultState['0'],
      cards: {
        deck:
          debugHandCardKey !== ''
            ? createDebugDeck(G, ctx, setsCore, debugHandCardKey)
            : createRandomDeck(G, ctx, setsCore),
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
        deck:
          debugOpponentHandCardKey !== ''
            ? createDebugDeck(G, ctx, setsCore, debugOpponentHandCardKey)
            : createRandomDeck(G, ctx, setsCore),
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
