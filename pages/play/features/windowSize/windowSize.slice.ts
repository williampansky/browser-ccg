import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

const initialState: {
  width?: number;
  height?: number;
} = {
  width: undefined,
  height: undefined,
};

export const windowSizeSlice = createSlice({
  name: 'windowSize',
  initialState,
  reducers: {
    setWindowSize: (
      state,
      {
        payload,
      }: PayloadAction<{
        width?: number;
        height?: number;
      }>
    ) => {
      const { height, width } = payload;
      state.height = height;
      state.width = width;
    },
  },
});

export const { setWindowSize } = windowSizeSlice.actions;
export default windowSizeSlice.reducer;
