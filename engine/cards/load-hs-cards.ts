import core from '../../data/core.json';
import prime from '../../data/prime.json';
import entourage from '../../data/entourage.json';
import game from '../../data/game.json';
import mechanics from '../../data/mechanics.json';
import constants from '../../data/constants.json';
import { loadCards } from './load-cards';
import type {
  LoadCardsOptions,
  LoadCardsResult,
  RawCard,
  RawGlossaryEntry,
} from './types';

/**
 * Loads the committed Hearthstone-style card data (`data/*.json`, pulled by
 * `npm run airtable`) into normalised cards.
 */
export function loadHsCards(options?: LoadCardsOptions): LoadCardsResult {
  return loadCards(
    {
      core: core as unknown as RawCard[],
      prime: prime as unknown as RawCard[],
      entourage: entourage as unknown as RawCard[],
      game: game as unknown as RawCard[],
      mechanics: mechanics as unknown as RawGlossaryEntry[],
      constants: constants as unknown as RawGlossaryEntry[],
    },
    options
  );
}
