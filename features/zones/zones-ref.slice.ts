import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ZonesCardsReference } from '../../types';
import { defaultState } from '../../game/state';

const initialState: ZonesCardsReference[] = defaultState.zonesCardsReference;

export const zonesRefSlice = createSlice({
  name: 'zonesRef',
  initialState,
  reducers: {
    updateZonesRef: (state, { payload }: PayloadAction<any>) => {
      return payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateZonesRef } = zonesRefSlice.actions;

export default zonesRefSlice.reducer;
