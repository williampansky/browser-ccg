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

import { calculateZoneSidePower, drawCardFromPlayersDeck, handleCardDestructionMechanics, logPhaseToConsole } from '../../../utils';
import { fxEnd } from '../../config.bgio-effects';
import { noDestroyableMinionsAvailable } from './methods/no-destroyable-minions-available';
import { attackMinion } from '../_moves/attack-minion.move';
import { determineDestroyableMinions } from './methods/determine-destroyable-minions';
import { unsetPlayableCards } from '../_utils/unset-playable-cards';
import { resetHealableMinions } from '../heal-minion/methods/reset-healable-minions';
import removeCardFromHand from '../_utils/remove-card-from-hand';
import { resetDestroyableMinions } from './methods/reset-destroyable-minions';
import { lte } from 'lodash';
import { counts } from '../../state';
import handleDestroyedCards from '../_utils/handle-destroyed-cards';
import handleZonePowersCalculations from '../_utils/handle-zone-powers-calculations';
import { destroyMinion } from '../_moves/destroy-minion.move';
import removeLastPlayedCardFromHand from '../_utils/remove-last-played-card-from-hand';
import { LastMoveMade } from '../../../enums';
// import { moves } from './play-cards.phase.moves';

export default <PhaseConfig>{
  next: 'playCard',
  onBegin(G: GameState, ctx: Ctx) {
    logPhaseToConsole(G.turn, ctx.phase, ctx.currentPlayer);
  },
  onEnd(G: GameState, ctx: Ctx) {
  },
  endIf(G: GameState, ctx: Ctx) {
    return (
      noDestroyableMinionsAvailable(G, ctx.currentPlayer) ||
      G.playerTurnDone[ctx.currentPlayer] === true
    );
  },
  moves: {
    destroyMinion: {
      client: false,
      noLimit: true,
      ignoreStaleStateID: true,
      undoable: false,
      move: (
        G: GameState,
        ctx: Ctx,
        cardToDestroy: Card,
        lastPlayedCard: Card,
        targetPlayer: PlayerID
      ) => {
        return destroyMinion(G, ctx, cardToDestroy, lastPlayedCard, targetPlayer);
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
      determineDestroyableMinions(G, ctx.currentPlayer);
      unsetPlayableCards(G, ctx.currentPlayer);
    },
    onEnd(G, ctx) {
      removeLastPlayedCardFromHand(G, ctx.currentPlayer);
      resetDestroyableMinions(G, ctx.currentPlayer);
    },
    endIf(G: GameState, ctx: Ctx) {
      return G.playerTurnDone[ctx.currentPlayer] === true;
    },
    onMove(G: GameState, ctx: Ctx) {
      if (G.lastMoveMade === LastMoveMade.DestroyMinion) {
        handleDestroyedCards(G, ctx);
      }
    },
  },
};
