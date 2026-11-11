import { produce } from 'immer';
import { createGame } from '../../state/create-game';
import { applyAction } from '../../rules/apply-action';
import { legalTargets } from '../../rules/targeting';
import { heal } from '../primitives';
import { createSeededRng } from '../../rng';
import { catalogOf, minionCard, putInHand, putOnBoard, setEnergy, spellCard } from '../../testing/builders';
import type { Action, ActionErrorCode, GameEvent, GameState, TargetRef } from '../../state/types';

const grunt = minionCard('GRUNT', { cost: 2, attack: 2, health: 3 });
const wall = minionCard('WALL', { attack: 1, health: 4, mechanics: ['BULWARK'] });
const ghost = minionCard('GHOST', { attack: 1, health: 3, mechanics: ['HIDDEN'] });
// Real card ids (so the engine finds their definitions) with fabricated stats.
const zap = spellCard('CORE_044', 1, { primary: 2 }); // damage a chosen character
const fireballs = spellCard('CORE_063', 1, { primary: 1, random: 3 }); // 1 damage to 3 random enemies
const sweep = spellCard('CORE_065', 2, { primary: 2 }); // damage to all enemy minions
const burn = spellCard('CORE_095', 1, { primary: 3 }); // damage to the enemy hero
const study = spellCard('CORE_102', 3, { primary: 4 }); // draw
const orb = spellCard('GAME_001', 0, { primary: 1 });
const mystery = spellCard('CORE_999', 1); // a spell with no definition
const catalog = catalogOf(grunt, wall, ghost, zap, fireballs, sweep, burn, study, orb, mystery);

const fresh = (): GameState =>
  createGame(
    { decks: { '0': Array(30).fill('GRUNT'), '1': Array(30).fill('GRUNT') }, firstPlayer: '0' },
    createSeededRng(1)
  );
const run = (s: GameState, a: Action, seed = 1) => applyAction(s, a, { rng: createSeededRng(seed), catalog });
const act = (s: GameState, a: Action, seed = 1): GameState => {
  const r = run(s, a, seed);
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
/** P0 to move, hand = exactly these cards, 10 energy. */
const withHand = (...ids: string[]): GameState => {
  let s = fresh();
  s = { ...s, players: { ...s.players, '0': { ...s.players['0'], hand: [] } } };
  for (const id of ids) s = putInHand(s, '0', id);
  return setEnergy(s, '0', 10);
};
const play = (target?: TargetRef): Action => ({ type: 'PlayCard', handIndex: 0, target });
const minionRef = (instanceId: number): TargetRef => ({ kind: 'minion', instanceId });
const hero = (player: '0' | '1'): TargetRef => ({ kind: 'hero', player });
const idOf = (s: GameState, p: '0' | '1', i = 0) => s.players[p].board[i].instanceId;

describe('legalTargets: attacks', () => {
  it('lists enemy minions and the enemy hero, never your own side', () => {
    let s = putOnBoard(fresh(), '0', grunt);
    s = putOnBoard(s, '1', grunt);
    const t = legalTargets(s, { kind: 'attack', attackerId: idOf(s, '0') });
    expect(t).toEqual([minionRef(idOf(s, '1')), hero('1')]);
  });
  it('Guard narrows it to Guard minions', () => {
    let s = putOnBoard(fresh(), '0', grunt);
    s = putOnBoard(s, '1', grunt);
    s = putOnBoard(s, '1', wall);
    expect(legalTargets(s, { kind: 'attack', attackerId: idOf(s, '0') })).toEqual([minionRef(idOf(s, '1', 1))]);
  });
  it('hidden minions cannot be targeted', () => {
    let s = putOnBoard(fresh(), '0', grunt);
    s = putOnBoard(s, '1', ghost);
    expect(legalTargets(s, { kind: 'attack', attackerId: idOf(s, '0') })).toEqual([hero('1')]);
  });
});

describe('legalTargets: cards', () => {
  const board = () => {
    let s = withHand('CORE_044', 'CORE_063');
    s = putOnBoard(s, '0', grunt);
    s = putOnBoard(s, '1', wall);
    return putOnBoard(s, '1', ghost);
  };
  it('a targeted spell may pick any visible character, and Guard does not restrict spells', () => {
    const s = board();
    const t = legalTargets(s, { kind: 'card', handIndex: 0 }, catalog);
    expect(t).toEqual(
      expect.arrayContaining([hero('0'), hero('1'), minionRef(idOf(s, '0')), minionRef(idOf(s, '1', 0))])
    );
    expect(t).toHaveLength(4); // the hidden ghost is excluded
  });
  it('a global spell has no targets', () => {
    expect(legalTargets(board(), { kind: 'card', handIndex: 1 }, catalog)).toEqual([]);
  });
});

describe('targeted spells', () => {
  it('damages the chosen minion, spends energy, removes the card, emits CardPlayed', () => {
    let s = putOnBoard(withHand('CORE_044'), '1', grunt);
    const target = minionRef(idOf(s, '1'));
    const a = play(target);
    const t = act(s, a);
    expect(t.players['1'].board[0].health).toBe(1);
    expect(t.players['0'].energy.current).toBe(9);
    expect(t.players['0'].hand).toHaveLength(0);
    expect(events(s, a)).toContainEqual(expect.objectContaining({ type: 'CardPlayed', cardId: 'CORE_044' }));
  });
  it('a killing spell removes the minion at once', () => {
    let s = putOnBoard(withHand('CORE_044'), '1', minionCard('LOW', { health: 2 }));
    expect(act(s, play(minionRef(idOf(s, '1')))).players['1'].board).toHaveLength(0);
  });
  it('can hit your own minion, or either hero (armor first)', () => {
    let s = putOnBoard(withHand('CORE_044'), '0', grunt);
    expect(act(s, play(minionRef(idOf(s, '0')))).players['0'].board[0].health).toBe(1);
    let h = withHand('CORE_044');
    h = produce(h, (g) => void (g.players['1'].armor = 1));
    expect(act(h, play(hero('1'))).players['1']).toMatchObject({ armor: 0, health: 29 });
  });
  it('lethal spell damage to a hero ends the game', () => {
    let s = withHand('CORE_044');
    s = produce(s, (g) => void (g.players['1'].health = 2));
    expect(act(s, play(hero('1')))).toMatchObject({ status: 'over', winner: '0' });
  });
  it('rejects a missing, hidden, unknown or unexpected target', () => {
    let s = putOnBoard(withHand('CORE_044', 'CORE_095'), '1', ghost);
    expect(fail(s, play())).toBe('ILLEGAL_TARGET');
    expect(fail(s, play(minionRef(idOf(s, '1'))))).toBe('ILLEGAL_TARGET');
    expect(fail(s, play(minionRef(9999)))).toBe('ILLEGAL_TARGET');
    expect(fail(s, { type: 'PlayCard', handIndex: 1, target: hero('1') })).toBe('ILLEGAL_TARGET');
  });
  it('rejects what it cannot afford, and spells it has no definition for', () => {
    expect(fail(setEnergy(withHand('CORE_044'), '0', 0), play(hero('1')))).toBe('CANT_AFFORD');
    expect(fail(withHand('CORE_999'), play())).toBe('UNSUPPORTED_CARD');
  });
});

describe('global spells', () => {
  it('hits every enemy minion and nothing else', () => {
    let s = withHand('CORE_065');
    s = putOnBoard(s, '0', grunt);
    s = putOnBoard(s, '1', grunt);
    s = putOnBoard(s, '1', minionCard('LOW', { health: 2 }));
    const t = act(s, play());
    expect(t.players['1'].board.map((m) => m.health)).toEqual([1]);
    expect(t.players['0'].board[0].health).toBe(3);
    expect(t.players['1'].health).toBe(30);
  });
  it('can hit the enemy hero directly', () => {
    expect(act(withHand('CORE_095'), play()).players['1'].health).toBe(27);
  });
  it('random damage hits exactly the stated number of distinct enemies, reproducibly', () => {
    let s = withHand('CORE_063');
    for (let i = 0; i < 4; i++) s = putOnBoard(s, '1', minionCard(`M${i}`, { health: 9 }));
    const t = act(s, play());
    const hit = t.players['1'].board.filter((m) => m.health === 8).length + (t.players['1'].health === 29 ? 1 : 0);
    expect(hit).toBe(3);
    expect(t.players['1'].board.every((m) => m.health >= 8)).toBe(true);
    expect(act(s, play())).toEqual(t); // same seed, same result
    expect(act(s, play(), 7)).not.toEqual(t); // different seed picks differently
  });
  it('random damage with fewer enemies than the count hits them all once', () => {
    const t = act(withHand('CORE_063'), play()); // only the enemy hero
    expect(t.players['1'].health).toBe(29);
  });
  it('never touches your own side', () => {
    let s = putOnBoard(withHand('CORE_063'), '0', grunt);
    expect(act(s, play()).players['0'].board[0].health).toBe(3);
    expect(act(s, play()).players['0'].health).toBe(30);
  });
  it('draw spells draw that many cards, burning past a full hand', () => {
    const s = withHand('CORE_102');
    const deck = s.players['0'].deck.length;
    const t = act(s, play());
    expect(t.players['0'].hand).toHaveLength(4);
    expect(t.players['0'].deck).toHaveLength(deck - 4);
    let full = withHand('CORE_102', ...Array(8).fill('GRUNT')); // 9 cards, one is played -> 8
    const t2 = act(full, play());
    expect(t2.players['0'].hand).toHaveLength(10);
  });
  it('does not mutate its input', () => {
    const s = putOnBoard(withHand('CORE_065'), '1', grunt);
    const snap = JSON.stringify(s);
    act(s, play());
    expect(JSON.stringify(s)).toBe(snap);
  });
});

describe('The Orb', () => {
  it('is dealt to the second player as a fifth card', () => {
    const g = createGame(
      {
        decks: { '0': Array(30).fill('GRUNT'), '1': Array(30).fill('GRUNT') },
        firstPlayer: '0',
        secondPlayerBonusCard: 'GAME_001',
      },
      createSeededRng(1)
    );
    expect(g.players['1'].hand).toHaveLength(5);
    expect(g.players['1'].hand.some((c) => c.cardId === 'GAME_001')).toBe(true);
    expect(g.players['0'].hand).toHaveLength(4);
  });
  it('adds one energy this turn, even above the total', () => {
    const s = setEnergy(withHand('GAME_001'), '0', 1, 1);
    expect(act(s, play()).players['0'].energy).toEqual({ current: 2, total: 1 });
  });
  it('the extra energy is not lost when you spend part of it first', () => {
    let s = setEnergy(withHand('GAME_001', 'CORE_095'), '0', 1, 1);
    s = act(s, play());
    s = act(s, { type: 'PlayCard', handIndex: 0 }); // burn, cost 1
    expect(s.players['0'].energy.current).toBe(1);
  });
});

describe('heal primitive', () => {
  const healAll = (s: GameState, amount: number, target: TargetRef) =>
    produce(s, (g) => {
      heal(() => [target], amount)({
        g,
        caster: '0',
        rng: createSeededRng(1),
        catalog,
        events: [],
      });
    });
  it('restores minion health up to its maximum', () => {
    let s = putOnBoard(fresh(), '0', grunt, { health: 1 });
    const id = idOf(s, '0');
    expect(healAll(s, 1, minionRef(id)).players['0'].board[0].health).toBe(2);
    expect(healAll(s, 99, minionRef(id)).players['0'].board[0].health).toBe(3);
  });
  it('restores hero health up to 30', () => {
    const s = produce(fresh(), (g) => void (g.players['0'].health = 28));
    expect(healAll(s, 5, hero('0')).players['0'].health).toBe(30);
  });
});
