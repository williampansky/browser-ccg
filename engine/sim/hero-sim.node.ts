/**
 * Hero balance report. Usage: `npm run sim:heroes -- [games] [core|basic]`
 * Hero against hero (every playable class plus "no hero") on the same base
 * deck, one of twelve seeded random Core + Prime decks (`sim-decks.ts`). Each
 * class's side has up to ten of its class cards swapped in, so both sides share
 * the rest of the deck and differ by class. `games` is per hero pair per deck
 * (alternating seats). Prints the hero grid, each hero's overall rate and each
 * hero's rate by deck. Greedy bot on both sides.
 *
 * With `core`, the decks are Core only and no class cards are swapped in (Core
 * has none), so heroes differ by skill alone.
 *
 * With `basic`, the decks are Core plus each class's STARTER class cards (up to
 * ten, one copy each, swapped in): what a new player has.
 */
import { chooseGreedyAction } from '../bots/greedy-bot';
import { loadHsCards } from '../cards/load-hs-cards';
import type { Card } from '../cards/types';
import { classCardsFor, playablePool, primePool } from '../decks';
import { heroes, withHeroTokens } from '../heroes';
import { classDeck, simDecks } from './sim-decks';
import { playMatchup } from './simulate';

const gamesArg = process.argv.slice(2).find((arg) => /^\d+$/.test(arg));
const games = Number(gamesArg ?? 20);
const isBasic = process.argv.slice(2).includes('basic');
const isCoreOnly = process.argv.slice(2).includes('core');
const isCorePool = isCoreOnly || isBasic;
const DECK_COUNT = 12;
const NO_HERO = 'NONE';
const COLUMN_WIDTH = 16;
const DECK_COLUMN_WIDTH = 9;
const DECK_LABEL_WIDTH = 18;
const SEED_STEP = 100000;
const PAIR_SEED_STEP = 1000;

if (!Number.isInteger(games) || games < 2)
  throw new Error('games must be a whole number, at least 2');

const { byId, cards } = loadHsCards();
const catalog = withHeroTokens(byId);
const decks = simDecks(
  isCorePool
    ? playablePool(cards)
    : [...playablePool(cards), ...primePool(cards)],
  DECK_COUNT,
);
const names = [...heroes().map((hero) => hero.id), NO_HERO];
const bot = chooseGreedyAction;
const started = Date.now();
const rate = (value: number): string => `${(value * 100).toFixed(0)}%`;

const isStarter = (card: Card): boolean => card.availability === 'STARTER';

const swapCardsFor = (name: string): Card[] => {
  const classCards = classCardsFor(cards, name);

  return isBasic ? classCards.filter(isStarter) : classCards;
};

const deckFor = (name: string, base: string[], seed: number): string[] =>
  name === NO_HERO || isCoreOnly
    ? base
    : classDeck(base, swapCardsFor(name), seed);

const wins = new Map<string, number>();
const total = new Map<string, number>();
const grid = new Map<string, { won: number; played: number }>();
const perDeck = new Map<string, Map<string, number>>();

decks.forEach((base, deckIndex) => {
  const seed = deckIndex + 1;

  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const sideA = {
        name: names[i],
        deck: deckFor(names[i], base.deck, seed),
        bot,
        hero: names[i] === NO_HERO ? undefined : names[i],
      };
      const sideB = {
        name: names[j],
        deck: deckFor(names[j], base.deck, seed),
        bot,
        hero: names[j] === NO_HERO ? undefined : names[j],
      };
      const pairSeed =
        1 + deckIndex * SEED_STEP + (i * names.length + j) * PAIR_SEED_STEP;
      const result = playMatchup(sideA, sideB, games, catalog, pairSeed);

      for (const [me, won, other] of [
        [sideA.name, result.aWins, sideB.name],
        [sideB.name, result.games - result.aWins, sideA.name],
      ] as const) {
        wins.set(me, (wins.get(me) ?? 0) + won);
        total.set(me, (total.get(me) ?? 0) + result.games);

        const cell = grid.get(`${me}|${other}`) ?? { won: 0, played: 0 };

        grid.set(`${me}|${other}`, {
          won: cell.won + won,
          played: cell.played + result.games,
        });

        const byDeck = perDeck.get(me) ?? new Map<string, number>();

        byDeck.set(base.name, (byDeck.get(base.name) ?? 0) + won);
        perDeck.set(me, byDeck);
      }
    }
  }
});

console.log(
  `Hero vs hero on the same base deck, ${isCoreOnly ? 'Core only, no class cards (skills alone)' : isBasic ? 'Core plus starter class cards' : 'class cards swapped in'}, ${decks.length} random decks x ${games} games per pair (seats alternating), greedy bot\n`,
);
console.log(
  ''.padEnd(COLUMN_WIDTH) +
    names.map((name) => name.padEnd(COLUMN_WIDTH)).join(''),
);

for (const row of names) {
  const cells = names.map((column) => {
    const cell = grid.get(`${row}|${column}`);

    return (
      row === column || !cell ? '-' : rate(cell.won / cell.played)
    ).padEnd(COLUMN_WIDTH);
  });

  console.log(row.padEnd(COLUMN_WIDTH) + cells.join(''));
}

console.log('\nOverall:');
[...names]
  .sort((a, b) => wins.get(b)! / total.get(b)! - wins.get(a)! / total.get(a)!)
  .forEach((name) =>
    console.log(
      `  ${rate(wins.get(name)! / total.get(name)!).padStart(4)}  ${name}`,
    ),
  );

console.log(
  "\nBy deck (each hero's win rate with that deck against the others):",
);
console.log(
  ''.padEnd(DECK_LABEL_WIDTH) +
    names.map((name) => name.slice(0, 7).padEnd(DECK_COLUMN_WIDTH)).join(''),
);

for (const base of decks) {
  const perHero = games * (names.length - 1);
  const cells = names.map((name) =>
    rate(perDeck.get(name)!.get(base.name)! / perHero).padEnd(
      DECK_COLUMN_WIDTH,
    ),
  );

  console.log(base.name.padEnd(DECK_LABEL_WIDTH) + cells.join(''));
}

console.log(`\nDone in ${((Date.now() - started) / 1000).toFixed(1)}s`);
