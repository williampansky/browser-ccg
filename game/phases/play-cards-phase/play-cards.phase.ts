import { TurnOrder } from 'boardgame.io/core';
import { Ctx, PhaseConfig } from 'boardgame.io';
import { Card, GameState, Zone } from '../../../types';
import {
  addDebugCardToHand,
  incrementActionPointsTotal,
  initZoneOnTurnStartInteractions,
  resetDoneStateForBothPlayers,
  setActionPointsToTotal,
  setFirstRevealer,
  setPlayableCardsInHand,
  unsetPlayableCardsInHand,
} from './methods';
import {
  deselectCard,
  playAiCard,
  playCard,
  selectCard,
  setDone,
  undoPlayCard,
} from '../../moves';
import { logPhaseToConsole } from '../../../utils';
import { gameConfig } from '../../../app.config';

const { asynchronousTurns } = gameConfig;
const gameUsesAsyncTurns = asynchronousTurns === true;
const gameUsesDefaultTurns = asynchronousTurns === false;

const moves = {
  selectCard: {
    client: false,
    noLimit: true,
    ignoreStaleStateID: true,
    move: (G: GameState, ctx: Ctx, playerId: string, cardUuid: string) => {
      return selectCard(G, ctx, playerId, cardUuid);
    },
  },
  deselectCard: {
    client: false,
    noLimit: true,
    ignoreStaleStateID: true,
    move: (G: GameState, ctx: Ctx, playerId: string) => {
      return deselectCard(G, ctx, playerId);
    },
  },
  playCard: {
    client: false,
    noLimit: true,
    ignoreStaleStateID: true,
    undoable: true,
    move: (G: GameState, ctx: Ctx, playerId: string, zoneNumber: number) => {
      return playCard(G, ctx, playerId, zoneNumber);
    },
  },
  undoPlayCard: {
    client: false,
    noLimit: true,
    ignoreStaleStateID: true,
    move: (G: GameState, ctx: Ctx, playerId: string, undo: any) => {
      return undoPlayCard(G, ctx, playerId, undo);
    },
  },
  playAiCard: {
    client: false,
    noLimit: true,
    ignoreStaleStateID: true,
    move: (
      G: GameState,
      ctx: Ctx,
      zoneNumber: number,
      card: Card,
      cardIndex: number
    ) => {
      return playAiCard(G, ctx, zoneNumber, card, cardIndex);
    },
  },
  setDone: {
    client: false,
    noLimit: true,
    ignoreStaleStateID: true,
    move: (G: GameState, ctx: Ctx, playerId: string) => {
      return setDone(G, ctx, playerId);
    },
  },
  endTurn: {
    client: false,
    noLimit: true,
    ignoreStaleStateID: true,
    move: (G: GameState, ctx: Ctx, playerId: string) => {
      return ctx?.events?.endTurn({ next: playerId });
    },
  },
};

const playCardsPhase: PhaseConfig = {
  onBegin(G: GameState, ctx: Ctx) {
    logPhaseToConsole(G.turn, ctx.phase);
    incrementActionPointsTotal(G); // ...... set new total action points available
    setActionPointsToTotal(G); // .......... set current action points to new total
    setPlayableCardsInHand(G); // .......... check card playability
    initZoneOnTurnStartInteractions(G); // . on-turn-start zone effects
    resetDoneStateForBothPlayers(G); // .... reset turn done state
    setFirstRevealer(G); // ................ sets who reveals first
    addDebugCardToHand(G); // .............. handle debug card draw, if applicable

    // updated zone references
    G.zones.forEach((z: Zone, i: number) => {
      G.zonesCardsReference[i]['0'] = z.sides['0'];
      G.zonesCardsReference[i]['1'] = z.sides['1'];
    });
  },
  onEnd(G: GameState, ctx: Ctx) {
    unsetPlayableCardsInHand(G); // ......... set all cards to canPlay: false
  },
  turn: {
    activePlayers: gameUsesAsyncTurns
      ? {
          all: 'playCards',
          currentPlayer: { stage: 'playCards' },
          others: { stage: 'playCards' },
          value: {
            '0': { stage: 'playCards' },
            '1': { stage: 'playCards' },
          },
        }
      : undefined,
    stages: gameUsesAsyncTurns
      ? {
          playCards: {
            moves: moves,
          },
        }
      : undefined,
    order: TurnOrder.CUSTOM_FROM('turnOrder'),
    endIf(G: GameState, ctx: Ctx) {
      return (
        gameUsesDefaultTurns &&
        G.playerTurnDone['0'] === true &&
        G.playerTurnDone['1'] === true
      );
    },
  },
  moves: gameUsesDefaultTurns ? moves : undefined,
};

export default playCardsPhase;
