import { playedCards } from '../';
import { mockGameState } from '../../test-utils';
import createCardObject from '../../../utils/create-card-object';

describe('Handles G.playedCards state manipulation', () => {
  test('Should return the default state', () => {
    const defaultStateCheck = {
      '0': [],
      '1': [],
    };

    const fn = playedCards.defaultState;
    expect(fn).toStrictEqual(defaultStateCheck);
  });

  test("Should push a Card object the player's playedCards array", () => {
    let G = mockGameState();
    const testCardBase = { id: 'testCard1', name: 'cardy', cost: 1, power: 0 };
    const testCardObj = createCardObject(testCardBase);

    playedCards.push(G, '0', testCardObj);

    expect(G.playedCards['0']).toStrictEqual([testCardObj]);
    expect(G.playedCards['0']).toHaveLength(1);
    expect(G.playedCards['1']).toEqual([]);
    expect(G.playedCards['1']).toHaveLength(0);
  });
});
