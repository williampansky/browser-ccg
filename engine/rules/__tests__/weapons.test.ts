import { produce } from 'immer';
import { createGame } from '../../state/create-game';
import { applyAction } from '../apply-action';
import { legalTargets } from '../targeting';
import { legalActions } from '../legal-actions';
import { createSeededRng } from '../../rng';
import { catalogOf, minionCard, putInHand, putOnBoard, setEnergy, spellCard, weaponCard } from '../../testing/builders';
import type { Action, ActionErrorCode, GameEvent, GameState, TargetRef } from '../../state/types';

const grunt = minionCard('GRUNT', { cost: 2, attack: 2, health: 3 });
const brute = minionCard('BRUTE', { cost: 2, attack: 3, health: 5 });
const wall = minionCard('WALL', { attack: 1, health: 4, mechanics: ['BULWARK'] });
const bubbly = minionCard('BUBBLY', { attack: 2, health: 3, mechanics: ['BUBBLE'] });
const ghost = minionCard('GHOST', { attack: 2, health: 3, mechanics: ['HIDDEN'] });
const mace = weaponCard('CORE_076', { cost: 1, attack: 1, durability: 4 });
const axe = weaponCard('CORE_128', { cost: 3, attack: 3, durability: 2 });
const knife = weaponCard('CORE_999', { cost: 1, attack: 2, durability: 1 });
const dull = weaponCard('CORE_998', { cost: 1, attack: 0, durability: 3 });
const shieldItem = { ...spellCard('CORE_129', 3, { primary: 5 }), type: 'item' as const }; // +5 armor and draw a card
const sharpen = { ...spellCard('CORE_094', 1, { primary: 2, secondary: 0 }), type: 'item' as const }; // weapon +2 attack
const zap = spellCard('CORE_044', 1, { primary: 3 });
const mystery = { ...spellCard('CORE_997', 1), type: 'item' as const }; // an item with no definition yet
const catalog = catalogOf(mystery, grunt, brute, wall, bubbly, ghost, mace, axe, knife, dull, shieldItem, sharpen, zap);

const fresh = (): GameState =>
  createGame(
    { decks: { '0': Array(30).fill('GRUNT'), '1': Array(30).fill('GRUNT') }, firstPlayer: '0' },
    createSeededRng(1)
  );
const run = (s: GameState, a: Action) => applyAction(s, a, { rng: createSeededRng(1), catalog });
const act = (s: GameState, a: Action): GameState => {
  const r = run(s, a);
  if ('error' in r) throw new Error(`unexpected ${r.error}`);
  return r.state;
};
const events = (s: GameState, a: Action): GameEvent[] => {
  const r = run(s, a);
  if ('error' in r) throw new Error(r.error);
  return r.events;
};
const fail = (s: GameState, a: Action): ActionErrorCode => {
  const r = run(s, a);
  if (!('error' in r)) throw new Error('expected an error');
  return r.error;
};
const withHand = (...ids: string[]): GameState => {
  let s = fresh();
  s = { ...s, players: { ...s.players, '0': { ...s.players['0'], hand: [] } } };
  for (const id of ids) s = putInHand(s, '0', id);
  return setEnergy(s, '0', 10);
};
/** P0 holds a ready weapon. */
const armed = (attack: number, durability: number, base = fresh()): GameState =>
  produce(base, (g) => {
    g.players['0'].weapon = { instanceId: 900, cardId: 'CORE_076', attack, durability };
  });
const play = (handIndex = 0, target?: TargetRef): Action => ({ type: 'PlayCard', handIndex, target });
const wAttack = (target: TargetRef): Action => ({ type: 'WeaponAttack', target });
const hero1: TargetRef = { kind: 'hero', player: '1' };
const mref = (instanceId: number): TargetRef => ({ kind: 'minion', instanceId });
const idOf = (s: GameState, p: '0' | '1', i = 0) => s.players[p].board[i].instanceId;

describe('equipping weapons', () => {
  it('moves the weapon from hand to the hero, with attack and durability from the card', () => {
    const a = play();
    const s = withHand('CORE_076');
    const t = act(s, a);
    expect(t.players['0'].hand).toHaveLength(0);
    expect(t.players['0'].energy.current).toBe(9);
    expect(t.players['0'].weapon).toMatchObject({ cardId: 'CORE_076', attack: 1, durability: 4 });
    expect(events(s, a)).toContainEqual({ type: 'WeaponEquipped', player: '0', cardId: 'CORE_076' });
  });
  it('replaces any weapon already equipped', () => {
    let s = act(withHand('CORE_076', 'CORE_128'), play());
    s = act(s, play());
    expect(s.players['0'].weapon).toMatchObject({ cardId: 'CORE_128', attack: 3, durability: 2 });
  });
  it('costs energy', () => {
    expect(fail(setEnergy(withHand('CORE_128'), '0', 2), play())).toBe('CANT_AFFORD');
  });
});

describe('attacking with a weapon', () => {
  it('can attack the turn it is equipped', () => {
    const s = act(withHand('CORE_128'), play());
    expect(act(s, wAttack(hero1)).players['1'].health).toBe(27);
  });
  it('hits the hero for the weapon attack, costs 1 durability, and takes no counter-damage', () => {
    const s = armed(3, 2);
    const t = act(s, wAttack(hero1));
    expect(t.players['1'].health).toBe(27);
    expect(t.players['0'].health).toBe(30);
    expect(t.players['0'].weapon?.durability).toBe(1);
    expect(events(s, wAttack(hero1))).toContainEqual({ type: 'WeaponAttacked', target: hero1 });
  });
  it("a hit on a hero drains the target's armor first", () => {
    const s = produce(armed(3, 2), (g) => void (g.players['1'].armor = 2));
    expect(act(s, wAttack(hero1)).players['1']).toMatchObject({ armor: 0, health: 29 });
  });
  it('against a minion: both take damage, the hero as counter-damage with armor first', () => {
    let s = armed(2, 3);
    s = putOnBoard(s, '1', grunt); // 2/3
    s = produce(s, (g) => void (g.players['0'].armor = 1));
    const t = act(s, wAttack(mref(idOf(s, '1'))));
    expect(t.players['1'].board[0].health).toBe(1);
    expect(t.players['0']).toMatchObject({ armor: 0, health: 29 });
  });
  it('kills the minion when the weapon is strong enough', () => {
    let s = putOnBoard(armed(4, 3), '1', grunt);
    expect(act(s, wAttack(mref(idOf(s, '1')))).players['1'].board).toHaveLength(0);
  });
  it("Bubble absorbs the weapon's hit, but the hero still takes the counter-damage", () => {
    let s = putOnBoard(armed(5, 3), '1', bubbly);
    const t = act(s, wAttack(mref(idOf(s, '1'))));
    expect(t.players['1'].board[0]).toMatchObject({ health: 3 });
    expect(t.players['1'].board[0].keywords.bubble).toBe(false);
    expect(t.players['0'].health).toBe(28);
  });
  it('a lethal counter-hit kills the hero and loses the game', () => {
    let s = putOnBoard(armed(1, 3), '1', brute); // 3 attack
    s = produce(s, (g) => void (g.players['0'].health = 3));
    expect(act(s, wAttack(mref(idOf(s, '1'))))).toMatchObject({ status: 'over', winner: '1' });
  });
  it('lethal damage to the enemy hero wins', () => {
    const s = produce(armed(3, 3), (g) => void (g.players['1'].health = 3));
    expect(act(s, wAttack(hero1))).toMatchObject({ status: 'over', winner: '0' });
  });
  it('is limited to one attack per turn, and resets next turn', () => {
    let s = act(armed(1, 4), wAttack(hero1));
    expect(fail(s, wAttack(hero1))).toBe('HERO_CANT_ATTACK');
    s = act(act(s, { type: 'EndTurn' }), { type: 'EndTurn' });
    expect(act(s, wAttack(hero1)).players['1'].health).toBe(28);
  });
  it('breaks when durability runs out', () => {
    const s = armed(2, 1);
    const t = act(s, wAttack(hero1));
    expect(t.players['0'].weapon).toBeNull();
    expect(events(s, wAttack(hero1))).toContainEqual({ type: 'WeaponBroke', player: '0' });
  });
  it('needs a weapon, and a weapon with attack', () => {
    expect(fail(fresh(), wAttack(hero1))).toBe('NO_WEAPON');
    expect(fail(armed(0, 3), wAttack(hero1))).toBe('HERO_CANT_ATTACK');
  });
  it('a weapon played with 1 durability is gone after one swing', () => {
    let s = act(withHand('CORE_999'), play());
    s = act(s, wAttack(hero1));
    expect(s.players['0'].weapon).toBeNull();
    expect(s.players['1'].health).toBe(28);
  });
});

describe('weapon targeting', () => {
  it('Guard restricts weapon attacks too (RULES Q10)', () => {
    let s = putOnBoard(putOnBoard(armed(3, 3), '1', grunt), '1', wall);
    const guard = idOf(s, '1', 1);
    expect(legalTargets(s, { kind: 'weapon' })).toEqual([mref(guard)]);
    expect(fail(s, wAttack(hero1))).toBe('ILLEGAL_TARGET');
    expect(fail(s, wAttack(mref(idOf(s, '1', 0))))).toBe('ILLEGAL_TARGET');
    expect(act(s, wAttack(mref(guard))).players['1'].board[1].health).toBe(1);
  });
  it('hidden minions cannot be targeted; own side never can', () => {
    let s = putOnBoard(putOnBoard(armed(3, 3), '1', ghost), '0', grunt);
    expect(legalTargets(s, { kind: 'weapon' })).toEqual([hero1]);
    expect(fail(s, wAttack(mref(idOf(s, '0'))))).toBe('ILLEGAL_TARGET');
  });
});

describe('armor and items', () => {
  it('an item plays like a spell: +5 armor and draw a card', () => {
    const s = withHand('CORE_129');
    const t = act(s, play());
    expect(t.players['0'].armor).toBe(5);
    expect(t.players['0'].hand).toHaveLength(1);
    expect(act(t, { type: 'EndTurn' }).players['0'].armor).toBe(5); // armor does not decay
  });
  it('an item with no definition is refused, not silently used up', () => {
    expect(fail(withHand('CORE_997'), play())).toBe('UNSUPPORTED_CARD');
  });
  it('armor stacks, and absorbs spell damage before health (RULES Q14)', () => {
    let s = act(withHand('CORE_129', 'CORE_129'), play());
    s = act(s, play());
    expect(s.players['0'].armor).toBe(10);
    const z = produce(withHand('CORE_044'), (g) => void (g.players['1'].armor = 5));
    const t = act(z, play(0, hero1));
    expect(t.players['1']).toMatchObject({ armor: 2, health: 30 });
  });
  it('a weapon buff raises attack, and does nothing without a weapon', () => {
    const s = armed(1, 3, withHand('CORE_094'));
    expect(act(s, play()).players['0'].weapon).toMatchObject({ attack: 3, durability: 3 });
    const none = act(withHand('CORE_094'), play());
    expect(none.players['0'].weapon).toBeNull();
    expect(none.players['0'].hand).toHaveLength(0);
  });
});

describe('legalActions with weapons', () => {
  it('offers weapon attacks for each legal target while the weapon is ready', () => {
    let s = putOnBoard(armed(2, 3), '1', grunt);
    const attacks = legalActions(s, '0', catalog).filter((a) => a.type === 'WeaponAttack');
    expect(attacks).toHaveLength(2);
    const used = act(s, wAttack(hero1));
    expect(legalActions(used, '0', catalog).filter((a) => a.type === 'WeaponAttack')).toEqual([]);
  });
  it('offers equipping an affordable weapon', () => {
    const plays = legalActions(withHand('CORE_076'), '0', catalog).filter((a) => a.type === 'PlayCard');
    expect(plays).toEqual([{ type: 'PlayCard', handIndex: 0 }]);
  });
});
