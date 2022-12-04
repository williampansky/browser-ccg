import { TurnOrder } from 'boardgame.io/core';

import type { Ctx, PhaseConfig } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';

// import {
//   onTurnBeginLoop,
//   onTurnEndLoop,
//   onTurnMoveLoop,
//   resetDoneState,
//   unsetPlayableCardsInHand,
// } from './methods';

import { logPhaseToConsole } from '../../../utils';
import { fxEnd } from '../../config.bgio-effects';
import { determineHealableMinions } from './methods/determine-healable-minions';
import { healMinion, HealMinionMove } from './moves/heal-minion.move';
import { resetHealableMinions } from './methods/reset-healable-minions';
import { unsetPlayableCards } from '../_utils/unset-playable-cards';
import { noHealableMinionsAvailable } from './methods/no-healable-minions-available';
import setDoneMove from '../_moves/set-done.move';
import removeCardFromHand from '../_utils/remove-card-from-hand';
import { playerTurnDone } from '../../state';
// import { moves } from './play-cards.phase.moves';

export default <PhaseConfig>{
  next: 'playCard',
  onBegin(G: GameState, ctx: Ctx) {
    logPhaseToConsole(G.turn, ctx.phase, ctx.currentPlayer);
  },
  onEnd(G: GameState, ctx: Ctx) {},
  endIf(G: GameState, ctx: Ctx) {
    return (
      noHealableMinionsAvailable(G, ctx.currentPlayer) ||
      G.playerTurnDone[ctx.currentPlayer] === true
    );
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
    // setDone: {
    //   client: false,
    //   noLimit: true,
    //   ignoreStaleStateID: true,
    //   undoable: false,
    //   move: (G: GameState, ctx: Ctx, player: PlayerID) => {
    //     G.lastMoveMade = 'setDone';
    //     playerTurnDone.set(G, player);
    //     // ctx.events?.endTurn();
    //     // ctx.events?.endPhase();
    //   },
    // },
  },
  turn: {
    order: TurnOrder.CUSTOM_FROM('turnOrder'),
    onBegin(G, ctx) {
      determineHealableMinions(G, ctx.currentPlayer);
      unsetPlayableCards(G, ctx.currentPlayer);
    },
    onEnd(G, ctx) {
      const { selectedCardData, selectedCardIndex } = G;
      const { currentPlayer } = ctx;

      const cardUuid = selectedCardData[currentPlayer]!.uuid;
      const cardIdx = selectedCardIndex[currentPlayer]!;

      removeCardFromHand(G, currentPlayer, cardUuid, cardIdx);
      resetHealableMinions(G, currentPlayer);
    },
    endIf(G: GameState, ctx: Ctx) {
      return G.playerTurnDone[ctx.currentPlayer] === true;
    },
    // onBegin(G: GameState, ctx: Ctx) {
    //   ctx.events?.setActivePlayers({ currentPlayer: ctx.playOrder[0] })
    // },
    // onEnd(G: GameState, ctx: Ctx) {
    //   const { currentPlayer } = ctx;
    //   unsetPlayableCardsInHand(G, currentPlayer);
    //   onTurnEndLoop(G, ctx);
    //   fxEnd(ctx);
    // },
    // endIf(G: GameState, ctx: Ctx) {
    //   const { currentPlayer } = ctx;
    //   return G.playerTurnDone[currentPlayer] === true;
    // },
    // onMove(G: GameState, ctx: Ctx) {
    //   const { currentPlayer } = ctx;
    //   onTurnMoveLoop(G, ctx, currentPlayer);
    // },
    // order: TurnOrder.CUSTOM_FROM('turnOrder'),
  },
};
