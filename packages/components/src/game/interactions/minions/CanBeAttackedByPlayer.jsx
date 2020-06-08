import React from 'react';
import PropTypes from 'prop-types';

export default function CanBeAttackedByPlayer({ moves, index }) {
  const { attackMinionWithPlayer } = moves;
  return (
    <div
      className="board__slot--can-be-attacked"
      data-file="interactions/minions/CanBeAttackedByPlayer"
      onClick={() => attackMinionWithPlayer(index)}
    />
  );
}

CanBeAttackedByPlayer.propTypes = {
  moves: PropTypes.object,
  index: PropTypes.number
};
