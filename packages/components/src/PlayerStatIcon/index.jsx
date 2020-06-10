import React from 'react';
import PropTypes from 'prop-types';
import { AppIcon } from '@ccg/components';
// import { getIcon } from '@ccg/utils';
import styles from './styles.module.scss';

/**
 * @requires AppIcon
 */
const PlayerStatIcon = ({
  iconColor,
  icon,
  iconSize = '20px',
  onClick = () => {},
  statColor = 'white',
  statFontSize = '1em',
  statLabel,
  statValue
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

export default PlayerStatIcon;
