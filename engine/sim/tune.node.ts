/**
 * Weight tuning for the greedy bot. Usage: `npm run tune -- [gamesPerDeck]`.
 * Each variant plays the default weights with the same deck on both sides (so
 * the deck cancels out), for each of 12 seeded random decks, and prints the
 * variant's win rate. Above about 55% over a few
 * hundred games is a real gain.
 */
import {
  chooseGreedyActionWith,
  DEFAULT_WEIGHTS,
  GreedyWeights,
} from '../bots/greedy-bot';
import { loadHsCards } from '../cards/load-hs-cards';
import { playablePool, primePool } from '../decks';
import { simDecks } from './sim-decks';
import { Bot, playMatchup } from './simulate';

const games = Number(process.argv[2] ?? 100);
const { byId, cards } = loadHsCards();
const decks = simDecks([...playablePool(cards), ...primePool(cards)], 12);

const variants: Record<string, Partial<GreedyWeights>> = {
  'cards worth 1': { card: 1 },
  'cards worth 2.5': { card: 2.5 },
  'life low x3': { lifeLow: 3 },
  'life flat 1': { lifeLow: 1, lifeMid: 1, lifeHigh: 1 },
  'life cheap (0.5 all)': { lifeLow: 0.5, lifeMid: 0.5, lifeHigh: 0.5 },
  'guard 3': { guard: 3 },
  'weapons x1.5': { weapon: 1.5 },
};

const asBot =
  (w: GreedyWeights): Bot =>
  (state, catalog, rng) =>
    chooseGreedyActionWith(w, state, catalog, rng);

for (const [name, tweak] of Object.entries(variants)) {
  const bot = asBot({ ...DEFAULT_WEIGHTS, ...tweak });
  const base = asBot(DEFAULT_WEIGHTS);
  const rates = decks.map(({ deck }) => {
    const m = playMatchup(
      { name: 'variant', deck, bot },
      { name: 'default', deck, bot: base },
      games,
      byId,
      777,
    );
    return m.aWins / m.games;
  });
  const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
  console.log(
    `${name.padEnd(24)} ${(avg * 100).toFixed(0)}%   (${rates.map((r) => `${(r * 100).toFixed(0)}%`).join(' / ')})`,
  );
}
