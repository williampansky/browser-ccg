import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './store';
import Game from './Game';
import './index.scss';
import * as serviceWorker from './serviceWorker';

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./Game', () => {
    const Game = require('./Game').default;
    ReactDOM.render(
      <Provider store={store}>
        <Game />
      </Provider>,
      document.getElementById('root')
    );
  });
}

ReactDOM.render(
  <Provider store={store}>
    <Game />
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
