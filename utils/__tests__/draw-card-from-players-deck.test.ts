import { createCardObject, drawCardFromPlayersDeck } from '..';
import { defaultState } from '../../game/state';
import { Counts, PlayerCards } from '../../types';

const setUpCounts = (deck: number = 0, hand: number = 0) => {
  return {
    hand: hand,
    deck: deck,
    discarded: 0,
    destroyed: 0,
    played: 0,
  } as Counts;
};

describe("Handles moving card objects from player's deck to hand + G.counts", () => {
  test('Should draw a single card if no amount is provided', () => {
    const testCardBase = { id: 'testCard', name: 'cardy', cost: 1, power: 0 };
    const testCardObj = createCardObject(testCardBase);

    let G = {
      ...defaultState,
      counts: {
        '0': setUpCounts(1, 0),
        '1': setUpCounts(),
      },
      players: {
        '0': {
          actionPoints: { current: 0, total: 0 },
          displayName: 'Player',
          playerId: '0',
          cards: {
            deck: [testCardObj],
            hand: [],
            destroyed: [],
            discarded: [],
            played: [],
          } as PlayerCards,
        },
        '1': {
          actionPoints: { current: 0, total: 0 },
          displayName: 'Opponent',
          playerId: '1',
          cards: {
            deck: [],
            hand: [],
            destroyed: [],
            discarded: [],
            played: [],
          } as PlayerCards,
        },
      },
    };

    drawCardFromPlayersDeck(G, '0');

    expect(G.counts['0'].deck).toBe(0);
    expect(G.counts['0'].hand).toBe(1);

    expect(G.players['0'].cards.deck).toHaveLength(0);
    expect(G.players['0'].cards.hand).toHaveLength(1);
    expect(G.players['0'].cards.hand).toStrictEqual([testCardObj]);
  });

  test('Should multiple cards if to the provided amount', () => {
    const testCardBase = { id: 'testCard', name: 'cardy', cost: 1, power: 0 };
    const testCardObj = createCardObject(testCardBase);

    let G = {
      ...defaultState,
      counts: {
        '0': setUpCounts(3, 1),
        '1': setUpCounts(),
      },
      players: {
        '0': {
          actionPoints: { current: 0, total: 0 },
          displayName: 'Player',
          playerId: '0',
          cards: {
            deck: [testCardObj, testCardObj, testCardObj],
            hand: [testCardObj],
            destroyed: [],
            discarded: [],
            played: [],
          } as PlayerCards,
        },
        '1': {
          actionPoints: { current: 0, total: 0 },
          displayName: 'Opponent',
          playerId: '1',
          cards: {
            deck: [],
            hand: [],
            destroyed: [],
            discarded: [],
            played: [],
          } as PlayerCards,
        },
      },
    };

    drawCardFromPlayersDeck(G, '0', 3);

    expect(G.counts['0'].deck).toBe(0);
    expect(G.counts['0'].hand).toBe(4);

    expect(G.players['0'].cards.deck).toHaveLength(0);
    expect(G.players['0'].cards.hand).toHaveLength(4);
    expect(G.players['0'].cards.hand).toStrictEqual([
      testCardObj,
      testCardObj,
      testCardObj,
      testCardObj,
    ]);
  });

  test("Should draw no card(s) if the player's hand is full", () => {
    const testCardBase = { id: 'testCard', name: 'cardy', cost: 1, power: 0 };
    const testCardObj = createCardObject(testCardBase);

    let G = {
      ...defaultState,
      counts: {
        '0': setUpCounts(3, 8),
        '1': setUpCounts(),
      },
      players: {
        '0': {
          actionPoints: { current: 0, total: 0 },
          displayName: 'Player',
          playerId: '0',
          cards: {
            deck: [testCardObj, testCardObj, testCardObj],
            hand: [
              testCardObj,
              testCardObj,
              testCardObj,
              testCardObj,
              testCardObj,
              testCardObj,
              testCardObj,
              testCardObj,
            ],
            destroyed: [],
            discarded: [],
            played: [],
          } as PlayerCards,
        },
        '1': {
          actionPoints: { current: 0, total: 0 },
          displayName: 'Opponent',
          playerId: '1',
          cards: {
            deck: [],
            hand: [],
            destroyed: [],
            discarded: [],
            played: [],
          } as PlayerCards,
        },
      },
    };

    drawCardFromPlayersDeck(G, '0');

    expect(G.counts['0'].deck).toBe(3);
    expect(G.counts['0'].hand).toBe(8);

    expect(G.players['0'].cards.deck).toHaveLength(3);
    expect(G.players['0'].cards.hand).toHaveLength(8);
    expect(G.players['0'].cards.hand).toStrictEqual([
      testCardObj,
      testCardObj,
      testCardObj,
      testCardObj,
      testCardObj,
      testCardObj,
      testCardObj,
      testCardObj,
    ]);
  });

  test("Should stop drawing card(s) when the player's hand gets full", () => {
    const testCardBase = { id: 'testCard', name: 'cardy', cost: 1, power: 0 };
    const testCardObj = createCardObject(testCardBase);

    let G = {
      ...defaultState,
      counts: {
        '0': setUpCounts(3, 6),
        '1': setUpCounts(),
      },
      players: {
        '0': {
          actionPoints: { current: 0, total: 0 },
          displayName: 'Player',
          playerId: '0',
          cards: {
            deck: [testCardObj, testCardObj, testCardObj],
            hand: [
              testCardObj,
              testCardObj,
              testCardObj,
              testCardObj,
              testCardObj,
              testCardObj,
            ],
            destroyed: [],
            discarded: [],
            played: [],
          } as PlayerCards,
        },
        '1': {
          actionPoints: { current: 0, total: 0 },
          displayName: 'Opponent',
          playerId: '1',
          cards: {
            deck: [],
            hand: [],
            destroyed: [],
            discarded: [],
            played: [],
          } as PlayerCards,
        },
      },
    };

    drawCardFromPlayersDeck(G, '0', 3);

    expect(G.counts['0'].deck).toBe(1);
    expect(G.counts['0'].hand).toBe(8);

    expect(G.players['0'].cards.deck).toHaveLength(1);
    expect(G.players['0'].cards.hand).toHaveLength(8);
    expect(G.players['0'].cards.hand).toStrictEqual([
      testCardObj,
      testCardObj,
      testCardObj,
      testCardObj,
      testCardObj,
      testCardObj,
      testCardObj,
      testCardObj,
    ]);
  });

  test("Should not draw card(s) when the player's deck is empty", () => {
    const testCardBase = { id: 'testCard', name: 'cardy', cost: 1, power: 0 };
    const testCardObj = createCardObject(testCardBase);

    let G = {
      ...defaultState,
      counts: {
        '0': setUpCounts(3, 0),
        '1': setUpCounts(),
      },
      players: {
        '0': {
          actionPoints: { current: 0, total: 0 },
          displayName: 'Player',
          playerId: '0',
          cards: {
            deck: [testCardObj, testCardObj, testCardObj],
            hand: [],
            destroyed: [],
            discarded: [],
            played: [],
          } as PlayerCards,
        },
        '1': {
          actionPoints: { current: 0, total: 0 },
          displayName: 'Opponent',
          playerId: '1',
          cards: {
            deck: [],
            hand: [],
            destroyed: [],
            discarded: [],
            played: [],
          } as PlayerCards,
        },
      },
    };

    drawCardFromPlayersDeck(G, '0', 5);

    expect(G.counts['0'].deck).toBe(0);
    expect(G.counts['0'].hand).toBe(3);

    expect(G.players['0'].cards.deck).toHaveLength(0);
    expect(G.players['0'].cards.hand).toHaveLength(3);
    expect(G.players['0'].cards.hand).toStrictEqual([
      testCardObj,
      testCardObj,
      testCardObj,
    ]);
  });
});
