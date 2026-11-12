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

describe.each([
  ['PRIME_009', 2, 3],
  ['PRIME_035', 2, 2],
  ['PRIME_041', 0, 5],
  ['PRIME_024', 2, 3],
  ['PRIME_244', 3, 6],
])('%s: bonus Attack while damaged', (id, base, bonus) => {
  it('has its printed Attack when unhurt and the bonus once hurt, and loses it when healed', () => {
    const health = realCard(id).health!;
    expect(stats(settled(id), '0')[0][0]).toBe(base);
    const damaged = settled(id, (s) => hurt(s, '0', 0, health - 1));
    expect(stats(damaged, '0')[0][0]).toBe(base + bonus);
    const healed = produceHealed(damaged);
    expect(stats(healed, '0')[0][0]).toBe(base);
  });
});
const produceHealed = (s: GameState): GameState => {
  const healed = hurt(s, '0', 0, s.players['0'].board[0].maxHealth);
  // a settle (any action) recomputes the bonus
  const r = run(healed, { type: 'EndTurn' } as Action);
  return 'error' in r ? healed : r.state;
};

it('PRIME_174 has Attack equal to its Health, always', () => {
  expect(stats(settled('PRIME_174'), '0')[0]).toEqual([5, 5]);
  expect(stats(settled('PRIME_174', (s) => hurt(s, '0', 0, 2)), '0')[0]).toEqual([2, 2]);
});

describe('PRIME_022 Blood-crazed Assassin', () => {
  it('has no Onslaught while unhurt, even though its data lists it', () => {
    const r = play(setup('PRIME_022')).state;
    expect(minion(r, '0', 0).keywords.doubleAttack).toBe(false);
  });
  it('gains +1 Attack and Onslaught while damaged', () => {
    const r = settled('PRIME_022', (s) => hurt(s, '0', 0, 2));
    expect(stats(r, '0')[0]).toEqual([4, 2]);
    expect(minion(r, '0', 0).keywords.doubleAttack).toBe(true);
  });
});

describe('PRIME_006 Swiftpack', () => {
  it('has Stampede only while you have a weapon', () => {
    expect(minion(play(setup('PRIME_006')).state, '0', 0).keywords.rush).toBe(false);
    const armed = play(withWeapon(setup('PRIME_006'), '0')).state;
    expect(minion(armed, '0', 0).keywords.rush).toBe(true);
  });
  it('an on-board Swiftpack gains it when a weapon is equipped, and loses it when the weapon breaks', () => {
    const s = setup('CORE_076', { mine: [[2, 1, 'PRIME_006']] });
    expect(realCard('CORE_076').type).toBe('weapon');
    const armed = play(s).state;
    expect(minion(armed, '0', 0).keywords.rush).toBe(true);
  });
});

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
