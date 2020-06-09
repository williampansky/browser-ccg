import React from 'react';
import PropTypes from 'prop-types';
import EnergySlot from 'components/game/player-energy/EnergySlot';

export default function PlayerEnergy({ energy, selectedCost }) {
  const { current, total } = energy;
  return (
    <div data-file="player-energy/PlayerEnergy" className={'player-energy'}>
      <div className={'player-energy__energy-bar'}>
        {Array.from(Array(10)).map((_, index) => {
          index = index + 1;
          return (
            <EnergySlot
              available={total >= index}
              empty={current <= index}
              filled={current >= index}
              key={index}
              number={index}
              willCost={selectedCost >= index}
            />
          );
        })}
      </div>
    </div>
  );
}

PlayerEnergy.propTypes = {
  energy: PropTypes.shape({
    current: PropTypes.number,
    total: PropTypes.number
  }),
  selectedCost: PropTypes.number
};
