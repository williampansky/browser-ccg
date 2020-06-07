import React from 'react';
import PropTypes from 'prop-types';

export default function CanBeAttackedByMinion({ G, ctx, moves, index }) {
  const { selectedMinionIndex } = G;
  const { currentPlayer } = ctx;
  const {
    attackMinion,
    setAttackedMinionIndex,
    resetMinionIsAttacking,
    resetMinionIsAttackingIndex
  } = moves;

  function handleClick() {
    attackMinion(index);

    setTimeout(() => {
      setAttackedMinionIndex(null);
      resetMinionIsAttacking(selectedMinionIndex[currentPlayer]);
      resetMinionIsAttackingIndex(selectedMinionIndex[currentPlayer]);
    }, 250);
  }

  return (
    <div
      className="can-be-attacked"
      data-file="interactions/minions/CanBeAttackedByMinion"
      onClick={() => handleClick()}
    />
  );
}

CanBeAttackedByMinion.propTypes = {
  G: PropTypes.object,
  ctx: PropTypes.object,
  moves: PropTypes.object,
  index: PropTypes.number
};
