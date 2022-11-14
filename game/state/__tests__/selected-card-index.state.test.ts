import { selectedCardIndex } from '..';
import { mockGameState } from '../../test-utils';

describe('Handles G.selectedCardIndex state manipulation', () => {
  test('Should return the default state', () => {
    const defaultStateCheck = {
      '0': undefined,
      '1': undefined
    }

    const fn = selectedCardIndex.defaultState;
    expect(fn).toStrictEqual(defaultStateCheck);
  });

  test('Should set the player\'s selected card index', () => {
    let G = mockGameState('selectedCardIndex');

    selectedCardIndex.set(G, '0', 2);
    
    expect(G.selectedCardIndex['0']).toBe(2); // should change
    expect(G.selectedCardIndex['1']).toBeUndefined(); // shouldn't change
  });

  test('Should set the player\'s selected card to undefined', () => {
    let G = mockGameState('selectedCardIndex', 1);
    selectedCardIndex.reset(G, '0');
    
    expect(G.selectedCardIndex['0']).toBeUndefined();
    expect(G.selectedCardIndex['1']).toBeUndefined();
  });
});
