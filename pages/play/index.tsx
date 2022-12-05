import { Fragment, FunctionComponent } from 'react';
import { EffectsBoardWrapper } from 'bgio-effects/react';
import { Client as BoardgameClient } from 'boardgame.io/react';
import { Local, SocketIO } from 'boardgame.io/multiplayer';
import { MCTSBot, RandomBot } from 'boardgame.io/ai';
import { Provider } from 'react-redux';
import { v4 as uuid } from 'uuid';

import { store } from '../../store';
import { BrowserCCG } from '../../game';
import { gameConfig } from '../../app.config';
import { useGlobalGameStyles } from '../../hooks';
import { Board } from '../../components/game-components/Board/Board';

const getBot = () => {
  if (gameConfig.ai.botToUse === 'MCTSBot') return MCTSBot;
  if (gameConfig.ai.botToUse === 'RandomBot') return RandomBot;
}

const MultiplayerSetup = (isMultiplayer: boolean = false) => {
  if (isMultiplayer) return SocketIO();

  return Local({
    bots: gameConfig.ai.enableBotAi ? { 1: getBot() } : undefined,
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
  numPlayers: gameConfig.ai.enableBotAi ? 1 : 2,
  debug: gameConfig.debugConfig.showBoardgameIoSidebar,
});

const BrowserCcgPage: FunctionComponent = (props) => {
  useGlobalGameStyles();

  return (
    <Fragment>
      <Provider store={store}>
        <BrowserCcgClient
          playerID={getInitialProps().playerID}
          matchID={uuid()}
        />
      </Provider>
    </Fragment>
  );
};

export default BrowserCcgPage;
