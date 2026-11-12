/**
 * Bot-vs-bot balance report. Usage: `npm run sim -- [gamesPerPair] [bot] [decks]` where bot is `greedy` (default) or `random`, and
 * decks is `core` (default), `prime`, `mixed` (Core + Prime decks) or `all` (every starter deck against every other).
 * Prints a win-rate grid for those starter decks, each deck's overall win rate, then the best and worst cards by win rate when played.
 */
import { chooseGreedyAction } from '../bots/greedy-bot';
import { chooseRandomAction } from '../bots/random-bot';
import { loadHsCards } from '../cards/load-hs-cards';
import { playablePool, primePool } from '../decks';
import { ALL_STARTER_DECKS, buildStarterDeck, MIXED_STARTER_DECKS, poolFor, PRIME_STARTER_DECKS, STARTER_DECKS } from '../starter-decks';
import { formatWinTable, runTournament } from './simulate';

const games = Number(process.argv[2] ?? 100);
const botName = process.argv[3] ?? 'greedy';
const bot = botName === 'random' ? chooseRandomAction : chooseGreedyAction;
const setName = process.argv[4] ?? 'core';
const chosen = { core: STARTER_DECKS, prime: PRIME_STARTER_DECKS, mixed: MIXED_STARTER_DECKS, all: ALL_STARTER_DECKS }[setName];
if (!chosen) throw new Error('decks must be core, prime, mixed or all');
if (!Number.isInteger(games) || games < 2) throw new Error('gamesPerPair must be a whole number, at least 2');

const { byId, cards } = loadHsCards();
const pool = playablePool(cards);
const prime = primePool(cards);
const contestants = chosen.map((d) => ({ name: d.name, deck: buildStarterDeck(d, poolFor(d.set, pool, prime)), bot }));

console.log(`${games} games per pairing, both seats alternating, ${botName} bot, ${setName} starter decks (${contestants.length}), CORE pool ${pool.length} cards, PRIME pool ${prime.length}\n`);
const started = Date.now();
const { matchups, cardStats } = runTournament(contestants, games, byId);
console.log('Win rate of the row deck against the column deck:\n');
console.log(formatWinTable(contestants.map((c) => c.name), matchups));
const overall = contestants
  .map((c) => {
    const rows = matchups.filter((m) => m.a === c.name || m.b === c.name);
    const wins = rows.reduce((sum, m) => sum + (m.a === c.name ? m.aWins : m.games - m.aWins), 0);
    const total = rows.reduce((sum, m) => sum + m.games, 0);
    const turns = rows.reduce((sum, m) => sum + m.averageTurns, 0) / Math.max(1, rows.length);
    return { name: c.name, rate: wins / Math.max(1, total), turns };
  })
  .sort((a, b) => b.rate - a.rate);
console.log('\nOverall win rate against the other decks listed (average game length in turns):');
for (const o of overall) console.log(`  ${`${(o.rate * 100).toFixed(0)}%`.padStart(4)}  ${o.name.padEnd(18)} ${o.turns.toFixed(1)} turns`);

const MIN_GAMES = Math.max(5, games / 4);
const ranked = cardStats
  .filter((c) => c.games >= MIN_GAMES)
  .map((c) => ({ ...c, rate: c.wins / c.games }))
  .sort((a, b) => b.rate - a.rate);
const line = (c: (typeof ranked)[number]) =>
  `  ${`${(c.rate * 100).toFixed(0)}%`.padStart(4)}  ${c.cardId}  ${byId.get(c.cardId)?.name ?? ''} (${c.games} games)`;
console.log('\nCaution: "win rate when played" is confounded (a card that is only played in a losing game looks bad, one held until you are ahead looks good). Use it to spot outliers, not to rank.');
console.log(`\nBest win rate when played (at least ${MIN_GAMES} games):`);
ranked.slice(0, 8).forEach((c) => console.log(line(c)));
console.log('\nWorst:');
ranked.slice(-8).forEach((c) => console.log(line(c)));
console.log(`\nDone in ${((Date.now() - started) / 1000).toFixed(1)}s`);
