/**
 * Class card report (the collection layer: class cards are Prime, so this is
 * not about Core-only starter decks). Usage: `npm run sim:cards -- [games] [HERO ...]`
 * For each hero (all of them, or only the ones named), `games` games against
 * a rotating field of the other heroes. Every game gets a fresh random Core +
 * Prime base deck and a fresh random draw of up to ten of the hero's class
 * cards, so each class card is in the deck in some games and not in others.
 * Per class card it prints the hero's win rate with the card in the deck
 * against without it (the fair comparison, since inclusion is random) and its
 * win rate in games where the card was played (biased upward: games that run
 * long let more cards be played). Greedy bot on both sides.
 */
import { chooseGreedyAction } from '../bots/greedy-bot';
import { loadHsCards } from '../cards/load-hs-cards';
import { buildDeck, classCardsFor, playablePool, primePool } from '../decks';
import { heroes, withHeroTokens } from '../heroes';
import { createSeededRng } from '../rng';
import { classDeck } from './sim-decks';
import { playGame } from './simulate';

const args = process.argv.slice(2);
const gamesArg = args.find((arg) => /^\d+$/.test(arg));
const games = Number(gamesArg ?? 400);
const heroFilter = args.filter((arg) => !/^\d+$/.test(arg));
const SEED_STEP = 100000;
const CARD_COLUMN_WIDTH = 28;
const NUMBER_COLUMN_WIDTH = 10;
const PERCENT = 100;
const SIGNIFICANT_Z = 2;

if (!Number.isInteger(games) || games < 2)
  throw new Error('games must be a whole number, at least 2');

const { byId, cards } = loadHsCards();
const catalog = withHeroTokens(byId);
const pool = [...playablePool(cards), ...primePool(cards)];
const allHeroes = heroes().map((hero) => hero.id);
const chosenHeroes = heroFilter.length ? heroFilter : allHeroes;
const started = Date.now();

interface Tally {
  inWon: number;
  inPlayed: number;
  outWon: number;
  outPlayed: number;
  playedWon: number;
  playedGames: number;
}

const percent = (value: number): string => `${(value * PERCENT).toFixed(0)}%`;
const signed = (value: number): string => {
  const points = Math.round(value * PERCENT);

  return `${points > 0 ? '+' : ''}${points}`;
};

/** Standard error of the gap between two win rates. */
const gapError = (tally: Tally): number => {
  const { inWon, inPlayed, outWon, outPlayed } = tally;
  const rateIn = inWon / inPlayed;
  const rateOut = outWon / outPlayed;

  return Math.sqrt(
    (rateIn * (1 - rateIn)) / inPlayed + (rateOut * (1 - rateOut)) / outPlayed,
  );
};

const reportHero = (hero: string, heroIndex: number): void => {
  const classCards = classCardsFor(cards, hero);
  const others = allHeroes.filter((name) => name !== hero);
  const tallies = new Map<string, Tally>();
  let totalWon = 0;

  classCards.forEach((card) => {
    tallies.set(card.id, {
      inWon: 0,
      inPlayed: 0,
      outWon: 0,
      outPlayed: 0,
      playedWon: 0,
      playedGames: 0,
    });
  });

  for (let game = 0; game < games; game++) {
    const seed = 1 + heroIndex * SEED_STEP + game;
    const opponent = others[game % others.length];
    const base = buildDeck(pool, createSeededRng(seed));
    const ownDeck = classDeck(base, classCards, seed);
    const opponentDeck = classDeck(
      base,
      classCardsFor(cards, opponent),
      seed + SEED_STEP * allHeroes.length,
    );
    const isFirst = game % 2 === 0;
    const seat = isFirst ? '0' : '1';
    const otherSeat = isFirst ? '1' : '0';
    const decks = { [seat]: ownDeck, [otherSeat]: opponentDeck } as Record<
      '0' | '1',
      string[]
    >;
    const heroOf = { [seat]: hero, [otherSeat]: opponent } as Record<
      '0' | '1',
      string
    >;
    const bot = chooseGreedyAction;
    const result = playGame(
      decks,
      { '0': bot, '1': bot },
      catalog,
      seed,
      heroOf,
    );
    const point =
      result.winner === 'draw' ? 0.5 : result.winner === seat ? 1 : 0;
    const inDeck = new Set(ownDeck);
    const played = new Set(result.played[seat]);

    totalWon += point;
    classCards.forEach((card) => {
      const tally = tallies.get(card.id)!;

      if (inDeck.has(card.id)) {
        tally.inWon += point;
        tally.inPlayed += 1;
      } else {
        tally.outWon += point;
        tally.outPlayed += 1;
      }

      if (played.has(card.id)) {
        tally.playedWon += point;
        tally.playedGames += 1;
      }
    });
  }

  const rows = classCards
    .map((card) => ({ card, tally: tallies.get(card.id)! }))
    .filter(({ tally }) => tally.inPlayed > 0 && tally.outPlayed > 0)
    .map(({ card, tally }) => ({
      card,
      tally,
      gap: tally.inWon / tally.inPlayed - tally.outWon / tally.outPlayed,
    }))
    .sort((a, b) => b.gap - a.gap);

  console.log(
    `\n${hero}: ${percent(totalWon / games)} over ${games} games, ${classCards.length} class cards`,
  );
  console.log(
    'card'.padEnd(CARD_COLUMN_WIDTH) +
      ['in deck', 'without', 'gap', 'played']
        .map((head) => head.padEnd(NUMBER_COLUMN_WIDTH))
        .join(''),
  );

  rows.forEach(({ card, tally, gap }) => {
    const isSignificant = Math.abs(gap) > SIGNIFICANT_Z * gapError(tally);
    const cells = [
      percent(tally.inWon / tally.inPlayed),
      percent(tally.outWon / tally.outPlayed),
      signed(gap) + (isSignificant ? ' *' : ''),
      tally.playedGames ? percent(tally.playedWon / tally.playedGames) : '-',
    ];
    const label = `${card.id} ${card.name ?? ''}`.slice(
      0,
      CARD_COLUMN_WIDTH - 1,
    );

    console.log(
      label.padEnd(CARD_COLUMN_WIDTH) +
        cells.map((cell) => cell.padEnd(NUMBER_COLUMN_WIDTH)).join(''),
    );
  });
};

chosenHeroes.forEach(reportHero);
console.log('\n* = the gap is more than two standard errors from zero');
console.log(`Done in ${((Date.now() - started) / 1000).toFixed(1)}s`);
