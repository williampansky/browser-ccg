import { catalog, endTurn, hurt, mref, minion, play, realCard, run, setup, stats, withWeapon } from '../../testing/real-cards';
import { legalActions } from '../../rules/legal-actions';
import type { Action, GameState } from '../../state/types';

// "While damaged" self effects (selfAura) and "whenever a minion takes damage" triggers.

const ids = ['009', '035', '041', '024', '244', '174', '022', '006', '239', '237', '016', '050'].map((n) => `PRIME_${n}`);
it.each(ids)('%s is defined and playable', (id) => {
  const s = setup(id);
  expect(legalActions(s, '0', catalog).some((a) => a.type === 'PlayCard' && a.handIndex === 0)).toBe(true);
});

/** A board with one `id` minion at its printed stats, then a spell is played so the engine settles. */
const settled = (id: string, mutate: (s: GameState) => GameState = (s) => s) => {
  const c = realCard(id);
  const s = mutate(setup('CORE_043', { mine: [[c.attack ?? 0, c.health ?? 1, id]] }));
  return play(s).state;
};

describe('damage triggers', () => {
  const attackOnto = (s: GameState) => {
    const attacker = s.players['0'].board[0];
    const r = run(s, { type: 'Attack', attackerId: attacker.instanceId, target: { kind: 'minion', instanceId: s.players['1'].board[0].instanceId } });
    if ('error' in r) throw new Error(r.error);
    return r.state;
  };
  it('PRIME_239 gains +1 Attack for every minion that takes damage, either side', () => {
    const s = setup('CORE_043', { mine: [[2, 4, 'PRIME_239'], [1, 9]], theirs: [[1, 9]] });
    const r = attackOnto({ ...s, players: { ...s.players, '0': { ...s.players['0'], board: [s.players['0'].board[1], s.players['0'].board[0]] } } });
    expect(stats(r, '0').find((x) => x[1] === 4)![0]).toBe(4); // two damage events: the attacker and the defender
  });
  it('PRIME_237 gives 1 Armor when a FRIENDLY minion is hurt, not an enemy one', () => {
    const s = setup('CORE_043', { mine: [[1, 9], [1, 4, 'PRIME_237']], theirs: [[1, 9]] });
    expect(attackOnto(s).players['0'].armor).toBe(1);
    const enemy = setup('CORE_043', { mine: [[1, 9]], theirs: [[1, 9, 'PRIME_237']] });
    expect(attackOnto(enemy).players['0'].armor).toBe(0);
  });
  it('PRIME_237 still pays out when the hurt friendly minion dies', () => {
    const s = setup('CORE_043', { mine: [[1, 1], [1, 4, 'PRIME_237']], theirs: [[5, 9]] });
    expect(attackOnto(s).players['0'].armor).toBe(1);
  });
  it('PRIME_016 draws only when it itself is damaged', () => {
    const s = setup('CORE_043', { mine: [[1, 9]], theirs: [[1, 9, 'PRIME_016']] });
    expect(attackOnto(s).players['1'].hand.length).toBe(s.players['1'].hand.length + 1);
    const other = setup('CORE_043', { mine: [[1, 9]], theirs: [[1, 9], [1, 9, 'PRIME_016']] });
    expect(attackOnto(other).players['1'].hand.length).toBe(other.players['1'].hand.length);
  });
  it('PRIME_050 gets +2 Attack for a spell, and loses it when the turn ends', () => {
    const s = setup('CORE_043', { mine: [[1, 3, 'PRIME_050']] });
    const r = play(s).state;
    expect(stats(r, '0')[0][0]).toBe(3);
    expect(stats(endTurn(r), '0')[0][0]).toBe(1);
    expect(stats(play(setup('PRIME_034', { mine: [[1, 3, 'PRIME_050']] })).state, '0')[0][0]).toBe(1); // not a spell
  });
});
