import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ReactSVG } from 'react-svg';
import svg from 'assets/svgs/sphere.svg';
import PlayerShield from 'components/game/player-health/PlayerShield';

export default function PlayerHealth({ health, player, shieldPoints }) {
  const [animation, setAnimation] = useState(false);

  useEffect(() => {
    setAnimation(true);
    setTimeout(() => {
      setAnimation(false);
    }, 200);
  }, [health]);

  return (
    <Component data-file="player-health/PlayerHealth" player={player}>
      <ReactSVG className="svg" src={svg} />
      <HealthValue animation={animation} health={health}>
        {health}
      </HealthValue>
      <PlayerShield player={player} shieldPoints={shieldPoints} />
    </Component>
  );
}

PlayerHealth.propTypes = {
  health: PropTypes.number,
  player: PropTypes.string,
  shieldPoints: PropTypes.number
};

const Component = styled.div`
  align-items: center;
  border-radius: 50%;
  display: flex;
  flex-flow: column nowrap;
  font-size: 22px;
  font-weight: bold;
  height: var(--player-health-size);
  justify-content: center;
  pointer-events: none;
  position: absolute;
  width: var(--player-health-size);
  z-index: 1;

  top: ${p => (p.player === 'YourHealth' ? '20%' : 'auto')};
  bottom: ${p => (p.player === 'YourHealth' ? 'auto' : '20%')};
  right: ${p => (p.player === 'YourHealth' ? 'auto' : '-15%')};
  left: ${p => (p.player === 'YourHealth' ? '-15%' : 'auto')};

  .svg {
    width: var(--player-health-size);
    height: var(--player-health-size);
  }

  &:before {
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.25);
    content: '';
    height: 100%;
    width: 100%;
    position: absolute;
    z-index: 1;
  }

  &:after {
    border-radius: 50%;
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
  color: ${p => (p.health < 30 ? '#ff3535' : 'white')};
  font-size: 1em;
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
  transform: ${p => (p.animation ? 'scale(1.5)' : 'scale(1)')};
  transition: transform 100ms ease-in-out;
`;
