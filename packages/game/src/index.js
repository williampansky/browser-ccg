import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from 'store';
import GameLocal from './GameLocal';
import './index.scss';
import * as serviceWorker from './serviceWorker';

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./GameLocal', () => {
    const GameLocal = require('./GameLocal').default;
    ReactDOM.render(
      <Provider store={store}>
        <GameLocal />
      </Provider>,
      document.getElementById('root')
    );
  });
}

ReactDOM.render(
  <Provider store={store}>
    <GameLocal />
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
