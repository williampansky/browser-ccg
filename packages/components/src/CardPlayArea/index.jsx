import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

const CardPlayArea = props => {
  const { active, onMouseUp } = props;

  return (
    <div
      className={[
        styles['card__play__area'],
        active ? styles['board--is-active'] : ''
      ].join(' ')}
      data-component="CardPlayArea"
      onMouseUpCapture={onMouseUp}
      role="button"
      tabIndex={0}
    />
  );
};

CardPlayArea.propTypes = {};

CardPlayArea.defaultProps = {};

export default CardPlayArea;
