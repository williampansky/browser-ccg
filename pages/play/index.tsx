import { Fragment, FunctionComponent } from 'react';
import { EffectsBoardWrapper } from 'bgio-effects/react';
import { Client as BoardgameClient } from 'boardgame.io/react';
import { Local, SocketIO } from 'boardgame.io/multiplayer';
import { MCTSBot } from 'boardgame.io/ai';
import { Provider } from 'react-redux';
import { v4 as uuid } from 'uuid';

import { BrowserCCG } from '../../game';
import { Board } from './Board';
import { store } from './store';
import useGlobalGameStyles from './useGlobalGameStyles';

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
});

const BrowserCcgPage: FunctionComponent = () => {
  useGlobalGameStyles();

  return (
    <Fragment>
      <Provider store={store}>
        <BrowserCcgClient playerID='0' matchID={uuid()} />
      </Provider>
    </Fragment>
  );
};

export default BrowserCcgPage;
