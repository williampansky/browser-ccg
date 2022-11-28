import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';

import {
  buffMinion,
  deselectCard,
  destroyMinion,
  playAiCard,
  playCard,
  selectCard,
  setDone,
  undoPlayCard,
  updatePlayerHandArray,
} from '../../moves';

export const moves = {
  selectCard: {
    client: false,
    noLimit: true,
    ignoreStaleStateID: true,
    move: (G: GameState, ctx: Ctx, player: PlayerID, cardUuid: string) => {
      return selectCard(G, ctx, player, cardUuid);
    },
  },
  deselectCard: {
    client: false,
    noLimit: true,
    ignoreStaleStateID: true,
    move: (G: GameState, ctx: Ctx, player: PlayerID) => {
      return deselectCard(G, ctx, player);
    },
  },
  playCard: {
    client: false,
    noLimit: true,
    ignoreStaleStateID: true,
    undoable: true,
    move: (G: GameState, ctx: Ctx, player: PlayerID, zoneNumber: number) => {
      return playCard(G, ctx, player, zoneNumber);
    },
  },
  undoPlayCard: {
    client: false,
    noLimit: true,
    ignoreStaleStateID: true,
    move: (G: GameState, ctx: Ctx, player: PlayerID, undo: any) => {
      return undoPlayCard(G, ctx, player, undo);
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
    move: (G: GameState, ctx: Ctx, player: PlayerID) => {
      return setDone(G, ctx, player);
    },
  },
  endTurn: {
    client: false,
    noLimit: true,
    ignoreStaleStateID: true,
    move: (G: GameState, ctx: Ctx, player: PlayerID) => {
      return ctx?.events?.endTurn({ next: player });
    },
  },
  buffMinion: {
    client: false,
    noLimit: true,
    ignoreStaleStateID: true,
    move: (
      G: GameState,
      ctx: Ctx,
      player: PlayerID,
      cardToBuffUuid: string,
      zoneNumber: number
    ) => {
      return buffMinion(G, ctx, player, cardToBuffUuid, zoneNumber);
    },
  },
  destroyMinion: {
    client: false,
    noLimit: true,
    ignoreStaleStateID: true,
    move: (
      G: GameState,
      ctx: Ctx,
      player: PlayerID,
      cardToDestroyUuid: string,
      zoneNumber: number
    ) => {
      return destroyMinion(G, ctx, player, cardToDestroyUuid, zoneNumber);
    },
  },
  updatePlayerHandArray: {
    client: false,
    noLimit: true,
    ignoreStaleStateID: true,
    move: (
      G: GameState,
      ctx: Ctx,
      player: PlayerID,
      cardUuid: string,
    ) => {
      return updatePlayerHandArray(G, ctx, player, cardUuid);
    },
  },
};
