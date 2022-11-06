import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { GameOver } from '../../../../types/g.interface';

const initialState: GameOver = {
  draw: undefined,
  winner: undefined
};

export const gameOverSlice = createSlice({
  name: 'gameOver',
  initialState,
  reducers: {
    setGameOver: (state, { payload }: PayloadAction<any>) => {
      return payload;
    },
  },
});

export const { setGameOver } = gameOverSlice.actions;

export default gameOverSlice.reducer;
