import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

export default function PlayerWeapon({
  canUse,
  playerAttackValue,
  weaponAttack,
  weaponHealth,
  weaponImageSrc
}) {
  const AP_VALUE = playerAttackValue !== 0 ? playerAttackValue : weaponAttack;
  return (
    <Component
      data-file="player-weapon/PlayerWeapon"
      backgroundImage={weaponImageSrc}
      canUse={canUse}
    >
      <Sphere contentContext="attack">
        <TextValue>{AP_VALUE}</TextValue>
      </Sphere>
      <Sphere contentContext="health">
        <TextValue>{weaponHealth}</TextValue>
      </Sphere>
    </Component>
  );
}

PlayerWeapon.propTypes = {
  canUse: PropTypes.bool,
  playerAttackValue: PropTypes.number,
  weaponAttack: PropTypes.number,
  weaponHealth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  weaponImageSrc: PropTypes.string
};

const b1a = '4px solid rgb(254, 255, 200)';
const b1b = '4px solid rgb(255, 198, 198)';
const b2a = '4px solid rgb(179, 154, 18)';
const b2b = '4px solid rgb(145, 9, 9)';

const Sphere = styled.div`
  align-items: center;
  background: ${p =>
    p.contentContext === 'attack'
      ? 'radial-gradient(circle at 50% 15%, white -10px, rgb(232, 233, 141) 3%, rgb(197, 173, 37) 60%);'
      : 'radial-gradient(circle at 50% 15%, white -10px, rgb(233, 141, 141) 3%, rgb(197, 37, 37) 60%)'};
  border-radius: 50%;
  display: flex;
  flex-flow: column nowrap;
  font-weight: 600;
  height: calc(var(--card-height) / 8);
  justify-content: center;
  position: absolute;
  overflow: hidden;
  user-select: none;
  width: calc(var(--card-height) / 8);
  z-index: 5;
  box-shadow: 0px 0px 1.5px rgba(0, 0, 0, 0.925),
    0px 0px 4px rgba(0, 0, 0, 0.465);

  bottom: 0;
  left: ${p => (p.contentContext === 'attack' ? '0' : 'auto')};
  right: ${p => (p.contentContext === 'attack' ? 'auto' : '0')};

  &:before {
    content: '';
    width: 100%;
    height: 100%;
    background: transparent;
    pointer-events: none;
    border-radius: 50%;
    border-top: ${p => (p.contentContext === 'attack' ? b1a : b1b)};
    border-bottom: ${p => (p.contentContext === 'attack' ? b2a : b2b)};
    filter: blur(2px);
    position: absolute;
    z-index: 0;
  }
`;

const TextValue = styled.div`
  color: white;
  font-family: 'Carter One', sans-serif;
  font-size: 1em;
  line-height: 1;
  position: relative;
  top: 1px;
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

const Component = styled.div`
  align-items: center;
  background-color: black;
  background-image: ${p => `url('${p.backgroundImage}')`};
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  border-radius: var(--weapon-border-radius);
  border-top: 1px solid rgba(255, 255, 255, 0.465);
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
  cursor: default;
  display: flex;
  flex-flow: column nowrap;
  height: 120px;
  justify-content: center;
  position: absolute;
  right: 235px;
  top: 20px;
  user-select: none;
  width: 120px;
  box-shadow: 0px 0px 4.5px rgba(0, 0, 0, 0.925),
    0px 0px 12.5px rgba(0, 0, 0, 0.465);
`;
