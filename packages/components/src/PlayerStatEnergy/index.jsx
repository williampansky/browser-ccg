import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

const PlayerStatEnergy = ({
  iconColor,
  iconSize,
  onClick,
  statColor,
  statFontSize,
  statLabel,
  statValue,
  totalEnergy
}) => {
  return (
    <div
      className={styles['player__stats__icon']}
      style={{ marginTop: `calc(${iconSize} / 1.5)` }}
      onClick={onClick}
      onKeyPress={onClick}
      role="button"
      tabIndex={0}
    >
      <div className={styles['total__energy']}>
        <span
          className="text__value"
          style={{ color: iconColor }}
        >{`/${totalEnergy}`}</span>
      </div>
      <div
        className={styles['player__stat']}
        data-label={statLabel}
        style={{
          color: statColor,
          fontSize: statFontSize
        }}
      >
        <span className="text__value" data-value={statValue}>
          {statValue}
        </span>
      </div>
    </div>
  );
};

PlayerStatEnergy.propTypes = {
  iconColor: PropTypes.string,
  iconSize: PropTypes.string,
  onClick: PropTypes.func,
  statColor: PropTypes.string,
  statFontSize: PropTypes.string,
  statLabel: PropTypes.string.isRequired,
  statValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  totalEnergy: PropTypes.number.isRequired
};

PlayerStatEnergy.defaultProps = {
  iconColor: 'white',
  iconSize: '20px',
  onClick: () => {},
  statColor: 'white',
  statFontSize: '1em'
};

export default PlayerStatEnergy;
