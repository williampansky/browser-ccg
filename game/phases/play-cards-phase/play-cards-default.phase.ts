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
} from '../init-card-mechanics-phase';

import { moves } from './play-cards.phase.moves';
import { drawCardFromPlayersDeck, logPhaseToConsole } from '../../../utils';
import { calculateZoneSidePower } from '../handle-zone-power-calculations-phase/methods';
import { fxEnd } from '../../config.bgio-effects';

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
      drawCardFromPlayersDeck(G, currentPlayer);
      incrementActionPointsTotal(G, currentPlayer);
      setActionPointsToTotal(G, currentPlayer);
      setPlayableCardsInHand(G, currentPlayer);
      initZoneOnTurnStartInteractions(G, currentPlayer);
      addDebugCardToHand(G, currentPlayer);
      fxEnd(ctx);
    },
    onEnd(G: GameState, ctx: Ctx) {
      const { currentPlayer } = ctx;
      unsetPlayableCardsInHand(G, currentPlayer);

      G.zones.forEach((zone: Zone, zoneIdx) => {
        zone.sides['0'].forEach((card: Card, cardIdx) => {
          card.booleans = {
            ...card.booleans,
            canBeBuffed: false,
            canBeDestroyed: false,
          }

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
            canBeBuffed: false,
            canBeDestroyed: false,
          }

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

        G.zones[zoneIdx].powers = {
          '0': calculateZoneSidePower(G, zoneIdx, '0'),
          '1': calculateZoneSidePower(G, zoneIdx, '1'),
        };

        // handle card deaths if health goes below zero
        G.zones.forEach((z, zI) => {
          z.sides['0'].forEach((c, cI) => {
            if (c.revealed && c.displayHealth <= 0) {
              G.players['0'].cards.destroyed.push(c.key);
              z.sides['0'] = z.sides['0'].filter((_, idx) => idx !== cI);
            }
          });

          z.sides['1'].forEach((c, cI) => {
            if (c.revealed && c.displayHealth <= 0) {
              G.players['1'].cards.destroyed.push(c.key);
              z.sides['1'] = z.sides['1'].filter((_, idx) => idx !== cI);
            }
          });
        })
      });
    },
    order: TurnOrder.CUSTOM_FROM('turnOrder'),
  },
};

export default defaultPlayCardsPhase;
