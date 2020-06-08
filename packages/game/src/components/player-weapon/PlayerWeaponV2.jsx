import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { PLAYER_BOARDS } from '@ccg/enums';

export default function PlayerWeapon({
  board,
  canUse,
  playerAttackValue,
  weapon
}) {
  const { attack, health, id, set } = weapon;
  const AP_VALUE = playerAttackValue !== 0 ? playerAttackValue : attack;

  return (
    <Component
      data-file="player-weapon/PlayerWeapon"
      board={board}
      canUse={canUse}
    >
      <Image wID={id} set={set} />

      <AttackWrapper data-value={AP_VALUE}>
        <TextValue className={'text__value'}>{AP_VALUE}</TextValue>
        <img alt="" src={'assets/card-assets/ic_attack.png'} />
      </AttackWrapper>
      <HealthWrapper data-value={health}>
        <TextValue className={'text__value'}>{health}</TextValue>
        <img alt="" src={'assets/card-assets/ic_health.png'} />
      </HealthWrapper>

      <Sphere src={`assets/card-assets/Class_Skill_Sphere.png`} />
    </Component>
  );
}

const AttackWrapper = styled.div`
  border-radius: 50%;
  bottom: 0;
  font-size: 1em;
  font-weight: 600;
  height: calc(var(--minion-height) / 3.5);
  left: 0;
  line-height: 1;
  position: absolute;
  width: calc(var(--minion-height) / 3.5);
  z-index: 5;

  img {
    border-radius: 50%;
    height: calc(var(--minion-height) / 3.5);
    width: calc(var(--minion-height) / 3.5);
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 0;
  }
`;

const HealthWrapper = styled.div`
  border-radius: 50%;
  bottom: 0;
  font-size: 1em;
  font-weight: 600;
  height: calc(var(--minion-height) / 3.5);
  right: 0;
  line-height: 1;
  position: absolute;
  width: calc(var(--minion-height) / 3.5);
  z-index: 5;

  img {
    border-radius: 50%;
    height: calc(var(--minion-height) / 3.5);
    width: calc(var(--minion-height) / 3.5);
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 0;
  }
`;

const Sphere = styled.img`
  height: 150px;
  right: -15px;
  top: -12px;
  position: absolute;
  pointer-events: none;
`;

const Image = styled.div`
  height: 100px;
  width: 100px;
  right: 9px;
  top: 10px;
  position: absolute;
  background-image: ${p =>
    `url('assets/images/sets/${p.set}/${p.wID}-CARD.jpg')`};
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: 50%;
  border-top: 1px solid rgba(255, 255, 255, 1);
  border-bottom: 1px solid rgba(0, 0, 0, 1);
  z-index: 1;

  &:before {
    content: ${p => (p.board === PLAYER_BOARDS[1] ? '' : 'none')};
    width: 100%;
    height: 100%;
    background: transparent;
    pointer-events: none;
    border-radius: 50%;
    position: absolute;
    background: rgba(0, 0, 0, 0.15);
  }
`;

const TextValue = styled.div`
  color: white;
  font-family: 'Carter One', sans-serif;
  text-align: center;
  pointer-events: none;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  z-index: 2;
  position: relative;
  opacity: 1;
  transition: 200ms ease-in-out;
  transition-property: opacity, transform;
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
  border-radius: 50%;
  cursor: default;
  display: flex;
  flex-flow: column nowrap;
  height: 120px;
  justify-content: center;
  position: absolute;
  left: -165px;
  top: 45px;
  user-select: none;
  width: 120px;
  pointer-events: none;
  transition: transform 400ms cubic-bezier(0.19, 1, 0.22, 1);

  .player-avatar--is_attacking & {
    transform: translate(75%, 25%) scale(0.75);
    z-index: 1;
  }

  /* prettier-ignore */
  ${AttackWrapper} {
    &[data-value='1'] ${TextValue} { left: -1px; }
  }
`;
