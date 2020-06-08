import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
const GIF = require('assets/images/animation-props/nebula-explosion.gif');

export default function CORE_065({ onEnd }) {
  // prettier-ignore
  useEffect(() => {
    setTimeout(() => { onEnd(); }, 500);
  }, [onEnd]);

  return (
    <Component data-file="animations/global/CORE_065">
      <Explosion src={GIF} />
    </Component>
  );
}

CORE_065.propTypes = {
  onEnd: PropTypes.func
};

const Component = styled.div`
  bottom: 0;
  height: 100%;
  left: 0;
  opacity: 1;
  position: absolute;
  right: 0;
  top: 0;
  width: 100%;
`;

const Explosion = styled.img`
  animation: endAnimation 200ms ease-out forwards 400ms;
  height: 100%;
  width: 100%;
  z-index: 1;

  /* prettier-ignore */
  @keyframes endAnimation {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;
