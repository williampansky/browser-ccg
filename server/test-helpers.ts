import {
  buildDeck,
  createSeededRng,
  loadHsCards,
  playablePool,
  withHeroTokens,
} from '../engine';
import { Match } from './match';

const { cards, byId } = loadHsCards();
export const catalog = withHeroTokens(byId);
export const pool = playablePool(cards);

/** A match of two random Core decks, seeded, started at time 0. */
export const makeMatch = (seed = 1, bot?: 'greedy' | 'random'): Match => {
  const rng = createSeededRng(seed);

  return new Match(
    {
      decks: { '0': buildDeck(pool, rng), '1': buildDeck(pool, rng) },
      heroes: { '0': 'FIGHTER', '1': 'WIZARD' },
      seats: {
        '0': { name: 'A', color: 'blue' },
        '1': { name: 'B', color: 'red', bot },
      },
      catalog,
      rng,
      bonusCard: 'GAME_001',
    },
    0,
  );
};
