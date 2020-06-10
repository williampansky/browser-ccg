import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { fontSizeBasedOnCharacterLength } from '@ccg/utils/src';

const PlayerName = ({ id = '0', name }) => {
  const defaultName = 'Player';
  const nameString = name ? name : `${defaultName} ${id}`;
  return (
    <h1 className={styles['player__name']}>
      <span
        className="text__value"
        style={{ fontSize: `${fontSizeBasedOnCharacterLength(nameString)}em` }}
      >
        {nameString}
      </span>
    </h1>
  );
};

PlayerName.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string
};

export default PlayerName;
