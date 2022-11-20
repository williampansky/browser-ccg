import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Card } from '../../types';

const initialState: Card[] = [];

export const collectionSlice = createSlice({
  name: 'collection',
  initialState,
  reducers: {
    setCollection: (state, { payload }: PayloadAction<Card[]>) => {
      return payload;
    },
  },
});

export const { setCollection } = collectionSlice.actions;
export default collectionSlice.reducer;
