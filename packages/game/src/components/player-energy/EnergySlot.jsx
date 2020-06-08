import React from 'react';
import PropTypes from 'prop-types';
import { ReactSVG } from 'react-svg';

export default function EnergySlot({
  available,
  empty,
  filled,
  number,
  willCost
}) {
  return (
    <div
      data-file="player-energy/EnergySlot"
      className={[
        'energy-bar__energy-slot',
        available ? 'energy-slot--available' : '',
        !available ? 'energy-slot--locked' : '',
        filled ? 'energy-slot--filled' : '',
        willCost ? 'energy-slot--will-cost' : ''
      ].join(' ')}
    >
      {available ? (
        <div className={''}>{number}</div>
      ) : (
        <ReactSVG className={'icon'} src="assets/icons/padlock.svg" />
      )}
    </div>
  );
}

EnergySlot.propTypes = {
  available: PropTypes.bool,
  empty: PropTypes.bool,
  filled: PropTypes.bool,
  number: PropTypes.number
};
