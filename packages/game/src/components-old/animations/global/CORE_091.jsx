import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

export default function CORE_091({ onEnd }) {
  // prettier-ignore
  useEffect(() => {
    setTimeout(() => { onEnd(); }, 150);
  }, [onEnd]);

  return <Component data-file="animations/global/CORE_091" />;
}

CORE_091.propTypes = {
  onEnd: PropTypes.func
};

const Component = styled.div`
  align-items: center;
  bottom: 0;
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  justify-content: center;
  left: 0;
  opacity: 1;
  position: absolute;
  right: 0;
  top: 0;
  width: 100%;

  &:before {
    animation: explosion 300ms ease-out forwards;
    background: rgba(255, 255, 0, 0.425);
    border: 4px solid yellow;
    border-radius: 50%;
    content: '';
    filter: blur(10px);
    position: absolute;
    z-index: 1;
  }

  @keyframes explosion {
    0% {
      opacity: 0;
      width: 0;
      height: 0;
    }
    90% {
      opacity: 1;
      width: 200vw;
      height: 200vh;
    }
    100% {
      opacity: 0;
      width: 400vw;
      height: 400vh;
    }
  }
`;
