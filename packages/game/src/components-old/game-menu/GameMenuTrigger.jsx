import React from 'react';

export default function GameMenuTrigger({ showMenu, toggleMenuFn }) {
  return (
    <div
      data-file="GameMenuTrigger"
      className={['game-menu-trigger', showMenu ? 'active' : ''].join(' ')}
      onClick={toggleMenuFn}
    >
      Menu
    </div>
  );
}
