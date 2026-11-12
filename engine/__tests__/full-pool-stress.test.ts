// Whole-pool stress: random bots play mixed CORE+PRIME decks and the board, hand, energy, health and loan rules are checked after every action.
import { applyAction, buildDeck, createGame, createSeededRng, legalActions, loadHsCards, playablePool, primePool } from '..';

const { cards, byId } = loadHsCards();
const prime = primePool(cards);
const core = playablePool(cards);

it('120 random-bot games on mixed decks keep every invariant', () => {
  const mixed = [...prime, ...core];
  let finished = 0;
  for (let seed = 1000; seed < 1120; seed++) {
    const rng = createSeededRng(seed);
    let s = createGame({ decks: { '0': buildDeck(mixed, rng), '1': buildDeck(mixed, rng) }, firstPlayer: seed % 2 ? '0' : '1' }, rng);
    let steps = 0;
    while (s.status === 'playing') {
      if (++steps > 6000) throw new Error(`seed ${seed} did not finish`);
      const actions = legalActions(s, s.activePlayer, byId);
      const active = actions.filter((a) => a.type !== 'EndTurn');
      const pick = active.length > 0 && rng.int(5) > 0 ? active[rng.int(active.length)] : actions[rng.int(actions.length)];
      const r = applyAction(s, pick, { rng, catalog: byId });
      if ('error' in r) throw new Error(`seed ${seed}: ${JSON.stringify(pick)} -> ${r.error}`);
      s = r.state;
      for (const p of ['0', '1'] as const) {
        const pl = s.players[p];
        const where = `seed ${seed} step ${steps} player ${p}`;
        if (pl.board.length > 7) throw new Error(`${where}: board ${pl.board.length}`);
        if (pl.hand.length > 10) throw new Error(`${where}: hand ${pl.hand.length}`);
        if (pl.health > 30) throw new Error(`${where}: health ${pl.health}`);
        if (pl.energy.total > 10 || pl.energy.current < 0 || pl.energy.total < 0) throw new Error(`${where}: energy ${JSON.stringify(pl.energy)}`);
        if (s.status === 'playing') {
          for (const m of pl.board) {
            if (m.health <= 0) throw new Error(`${where}: dead minion ${m.cardId} on board`);
            if (m.health > m.maxHealth) throw new Error(`${where}: ${m.cardId} health ${m.health} > max ${m.maxHealth}`);
            if (m.attack < 0) throw new Error(`${where}: ${m.cardId} negative attack`);
            if (m.loan && m.loan.returnOnTurn < s.turn - 1) throw new Error(`${where}: stale loan ${m.cardId}`);
          }
        }
      }
    }
    finished++;
  }
  expect(finished).toBe(120);
}, 120000);
