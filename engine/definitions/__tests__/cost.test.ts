import { produce } from 'immer';
import { effectiveCost } from '../../rules/cost';
import { legalActions } from '../../rules/legal-actions';
import { catalog, failCode, play, realCard, run, setup } from '../../testing/real-cards';
import { setEnergy } from '../../testing/builders';
import type { GameState } from '../../state/types';

// Cost changes: effectiveCost is what the engine charges, what legalActions allows, and what the UI shows.

const cost = (s: GameState, id: string) => effectiveCost(s, '0', realCard(id), catalog);
const withEnergy = (s: GameState, n: number) => setEnergy(s, '0', n);

describe('PRIME_220 Ancient Portal: minions cost 2 less, not below 1', () => {
  const s = setup('CORE_001', { mine: [[0, 4, 'PRIME_220']] });
  it('reduces minions by 2 but never below 1', () => {
    const minionOf = (c: number) => Array.from(catalog.values()).find((x) => x.type === 'minion' && x.cost === c && x.source === 'core')!;
    expect(effectiveCost(s, '0', minionOf(5), catalog)).toBe(3);
    expect(effectiveCost(s, '0', minionOf(2), catalog)).toBe(1);
    expect(effectiveCost(s, '0', minionOf(1), catalog)).toBe(1);
  });
  it('leaves a 0-cost minion at 0 and does not touch spells', () => {
    const zero = { ...realCard('CORE_001'), cost: 0 };
    expect(effectiveCost(s, '0', zero, catalog)).toBe(0);
    expect(cost(s, 'CORE_043')).toBe(realCard('CORE_043').cost);
  });
  it('only helps its owner', () => {
    const other = setup('CORE_001', { theirs: [[0, 4, 'PRIME_220']] });
    expect(cost(other, 'CORE_001')).toBe(realCard('CORE_001').cost);
  });
  it('is charged when played, and makes an unaffordable card playable', () => {
    const base = setup('PRIME_034', { mine: [[0, 4, 'PRIME_220']] }); // a 5-cost minion
    expect(realCard('PRIME_034').cost).toBe(5);
    const poor = withEnergy(base, 3);
    expect(failCode(poor)).toBeUndefined();
    expect(play(poor).state.players['0'].energy.current).toBe(0);
    expect(legalActions(poor, '0', catalog).some((a) => a.type === 'PlayCard')).toBe(true);
    expect(failCode(withEnergy(base, 2))).toBe('CANT_AFFORD');
    const without = withEnergy(setup('PRIME_034'), 3);
    expect(failCode(without)).toBe('CANT_AFFORD');
  });
});

describe('PRIME_142 Demon Sorcerer: spells cost 1 less', () => {
  it('only spells, and not below 0', () => {
    const s = setup('CORE_043', { mine: [[0, 2, 'PRIME_142']] });
    expect(realCard('CORE_043').type).toBe('spell');
    expect(cost(s, 'CORE_043')).toBe(Math.max(0, realCard('CORE_043').cost - 1));
    expect(cost(s, 'CORE_094')).toBe(realCard('CORE_094').cost); // an item
    expect(cost(s, 'PRIME_034')).toBe(5);
  });
  it('two of them stack', () => {
    const s = setup('CORE_043', { mine: [[0, 2, 'PRIME_142'], [0, 2, 'PRIME_142']] });
    const spell = Array.from(catalog.values()).find((c) => c.type === 'spell' && c.cost === 4)!;
    expect(effectiveCost(s, '0', spell, catalog)).toBe(2);
  });
});
