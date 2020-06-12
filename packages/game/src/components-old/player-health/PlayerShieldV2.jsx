import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

export default function PlayerShield({ player, shieldPoints }) {
  const [animation, setAnimation] = useState(false);

  useEffect(() => {
    setAnimation(true);
    setTimeout(() => {
      setAnimation(false);
    }, 200);
  }, [shieldPoints]);

  return shieldPoints >= 1 ? (
    <Component data-file="player-health/PlayerShield" player={player}>
      <HealthValue animation={animation}>{shieldPoints}</HealthValue>
      <Badge src={`assets/card-assets/ic_energy.png`} />
    </Component>
  ) : null;
}

PlayerShield.propTypes = {
  player: PropTypes.string,
  shieldPoints: PropTypes.number
};

const Badge = styled.img`
  height: 35px;
  right: 2px;
  top: 6px;
  left: 0px;
  position: absolute;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
`;

const Component = styled.div`
  position: absolute;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  height: calc(var(--player-health-size) / 1.5);
  width: calc(var(--player-health-size) / 1.5);
  z-index: 1;
  bottom: calc(var(--player-health-size) * 0.875);
  left: calc(var(--player-health-size) * -0.175);
`;

const HealthValue = styled.div`
  position: absolute;
  font-size: 18px;
  width: 25px;
  height: 25px;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  top: 11px;
  left: 4.5px;
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
  transform: ${p => (p.animation ? 'scale(1.5)' : 'scale(1)')};
`;
