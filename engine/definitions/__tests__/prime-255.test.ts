import { produce } from 'immer';
import { checkDeck } from '../../deck-rules';
import { isPlayable, playablePool, primePool } from '../../decks';
import { loadHsCards } from '../../cards/load-hs-cards';
import {
  catalog,
  failCode,
  hero,
  mref,
  play,
  realCard,
  setup,
} from '../../testing/real-cards';

// PRIME_255: Warrior-only COMMON spell, "Deal 1 damage for each Armor you have (cannot be used on heroes)".

const withArmor = (
  armor: number,
  sc = { theirs: [[2, 6]] as [number, number][] },
) =>
  produce(setup('PRIME_255', sc), (g) => void (g.players['0'].armor = armor));

describe('PRIME_255', () => {
  it('is a COMMON, 1 cost spell restricted to the WARRIOR class', () => {
    const c = realCard('PRIME_255');
    expect([c.rarity, c.cost, c.type, c.heroClass]).toEqual([
      'COMMON',
      1,
      'spell',
      'WARRIOR',
    ]);
    expect(isPlayable(c)).toBe(true);
  });
  it('deals damage equal to your Armor to a minion, without spending the Armor', () => {
    const s = withArmor(4);
    const r = play(s, mref(s, '1', 0)).state;
    expect(r.players['1'].board[0].health).toBe(2);
    expect(r.players['0'].armor).toBe(4);
  });
  it('does nothing with no Armor', () => {
    const s = withArmor(0);
    expect(play(s, mref(s, '1', 0)).state.players['1'].board[0].health).toBe(6);
  });
  it('cannot be aimed at a hero', () => {
    expect(failCode(withArmor(4), hero('1'))).toBeDefined();
  });
});

describe('class-restricted cards', () => {
  const { byId } = loadHsCards();
  it('only a deck with that hero may include the card', () => {
    expect(checkDeck(['PRIME_255'], byId).ok).toBe(false);
    expect(checkDeck(['PRIME_255'], byId, true, 'ZEUS').ok).toBe(false);
    expect(checkDeck(['PRIME_255'], byId, true, 'WARRIOR').ok).toBe(true);
  });
  it('neutral cards need no hero', () => {
    expect(byId.get('CORE_001')!.heroClass).toBeUndefined();
    expect(checkDeck(['CORE_001'], byId).ok).toBe(true);
  });
  it('random and starter pools leave class cards out', () => {
    const all = Array.from(byId.values());
    expect(primePool(all).some((c) => c.id === 'PRIME_255')).toBe(false);
    expect(playablePool(all).every((c) => !c.heroClass)).toBe(true);
    expect(catalog.get('PRIME_255')).toBeDefined();
  });
});
