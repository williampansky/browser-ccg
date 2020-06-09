import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

export default function PlayerShield({ player, shieldPoints }) {
  return shieldPoints >= 1 ? (
    <Component data-file="player-health/PlayerShield" player={player}>
      <HealthValue>{shieldPoints}</HealthValue>
    </Component>
  ) : null;
}

PlayerShield.propTypes = {
  player: PropTypes.string,
  shieldPoints: PropTypes.number
};

const Component = styled.div`
  position: absolute;
  display: flex;
  flex-flow: column nowrap;
  border-radius: 8px;
  border-bottom-left-radius: 50%;
  border-bottom-right-radius: 50%;
  align-items: center;
  pointer-events: none;
  justify-content: center;
  height: calc(var(--player-health-size) / 1.5);
  width: calc(var(--player-health-size) / 1.5);
  background: radial-gradient(#24debe, #11a58b);
  z-index: -1;

  bottom: ${p =>
    p.player === 'YourHealth'
      ? 'calc(var(--player-health-size) * 0.875)'
      : 'calc(var(--player-health-size) * 0.8275)'};
  left: ${p =>
    p.player === 'YourHealth'
      ? 'calc(var(--player-health-size) * -0.175)'
      : 'calc(var(--player-health-size) * 0.375)'};

  .svg {
    width: var(--player-health-size);
    height: var(--player-health-size);
  }

  &:before {
    border-radius: 8px;
    border-bottom-left-radius: 50%;
    border-bottom-right-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.25);
    content: '';
    height: 100%;
    width: 100%;
    position: absolute;
    z-index: 1;
  }

  &:after {
    border-radius: 8px;
    border-bottom-left-radius: 50%;
    border-bottom-right-radius: 50%;
    box-shadow: 0px 1px 8px rgba(0, 0, 0, 0.625);
    content: '';
    height: 100%;
    width: 100%;
    position: absolute;
  }
`;

const HealthValue = styled.div`
  position: absolute;
  z-index: 1;
  color: white;
  font-size: 0.675em;
  line-height: 1;
  font-family: 'Carter One', sans-serif;
  pointer-events: none;
  text-shadow: 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black;
`;
