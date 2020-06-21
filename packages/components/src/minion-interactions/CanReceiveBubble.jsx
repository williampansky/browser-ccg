import React from 'react';
import PropTypes from 'prop-types';
import { TARGET_CONTEXT } from '@ccg/enums';

export default function canReceiveBubble({ moves, index }) {
  const { castTargetedSpell } = moves;
  return (
    <div
      className="minion--can-be-buffed"
      data-file="interactions/minions/canReceiveBubble"
      onClick={() => castTargetedSpell(TARGET_CONTEXT['SELF'], index)}
      onKeyPress={() => castTargetedSpell(TARGET_CONTEXT['SELF'], index)}
      role="button"
      tabIndex={0}
    />
  );
}

canReceiveBubble.propTypes = {
  moves: PropTypes.object,
  index: PropTypes.number
};
