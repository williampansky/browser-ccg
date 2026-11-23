import { boostedMinions } from '../boost-preview';
import { catalog, setup } from '../../../engine/testing/real-cards';

// CORE_003: "Your other Sprites gain +1 Attack". Board: one Sprite (CORE_003 itself is a Sprite) and a Creature.
describe('boostedMinions', () => {
  it('lists only the matching minion for CORE_003', () => {
    const s = setup('CORE_003', {
      mine: [
        [2, 2, 'CORE_003'],
        [2, 2, 'CORE_062'],
      ],
    });
    const [sprite] = s.players['0'].board;
    expect(boostedMinions(s, '0', 0, catalog)).toEqual([sprite.instanceId]);
  });
  it('lists nothing when no minion matches', () => {
    const s = setup('CORE_003', { mine: [[2, 2, 'CORE_062']] });
    expect(boostedMinions(s, '0', 0, catalog)).toEqual([]);
  });
});
