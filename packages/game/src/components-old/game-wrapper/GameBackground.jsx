import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

export default function GameBackground({
  backgroundImage,
  gameWidth,
  gameHeight
}) {
  return (
    <Component
      backgroundImage={backgroundImage}
      data-file="game-wrapper/GameBackground"
      gameWidth={gameWidth}
      gameHeight={gameHeight}
    />
  );
}

const Component = styled.div`
  position: absolute;
  width: ${p => `${p.gameWidth}px`};
  height: ${p => `${p.gameHeight - 40}px`};
  background-image: ${p => `url('${p.backgroundImage}')`};
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  top: 0;
  left: 0;
  pointer-events: none;
`;

GameBackground.propTypes = {
  backgroundImage: PropTypes.string,
  gameWidth: PropTypes.number,
  gameHeight: PropTypes.number
};
