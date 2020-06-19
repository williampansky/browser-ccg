import React from 'react';
import PropTypes from 'prop-types';

export default function IsAttacking(props) {
  const { handleIsAttackingFunction } = props;

  return (
    <div
      className="minion--is-selected"
      data-file="interactions/minions/IsAttacking"
      onClick={() => handleIsAttackingFunction()}
      onKeyPress={() => handleIsAttackingFunction()}
      role="button"
      tabIndex={0}
    />
  );
}

IsAttacking.propTypes = {
  handleIsAttackingFunction: PropTypes.func
};

IsAttacking.defaultProps = {
  handleIsAttackingFunction: () => {}
};
