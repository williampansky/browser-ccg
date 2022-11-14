import { selectedCardData } from '../';
import { mockGameState } from '../../test-utils';
import createCardObject from '../../../utils/create-card-object';

describe('Handles G.selectedCardData state manipulation', () => {
  test('Should return the default state', () => {
    const defaultStateCheck = {
      '0': undefined,
      '1': undefined
    }

    const fn = selectedCardData.defaultState;
    expect(fn).toStrictEqual(defaultStateCheck);
  });

  test('Should set the player\'s selected card data object', () => {
    let G = mockGameState('selectedCardData');
    const testCardBase = { id: 'testCard1', name: 'cardy', cost: 1, power: 0 };
    const testCardObj = createCardObject(testCardBase);

    selectedCardData.set(G, '0', testCardObj);
    
    expect(G.selectedCardData['0']).toStrictEqual(testCardObj); // should change
    expect(G.selectedCardData['1']).toBeUndefined(); // shouldn't change
  });

  test('Should set the player\'s selected card to undefined', () => {
    let G = mockGameState('selectedCardData');
    selectedCardData.reset(G, '0');
    
    expect(G.selectedCardData['0']).toBeUndefined(); // should'nt change
    expect(G.selectedCardData['1']).toBeUndefined(); // shouldn't change
  });
});
