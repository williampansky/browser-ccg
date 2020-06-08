import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import PlayerShield from './PlayerShieldV2';

export default function PlayerHealth({
  health,
  player,
  shieldPoints,
  wasAttacked
}) {
  const [animation, setAnimation] = useState(false);

  useEffect(() => {
    setAnimation(true);
    setTimeout(() => {
      setAnimation(false);
    }, 200);
  }, [wasAttacked]);

  return (
    <Component data-file="player-health/PlayerHealth" player={player}>
      <HealthValue animation={animation} health={health}>
        {health}
      </HealthValue>
      <PlayerShield player={player} shieldPoints={shieldPoints} />
      <Badge src={`assets/card-assets/ic_health.png`} />
    </Component>
  );
}

PlayerHealth.propTypes = {
  health: PropTypes.number,
  player: PropTypes.string,
  shieldPoints: PropTypes.number,
  wasAttacked: PropTypes.bool
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
  top: 20%;
  bottom: auto;
  right: auto;
  left: -15%;

  &:after {
    border-radius: 50%;
    box-shadow: 0px 1px 8px rgba(0, 0, 0, 0.625);
    content: '';
    height: 100%;
    width: 100%;
    position: absolute;
  }
`;

const Badge = styled.img`
  height: 80px;
  right: -15px;
  top: -15px;
  position: absolute;
  z-index: 0;
`;

const HealthValue = styled.div`
  position: absolute;
  z-index: 1;
  color: ${p =>
    p.animation ? '#ff3535' : p.health < 30 ? '#ff3535' : 'white'};
  font-size: 1em;
  line-height: 1;
  font-family: 'Carter One', sans-serif;
  pointer-events: none;
  width: 45px;
  height: 45px;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
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
