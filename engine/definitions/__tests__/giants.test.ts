import { produce } from 'immer';
import { getCardDef } from '..';
import { isPlayable } from '../../decks';
import { effectiveCost } from '../../rules/cost';
import { legalActions } from '../../rules/legal-actions';
import { backTo, catalog, endTurn, hero, hurt, minion, mref, play, realCard, run, setup, stats } from '../../testing/real-cards';
import type { Action, GameState } from '../../state/types';

// The Giants (state-dependent costs), the keyword-pile 8-drop, and a few rewritten exact effects (balance/PRIME-DISTANCE.md).

const cost = (s: GameState, id: string) => effectiveCost(s, '0', realCard(id), catalog);
const ids = ['085', '086', '247', '214', '228', '078', '105', '107'];
it.each(ids)('PRIME_%s is defined', (n) => {
  expect(isPlayable(realCard(`PRIME_${n}`))).toBe(true);
  expect(getCardDef(realCard(`PRIME_${n}`))).toBeDefined();
});
it('the cheaper ones can be played right away (the 12-cost Giants need their discount first)', () => {
  for (const n of ['085', '214', '228', '078', '105']) {
    const s = setup(`PRIME_${n}`, { mine: [[1, 3]], theirs: [[1, 3]] });
    const energyFor = produce(s, (g) => void (g.players['0'].energy = { current: 10, total: 10 }));
    expect(legalActions(energyFor, '0', catalog).some((a) => a.type === 'PlayCard' && a.handIndex === 0)).toBe(true);
  }
});

describe('PRIME_085 Bark Creature: 1 less per minion that has died (max 6)', () => {
  it('starts at 10 and counts deaths of either side', () => {
    expect(cost(setup('PRIME_085'), 'PRIME_085')).toBe(10);
    expect(cost(produce(setup('PRIME_085'), (g) => void (g.deaths = 3)), 'PRIME_085')).toBe(7);
    expect(cost(produce(setup('PRIME_085'), (g) => void (g.deaths = 40)), 'PRIME_085')).toBe(4); // capped at 6
  });
  it('the engine counts real deaths', () => {
    // CORE_125 deals 2 to two random enemy minions: two 1-health minions both die.
    const s = play(setup('CORE_125', { theirs: [[1, 1], [1, 1]], hand: ['PRIME_085'] })).state;
    expect(s.deaths).toBe(2);
    expect(effectiveCost(s, '0', realCard('PRIME_085'), catalog)).toBe(8);
  });
});

describe('PRIME_086 Spider Mech: 1 less per card you played this turn and last (max 6)', () => {
  it('counts the cards you play this turn', () => {
    const s = setup('CORE_043', { hand: ['PRIME_086', 'CORE_043'] });
    expect(cost(s, 'PRIME_086')).toBe(12);
    const after = play(s).state; // one card played
    expect(cost(after, 'PRIME_086')).toBe(11);
  });
  it('still counts them on your next turn, then forgets them', () => {
    let s = play(setup('CORE_043', { hand: ['PRIME_086'] })).state;
    s = backTo(endTurn(s), '0');
    expect(cost(s, 'PRIME_086')).toBe(11); // played last turn
    s = backTo(endTurn(s), '0');
    expect(cost(s, 'PRIME_086')).toBe(12); // two turns ago: forgotten
  });
  it('never counts the opponent\'s plays and caps at 6', () => {
    const s = produce(setup('PRIME_086'), (g) => void (g.players['0'].plays = { now: 5, prev: 4 }));
    expect(cost(s, 'PRIME_086')).toBe(6);
    const foe = produce(setup('PRIME_086'), (g) => void (g.players['1'].plays = { now: 5, prev: 4 }));
    expect(cost(foe, 'PRIME_086')).toBe(12);
  });
});

describe('PRIME_247 Volcanic Giant (12): 1 less per Armor your hero has lost', () => {
  it('only Armor that soaked damage counts, not Armor gained or health lost', () => {
    expect(cost(setup('PRIME_247'), 'PRIME_247')).toBe(12);
    expect(cost(produce(setup('PRIME_247'), (g) => void (g.players['0'].armor = 9)), 'PRIME_247')).toBe(12);
    expect(cost(setup('PRIME_247', { heroHp: { '0': 10 } }), 'PRIME_247')).toBe(12);
  });
  it('counts Armor actually lost to a hit, even over several hits', () => {
    let s = setup('CORE_043', { theirs: [[3, 9]], hand: ['PRIME_247'] });
    s = produce(s, (g) => void (g.players['0'].armor = 5));
    s = endTurn(s);
    const hit = run(s, { type: 'Attack', attackerId: s.players['1'].board[0].instanceId, target: hero('0') } as Action);
    if ('error' in hit) throw new Error(hit.error);
    expect(hit.state.players['0'].armorSpent).toBe(3);
    expect(effectiveCost(hit.state, '0', realCard('PRIME_247'), catalog)).toBe(9);
  });
});

describe('PRIME_214 Spirit of the Night (5/5 Guard, Bubble)', () => {
  it('has Guard and Bubble but not Rush or Onslaught itself, and gives your OTHER minions Rush', () => {
    const r = play(setup('PRIME_214', { mine: [[1, 1]], theirs: [[1, 1]] })).state;
    const spirit = r.players['0'].board.find((m) => m.cardId === 'PRIME_214')!;
    expect([spirit.attack, spirit.health, spirit.keywords.guard, spirit.keywords.bubble, spirit.keywords.rush, spirit.keywords.doubleAttack]).toEqual([5, 5, true, true, false, false]);
    expect(r.players['0'].board.find((m) => m.cardId !== 'PRIME_214')!.keywords.rush).toBe(true);
    expect(r.players['1'].board[0].keywords.rush).toBe(false);
  });
});

describe('PRIME_228 The Sorcerer\'s Stone (6)', () => {
  it('destroys only minions with 4 or more Attack, then BOTH players draw', () => {
    const s = setup('PRIME_228', { mine: [[4, 4], [3, 9]], theirs: [[7, 1], [2, 2]] });
    const r = play(s).state;
    expect(stats(r, '0')).toEqual([[3, 9]]);
    expect(stats(r, '1')).toEqual([[2, 2]]);
    expect(r.players['0'].hand.length).toBe(1);
    expect(r.players['1'].hand.length).toBe(s.players['1'].hand.length + 1);
  });
});

describe('PRIME_078 Infernal Nest (0/7)', () => {
  it('at the start of YOUR next turn deals 4 to ALL minions, then dies', () => {
    let s = play(setup('PRIME_078', { mine: [[1, 9]], theirs: [[1, 9]] })).state;
    s = endTurn(s); // the opponent's turn starts: nothing
    expect(stats(s, '0').length).toBe(2);
    expect(stats(s, '1')).toEqual([[1, 9]]);
    s = endTurn(s); // my turn starts
    expect(s.players['0'].board.map((m) => m.cardId)).not.toContain('PRIME_078');
    expect(stats(s, '0')).toEqual([[1, 5]]);
    expect(stats(s, '1')).toEqual([[1, 5]]);
  });
});

describe('PRIME_105 Nightmare', () => {
  it('sets BOTH heroes\' Health to 18 (up or down)', () => {
    const r = play(setup('PRIME_105', { heroHp: { '0': 25, '1': 9 } })).state;
    expect([r.players['0'].health, r.players['1'].health]).toEqual([18, 18]);
    expect(stats(r, '0')).toEqual([[10, 5]]);
  });
});
