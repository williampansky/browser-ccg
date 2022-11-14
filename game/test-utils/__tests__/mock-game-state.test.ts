import { mockGameState } from '..';
import { defaultState } from '../../state';

describe('Handles creating a mock object of the GameState', () => {
  test('Should return the default state when no modifications are provided', () => {
    const fn = mockGameState();
    expect(fn).toStrictEqual(defaultState);
  });

  test('Should return the default state when only the mockKey is passed', () => {
    expect(mockGameState('actionPoints')).toStrictEqual(defaultState);
    expect(mockGameState('counts')).toStrictEqual(defaultState);
    expect(mockGameState('playerTurnDone')).toStrictEqual(defaultState);
  });

  test('Should return the modified state when options are passed', () => {
    const apForPlayer0 =  { current: 2, total: 4 }
    expect(mockGameState('actionPoints', apForPlayer0)).toStrictEqual({
      ...defaultState,
      actionPoints: {
        '0': apForPlayer0,
        '1': { current: 0, total: 0 }
      }
    });

    const countsP0 = { hand: 5, deck: 15 };
    const countsP1 = { hand: 10, deck: 10 };
    expect(mockGameState('counts', countsP0, countsP1)).toStrictEqual({
      ...defaultState,
      counts: {
        '0': countsP0,
        '1': countsP1
      }
    });

    expect(mockGameState('playerTurnDone', true, false)).toStrictEqual({
      ...defaultState,
      playerTurnDone: {
        '0': true,
        '1': false
      }
    });
  });
});
