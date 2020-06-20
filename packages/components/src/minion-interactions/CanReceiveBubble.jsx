/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';
import { TARGET_CONTEXT } from '@ccg/enums';

export default function CanReceiveEnergyShield({ moves, index }) {
  const { castTargetedSpell } = moves;
  return (
    <div
      className="minion--can-be-buffed"
      data-file="interactions/minions/CanReceiveEnergyShield"
      onClick={() => castTargetedSpell(TARGET_CONTEXT['SELF'], index)}
      role="button"
      tabIndex={0}
    />
  );
}

CanReceiveEnergyShield.propTypes = {
  moves: PropTypes.object,
  index: PropTypes.number
};
