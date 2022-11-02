import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { gameConfig } from '../../../../config.app';
import type { AppConfig } from '../../../../types';
import { defaultState } from '../../../../game/state';

const initialState: any = null;

export const configSlice = createSlice({
  name: 'configPoints',
  initialState,
  reducers: {
    setConfig: (state, { payload }: PayloadAction<any>) => {
      return payload;
    },
  },
});

export const { setConfig } = configSlice.actions;

export default configSlice.reducer;
