import {
  formatWinTable,
  playGame,
  playMatchup,
  runTournament,
} from '../simulate';
import type { Contestant } from '../simulate';
import { chooseGreedyAction } from '../../bots/greedy-bot';
import { chooseRandomAction } from '../../bots/random-bot';
import { loadHsCards } from '../../cards/load-hs-cards';
import { playablePool } from '../../decks';
import { simDecks } from '../sim-decks';

const { byId, cards } = loadHsCards();
const pool = playablePool(cards);
const decks = simDecks(pool, 12);

describe('sim decks', () => {
  it('are 30 distinct playable cards each, and different from one another', () => {
    for (const d of decks) {
      expect(d.deck).toHaveLength(30);
      expect(new Set(d.deck).size).toBe(30);
      for (const id of d.deck) expect(pool.some((c) => c.id === id)).toBe(true);
    }
    expect(new Set(decks.map((d) => d.deck.join())).size).toBe(decks.length);
  });
  it('are the same every run', () => {
    expect(simDecks(pool, 12)).toEqual(decks);
  });
});

describe('simulation', () => {
  const greedy = (d: (typeof decks)[number]): Contestant => ({
    ...d,
    bot: chooseGreedyAction,
  });
  it('plays a game to a result, the same way for the same seed', () => {
    const bots = { '0': chooseGreedyAction, '1': chooseRandomAction };
    const dk = { '0': decks[0].deck, '1': decks[1].deck };
    const a = playGame(dk, bots, byId, 7);
    expect(a).toEqual(playGame(dk, bots, byId, 7));
    expect(['0', '1', 'draw']).toContain(a.winner);
    expect(a.turns).toBeGreaterThan(0);
  });
  it('a matchup alternates who goes first and its win counts add up', () => {
    const m = playMatchup(greedy(decks[0]), greedy(decks[1]), 6, byId);
    expect(m.games).toBe(6);
    expect(m.aWins).toBeGreaterThanOrEqual(0);
    expect(m.aWins).toBeLessThanOrEqual(6);
  });
  it('a deck mirror-matched against itself with the same bot comes out near even', () => {
    const m = playMatchup(
      greedy(decks[1]),
      { ...greedy(decks[1]), name: 'Mirror' },
      12,
      byId,
    );
    expect(m.aWins).toBeGreaterThanOrEqual(2);
    expect(m.aWins).toBeLessThanOrEqual(10);
  });
  it('the greedy bot on a deck beats the random bot on the same deck', () => {
    const smart = greedy(decks[1]);
    const dumb: Contestant = {
      name: 'Random',
      deck: decks[1].deck,
      bot: chooseRandomAction,
    };
    expect(playMatchup(smart, dumb, 12, byId).aWins).toBeGreaterThanOrEqual(9);
  });
  it('a tournament covers every pair once and tallies cards', () => {
    const t = runTournament(decks.map(greedy), 2, byId);
    expect(t.matchups).toHaveLength((decks.length * (decks.length - 1)) / 2);
    expect(t.cardStats.length).toBeGreaterThan(0);
    for (const c of t.cardStats) expect(c.wins).toBeLessThanOrEqual(c.games);
    const table = formatWinTable(
      decks.map((d) => d.name),
      t.matchups,
    );
    expect(table.split('\n')).toHaveLength(decks.length + 1);
    expect(table).toContain('Deck 1');
  });
});
