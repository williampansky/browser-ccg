import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AppConfig } from '../../types';
import appConfig from '../../app.config';

const initialState: AppConfig = appConfig;

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setConfig: (state, { payload }: PayloadAction<AppConfig>) => {
      return payload;
    },
  },
});

export const { setConfig } = configSlice.actions;
export default configSlice.reducer;
