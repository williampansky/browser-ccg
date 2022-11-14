import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Card, PlayerID, Zone } from '../../types';
import { defaultState } from '../../game/state';

const initialState: Zone[] = defaultState.zones;

export const zonesSlice = createSlice({
  name: 'zones',
  initialState,
  reducers: {
    initZone: (state, { payload }: PayloadAction<{ zoneNumber: number; zoneData: Zone }>) => {
      const { zoneNumber, zoneData } = payload;
      state[zoneNumber] = zoneData;
    },
    updateZone: (state, { payload }: PayloadAction<{ zoneNumber: number; zoneData: Zone }>) => {
      const { zoneNumber, zoneData } = payload;
      state[zoneNumber] = zoneData;
    },
    updateZoneSide: (state, { payload }: PayloadAction<{ zoneNumber: number; cardData: Card, player: PlayerID }>) => {
      const { cardData, player, zoneNumber } = payload;
      state[zoneNumber].sides[player].push(cardData);
    },
  },
});

// Action creators are generated for each case reducer function
export const { initZone, updateZone, updateZoneSide } = zonesSlice.actions;

export default zonesSlice.reducer;
