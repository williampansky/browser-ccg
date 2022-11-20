import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

const initialState: number = 0;

export const addressBarSizeSlice = createSlice({
  name: 'addressBarSize',
  initialState,
  reducers: {
    setAddressBarSize: (state, { payload }: PayloadAction<number>) => {
      return payload;
    },
  },
});

export const { setAddressBarSize } = addressBarSizeSlice.actions;
export default addressBarSizeSlice.reducer;
