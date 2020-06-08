import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import PlayerShield from './PlayerShieldV2';
import { usePrevious } from '@ccg/hooks';

// https://codepen.io/junebug12851/pen/mJZNqN
export default function PlayerHealth({
  health,
  player,
  shieldPoints,
  wasAttacked
}) {
  const [animation, setAnimation] = useState(false);
  const progress = React.useRef();
  const water = React.useRef();
  const percent = React.useRef();
  const previousHealth = usePrevious(health);
  const colorIncrement = 30 / 3;

  // const hp = Math.round((img.width / naturalWidth) * 100));

  /**
   * Calculates in percent, the change between 2 numbers.
   * e.g from 1000 to 500 = 50%
   *
   * @param oldNumber The initial value
   * @param newNumber The value that changed
   */
  function getPercentageChange(oldNumber, newNumber) {
    var decreaseValue = oldNumber - newNumber;

    return (decreaseValue / oldNumber) * 100;
  }

  useEffect(() => {
    setAnimation(false);
    setTimeout(() => {
      setAnimation(false);
    }, 200);
  }, [wasAttacked]);

  function handleClass(val) {
    return 'red';
    // if (val !== '' && !isNaN(val) && val <= 30 && val >= 0) {
    //   if (previousHealth < colorIncrement * 1) return 'red';
    //   else if (previousHealth < colorIncrement * 2) return 'orange';
    //   else return 'green';
    // } else {
    //   return 'green';
    // }
  }

  return (
    <Component data-file="player-health/PlayerHealth" player={player}>
      <HealthValue animation={animation} health={health}>
        {health}
      </HealthValue>
      <PlayerShield player={player} shieldPoints={shieldPoints} />

      <div className={handleClass(health)}>
        <div className="progress" ref={progress}>
          <div className="inner">
            {/* <div className="percent" ref={percent}>
              <span>67</span>%
            </div> */}
            <div
              className="water"
              ref={water}
              style={{ top: `${getPercentageChange(30, health)}%` }}
            />
            <div className="glare" />
          </div>
        </div>
      </div>

      <Badge src={`assets/card-assets/Class_Skill_Sphere.png`} />
    </Component>
  );
}

PlayerHealth.propTypes = {
  health: PropTypes.number,
  player: PropTypes.string,
  shieldPoints: PropTypes.number,
  wasAttacked: PropTypes.bool
};

const Badge = styled.img`
  height: calc(var(--class-skill-button-size) + 30px);
  right: -15px;
  top: -12px;
  pointer-events: none;
  position: absolute;
  z-index: 0;
`;

const Component = styled.div`
  align-items: center;
  border-radius: 50%;
  display: flex;
  flex-flow: column nowrap;
  font-size: 32px;
  font-weight: bold;
  height: var(--class-skill-button-size);
  justify-content: center;
  /* pointer-events: none; */
  position: absolute;
  width: var(--class-skill-button-size);
  z-index: 1;
  left: 4%;
  top: -350%;

  * {
    user-select: none;
  }
`;

const HealthValue = styled.div`
  position: absolute;
  z-index: 5;
  color: white;
  /* color: ${p =>
    p.animation ? '#ff3535' : p.health < 30 ? '#ff3535' : 'white'}; */
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
