import { chooseRandomAction } from '../random-bot';
import { applyAction } from '../../rules/apply-action';
import { legalActions } from '../../rules/legal-actions';
import { createGame } from '../../state/create-game';
import { createSeededRng } from '../../rng';
import { loadHsCards } from '../../cards/load-hs-cards';
import { buildDeck, playablePool } from '../../decks';
import { catalogOf, minionCard, putInHand, putOnBoard, setEnergy } from '../../testing/builders';
import type { GameState } from '../../state/types';

const grunt = minionCard('GRUNT', { cost: 2, attack: 2, health: 3 });
const catalog = catalogOf(grunt);
const start = (): GameState =>
  createGame({ decks: { '0': Array(30).fill('GRUNT'), '1': Array(30).fill('GRUNT') }, firstPlayer: '0' }, createSeededRng(1));

describe('random bot', () => {
  it('ends the turn when there is nothing else to do', () => {
    let s = start();
    s = { ...s, players: { ...s.players, '0': { ...s.players['0'], hand: [] } } };
    expect(chooseRandomAction(s, catalog, createSeededRng(1))).toEqual({ type: 'EndTurn' });
  });
  it('always chooses a legal action, and is reproducible for a seed', () => {
    let s = setEnergy(putInHand(start(), '0', 'GRUNT'), '0', 5);
    s = putOnBoard(s, '0', grunt);
    const legal = legalActions(s, '0', catalog);
    for (let seed = 1; seed <= 30; seed++) {
      const a = chooseRandomAction(s, catalog, createSeededRng(seed));
      expect(legal).toContainEqual(a);
      expect(chooseRandomAction(s, catalog, createSeededRng(seed))).toEqual(a);
    }
  });
  it('usually acts rather than passing, but does sometimes pass', () => {
    let s = setEnergy(putInHand(start(), '0', 'GRUNT'), '0', 5);
    s = putOnBoard(s, '0', grunt);
    const picks = Array.from({ length: 200 }, (_, i) => chooseRandomAction(s, catalog, createSeededRng(i + 1)).type);
    const passes = picks.filter((t) => t === 'EndTurn').length;
    expect(passes).toBeGreaterThan(0);
    expect(passes).toBeLessThan(100);
  });
  it('plays whole games against itself, with real cards, to a winner', () => {
    const { byId, cards } = loadHsCards();
    const pool = playablePool(cards);
    for (let seed = 1; seed <= 10; seed++) {
      const rng = createSeededRng(seed);
      let s = createGame(
        { decks: { '0': buildDeck(pool, rng), '1': buildDeck(pool, rng) }, firstPlayer: '0', secondPlayerBonusCard: 'GAME_001' },
        rng
      );
      for (let steps = 0; s.status === 'playing'; steps++) {
        if (steps > 4000) throw new Error(`seed ${seed} did not finish`);
        const r = applyAction(s, chooseRandomAction(s, byId, rng), { rng, catalog: byId });
        if ('error' in r) throw new Error(r.error);
        s = r.state;
      }
      expect(s.winner).not.toBeNull();
    }
  });
  it('never aims a damage card at its own minion or hero', () => {
    const { byId } = loadHsCards();
    const real = { ...grunt, id: 'GRUNT' };
    const cat = new Map(byId);
    cat.set('GRUNT', real);
    let s = setEnergy(putInHand(start(), '0', 'CORE_016'), '0', 5); // CORE_016: deal 1 damage to any character
    s = putOnBoard(s, '0', real);
    const friendly = new Set(['h0', `m${s.players['0'].board[0].instanceId}`]);
    const key = (t: any) => (t.kind === 'hero' ? `h${t.player}` : `m${t.instanceId}`);
    let sawEnemyAim = false;
    for (let seed = 1; seed <= 200; seed++) {
      const a: any = chooseRandomAction(s, cat, createSeededRng(seed));
      if (a.type === 'PlayCard' && a.target) {
        expect(friendly.has(key(a.target))).toBe(false);
        sawEnemyAim = true;
      }
    }
    expect(sawEnemyAim).toBe(true);
  });
});
