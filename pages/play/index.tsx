import { Fragment, FunctionComponent } from 'react';
import { Client } from 'boardgame.io/react';
import { BrowserCCG } from '../../game';
import { SocketIO } from 'boardgame.io/multiplayer';

import { Client as BoardgameClient } from 'boardgame.io/react';
import { EffectsBoardWrapper } from 'bgio-effects/react';
import { Local } from 'boardgame.io/multiplayer';
import { MCTSBot } from 'boardgame.io/ai';
import { Board } from './Board';
import { v4 as uuid } from 'uuid';
import { store } from './store';
import { Provider } from 'react-redux';
import Head from 'next/head';
import { noOverlayWorkaroundScript } from '../_app';
// import '../../styles/game.scss';

// @todo figure out better solution here
declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: any;
  }
}

// const REDUX_DEVTOOLS =
//   typeof window !== 'undefined' &&
//   window?.__REDUX_DEVTOOLS_EXTENSION__ &&
//   window?.__REDUX_DEVTOOLS_EXTENSION__();

const MultiplayerSetup = (isMultiplayer: boolean = false) => {
  if (isMultiplayer) return SocketIO();

  return Local({
    bots: { 1: MCTSBot },
    persist: false,
    storageKey: 'bgio',
  });
};

export const getInitialProps = () => ({
  playerID: '0',
});

const BrowserCcgClient = BoardgameClient({
  game: BrowserCCG,
  board: EffectsBoardWrapper(Board, { updateStateAfterEffects: true }),
  multiplayer: MultiplayerSetup(),
  numPlayers: 1,
  debug: false,
  // enhancer: REDUX_DEVTOOLS,
});

const BrowserCcgPage: FunctionComponent = () => {
  return (
    <Fragment>
      <Provider store={store}>
        <BrowserCcgClient playerID='0' matchID={uuid()} />
      </Provider>
    </Fragment>
  );
};

export default BrowserCcgPage;
