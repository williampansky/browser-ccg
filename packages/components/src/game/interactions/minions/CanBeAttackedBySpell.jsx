/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import PropTypes from 'prop-types';
import { TARGET_CONTEXT } from '@ccg/enums';

export default function CanBeAttackedBySpell({ moves, index }) {
  const { castTargetedSpell } = moves;
  return (
    <div
      className="can-be-attacked"
      data-file="interactions/minions/CanBeAttackedBySpell"
      onClick={() => castTargetedSpell(TARGET_CONTEXT['OPPONENT'], index)}
    />
  );
}

CanBeAttackedBySpell.propTypes = {
  moves: PropTypes.object,
  index: PropTypes.number
};
