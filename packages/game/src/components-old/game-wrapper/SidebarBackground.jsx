import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

export default function SidebarBackground({
  backgroundImage,
  gameWidth,
  gameHeight
}) {
  return (
    <Component
      backgroundImage={backgroundImage}
      data-file="game-wrapper/SidebarBackground"
      gameWidth={gameWidth}
      gameHeight={gameHeight}
    />
  );
}

const Component = styled.div`
  background-image: ${p => `url('${p.backgroundImage}')`};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center center;
  /* display: none; */
  height: 100%;
  pointer-events: auto;
  position: absolute;
  top: 0;
  right: 0;
  /* width: ${p => `calc(${p.gameWidth}px / 5.5)`}; */
  width: 487px;
  box-sizing: border-box;
  color: white;
  font-size: 12px;
  overflow: hidden;
  font-family: 'Verdana', sans-serif;
  margin: 0 0 0 auto;
  z-index: 0;
  pointer-events: none;
`;

SidebarBackground.propTypes = {
  backgroundImage: PropTypes.string,
  gameWidth: PropTypes.number,
  gameHeight: PropTypes.number
};
