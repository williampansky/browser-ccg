import { defineCard, on } from '../define-card';
import { buff, loseWeaponDurability } from '../../effects/primitives';
import { eventMinion } from '../../effects/selectors';

const BONUS_ATTACK = 1;
const BONUS_HEALTH = 1;
const DURABILITY_COST = 1;

// PRIME_166 Conscript's Cudgel (weapon): "After you summon a minion, give it
// +1/+1 and this loses 1 Durability"
export default defineCard('PRIME_166', () => ({
  triggers: [
    on('MinionSummoned', {
      when: (event, info) => event.player === info.owner,
      do: [
        buff(eventMinion(), BONUS_ATTACK, BONUS_HEALTH),
        loseWeaponDurability(DURABILITY_COST),
      ],
    }),
  ],
}));
