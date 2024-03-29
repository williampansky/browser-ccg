import { configureStore } from '@reduxjs/toolkit';
import {
  addressBarSizeSlice,
  cardModalSlice,
  collectionSlice,
  configSlice,
  decksSlice,
  gameOverSlice,
  popupOverlaysSlice,
  windowSizeSlice,
  zonesRefSlice,
  zonesSlice,
} from './features';

export const store = configureStore({
  reducer: {
    addressBarSize: addressBarSizeSlice,
    cardModal: cardModalSlice,
    collection: collectionSlice,
    config: configSlice,
    decks: decksSlice,
    gameOver: gameOverSlice,
    popupOverlays: popupOverlaysSlice,
    windowSize: windowSizeSlice,
    zones: zonesSlice,
    zonesRef: zonesRefSlice,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
