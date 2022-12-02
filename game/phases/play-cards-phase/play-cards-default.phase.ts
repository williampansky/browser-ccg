import { subtract } from 'mathjs';
import { gt, gte, lte } from 'lodash';
import { TurnOrder } from 'boardgame.io/core';

import type { Ctx, PhaseConfig } from 'boardgame.io';
import type { Card, GameState, Zone } from '../../../types';

import {
  addDebugCardToHand,
  incrementActionPointsTotal,
  initZoneOnTurnStartInteractions,
  resetDoneState,
  setActionPointsToTotal,
  setPlayableCardsInHand,
  unsetPlayableCardsInHand,
} from './methods';

import {
  initEvent,
  InitGameMechanic,
  initOnPlay,
  initTurnEnd,
} from '../../mechanics';

import {
  drawCardFromPlayersDeck,
  getContextualPlayerIds,
  handleCardDestructionMechanics,
  logPhaseToConsole,
} from '../../../utils';
import { moves } from './play-cards.phase.moves';
import { calculateZoneSidePower } from '../handle-zone-power-calculations-phase/methods';
import { fxEnd } from '../../config.bgio-effects';
import { counts } from '../../state';

const defaultPlayCardsPhase: PhaseConfig = {
  onBegin(G: GameState, ctx: Ctx) {
    logPhaseToConsole(G.turn, ctx.phase);

    fxEnd(ctx);
  },
  onEnd(G: GameState, ctx: Ctx) {
    resetDoneState(G);
  },
  endIf(G: GameState, ctx: Ctx) {
    return G.playerTurnDone['0'] === true && G.playerTurnDone['1'] === true;
  },
  moves: moves,
  turn: {
    onBegin(G: GameState, ctx: Ctx) {
      const { currentPlayer } = ctx;
      const { opponent } = getContextualPlayerIds(currentPlayer);

      drawCardFromPlayersDeck(G, currentPlayer);
      incrementActionPointsTotal(G, currentPlayer);
      setActionPointsToTotal(G, currentPlayer);
      setPlayableCardsInHand(G, currentPlayer);
      initZoneOnTurnStartInteractions(G, currentPlayer);
      addDebugCardToHand(G, currentPlayer);
      fxEnd(ctx);

      // decrement zone.disabledForXTurns values
      const op = opponent;
      G.zones.forEach((z, zI) => {
        if (gt(z.disabledForXTurns[op], 0)) {
          z.disabledForXTurns[op] = subtract(z.disabledForXTurns[op], 1);
        }

        if (z.disabled[op] === true && z.disabledForXTurns[op] === 0) {
          z.disabled[op] = false;
        }
      });
    },
    onEnd(G: GameState, ctx: Ctx) {
      const { currentPlayer } = ctx;
      unsetPlayableCardsInHand(G, currentPlayer);

      G.zones.forEach((zone: Zone, zoneIdx) => {
        zone.sides['0'].forEach((card: Card, cardIdx) => {
          card.booleans = {
            ...card.booleans,
            canBeAttackedBySpell: false,
            canBeAttackedByWeapon: false,
            canBeBuffed: false,
            canBeDestroyed: false,
            canBeHealed: false,
            eventWasTriggered: false,
          };

          const props: InitGameMechanic = {
            G,
            ctx,
            zone,
            zoneIdx,
            card,
            cardIdx,
            player: '0',
          };

          const turnEnd = (cb?: () => void) => initTurnEnd({ ...props }, cb);
          turnEnd();
        });

        zone.sides['1'].forEach((card: Card, cardIdx) => {
          card.booleans = {
            ...card.booleans,
            canBeAttackedBySpell: false,
            canBeAttackedByWeapon: false,
            canBeBuffed: false,
            canBeDestroyed: false,
            canBeHealed: false,
            eventWasTriggered: false,
          };

          const props: InitGameMechanic = {
            G,
            ctx,
            zone,
            zoneIdx,
            card,
            cardIdx,
            player: '1',
          };

          const turnEnd = (cb?: () => void) => initTurnEnd({ ...props }, cb);
          turnEnd();
        });
      });

      fxEnd(ctx);
    },
    endIf(G: GameState, ctx: Ctx) {
      const { currentPlayer } = ctx;
      return G.playerTurnDone[currentPlayer] === true;
    },
    onMove(G: GameState, ctx: Ctx) {
      const { currentPlayer } = ctx;
      const moveIsPlayCard = G.lastMoveMade === 'playCard';

      if (moveIsPlayCard) {
        G.zones.forEach((zone: Zone, zoneIdx) => {
          zone.sides[currentPlayer].forEach((card: Card, cardIdx) => {
            const props: InitGameMechanic = {
              G,
              ctx,
              zone,
              zoneIdx,
              card,
              cardIdx,
              player: currentPlayer,
            };

            const onPlay = (cb?: () => void) => initOnPlay({ ...props }, cb);
            const onEvent = (cb?: () => void) => initEvent({ ...props }, cb);

            onPlay(onEvent());
          });

          // handle card deaths if health goes below zero
          zone.sides['0'].forEach((c, cI) => {
            const hpIsLessOrEqualTo = (n: number) => lte(c.displayHealth, n);
            if (hpIsLessOrEqualTo(0)) {
              G.players['0'].cards.destroyed.push(c);
              counts.incrementDestroyed(G, '0');
              zone.sides['0'] = zone.sides['0'].filter((_, idx) => idx !== cI);
              handleCardDestructionMechanics(G, c, '0');
            }
          });

          zone.sides['1'].forEach((c, cI) => {
            const hpIsLessOrEqualTo = (n: number) => lte(c.displayHealth, n);
            if (hpIsLessOrEqualTo(0)) {
              G.players['1'].cards.destroyed.push(c);
              counts.incrementDestroyed(G, '1');
              zone.sides['1'] = zone.sides['1'].filter((_, idx) => idx !== cI);
              handleCardDestructionMechanics(G, c, '1');
            }
          });

          // set zone powers
          zone.powers['0'] = calculateZoneSidePower(G, zoneIdx, '0');
          zone.powers['1'] = calculateZoneSidePower(G, zoneIdx, '1');
        });

        if (gte(G.players[currentPlayer].cards.hand.length, 1)) {
          G.players[currentPlayer].cards.hand.forEach((c: Card) => {
            if (G.actionPoints[currentPlayer].current >= c.currentCost) {
              return (c.canPlay = true);
            } else {
              return (c.canPlay = false);
            }
          });
        }
      }
    },
    order: TurnOrder.CUSTOM_FROM('turnOrder'),
  },
};

export default defaultPlayCardsPhase;
