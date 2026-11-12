import { defineCard } from '../define-card';
import { damage, ifDead, summonRandomCard } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// PRIME_227 Zap: "Deal 2 damage to a minion; if it dies, summon a Random 4/5/6-cost Undead for you" (the data's Demonic race)
export default defineCard('PRIME_227', (n) => ({
  target: anyMinion(),
  onPlay: [
    damage(chosenTarget(), n.primary),
    ifDead(chosenTarget(), summonRandomCard((c) => c.race === 'DEMONIC' && c.cost >= 4 && c.cost <= 6)),
  ],
}));
