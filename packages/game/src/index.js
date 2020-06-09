import React from 'react';
import ReactDOM from 'react-dom';
// import Game from './Game';
import GameLocal from './GameLocal';
// import GameLobby from './GameLobby';
import './index.scss';

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./GameLocal', () => {
    const GameLocal = require('./GameLocal').default;
    ReactDOM.render(<GameLocal />, document.getElementById('root'));
  });
}

ReactDOM.render(<GameLocal />, document.getElementById('root'));
