import React from 'react';
import PropTypes from 'prop-types';
import GameMenuTrigger from './GameMenuTrigger';
import ForfeitGameButton from './ForfeitGameButton';

export default function GameMenu({
  G,
  moves,
  isActive,
  yourID,
  showMenu,
  toggleMenuFn,
  gameWidth
}) {
  return (
    <div
      data-file="GameMenu"
      className="game-menu"
      style={{ width: `${gameWidth}px` }}
    >
      <GameMenuTrigger showMenu={showMenu} toggleMenuFn={toggleMenuFn} />
      <h1>Menu</h1>
      <ForfeitGameButton moves={moves} isActive={isActive} yourID={yourID} />
    </div>
  );
}

GameMenu.propTypes = {
  G: PropTypes.object,
  moves: PropTypes.object,
  isActive: PropTypes.bool,
  yourID: PropTypes.string,
  showMenu: PropTypes.bool,
  toggleMenuFn: PropTypes.func,
  gameWidth: PropTypes.number
};
