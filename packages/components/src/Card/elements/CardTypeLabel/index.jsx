import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

const CardTypeLabel = ({ formatter, race, raceEnums, type, typeEnums }) => (
  <div className={styles['card__type']}>
    {type === typeEnums['MINION'] ? (
      race !== raceEnums['NONE'] ? (
        <div>{formatter(race)}</div>
      ) : (
        <div>{formatter(type)}</div>
      )
    ) : (
      <div>{formatter(type)}</div>
    )}
  </div>
);

CardTypeLabel.propTypes = {
  formatter: PropTypes.func.isRequired,
  race: PropTypes.string.isRequired,
  raceEnums: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  typeEnums: PropTypes.object.isRequired
};

export default CardTypeLabel;
