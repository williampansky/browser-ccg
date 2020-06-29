import React from 'react';
import PropTypes from 'prop-types';
import DesktopHand from './DesktopHandSprings';
import MobileHand from './MobileHand';

const Hand = props => {
  const { isDesktop } = props;
  return isDesktop ? <DesktopHand {...props} /> : <MobileHand {...props} />;
};

Hand.propTypes = {
  isDesktop: PropTypes.bool.isRequired
};

export default Hand;
