import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { AppIcon } from '@ccg/components';

/**
 * @requires AppIcon
 */
const PlayerStatIcon = ({
  iconColor,
  icon,
  cursor,
  iconSize,
  onClick,
  statColor,
  statFontSize,
  statLabel,
  statValue
}) => {
  return (
    <div
      className={styles['player__stats__icon']}
      style={{ cursor: cursor, marginTop: `calc(${iconSize} / 1.5)` }}
      onClick={onClick}
      onKeyPress={onClick}
      role="button"
      tabIndex={0}
    >
      <AppIcon
        color={iconColor}
        fileName={icon}
        height={iconSize}
        width={iconSize}
      />
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

PlayerStatIcon.propTypes = {
  cursor: PropTypes.string,
  iconColor: PropTypes.string,
  icon: PropTypes.string.isRequired,
  iconSize: PropTypes.string,
  onClick: PropTypes.func,
  statColor: PropTypes.string,
  statFontSize: PropTypes.string,
  statLabel: PropTypes.string.isRequired,
  statValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired
};

PlayerStatIcon.defaultProps = {
  cursor: 'default',
  iconSize: '20px',
  onClick: () => {},
  statColor: 'white',
  statFontSize: '1em'
};

export default PlayerStatIcon;
