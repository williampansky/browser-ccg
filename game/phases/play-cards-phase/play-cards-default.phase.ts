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

import { moves } from './play-cards.phase.config';
import { drawCardFromPlayersDeck, logPhaseToConsole } from '../../../utils';
import { calculateZoneSidePower } from '../handle-zone-power-calculations-phase/methods';

const defaultPlayCardsPhase: PhaseConfig = {
  onBegin(G: GameState, ctx: Ctx) {
    logPhaseToConsole(G.turn, ctx.phase);
    
    // @ts-ignore
    ctx.effects?.fxEnd();
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
    },
    onEnd(G: GameState, ctx: Ctx) {
      const { currentPlayer } = ctx;
      unsetPlayableCardsInHand(G, currentPlayer);

      G.zones.forEach((zone: Zone, zoneIdx) => {
        zone.sides[currentPlayer].forEach((card: Card, cardIdx) => {
          card.booleans = {
            ...card.booleans,
            canBeBuffed: false
          }

          const props: InitGameMechanic = {
            G,
            ctx,
            zone,
            zoneIdx,
            card,
            cardIdx,
            player: currentPlayer,
          };

          const turnEnd = (cb?: () => void) => initTurnEnd({ ...props }, cb);
          turnEnd();
        });
      });
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
      });
    },
    order: TurnOrder.CUSTOM_FROM('turnOrder'),
  },
};

export default defaultPlayCardsPhase;
