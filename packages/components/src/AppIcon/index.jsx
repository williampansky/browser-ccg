import React from 'react';
import PropTypes from 'prop-types';
import { ReactSVG } from 'react-svg';
import { getIcon } from '@ccg/utils';
import styles from './styles.module.scss';

/**
 * @param {string} color=white Color of the rendered icon
 * @param {string} fileName String of the icon file
 * @param {string} height=20px Height of the rendered icon
 * @param {string} width=20px Height of the rendered icon
 *
 * @requires react-svg
 * @see https://github.com/tanem/react-svg
 */
const AppIcon = ({ color, fileName, height, size, width }) => {
  return (
    <ReactSVG
      className={styles['icon']}
      data-file="AppIcon"
      src={getIcon(fileName)}
      style={{
        color: color,
        height: height || size,
        width: width || size
      }}
    />
  );
};

AppIcon.propTypes = {
  color: PropTypes.string,
  fileName: PropTypes.string.isRequired,
  height: PropTypes.string,
  size: PropTypes.string,
  width: PropTypes.string
};

AppIcon.defaultProps = {
  color: 'white',
  size: '20px'
};

export default AppIcon;
