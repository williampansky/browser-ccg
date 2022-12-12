import { Ctx } from 'boardgame.io';
import { isEqual } from 'lodash';
import { add } from 'mathjs';
import { Card, CardPowerStream, GameState, PlayerID } from '../types';
import cardHasBoon from './card-has-boon';
import cardIsNotSelf from './card-is-not-self';
import getContextualPlayerIds from './get-contextual-player-ids';
import pushPowerStreamAndSetDisplay from './push-powerstream-and-set-display';

const handleActiveCardBoons = {
  init: init,
  // compare: compare,
  // recalculate: recalculate,
};

function init(G: GameState, ctx: Ctx) {
  const { opponent, player } = getContextualPlayerIds(ctx.currentPlayer);
  const cardsWithBoons: Card[] = [];

  G.zones.forEach((z) => {
    z.sides[player].forEach((c1) => {
      if (cardHasBoon(c1)) {
        cardsWithBoons.push(c1);
        // handleActiveCardBoons.recalculate(c, player);
      }

      cardsWithBoons.forEach(c2 => {
        if (!isEqual(c1, c2)) {
          // console.log(c1.name)
          c1.booleans.isBooned = true;
          c1.booleans.hasPowerIncreased = true;
          pushPowerStreamAndSetDisplay(
            c1, c2, c2.numberPrimary, add(c1.displayPower, c2.numberPrimary)
          )
        }
      })
    });
  });

  // cardsWithBoons.forEach(c => console.log(c.name))

  // G.zones.forEach((z) => {
  //   z.sides[player].forEach((c) => {
  //     if (cardIsNotSelf(c)) {

  //     }
  //   });
  // });
}

// function compare(powerStreamObject: CardPowerStream, cardToCompare: Card) {

// }

// function recalculate(card: Card, player: PlayerID) {
//   // card.powerStream.forEach(obj => {
//   //   if ()
//   // })
// }

export default handleActiveCardBoons;
