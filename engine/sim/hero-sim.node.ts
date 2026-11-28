/**
 * Hero balance report. Usage: `npm run sim:heroes -- [games] [core|starter] [only=A,B]`
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
 * With `only=FIGHTER,CLERIC`, only the pairs that include one of those heroes
 * are played (each against every other hero, with the same seeds as a full
 * run). The other heroes' overall rates then cover just those pairs.
 *
 * With `starter`, every hero plays its real starter deck (`starter-decks.ts`:
 * five class cards and ten neutral Core cards, two copies each), with no random
 * decks. There is no "no hero" side. `games` is then per hero pair, and is
 * multiplied by the number of random decks the other modes use, so the totals
 * match.
 */
import { chooseGreedyAction } from '../bots/greedy-bot';
import { loadHsCards } from '../cards/load-hs-cards';
import { classCardsFor, playablePool, primePool } from '../decks';
import { heroes, withHeroTokens } from '../heroes';
import { starterDeck } from '../starter-decks';
import { classDeck, simDecks } from './sim-decks';
import { playMatchup } from './simulate';

const gamesArg = process.argv.slice(2).find((arg) => /^\d+$/.test(arg));
const requestedGames = Number(gamesArg ?? 20);
const isStarter = process.argv.slice(2).includes('starter');
const isCoreOnly = process.argv.slice(2).includes('core');
const onlyArg = process.argv.slice(2).find((arg) => arg.startsWith('only='));
const focus = onlyArg
  ? onlyArg.slice('only='.length).toUpperCase().split(',')
  : [];
const DECK_COUNT = 12;
const NO_HERO = 'NONE';
const COLUMN_WIDTH = 16;
const DECK_COLUMN_WIDTH = 9;
const DECK_LABEL_WIDTH = 18;
const SEED_STEP = 100000;
const PAIR_SEED_STEP = 1000;

const games = isStarter ? requestedGames * DECK_COUNT : requestedGames;

if (!Number.isInteger(requestedGames) || requestedGames < 2)
  throw new Error('games must be a whole number, at least 2');

const { byId, cards } = loadHsCards();
const catalog = withHeroTokens(byId);
const randomDecks = simDecks(
  isCoreOnly
    ? playablePool(cards)
    : [...playablePool(cards), ...primePool(cards)],
  DECK_COUNT,
);
const decks = isStarter ? [{ name: 'Starter', deck: [] }] : randomDecks;
const heroNames = heroes().map((hero) => hero.id);
const names = isStarter ? heroNames : [...heroNames, NO_HERO];
const unknownFocus = focus.filter((name) => !names.includes(name));

if (unknownFocus.length > 0)
  throw new Error(`unknown hero in only=: ${unknownFocus.join(', ')}`);

const isInFocus = (a: string, b: string): boolean =>
  focus.length === 0 || focus.includes(a) || focus.includes(b);
const bot = chooseGreedyAction;
const started = Date.now();
const rate = (value: number): string => `${(value * 100).toFixed(0)}%`;

const deckFor = (name: string, base: string[], seed: number): string[] => {
  if (isStarter) return starterDeck(name);
  if (name === NO_HERO || isCoreOnly) return base;

  return classDeck(base, classCardsFor(cards, name), seed);
};

const wins = new Map<string, number>();
const total = new Map<string, number>();
const grid = new Map<string, { won: number; played: number }>();
const perDeck = new Map<string, Map<string, number>>();

decks.forEach((base, deckIndex) => {
  const seed = deckIndex + 1;

  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      if (!isInFocus(names[i], names[j])) continue;

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
  `Hero vs hero on the same base deck, ${isStarter ? 'the real starter decks' : isCoreOnly ? 'Core only, no class cards (skills alone)' : 'class cards swapped in'}, ${decks.length} decks x ${games} games per pair (seats alternating), greedy bot\n`,
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
  const cells = names.map((name) =>
    rate(
      perDeck.get(name)!.get(base.name)! / (total.get(name)! / decks.length),
    ).padEnd(DECK_COLUMN_WIDTH),
  );

  console.log(base.name.padEnd(DECK_LABEL_WIDTH) + cells.join(''));
}

console.log(`\nDone in ${((Date.now() - started) / 1000).toFixed(1)}s`);
