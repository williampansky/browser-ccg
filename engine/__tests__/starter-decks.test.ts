import { checkDeck } from '../deck-rules';
import { loadHsCards } from '../cards/load-hs-cards';
import { isPlayable } from '../decks';
import { heroes } from '../heroes';
import {
  STARTER_CLASS_IDS,
  STARTER_NEUTRAL_IDS,
  starterDeck,
} from '../starter-decks';

const { byId } = loadHsCards();

describe('starter decks', () => {
  it('has a deck for every class', () => {
    heroes().forEach((hero) => {
      expect(starterDeck(hero.id)).toHaveLength(30);
    });
  });

  it('follows the deck rules for its class', () => {
    heroes().forEach((hero) => {
      const result = checkDeck(starterDeck(hero.id), byId, true, hero.id);

      expect(result.errors).toEqual([]);
    });
  });

  it('uses only playable, active, non-Mystery, non-Mythic cards', () => {
    const ids = [
      ...STARTER_NEUTRAL_IDS,
      ...Object.values(STARTER_CLASS_IDS).flat(),
    ];

    ids.forEach((id) => {
      const card = byId.get(id)!;

      expect(card.active).toBe(true);
      expect(isPlayable(card)).toBe(true);
      expect(card.rarity).not.toBe('MYTHIC');
      expect(card.mechanics).not.toContain('MYSTERY');
    });
  });

  it('only uses starter-available class cards', () => {
    Object.values(STARTER_CLASS_IDS)
      .flat()
      .forEach((id) => {
        expect(byId.get(id)!.availability).toBe('STARTER');
      });
  });
});
