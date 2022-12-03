import type { Ctx } from 'boardgame.io';
import type { Card, GameState, LastMoveMade, PlayerID } from '../../../types';
import { aiPlayCard } from '../../ai';
import {
  attackMinion,
  buffMinion,
  deselectCard,
  destroyMinion,
  healMinion,
  playCard,
  selectCard,
  setDone,
  setLog,
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
  aiPlayCard: {
    client: false,
    noLimit: true,
    ignoreStaleStateID: true,
    move: (
      G: GameState,
      ctx: Ctx,
      aiID: PlayerID,
      zoneNumber: number,
      card: Card,
      cardIndex: number
    ) => {
      return aiPlayCard(G, ctx, aiID, zoneNumber, card, cardIndex);
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
  setLog: {
    client: false,
    noLimit: true,
    ignoreStaleStateID: true,
    move: (G: GameState, ctx: Ctx, payload: LastMoveMade) => {
      return setLog(G, ctx, payload);
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
  attackMinion: {
    client: false,
    noLimit: true,
    ignoreStaleStateID: true,
    move: (
      G: GameState,
      ctx: Ctx,
      player: PlayerID,
      targetPlayer: PlayerID,
      cardToAttackUuid: string,
      zoneNumber: number
    ) => {
      return attackMinion(G, ctx, player, targetPlayer, cardToAttackUuid, zoneNumber);
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
      targetPlayer: PlayerID,
      cardToBuffUuid: string,
      zoneNumber: number
    ) => {
      return buffMinion(G, ctx, player, targetPlayer, cardToBuffUuid, zoneNumber);
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
      targetPlayer: PlayerID,
      cardToDestroyUuid: string,
      zoneNumber: number
    ) => {
      return destroyMinion(G, ctx, player, targetPlayer, cardToDestroyUuid, zoneNumber);
    },
  },
  healMinion: {
    client: false,
    noLimit: true,
    ignoreStaleStateID: true,
    move: (
      G: GameState,
      ctx: Ctx,
      player: PlayerID,
      targetPlayer: PlayerID,
      cardToHealUuid: string,
      zoneNumber: number
    ) => {
      return healMinion(G, ctx, player, targetPlayer, cardToHealUuid, zoneNumber);
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
