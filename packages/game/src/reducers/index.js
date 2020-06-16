import { combineReducers } from '@reduxjs/toolkit';

import configSlice from 'features/config.slice';

const rootReducer = combineReducers({
  config: configSlice
});

export default rootReducer;
