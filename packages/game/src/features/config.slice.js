import { createSlice } from '@reduxjs/toolkit';

let initialState = {};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {}
});

// export const { setCurrentStep } = configSlice.actions;
export default configSlice.reducer;
