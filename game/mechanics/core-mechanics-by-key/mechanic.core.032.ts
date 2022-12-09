import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID, Zone } from '../../../types';
import { CardRace } from '../../../enums';
import { drawCardFromPlayersDeck, pushEventStream } from '../../../utils';

/**
 * draw a card anytime you summon a creature
 */
const core032 = {
  exec: (
    G: GameState,
    ctx: Ctx,
    zone: Zone,
    zoneIdx: number,
    card: Card,
    cardIdx: number,
    player: PlayerID
  ) => {
    const { eventStream } = card;

    G.zones.forEach((z) => {
      z.sides[player].forEach((c) => {
        const revealedThisTurn = c.revealedOnTurn === G.turn;
        const cardIsACreature = c.race === CardRace.Creature;
        const cardNotInStream = !eventStream.find((o) => o.uuid === c.uuid);
        const cardIsNotSelf = c.uuid !== card.uuid;

        const requirementsMet = (): boolean => {
          return (
            cardIsNotSelf &&
            cardIsACreature &&
            cardNotInStream &&
            revealedThisTurn
          );
        };

        if (requirementsMet()) {
          drawCardFromPlayersDeck(G, player);

          // find the core032 card node
          const self = G.zones[zoneIdx].sides[player][cardIdx];

          // set animations and bools
          pushEventStream(self, c, 'eventWasTriggered');
          if (!self.booleans.eventWasTriggered) {
            self.booleans.eventWasTriggered = true;
          }
        }
      });
    });
  },
};

export default core032;
