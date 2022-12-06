import { Ctx, LongFormMove } from 'boardgame.io';
import { Card, GameState, PlayerID } from '../../../types';
import { AttackMinionMove, attackMinionMove } from './attack-minion.move';
import { BuffMinionMove, buffMinionMove } from './buff-minion.move';
import { DeselectCardMove, deselectCardMove } from './deselect-card.move';
import { PlayCardMove, playCardMove } from './play-card.move';
import { SelectCardMove, selectCardMove } from './select-card.move';
import { SetDoneMove, setDoneMove } from './set-done.move';

export const attackMinion: LongFormMove = {
  client: false,
  noLimit: true,
  ignoreStaleStateID: false,
  undoable: false,
  move: (G: GameState, ctx: Ctx, { card, targetPlayer }: AttackMinionMove) => {
    return attackMinionMove(G, ctx, { card, targetPlayer });
  },
};

export const buffMinion: LongFormMove = {
  client: false,
  noLimit: true,
  ignoreStaleStateID: false,
  undoable: false,
  move: (G: GameState, ctx: Ctx, { card, targetPlayer }: BuffMinionMove) => {
    return buffMinionMove(G, ctx, { card, targetPlayer });
  },
};

export const deselectCard: LongFormMove = {
  client: false,
  noLimit: true,
  ignoreStaleStateID: false,
  undoable: false,
  move: (G: GameState, ctx: Ctx, { player }: DeselectCardMove) => {
    return deselectCardMove(G, ctx, { player });
  },
};

export const playCard: LongFormMove = {
  client: false,
  noLimit: true,
  ignoreStaleStateID: false,
  undoable: true,
  move: (G: GameState, ctx: Ctx, { ...args }: PlayCardMove) => {
    return playCardMove(G, ctx, { ...args });
  },
};

export const selectCard: LongFormMove = {
  client: false,
  noLimit: true,
  ignoreStaleStateID: false,
  undoable: false,
  move: (G: GameState, ctx: Ctx, { player, cardUuid }: SelectCardMove) => {
    return selectCardMove(G, ctx, { player, cardUuid });
  },
};

export const setDone: LongFormMove = {
  client: false,
  noLimit: true,
  ignoreStaleStateID: true,
  undoable: true,
  move: (G: GameState, ctx: Ctx, { player }: SetDoneMove) => {
    return setDoneMove(G, ctx, { player });
  },
};
