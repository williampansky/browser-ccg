import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

const BoardDropArea = props => {
  const { areaIsAlone, cantDropMinion, boardIsActive, index, onClick } = props;

  return (
    <div
      className={[
        styles['board__drop__area'],
        boardIsActive ? styles['board--is-active'] : '',
        areaIsAlone ? styles['area--is-alone'] : '',
        cantDropMinion ? styles['cant--drop-minion'] : ''
      ].join(' ')}
      data-component="BoardDropArea"
      data-index={index}
      // onClick={onClick}
      // onKeyPress={onClick}
      onMouseUp={onClick}
      role="button"
      tabIndex={0}
    />
  );
};

BoardDropArea.propTypes = {};

BoardDropArea.defaultProps = {};

export default BoardDropArea;
