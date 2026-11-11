/**
 * Bot-vs-bot balance report. Usage: `npm run sim -- [gamesPerPair] [bot]` where bot is `greedy` (default) or `random`.
 * Prints a win-rate grid for the starter decks, then the best and worst cards by win rate when played.
 */
import { chooseGreedyAction } from '../bots/greedy-bot';
import { chooseRandomAction } from '../bots/random-bot';
import { loadHsCards } from '../cards/load-hs-cards';
import { playablePool } from '../decks';
import { buildStarterDeck, STARTER_DECKS } from '../starter-decks';
import { formatWinTable, runTournament } from './simulate';

const games = Number(process.argv[2] ?? 100);
const botName = process.argv[3] ?? 'greedy';
const bot = botName === 'random' ? chooseRandomAction : chooseGreedyAction;
if (!Number.isInteger(games) || games < 2) throw new Error('gamesPerPair must be a whole number, at least 2');

const { byId, cards } = loadHsCards();
const pool = playablePool(cards);
const contestants = STARTER_DECKS.map((d) => ({ name: d.name, deck: buildStarterDeck(d, pool), bot }));

console.log(`${games} games per pairing, both seats alternating, ${botName} bot, pool of ${pool.length} cards\n`);
const started = Date.now();
const { matchups, cardStats } = runTournament(contestants, games, byId);
console.log('Win rate of the row deck against the column deck:\n');
console.log(formatWinTable(contestants.map((c) => c.name), matchups));
console.log('\nAverage game length (turns):');
for (const m of matchups) console.log(`  ${m.a} vs ${m.b}: ${m.averageTurns.toFixed(1)}`);

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
