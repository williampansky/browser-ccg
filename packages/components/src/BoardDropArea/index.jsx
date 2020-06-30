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
        cantDropMinion ? styles['cant--drop-minion'] : ''
      ].join(' ')}
      data-component="BoardDropArea"
      data-index={index}
      onClick={onClick}
      onKeyPress={onClick}
      role="button"
      tabIndex={0}
    >
      {areaIsAlone ? (
        <div
          className={[styles['area'], styles['area--is-alone']].join(' ')}
          data-context="area--is-alone"
        />
      ) : (
        <div className={styles['area']} data-context="area" />
      )}
    </div>
  );
};

BoardDropArea.propTypes = {};

BoardDropArea.defaultProps = {};

export default BoardDropArea;
