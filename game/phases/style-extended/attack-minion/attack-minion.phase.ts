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

import { calculateZoneSidePower, drawCardFromPlayersDeck, handleCardDestructionMechanics, logPhaseToConsole } from '../../../../utils';
import { fxEnd } from '../../../config.bgio-effects';
import { noAttackableMinionsAvailable } from './methods/no-attackable-minions-available';
import { attackMinion } from '../_moves/attack-minion.move';
import { determineAttackableMinions } from './methods/determine-attackable-minions';
import { unsetPlayableCards } from '../utils/unset-playable-cards';
import { resetHealableMinions } from '../heal-minion/methods/reset-healable-minions';
import removeCardFromHand from '../utils/remove-card-from-hand';
import { resetAttackableMinions } from './methods/reset-attackable-minions';
import { lte } from 'lodash';
import { counts } from '../../../state';
import handleDestroyedCards from '../utils/handle-destroyed-cards';
import handleZonePowersCalculations from '../utils/handle-zone-powers-calculations';
// import { moves } from './play-cards.phase.moves';

export default <PhaseConfig>{
  next: 'playCard',
  onBegin(G: GameState, ctx: Ctx) {
    logPhaseToConsole(G.turn, ctx.phase, ctx.currentPlayer);
  },
  onEnd(G: GameState, ctx: Ctx) {
    handleDestroyedCards(G, ctx);
    handleZonePowersCalculations(G, ctx);
  },
  endIf(G: GameState, ctx: Ctx) {
    return (
      noAttackableMinionsAvailable(G, ctx.currentPlayer) ||
      G.playerTurnDone[ctx.currentPlayer] === true
    );
  },
  moves: {
    attackMinion: {
      client: false,
      noLimit: true,
      ignoreStaleStateID: true,
      undoable: false,
      move: (
        G: GameState,
        ctx: Ctx,
        cardToAttack: Card,
        lastPlayedCard: Card,
        targetPlayer: PlayerID
      ) => {
        return attackMinion(G, ctx, cardToAttack, lastPlayedCard, targetPlayer);
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
      determineAttackableMinions(G, ctx.currentPlayer);
      unsetPlayableCards(G, ctx.currentPlayer);
    },
    onEnd(G, ctx) {
      const { selectedCardData, selectedCardIndex } = G;
      const { currentPlayer } = ctx;

      const cardUuid = selectedCardData[currentPlayer]!.uuid;
      const cardIdx = selectedCardIndex[currentPlayer]!;

      resetAttackableMinions(G, currentPlayer);
      removeCardFromHand(G, currentPlayer, cardUuid, cardIdx);
    },
    endIf(G: GameState, ctx: Ctx) {
      return G.playerTurnDone[ctx.currentPlayer] === true;
    },
    onMove(G: GameState, ctx: Ctx) {
      
    },
  },
};
