/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';

export default function CanReceiveStampede({ moves, index }) {
  const { giveMinionStampede } = moves;

  return (
    <div
      className="minion--can-be-buffed"
      data-file="interactions/minions/CanReceiveStampede"
      onClick={() => giveMinionStampede(index)}
      role="button"
      tabIndex={0}
    />
  );
}

CanReceiveStampede.propTypes = {
  moves: PropTypes.object,
  index: PropTypes.number
};
