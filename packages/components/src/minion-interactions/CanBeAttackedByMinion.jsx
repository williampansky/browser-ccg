import React from 'react';
import PropTypes from 'prop-types';

export default function CanBeAttackedByMinion(props) {
  const { onClick } = props;
  // const { selectedMinionIndex } = G;
  // const { currentPlayer } = ctx;
  // const {
  //   attackMinion,
  //   setAttackedMinionIndex,
  //   resetMinionIsAttacking,
  //   resetMinionIsAttackingIndex
  // } = moves;

  // function handleClick() {
  //   attackMinion(index);

  //   setTimeout(() => {
  //     setAttackedMinionIndex(null);
  //     resetMinionIsAttacking(selectedMinionIndex[currentPlayer]);
  //     resetMinionIsAttackingIndex(selectedMinionIndex[currentPlayer]);
  //   }, 250);
  // }

  return (
    <div
      className="minion__interaction minion__interaction--can-be-attacked"
      data-file="minion-interactions/CanBeAttackedByMinion"
      onClick={onClick}
      onKeyPress={onClick}
      role="button"
      tabIndex={0}
    />
  );
}

// CanBeAttackedByMinion.propTypes = {
//   G: PropTypes.object,
//   ctx: PropTypes.object,
//   moves: PropTypes.object,
//   index: PropTypes.number
// };

CanBeAttackedByMinion.defaultProps = {
  onClick: () => {}
};
