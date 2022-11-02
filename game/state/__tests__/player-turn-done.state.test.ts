import { playerTurnDone } from '..';
import { mockGameState } from '../../test-utils';

describe('Handles G.playerTurnDone state manipulation', () => {
  test('Should return the default state', () => {
    const defaultStateCheck = {
      '0': false,
      '1': false,
    };

    const fn = playerTurnDone.defaultState;
    expect(fn).toStrictEqual(defaultStateCheck);
  });

  test("Should set the player's turn boolean to true", () => {
    let G = mockGameState('playerTurnDone');

    playerTurnDone.set(G, '0');
    playerTurnDone.set(G, '1');

    expect(G.playerTurnDone['0']).toBe(true);
    expect(G.playerTurnDone['1']).toBe(true);
  });

  test("Should reset both player's turn boolean to false", () => {
    let G = mockGameState('playerTurnDone', true, false);

    playerTurnDone.reset(G);

    expect(G.playerTurnDone['0']).toBe(false);
    expect(G.playerTurnDone['1']).toBe(false);
  });
});
