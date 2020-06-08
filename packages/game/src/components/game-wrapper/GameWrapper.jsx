import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// child components
import Board from '../boards/Board';
import GameBackground from './GameBackground';
import GameMenu from '../game-menu/GameMenu';
import GameOver from '../game-over/GameOver';
import LastPlayedCard from '../LastPlayedCard';
import MatchHistory from '../match-history/MatchHistory';
import PlayerSidebar from '../player-sidebar/PlayerSidebar';
import ResizeObserver from './ResizeObserver';
import TheirHand from '../hands/TheirHand';
import YourCardSelection from '../card-selection/YourCardSelection';
import YourHand from '../hands/YourHand';

export default function GameWrapper(props) {
  // global state manipulations
  const [{ showMenu }, setShowMenu] = useState({ showMenu: false });

  // props destructuring
  const {
    G,
    ctx,
    moves,
    events,
    reset,
    undo,
    redo,
    step,
    log,
    gameID,
    playerID,
    gameMetadata,
    isActive,
    isMultiplayer,
    isConnected,
    credentials
  } = props;
  const { cardBack, health, allPlayedCards, initHandsSelection, winner } = G;
  const { phase, gameover } = ctx;
  const { setGameWinner } = moves;

  // id declarations
  const yourID = playerID === '0' ? '0' : '1';
  const theirID = playerID === '0' ? '1' : '0';

  // toggle game menu
  function toggleMenu() {
    return !showMenu
      ? setShowMenu({ showMenu: true })
      : setShowMenu({ showMenu: false });
  }

  const escFunction = useCallback(
    event => {
      if (event.keyCode === 27) {
        !showMenu
          ? setShowMenu({ showMenu: true })
          : setShowMenu({ showMenu: false });
      }
    },
    [showMenu]
  );

  useEffect(() => {
    document.addEventListener('keydown', escFunction, false);

    return () => {
      document.removeEventListener('keydown', escFunction, false);
    };
  }, [escFunction]);

  useEffect(() => {
    document.body.style.width = `${1920}px`;
    document.body.style.height = `${1080 - 40}px`;
  }, []);

  // health declarations
  const YOUR_HEALTH = G && health && health[yourID];
  const THEIR_HEALTH = G && health && health[theirID];

  useEffect(() => {
    if (YOUR_HEALTH === 0) setGameWinner(theirID);
    if (THEIR_HEALTH === 0) setGameWinner(yourID);
  }, [YOUR_HEALTH, THEIR_HEALTH, setGameWinner]);

  return props ? (
    <React.Fragment>
      <div
        data-file="GameWrapper"
        className={[
          'game-wrapper',
          gameover && winner === theirID ? 'game-over defeat' : '',
          gameover && winner === yourID ? 'game-over victory' : ''
        ].join(' ')}
      >
        <TheirHand
          G={G}
          cardBackSrc={cardBack && cardBack[theirID]}
          theirID={theirID}
          toggleMenuFn={() => toggleMenu()}
          gameWidth={1920}
        />
        <Board
          G={G}
          ctx={ctx}
          moves={moves}
          events={events}
          reset={reset}
          undo={undo}
          redo={redo}
          step={step}
          log={log}
          gameID={gameID}
          playerID={playerID}
          gameMetadata={gameMetadata}
          isActive={isActive}
          isMultiplayer={isMultiplayer}
          isConnected={isConnected}
          credentials={credentials}
          yourID={yourID}
          theirID={theirID}
          gameWidth={1920}
        />
        <YourHand
          G={G}
          ctx={ctx}
          moves={moves}
          isActive={isActive}
          cardBackSrc={cardBack && cardBack[yourID]}
          yourID={yourID}
          gameWidth={1920}
        />
        <GameBackground
          backgroundImage="assets/images/boards/BOARD.jpg"
          // backgroundImage="assets/images/Uldaman_Board.jpg"
          gameWidth={1920}
          gameHeight={1080}
        />
        {/* <SidebarBackground
          backgroundImage="assets/SIDEBAR.png"
          gameWidth={1920}
          gameHeight={1080}
        /> */}
      </div>

      {gameover && (
        <GameOver
          gameWidth={1920}
          gameHeight={1080}
          theirID={theirID}
          yourID={yourID}
          winner={winner}
        />
      )}

      {showMenu && (
        <GameMenu
          G={G}
          moves={moves}
          isActive={isActive}
          yourID={yourID}
          showMenu={showMenu}
          toggleMenuFn={() => toggleMenu()}
          gameWidth={1920}
        />
      )}

      {phase === 'initHands' ? (
        <YourCardSelection
          G={G}
          ctx={ctx}
          moves={moves}
          isActive={isActive}
          yourID={yourID}
          data={initHandsSelection[yourID]}
        />
      ) : null}

      <LastPlayedCard G={G} ctx={ctx} array={allPlayedCards} />

      <MatchHistory G={G} ctx={ctx} gameWidth={1920} gameHeight={1080} />
      <PlayerSidebar
        G={G}
        ctx={ctx}
        gameWidth={1920}
        gameHeight={1080}
        moves={moves}
        events={events}
        isActive={isActive}
        yourID={yourID}
        theirID={theirID}
      />
      <ResizeObserver moves={moves} />
    </React.Fragment>
  ) : null;
}

GameWrapper.propTypes = {
  G: PropTypes.object,
  ctx: PropTypes.object,
  moves: PropTypes.object,
  events: PropTypes.object,
  reset: PropTypes.func,
  undo: PropTypes.func,
  redo: PropTypes.func,
  step: PropTypes.func,
  log: PropTypes.array,
  gameID: PropTypes.string,
  playerID: PropTypes.string,
  gameMetadata: PropTypes.object,
  isActive: PropTypes.bool,
  isMultiplayer: PropTypes.bool,
  isConnected: PropTypes.bool,
  credentials: PropTypes.string
};
