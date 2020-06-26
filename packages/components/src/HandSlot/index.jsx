import React from 'react';
import PropTypes from 'prop-types';
import DesktopHandSlot from './DesktopHandSlot';
import MobileHandSlot from './MobileHandSlot';

const HandSlot = props => {
  const { isDesktop } = props;

  return isDesktop ? (
    <DesktopHandSlot {...props} />
  ) : (
    <MobileHandSlot {...props} />
  );
};

HandSlot.propTypes = {
  isDesktop: PropTypes.bool
};

HandSlot.defaultProps = {
  isDesktop: false
};

export default HandSlot;
