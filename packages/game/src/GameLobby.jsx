import React from 'react';
import { hot } from 'react-hot-loader';
// import { Client as BoardgameClient } from 'boardgame.io/react';
import { Lobby } from 'boardgame.io/react';
// import { SocketIO } from 'boardgame.io/multiplayer';
import { ReactCCG } from '@ccg/server';
// import GameWrapper from './components/game-wrapper/GameWrapper';
// import GameLoader from './components/game-loader';
// import './index.css';
// import './styles/game.scss';

const REDUX_DEVTOOLS =
  typeof window !== undefined &&
  window.__REDUX_DEVTOOLS_EXTENSION__ &&
  window.__REDUX_DEVTOOLS_EXTENSION__();

const server = `http://locahost:8000`;
const importedGames = [{ game: ReactCCG }];

const App = () => (
  <div>
    <h1>Lobby</h1>
    <Lobby
      gameServer={server}
      lobbyServer={server}
      gameComponents={importedGames}
    />
  </div>
);

export default hot(module)(App);
