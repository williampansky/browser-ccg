import { GameState } from '../../types';
import { defaultState } from '../state';

const mockGameState = (
  mockKey?: string,
  mockValueForPlayer0?: any,
  mockValueForPlayer1?: any
): GameState => {
  const mockedDefaultGameState = {
    ...defaultState
  }

  if (mockKey) {
    const mockedModifiedGameState = {
      ...defaultState,
      [`${mockKey}`]: {
        '0': mockValueForPlayer0
          ? mockValueForPlayer0
          // @ts-ignore
          : defaultState[`${mockKey}`]['0'],
        '1': mockValueForPlayer1
          ? mockValueForPlayer1
          // @ts-ignore
          : defaultState[`${mockKey}`]['1'],
      },
    };

    return mockedModifiedGameState;
  }

  return mockedDefaultGameState;
};

export default mockGameState;
