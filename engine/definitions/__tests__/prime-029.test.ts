import { produce } from 'immer';
import { effectiveCost } from '../../rules/cost';
import { catalog, realCard, setup } from '../../testing/real-cards';
import type { GameState, PlayerId } from '../../state/types';

// PRIME_029: "Costs 1 less per Attack of your weapon" (a 4 cost minion with Guard).

const card = realCard('PRIME_029');
const armed = (s: GameState, player: PlayerId, attack: number): GameState =>
  produce(s, (g) => {
    g.players[player].weapon = {
      instanceId: 9999,
      cardId: 'GRUNT',
      attack,
      durability: 2,
    };
  });
const cost = (s: GameState) => effectiveCost(s, '0', card, catalog);

describe('PRIME_029', () => {
  it('is printed at 4 and costs that with no weapon', () => {
    expect(card.cost).toBe(4);
    expect(cost(setup('PRIME_029'))).toBe(4);
  });
  it('costs 1 less per point of Attack on your weapon', () => {
    expect(cost(armed(setup('PRIME_029'), '0', 1))).toBe(3);
    expect(cost(armed(setup('PRIME_029'), '0', 3))).toBe(1);
  });
  it('never costs less than 0', () => {
    expect(cost(armed(setup('PRIME_029'), '0', 7))).toBe(0);
  });
  it("counts a this-turn Attack boost already included in the weapon's Attack", () => {
    const s = produce(armed(setup('PRIME_029'), '0', 3), (g) => {
      g.players['0'].weapon!.tempAttack = 2; // Attack 3 here already includes the boost, as the engine stores it
    });
    expect(cost(s)).toBe(1);
  });
  it("ignores the opponent's weapon", () => {
    expect(cost(armed(setup('PRIME_029'), '1', 3))).toBe(4);
  });
});
