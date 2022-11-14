import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { defaultState } from '../../game/state';

const initialState: any = null;

export const movesSlice = createSlice({
  name: 'actionPoints',
  initialState,
  reducers: {
    setPlayerDone: (state, { payload }: PayloadAction<any>) => {
      return payload;
    },
  },
});

export const { setPlayerDone } = movesSlice.actions;

export default movesSlice.reducer;
