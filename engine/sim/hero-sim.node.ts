/**
 * Hero balance report. Usage: `npm run sim:heroes -- [mode] [games]`
 *  - `heroes` (default): hero against hero (the five heroes plus "no hero"), with both players on the SAME starter deck, so the deck cancels out.
 *    Every CORE starter deck is used; `games` is per hero pair per deck (alternating seats). Prints the hero grid and each hero's overall rate.
 *  - `decks`: the starter-deck grid with every game's heroes drawn from the five (cycling, so each deck meets each hero evenly), against the same grid
 *    with no heroes, to show what heroes do to deck balance.
 * Greedy bot on both sides.
 */
import { chooseGreedyAction } from '../bots/greedy-bot';
import { loadHsCards } from '../cards/load-hs-cards';
import { playablePool, primePool } from '../decks';
import { heroes, withHeroTokens } from '../heroes';
import { buildStarterDeck, poolFor, STARTER_DECKS } from '../starter-decks';
import {
  formatWinTable,
  playGame,
  playMatchup,
  runTournament,
} from './simulate';

const mode = process.argv[2] ?? 'heroes';
const games = Number(process.argv[3] ?? 20);
if (!['heroes', 'decks'].includes(mode))
  throw new Error('mode must be heroes or decks');
if (!Number.isInteger(games) || games < 2)
  throw new Error('games must be a whole number, at least 2');

const { byId, cards } = loadHsCards();
const catalog = withHeroTokens(byId);
const pool = playablePool(cards);
const prime = primePool(cards);
const decks = STARTER_DECKS.map((d) => ({
  name: d.name,
  deck: buildStarterDeck(d, poolFor(d.set, pool, prime)),
}));
const heroIds = heroes().map((h) => h.id);
const bot = chooseGreedyAction;
const started = Date.now();
const rate = (x: number) => `${(x * 100).toFixed(0)}%`;

if (mode === 'heroes') {
  const names = [...heroIds, 'NONE'];
  const wins = new Map<string, number>();
  const total = new Map<string, number>();
  const grid = new Map<string, { a: number; n: number }>();
  const perDeck = new Map<string, Map<string, number>>();
  decks.forEach((d, di) => {
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const A = {
          name: names[i],
          deck: d.deck,
          bot,
          hero: names[i] === 'NONE' ? undefined : names[i],
        };
        const B = {
          name: names[j],
          deck: d.deck,
          bot,
          hero: names[j] === 'NONE' ? undefined : names[j],
        };
        const r = playMatchup(
          A,
          B,
          games,
          catalog,
          1 + di * 100000 + (i * names.length + j) * 1000,
        );
        for (const [me, w, other] of [
          [A.name, r.aWins, B.name],
          [B.name, r.games - r.aWins, A.name],
        ] as const) {
          wins.set(me, (wins.get(me) ?? 0) + w);
          total.set(me, (total.get(me) ?? 0) + r.games);
          const g = grid.get(`${me}|${other}`) ?? { a: 0, n: 0 };
          grid.set(`${me}|${other}`, { a: g.a + w, n: g.n + r.games });
          const pd = perDeck.get(me) ?? new Map<string, number>();
          pd.set(d.name, (pd.get(d.name) ?? 0) + w);
          perDeck.set(me, pd);
        }
      }
    }
  });
  console.log(
    `Hero vs hero, same deck both sides, ${decks.length} starter decks x ${games} games per pair (seats alternating), greedy bot\n`,
  );
  const width = 16;
  console.log(''.padEnd(width) + names.map((n) => n.padEnd(width)).join(''));
  for (const r of names)
    console.log(
      r.padEnd(width) +
        names
          .map((c) =>
            (r === c
              ? '-'
              : rate(grid.get(`${r}|${c}`)!.a / grid.get(`${r}|${c}`)!.n)
            ).padEnd(width),
          )
          .join(''),
    );
  console.log('\nOverall:');
  [...names]
    .sort((a, b) => wins.get(b)! / total.get(b)! - wins.get(a)! / total.get(a)!)
    .forEach((n) =>
      console.log(`  ${rate(wins.get(n)! / total.get(n)!).padStart(4)}  ${n}`),
    );
  console.log(
    "\nBy deck (each hero's win rate with that deck against the other five):",
  );
  console.log(
    ''.padEnd(18) + names.map((n) => n.slice(0, 7).padEnd(9)).join(''),
  );
  for (const d of decks) {
    const per = games * (names.length - 1);
    console.log(
      d.name.padEnd(18) +
        names
          .map((n) => rate(perDeck.get(n)!.get(d.name)! / per).padEnd(9))
          .join(''),
    );
  }
} else {
  const heroed = decks.map((d) => ({ ...d, bot }));
  const plain = runTournament(heroed, games, catalog);
  // Same grid with heroes: seed i of every game cycles the heroes of each seat.
  const matchups = [] as ReturnType<typeof playMatchup>[];
  for (let i = 0; i < decks.length; i++) {
    for (let j = i + 1; j < decks.length; j++) {
      let aWins = 0;
      let turns = 0;
      for (let g = 0; g < games; g++) {
        const aFirst = g % 2 === 0;
        const ha = heroIds[g % heroIds.length];
        const hb = heroIds[Math.floor(g / heroIds.length) % heroIds.length];
        const sides = aFirst
          ? { '0': decks[i], '1': decks[j] }
          : { '0': decks[j], '1': decks[i] };
        const hs = aFirst ? { '0': ha, '1': hb } : { '0': hb, '1': ha };
        const r = playGame(
          { '0': sides['0'].deck, '1': sides['1'].deck },
          { '0': bot, '1': bot },
          catalog,
          1 + (i * decks.length + j) * 1000 + g,
          hs,
        );
        turns += r.turns;
        const aSide = aFirst ? '0' : '1';
        aWins += r.winner === 'draw' ? 0.5 : r.winner === aSide ? 1 : 0;
      }
      matchups.push({
        a: decks[i].name,
        b: decks[j].name,
        games,
        aWins,
        averageTurns: turns / games,
      });
    }
  }
  const overall = (ms: typeof matchups, name: string) => {
    const rows = ms.filter((m) => m.a === name || m.b === name);
    return (
      rows.reduce(
        (s, m) => s + (m.a === name ? m.aWins : m.games - m.aWins),
        0,
      ) / rows.reduce((s, m) => s + m.games, 0)
    );
  };
  const turnsOf = (ms: typeof matchups) =>
    ms.reduce((s, m) => s + m.averageTurns, 0) / ms.length;
  console.log(
    `Starter decks, ${games} games per pairing, greedy bot; heroes drawn from ${heroIds.join(', ')} (cycling)\n`,
  );
  console.log(
    formatWinTable(
      decks.map((d) => d.name),
      matchups,
    ),
  );
  console.log(
    `\nOverall (with heroes vs no heroes), average game ${turnsOf(matchups).toFixed(1)} vs ${turnsOf(plain.matchups).toFixed(1)} turns:`,
  );
  decks
    .map((d) => ({
      n: d.name,
      h: overall(matchups, d.name),
      p: overall(plain.matchups, d.name),
    }))
    .sort((a, b) => b.h - a.h)
    .forEach((o) =>
      console.log(
        `  ${rate(o.h).padStart(4)} (${rate(o.p).padStart(4)} no hero)  ${o.n}`,
      ),
    );
}
console.log(`\nDone in ${((Date.now() - started) / 1000).toFixed(1)}s`);
