import React from 'react';
import PropTypes from 'prop-types';

export default function IsAttacking(props) {
  const { handleIsAttackingFunction } = props;

  return (
    <div
      className="minion__interaction minion__interaction--is-attacking"
      data-component="minion-interactions/IsAttacking"
      onClick={handleIsAttackingFunction}
      onKeyPress={handleIsAttackingFunction}
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
