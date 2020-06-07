import React from 'react';
import PropTypes from 'prop-types';

export default function CanAttack({ moves, data, index }) {
  const { selectMinion } = moves;
  return (
    <div
      className="can-be-selected"
      data-file="interactions/minions/CanAttack"
      onClick={() => selectMinion(data, index)}
      onKeyPress={() => selectMinion(data, index)}
      role="button"
      tabIndex={0}
    />
  );
}

CanAttack.propTypes = {
  moves: PropTypes.object,
  data: PropTypes.object,
  index: PropTypes.number
};
