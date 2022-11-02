import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Zone } from '../../../../types';
import { defaultState } from '../../../../game/state';

const initialState: Zone[] = defaultState.zones;

export const zonesSlice = createSlice({
  name: 'zones',
  initialState,
  reducers: {
    initZone: (state, { payload }: PayloadAction<{ zoneNumber: number; zoneData: Zone }>) => {
      const { zoneNumber, zoneData } = payload;
      state[zoneNumber] = zoneData;
    },
  },
});

// Action creators are generated for each case reducer function
export const { initZone } = zonesSlice.actions;

export default zonesSlice.reducer;
