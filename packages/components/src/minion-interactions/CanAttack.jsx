import React from 'react';
import PropTypes from 'prop-types';

export default function CanAttack(props) {
  const { handleCanAttackFunction } = props;

  return (
    <div
      className="minion__interaction minion__interaction--can-attack"
      data-component="minion-interactions/CanAttack"
      onClick={handleCanAttackFunction}
      onKeyPress={handleCanAttackFunction}
      role="button"
      tabIndex={0}
    />
  );
}

CanAttack.propTypes = {
  handleCanAttackFunction: PropTypes.func
};

CanAttack.defaultProps = {
  handleCanAttackFunction: () => {}
};
