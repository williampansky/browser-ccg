import { TurnOrder } from 'boardgame.io/core';

import type { Ctx, PhaseConfig } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../../types';

// import {
//   onTurnBeginLoop,
//   onTurnEndLoop,
//   onTurnMoveLoop,
//   resetDoneState,
//   unsetPlayableCardsInHand,
// } from './methods';

import { logPhaseToConsole } from '../../../../utils';
import { fxEnd } from '../../../config.bgio-effects';
import { determineHealableMinions } from './methods/determine-healable-minions';
import { healMinion, HealMinionMove } from './moves/heal-minion.move';
import { resetHealableMinions } from './methods/reset-healable-minions';
import { unsetPlayableCards } from './methods/unset-playable-cards';
import { noHealableMinionsAvailable } from './methods/no-healable-minions-available';
// import { moves } from './play-cards.phase.moves';

export default <PhaseConfig>{
  next: 'playCard',
  onBegin(G: GameState, ctx: Ctx) {
    logPhaseToConsole(G.turn, ctx.phase, ctx.currentPlayer);
    determineHealableMinions({ G, player: ctx.currentPlayer });
    unsetPlayableCards({ G, player: ctx.currentPlayer });
  },
  onEnd(G: GameState, ctx: Ctx) {
    resetHealableMinions({ G, player: ctx.currentPlayer });
  },
  endIf(G: GameState, ctx: Ctx) {
    return noHealableMinionsAvailable({ G, player: ctx.currentPlayer });
  },
  moves: {
    healMinion: {
      client: false,
      noLimit: true,
      ignoreStaleStateID: true,
      undoable: false,
      move: (
        G: GameState,
        ctx: Ctx,
        cardToHeal: Card,
        lastPlayedCard: Card,
        targetPlayer: PlayerID
      ) => {
        return healMinion(G, ctx, cardToHeal, lastPlayedCard, targetPlayer);
      },
    },
  },
  // turn: {
  //   onBegin(G: GameState, ctx: Ctx) {
  //     onTurnBeginLoop(G, ctx);
  //   },
  //   onEnd(G: GameState, ctx: Ctx) {
  //     const { currentPlayer } = ctx;
  //     unsetPlayableCardsInHand(G, currentPlayer);
  //     onTurnEndLoop(G, ctx);
  //     fxEnd(ctx);
  //   },
  //   endIf(G: GameState, ctx: Ctx) {
  //     const { currentPlayer } = ctx;
  //     return G.playerTurnDone[currentPlayer] === true;
  //   },
  //   onMove(G: GameState, ctx: Ctx) {
  //     const { currentPlayer } = ctx;
  //     onTurnMoveLoop(G, ctx, currentPlayer);
  //   },
  //   order: TurnOrder.CUSTOM_FROM('turnOrder'),
  // },
};
