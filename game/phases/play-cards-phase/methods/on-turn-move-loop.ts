import { gte, lte } from 'lodash';
import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID, Zone } from '../../../../types';
import { initEvent, InitGameMechanic, initOnPlay } from '../../../mechanics';
import { counts } from '../../../state';
import {
  calculateZoneSidePower,
  getContextualPlayerIds,
  handleCardDestructionMechanics,
} from '../../../../utils';

const onTurnMoveLoop = (G: GameState, ctx: Ctx, currentPlayer: PlayerID) => {
  const { opponent } = getContextualPlayerIds(currentPlayer);
  const moveIsPlayCard = G.lastMoveMade !== 'selectCard' || 'deselectCard';

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

      // currentPlayer's opponent can only listen for events
      zone.sides[opponent].forEach((card: Card, cardIdx) => {
        const props: InitGameMechanic = {
          G,
          ctx,
          zone,
          zoneIdx,
          card,
          cardIdx,
          player: opponent,
        };

        const onEvent = (cb?: () => void) => initEvent({ ...props }, cb);

        onEvent();
      });

      // handle card deaths if health goes below zero
      zone.sides['0'].forEach((c, cI) => {
        const hpIsLessOrEqualTo = (n: number) => lte(c.displayHealth, n);
        if (hpIsLessOrEqualTo(0)) {
          c.booleans.isDestroyed = true;
          G.players['0'].cards.destroyed.push(c);
          counts.incrementDestroyed(G, '0');
          handleCardDestructionMechanics(G, c, '0');
        }
      });

      // handle card deaths if health goes below zero
      zone.sides['1'].forEach((c, cI) => {
        const hpIsLessOrEqualTo = (n: number) => lte(c.displayHealth, n);
        if (hpIsLessOrEqualTo(0)) {
          c.booleans.isDestroyed = true;
          G.players['1'].cards.destroyed.push(c);
          counts.incrementDestroyed(G, '1');
          handleCardDestructionMechanics(G, c, '1');
        }
      });

      // set zone powers
      zone.powers['0'] = calculateZoneSidePower(G, zoneIdx, '0');
      zone.powers['1'] = calculateZoneSidePower(G, zoneIdx, '1');
    });

    if (gte(G.players[currentPlayer].cards.hand.length, 1)) {
      G.players[currentPlayer].cards.hand.forEach((c: Card) => {
        const { current } = G.actionPoints[currentPlayer];
        const cardAffordCard = lte(c.currentCost, current);

        if (cardAffordCard) c.canPlay = true;
        else c.canPlay = false;
      });
    }
  }
};

export default onTurnMoveLoop;
