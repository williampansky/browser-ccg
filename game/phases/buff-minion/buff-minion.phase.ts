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
import { noBuffableMinionsAvailable } from './methods/no-buffable-minions-available';
import { attackMinion } from '../_moves/attack-minion.move';
import { determineBuffableMinions } from './methods/determine-buffable-minions';
import { unsetPlayableCards } from '../_utils/unset-playable-cards';
import { resetHealableMinions } from '../heal-minion/methods/reset-healable-minions';
import removeCardFromHand from '../_utils/remove-card-from-hand';
import { resetBuffableMinions } from './methods/reset-buffable-minions';
import { lte } from 'lodash';
import { counts } from '../../state';
import handleDestroyedCards from '../_utils/handle-destroyed-cards';
import handleZonePowersCalculations from '../_utils/handle-zone-powers-calculations';
import { buffMinion } from '../_moves/buff-minion.move';
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
      noBuffableMinionsAvailable(G, ctx.currentPlayer) ||
      G.playerTurnDone[ctx.currentPlayer] === true
    );
  },
  moves: {
    buffMinion: {
      client: false,
      noLimit: true,
      ignoreStaleStateID: true,
      undoable: false,
      move: (
        G: GameState,
        ctx: Ctx,
        cardToBuff: Card,
        lastPlayedCard: Card,
        targetPlayer: PlayerID
      ) => {
        return buffMinion(G, ctx, cardToBuff, lastPlayedCard, targetPlayer);
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
      determineBuffableMinions(G, ctx.currentPlayer);
      unsetPlayableCards(G, ctx.currentPlayer);
    },
    onEnd(G, ctx) {
      const { selectedCardData, selectedCardIndex } = G;
      const { currentPlayer } = ctx;

      const cardUuid = selectedCardData[currentPlayer]!.uuid;
      const cardIdx = selectedCardIndex[currentPlayer]!;

      removeCardFromHand(G, currentPlayer, cardUuid, cardIdx);
      resetBuffableMinions(G, currentPlayer);
    },
    endIf(G: GameState, ctx: Ctx) {
      return G.playerTurnDone[ctx.currentPlayer] === true;
    },
    onMove(G: GameState, ctx: Ctx) {
      
    },
  },
};
