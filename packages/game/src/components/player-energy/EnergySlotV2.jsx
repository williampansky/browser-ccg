import React from 'react';
import PropTypes from 'prop-types';

export default function EnergySlot({ available, filled, number, willCost }) {
  return (
    <div
      data-file="player-energy/EnergySlot"
      className={['energy-slot', willCost ? '--will-cost' : ''].join(' ')}
    >
      <div className={'text__value--wrapper'}>
        {filled ? (
          <div className={'text__value'} data-value={number}>
            {number}
          </div>
        ) : (
          ''
        )}
      </div>

      {filled ? (
        <img alt="" src="assets/images/ui/UI_EnergySlot-Available.png" />
      ) : available && !filled ? (
        <img alt="" src="assets/images/ui/UI_EnergySlot-Empty.png" />
      ) : (
        <img alt="" src="assets/images/ui/UI_EnergySlot-Locked.png" />
      )}
    </div>
  );
}

EnergySlot.propTypes = {
  available: PropTypes.bool,
  filled: PropTypes.bool,
  number: PropTypes.number,
  willCost: PropTypes.bool
};
