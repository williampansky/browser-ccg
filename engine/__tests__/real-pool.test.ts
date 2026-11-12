import { loadHsCards } from '../cards/load-hs-cards';
import { buildDeck, isPlayable, needsBehaviour, playablePool, primePool } from '../decks';
import { getCardDef } from '../definitions';
import { createGame } from '../state/create-game';
import { applyAction } from '../rules/apply-action';
import { legalActions } from '../rules/legal-actions';
import { createSeededRng } from '../rng';
import { catalogOf, minionCard, putInHand, setEnergy, weaponCard } from '../testing/builders';
import type { GameState, PlayerId } from '../state/types';
import { MAX_BOARD, MAX_HAND } from '../state/types';

const { cards, byId } = loadHsCards();
const pool = playablePool(cards);

describe('needsBehaviour / isPlayable', () => {
  it('spells and items always need behaviour; keyword-only minions and weapons do not', () => {
    expect(needsBehaviour({ ...minionCard('X'), type: 'spell' })).toBe(true);
    expect(needsBehaviour({ ...minionCard('X'), type: 'item' })).toBe(true);
    expect(needsBehaviour(minionCard('X', { mechanics: ['BULWARK', 'RUSH'] }))).toBe(false);
    expect(needsBehaviour(weaponCard('W'))).toBe(false);
  });
  it('minions with any effect mechanic (warcry, event, death, aura, spell damage, ...) need behaviour', () => {
    for (const m of ['ON_PLAY', 'EVENT', 'ON_DEATH', 'ON_END', 'COMBO', 'BOON', 'SPELL_DAMAGE', 'BUFF', 'LIFESTEAL']) {
      expect(needsBehaviour(minionCard('X', { mechanics: [m] }))).toBe(true);
    }
  });
  it('is playable only when it needs nothing or has a definition', () => {
    const warcry = minionCard('CORE_999', { mechanics: ['ON_PLAY'] });
    expect(isPlayable(warcry, () => undefined)).toBe(false);
    expect(isPlayable(warcry, () => ({ onPlay: [] }))).toBe(true);
    expect(isPlayable(minionCard('V'), () => undefined)).toBe(true);
  });
});

describe('a warcry minion with no definition is refused, never silently played as vanilla', () => {
  const warcry = minionCard('CORE_999', { cost: 1, mechanics: ['ON_PLAY'] });
  const catalog = catalogOf(warcry, minionCard('GRUNT'));
  const start = (): GameState => {
    let s = createGame({ decks: { '0': Array(30).fill('GRUNT'), '1': Array(30).fill('GRUNT') }, firstPlayer: '0' }, createSeededRng(1));
    s = { ...s, players: { ...s.players, '0': { ...s.players['0'], hand: [] } } };
    return setEnergy(putInHand(s, '0', 'CORE_999'), '0', 5);
  };
  it('applyAction returns UNSUPPORTED_CARD', () => {
    expect(applyAction(start(), { type: 'PlayCard', handIndex: 0 }, { rng: createSeededRng(1), catalog })).toEqual({
      error: 'UNSUPPORTED_CARD',
    });
  });
  it('legalActions does not offer it', () => {
    expect(legalActions(start(), '0', catalog).filter((a) => a.type === 'PlayCard')).toEqual([]);
  });
});

describe('the real CORE pool', () => {
  it('has a sizeable fully-supported pool, all of it real, non-token, active cards', () => {
    expect(pool.length).toBeGreaterThanOrEqual(40);
    for (const c of pool) {
      expect(c.source).toBe('core');
      expect(c.isToken).toBe(false);
      expect(c.active).toBe(true);
      expect(isPlayable(c, getCardDef)).toBe(true);
    }
  });
  it('no card in the pool has a mechanic the engine would silently ignore', () => {
    const keywordOnly = ['BULWARK', 'RUSH', 'BUBBLE', 'NO_ATTACK', 'DOUBLE_ATTACK', 'HIDDEN'];
    for (const c of pool.filter((x) => !getCardDef(x))) {
      expect(c.type === 'minion' || c.type === 'weapon').toBe(true);
      expect(c.mechanics.filter((m) => !keywordOnly.includes(m))).toEqual([]);
    }
  });
  it('buildDeck gives 30 distinct pool cards, reproducibly', () => {
    const a = buildDeck(pool, createSeededRng(5));
    expect(a).toHaveLength(30);
    expect(new Set(a).size).toBe(30);
    expect(buildDeck(pool, createSeededRng(5))).toEqual(a);
    expect(buildDeck(pool, createSeededRng(6))).not.toEqual(a);
  });

  const invariants = (s: GameState) => {
    for (const p of ['0', '1'] as PlayerId[]) {
      const pl = s.players[p];
      expect(pl.energy.current).toBeGreaterThanOrEqual(0);
      expect(pl.board.length).toBeLessThanOrEqual(MAX_BOARD);
      expect(pl.hand.length).toBeLessThanOrEqual(MAX_HAND);
      expect(pl.health).toBeLessThanOrEqual(30);
      for (const m of pl.board) {
        expect(m.health).toBeGreaterThan(0);
        expect(m.health).toBeLessThanOrEqual(m.maxHealth);
      }
      if (pl.weapon) expect(pl.weapon.durability).toBeGreaterThan(0);
    }
  };

  it('two random bots finish 60 seeded games with real cards, keeping every invariant', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const rng = createSeededRng(seed);
      let s = createGame(
        {
          decks: { '0': buildDeck(pool, rng), '1': buildDeck(pool, rng) },
          firstPlayer: '0',
          secondPlayerBonusCard: 'GAME_001',
        },
        rng
      );
      let steps = 0;
      while (s.status === 'playing') {
        if (++steps > 4000) throw new Error(`seed ${seed} did not finish`);
        const actions = legalActions(s, s.activePlayer, byId);
        const active = actions.filter((a) => a.type !== 'EndTurn');
        const pick = active.length > 0 && rng.int(4) > 0 ? active[rng.int(active.length)] : actions[rng.int(actions.length)];
        const r = applyAction(s, pick, { rng, catalog: byId });
        if ('error' in r) throw new Error(`seed ${seed}: ${JSON.stringify(pick)} -> ${r.error}`);
        s = r.state;
        invariants(s);
      }
      expect(s.winner).not.toBeNull();
    }
  });
});

describe('the PRIME pool (opt-in, kept apart from CORE)', () => {
  const prime = primePool(cards);
  it('is only real, named, active, non-token PRIME cards the engine can play, and none of it is in the CORE pool', () => {
    expect(prime.length).toBeGreaterThanOrEqual(20);
    for (const c of prime) {
      expect(c.source).toBe('prime');
      expect(c.isToken).toBe(false);
      expect(c.active).toBe(true);
      expect(c.name).toBeTruthy();
      expect(isPlayable(c, getCardDef)).toBe(true);
      expect(pool.some((x) => x.id === c.id)).toBe(false);
    }
  });
  it('leaves out an unnamed card and an inactive card even if its stats need no code', () => {
    const plain = cards.find((c) => c.source === 'prime' && !needsBehaviour(c) && c.active && c.name)!;
    expect(primePool([plain])).toHaveLength(1);
    expect(primePool([{ ...plain, name: undefined }])).toHaveLength(0);
    expect(primePool([{ ...plain, active: false }])).toHaveLength(0);
    expect(primePool([{ ...plain, source: 'core' }])).toHaveLength(0);
  });
  it('two random bots finish 60 seeded games with PRIME-heavy decks, keeping the rules', () => {
    const mixed = [...prime, ...pool.slice(0, 10)];
    for (let seed = 1; seed <= 60; seed++) {
      const rng = createSeededRng(seed);
      let s = createGame({ decks: { '0': buildDeck(mixed, rng), '1': buildDeck(prime, rng) }, firstPlayer: '0' }, rng);
      let steps = 0;
      while (s.status === 'playing') {
        if (++steps > 4000) throw new Error(`seed ${seed} did not finish`);
        const actions = legalActions(s, s.activePlayer, byId);
        const active = actions.filter((a) => a.type !== 'EndTurn');
        const pick = active.length > 0 && rng.int(4) > 0 ? active[rng.int(active.length)] : actions[rng.int(actions.length)];
        const r = applyAction(s, pick, { rng, catalog: byId });
        if ('error' in r) throw new Error(`seed ${seed}: ${JSON.stringify(pick)} -> ${r.error}`);
        s = r.state;
      }
      expect(s.winner).not.toBeNull();
    }
  });
});
