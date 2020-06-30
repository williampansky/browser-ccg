import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSpring, animated, config } from 'react-spring';
import { Card } from '@ccg/components';
import styles from './styles.module.scss';
import DesktopInteractionLayer from './DesktopInteractionLayer';
import MobileInteractionLayer from './MobileInteractionLayer';

const CardInteractionLayer = props => {
  const { isDesktop } = props;

  return isDesktop ? (
    <DesktopInteractionLayer {...props} />
  ) : (
    <MobileInteractionLayer {...props} />
  );
};

CardInteractionLayer.propTypes = {
  isDesktop: PropTypes.bool.isRequired
};

export default CardInteractionLayer;
