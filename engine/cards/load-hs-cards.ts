import core from '../../data/hs/core.json';
import prime from '../../data/hs/prime.json';
import entourage from '../../data/hs/entourage.json';
import game from '../../data/hs/game.json';
import mechanics from '../../data/hs/mechanics.json';
import constants from '../../data/hs/constants.json';
import { loadCards } from './load-cards';
import type {
  LoadCardsOptions,
  LoadCardsResult,
  RawCard,
  RawGlossaryEntry,
} from './types';

/**
 * Loads the committed Hearthstone-style card data (`data/hs/*.json`, pulled by
 * `npm run airtable:hs`) into normalised cards.
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
