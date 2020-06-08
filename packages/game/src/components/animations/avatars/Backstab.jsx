import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
const PNG = require('assets/images/animation-props/backstab-dagger.png');

export default function BackstabAnimation() {
  return (
    <Component data-file="animations/avatars/BackstabAnimation">
      <Dagger src={PNG} />
      <BloodSplatter
        src={`https://i.pinimg.com/originals/af/94/50/af9450d82c556c40fa42e12bb385d80e.png`}
      />
    </Component>
  );
}

BackstabAnimation.propTypes = {
  moves: PropTypes.object,
  board: PropTypes.string
};

const Component = styled.div`
  border-top-left-radius: var(--avatar-border-radius);
  border-top-right-radius: var(--avatar-border-radius);
  height: 100%;
  opacity: 1;
  position: absolute;
  transition-property: box-shadow, opacity;
  transition: 100ms ease-in-out;
  width: 100%;
`;

const Dagger = styled.img`
  animation: backstab 1200ms cubic-bezier(0.19, 1, 0.22, 1) forwards;
  filter: drop-shadow(-2px 0px 2px rgba(0, 0, 0, 0.45));
  height: 100%;
  opacity: 0;
  width: auto;
  z-index: 1;

  /* clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%);
  opacity: 1;
  transform: rotate(-85deg) translate3d(-20px, -60px, 0) scale(1); */

  @keyframes backstab {
    0% {
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
      opacity: 0;
      transform: rotate(-80deg) translate3d(-600%, -600%, 0) scale(0.1);
    }
    20% {
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
      opacity: 1;
      transform: rotate(-85deg) translate3d(-20px, -60px, 0) scale(1);
    }
    30%,
    40%,
    50%,
    60%,
    80% {
      clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%);
      opacity: 1;
      transform: rotate(-85deg) translate3d(-20px, -60px, 0) scale(1);
    }
    100% {
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
      opacity: 0;
      transform: rotate(-85deg) translate3d(-20px, -60px, 0) scale(2);
    }
  }
`;

const BloodSplatter = styled.img`
  animation: splatter 600ms cubic-bezier(0.19, 1, 0.22, 1) forwards 200ms;
  height: 100%;
  left: 10px;
  opacity: 0;
  position: absolute;
  top: -50px;
  width: auto;
  z-index: 2;

  @keyframes splatter {
    0% {
      opacity: 0;
    }
    90% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
`;
