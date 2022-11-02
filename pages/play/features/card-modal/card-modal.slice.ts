import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Card } from '../../../../types';

export type CardModal = Card | null;
const initialState: CardModal = null;

export const cardModalSlice = createSlice({
  name: 'cardModal',
  initialState,
  reducers: {
    hideCardModal: (state, action: PayloadAction<any>) => {
      return action.payload || null;
    },
    showCardModal: (state, { payload }: PayloadAction<any>) => {
      return payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { hideCardModal, showCardModal } = cardModalSlice.actions;

export default cardModalSlice.reducer;
