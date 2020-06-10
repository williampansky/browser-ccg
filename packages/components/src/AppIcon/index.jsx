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
const AppIcon = ({
  color = 'white',
  fileName,
  height = '20px',
  width = '20px'
}) => {
  return (
    <ReactSVG
      className={styles['icon']}
      data-file="AppIcon"
      src={getIcon(fileName)}
      style={{
        color: color,
        height: height,
        width: width
      }}
    />
  );
};

AppIcon.propTypes = {
  color: PropTypes.string,
  fileName: PropTypes.string.isRequired,
  height: PropTypes.string,
  width: PropTypes.string
};

export default AppIcon;
