import { add } from 'mathjs';
import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID, Zone } from '../../../types';
import { CardType } from '../../../enums';
import { getCardPower, isBotGame, pushEventStream, pushPowerStreamAndSetDisplay } from '../../../utils';

/**
 * buff +num1 power whenever you play a spell card
 */
const core012 = {
  exec: (
    G: GameState,
    ctx: Ctx,
    zone: Zone,
    zoneIdx: number,
    card: Card,
    cardIdx: number,
    player: PlayerID
  ) => {
    const { numberPrimary, powerStream } = card;

    G.zones.forEach((z, zIdx) => {
      z.sides[player].forEach((c, cIdx) => {
        const revealedThisTurn = c.revealedOnTurn === G.turn;
        const cardIsASpell = c.type === CardType.Spell;
        const cardNotInStream = !powerStream.find((o) => o.uuid === c.uuid);
        const cardIsNotSelf = c.uuid !== card.uuid;

        const requirementsMet = (): boolean => {
          return (
            cardIsNotSelf && cardIsASpell && cardNotInStream && revealedThisTurn
          );
        };

        if (requirementsMet()) {
          if (isBotGame(ctx)) {
            aiSpread(G, ctx, player, zoneIdx, card, c);
          } else {
            // find the core012 card node
            const self = G.zones[zoneIdx].sides[player][cardIdx];

            // set animations and bools
            pushEventStream(self, c, 'eventWasTriggered');
            if (!self.booleans.eventWasTriggered) {
              self.booleans.eventWasTriggered = true;
            }

            if (!self.booleans.isBuffed) {
              self.booleans.isBuffed = true;
            }

            if (!self.booleans.hasPowerIncreased) {
              self.booleans.hasPowerIncreased = true;
            }

            // push powerStream and set it
            pushPowerStreamAndSetDisplay(
              self,
              c,
              numberPrimary!,
              add(card.displayPower, numberPrimary!)
            );
          }
        }
      });
    });
  },
};

function aiSpread(
  G: GameState,
  ctx: Ctx,
  player: PlayerID,
  zoneNumber: number,
  cardToAdjust: Card,
  cardToBlame?: Card
) {
  const cardToAdjustIdx = G.zones[zoneNumber].sides[player].findIndex((o) => {
    return o.uuid === cardToAdjust.uuid;
  });

  // push streams
  G.zones[zoneNumber].sides[player][cardToAdjustIdx] = {
    ...G.zones[zoneNumber].sides[player][cardToAdjustIdx],
    booleans: {
      ...G.zones[zoneNumber].sides[player][cardToAdjustIdx].booleans,
      eventWasTriggered: true,
      isBuffed: true,
      hasPowerIncreased: true,
    },
    eventStream: [
      ...G.zones[zoneNumber].sides[player][cardToAdjustIdx].eventStream,
      {
        blame: cardToBlame ? cardToBlame.name : cardToAdjust.name,
        event: 'eventWasTriggered',
        uuid: cardToBlame ? cardToBlame.uuid : cardToAdjust.uuid,
      },
    ],
    powerStream: [
      ...G.zones[zoneNumber].sides[player][cardToAdjustIdx].powerStream,
      {
        blame: cardToBlame ? cardToBlame.name : cardToAdjust.name,
        adjustment: cardToAdjust.numberPrimary,
        currentPower: add(
          cardToAdjust.displayPower,
          cardToAdjust.numberPrimary
        ),
        uuid: cardToBlame ? cardToBlame.uuid : cardToAdjust.uuid,
      },
    ],
  };

  // set display power
  G.zones[zoneNumber].sides[player][cardToAdjustIdx] = {
    ...G.zones[zoneNumber].sides[player][cardToAdjustIdx],
    displayPower: getCardPower(
      G.zones[zoneNumber].sides[player][cardToAdjustIdx]
    ),
  };
}

export default core012;
