import { Ctx, PhaseConfig } from 'boardgame.io';
import { GameState } from '../../../types';
import { actionPoints, playerNames, players } from '../../state';
import { fxEnd } from '../../config.bgio-effects';
import {
  createAiDeck,
  createDebugDeck,
  createRandomDeck,
  logPhaseToConsole,
} from '../../../utils';
import setsCore from '../../data/setsCore.json';

const db = [
  ...setsCore
]

export default<PhaseConfig> {
  next: 'initZones',
  start: true,
  onBegin(G: GameState, ctx: Ctx) {
    const {
      gameConfig: {
        debugConfig,
        debugConfig: {
          debugHandCardKey,
          useDebugHandCardKey,
          debugOpponentHandCardKey,
          useDebugOpponentHandCardKey,
        },
      },
    } = G;

    if (debugConfig.logPhaseToConsole) {
      console.clear();
      logPhaseToConsole(G.turn, ctx.phase);
    }

    playerNames.set(G, '0', 'Player');
    players.set(G, ctx, '0', {
      actionPoints: actionPoints.defaultState['0'],
      cards: {
        deck:
          useDebugHandCardKey
            ? createDebugDeck(G, ctx, db, debugHandCardKey)
            : createRandomDeck(G, ctx, db),
        destroyed: [],
        discarded: [],
        hand: [],
        played: [],
      },
      displayName: 'Player',
      playerId: '0',
    });

    playerNames.set(G, '1', 'Opponent');
    players.set(G, ctx, '1', {
      actionPoints: actionPoints.defaultState['1'],
      cards: {
        deck:
          useDebugOpponentHandCardKey
            ? createDebugDeck(G, ctx, db, debugOpponentHandCardKey)
            : createAiDeck(G, ctx),
        destroyed: [],
        discarded: [],
        hand: [],
        played: [],
      },
      displayName: 'Opponent',
      playerId: '1',
    });

    fxEnd(ctx);
  },
  endIf(G: GameState, ctx: Ctx) {
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
  onEnd(G: GameState, ctx: Ctx) {
    fxEnd(ctx);
  },
};
