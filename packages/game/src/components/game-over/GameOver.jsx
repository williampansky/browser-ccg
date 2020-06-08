import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

export default function GameOver({
  gameWidth,
  gameHeight,
  yourID,
  theirID,
  winner
}) {
  return (
    <Component
      data-file="game-over/GameOver"
      className={'game-over'}
      gameWidth={gameWidth}
      gameHeight={gameHeight}
    >
      {winner === yourID ? (
        <h1>Victory is yours!</h1>
      ) : (
        <h1>You have been defeated!</h1>
      )}
    </Component>
  );
}

const Component = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  z-index: 9001;
  width: ${p => `${p.gameWidth}px`};
  height: ${p => `${p.gameHeight - 40}px`};

  * {
    user-select: none;
  }

  h1 {
    animation: fadeInText 800ms ease-in-out forwards;
    color: white;
    text-align: center;
  }
`;

GameOver.propTypes = {
  gameWidth: PropTypes.number,
  gameHeight: PropTypes.number,
  yourID: PropTypes.string,
  theirID: PropTypes.string,
  winner: PropTypes.string
};
