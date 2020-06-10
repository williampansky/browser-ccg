import React from 'react';
import PropTypes from 'prop-types';
import { ReactSVG } from 'react-svg';
import { getIcon } from '@ccg/utils';
import styles from './styles.module.scss';

/**
 * @param {string} fileName String of the icon file
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
