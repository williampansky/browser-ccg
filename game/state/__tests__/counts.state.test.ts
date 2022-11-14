import { counts, defaultState } from '../';
import { gameConfig } from '../../../app.config';
import { mockGameState } from '../../test-utils';

describe('Handles G.counts state manipulation', () => {
  test('Should return the default state', () => {
    const defaultStateCheck = {
      '0': {
        deck: gameConfig.numerics.cardsPerDeck,
        hand: 0,
        discarded: 0,
        destroyed: 0,
        played: 0,
      },
      '1': {
        deck: gameConfig.numerics.cardsPerDeck,
        hand: 0,
        discarded: 0,
        destroyed: 0,
        played: 0,
      },
    };

    const fn = counts.defaultState;
    expect(fn).toStrictEqual(defaultStateCheck);
  });

  test("Should reduce the player's deck count by 1", () => {
    const G = mockGameState(
      'counts',
      { deck: 20, hand: 0 },
      { deck: 20, hand: 0 }
    );

    counts.decrementDeck(G, '0');

    expect(G.counts['0'].deck).toBe(19); // should change
    expect(G.counts['0'].hand).toBe(defaultState.counts['0'].hand); // shouldn't change
    expect(G.counts['1'].deck).toBe(defaultState.counts['1'].deck); // shouldn't change
    expect(G.counts['1'].hand).toBe(defaultState.counts['1'].hand); // shouldn't change
  });

  test("Should reduce the player's hand count by 1", () => {
    const G = mockGameState(
      'counts',
      { deck: 20, hand: 5 },
      { deck: 20, hand: 0 }
    );

    counts.decrementHand(G, '0');

    expect(G.counts['0'].deck).toBe(defaultState.counts['0'].deck);
    expect(G.counts['0'].hand).toBe(4);
    expect(G.counts['1'].deck).toBe(defaultState.counts['1'].deck);
    expect(G.counts['1'].hand).toBe(defaultState.counts['1'].hand);
  });

  test("Should increase the player's deck count by 1", () => {
    const G = mockGameState(
      'counts',
      { deck: 20, hand: 0 },
      { deck: 20, hand: 0 }
    );

    counts.incrementDeck(G, '0');

    expect(G.counts['0'].deck).toBe(21);
    expect(G.counts['0'].hand).toBe(defaultState.counts['0'].hand);
    expect(G.counts['1'].deck).toBe(defaultState.counts['1'].deck);
    expect(G.counts['1'].hand).toBe(defaultState.counts['1'].hand);
  });

  test("Should increase the player's hand count by 1", () => {
    const G = mockGameState(
      'counts',
      { deck: 20, hand: 0 },
      { deck: 20, hand: 0 }
    );

    counts.incrementHand(G, '0');

    expect(G.counts['0'].deck).toBe(defaultState.counts['0'].deck);
    expect(G.counts['0'].hand).toBe(1);
    expect(G.counts['1'].deck).toBe(defaultState.counts['1'].deck);
    expect(G.counts['1'].hand).toBe(defaultState.counts['1'].hand);
  });
});
