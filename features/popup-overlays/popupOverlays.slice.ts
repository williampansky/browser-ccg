import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Card } from '../../types';

interface Props {
  discardedCard?: Card;
}

const initialState: Props = {
  discardedCard: undefined
};

export const popupOverlaysSlice = createSlice({
  name: 'popupOverlays',
  initialState,
  reducers: {
    setDiscardedCard: (state, { payload }: PayloadAction<any>) => {
      state.discardedCard = payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setDiscardedCard } = popupOverlaysSlice.actions;

export default popupOverlaysSlice.reducer;
