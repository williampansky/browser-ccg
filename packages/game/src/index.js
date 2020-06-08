import React from 'react';
import ReactDOM from 'react-dom';
import Game from './Game';
// import GameLobby from './GameLobby';
import './index.scss';

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./Game', () => {
    const Game = require('./Game').default;
    ReactDOM.render(<Game />, document.getElementById('root'));
  });
}

ReactDOM.render(<Game />, document.getElementById('root'));
