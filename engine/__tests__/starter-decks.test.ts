import { checkDeck } from '../deck-rules';
import { loadHsCards } from '../cards/load-hs-cards';
import { isPlayable } from '../decks';
import { heroes } from '../heroes';
import { starterDeck } from '../starter-decks';

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

  it('uses only playable, active, non-Mythic cards', () => {
    heroes().forEach((hero) => {
      starterDeck(hero.id).forEach((id) => {
        const card = byId.get(id)!;

        expect(card.active).toBe(true);
        expect(isPlayable(card)).toBe(true);
        expect(card.rarity).not.toBe('MYTHIC');
      });
    });
  });
});
