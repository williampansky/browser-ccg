import React from 'react';
import { Client as BoardgameClient } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { ReactCCG } from '@ccg/server';
import GameWrapper from './game-components/GameWrapper';
// import GameLoader from './components/game-loader';

const REDUX_DEVTOOLS =
  typeof window !== undefined &&
  window.__REDUX_DEVTOOLS_EXTENSION__ &&
  window.__REDUX_DEVTOOLS_EXTENSION__();

const Client = BoardgameClient({
  game: ReactCCG,
  board: GameWrapper,
  // loading: GameLoader,
  debug: true,
  multiplayer: Local(),
  enhancer: REDUX_DEVTOOLS
});

class App extends React.Component {
  state = {
    playerID: null,
    playerName: null,
    deck: []
  };

  componentDidMount() {
    const {
      location: { href }
    } = window;

    href.includes('3002')
      ? this.setState({ playerID: '1' })
      : this.setState({ playerID: '0' });

    if (localStorage.getItem('playerName'))
      this.setState({ playerName: localStorage.getItem('playerName') });

    if (localStorage.getItem('deck'))
      this.setState({ deck: JSON.parse(localStorage.getItem('deck')) });
  }

  render() {
    if (this.state.playerID === null) {
      return (
        <div>
          <p>Play as</p>
          <button onClick={() => this.setState({ playerID: '0' })}>
            Player 0
          </button>
          <button onClick={() => this.setState({ playerID: '1' })}>
            Player 1
          </button>
        </div>
      );
    }

    return (
      <React.Fragment>
        <Client
          playerID={this.state.playerID}
          playerName={this.state.playerName}
        />
      </React.Fragment>
    );
  }
}

export default App;
