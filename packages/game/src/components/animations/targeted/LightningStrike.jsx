import React from 'react';
import styled from 'styled-components';
// const PNG = require('assets/images/animation-props/backstab-dagger.png');

export default function LightningStrike() {
  return (
    <Component data-file="animations/targeted/LightningStrike">
      <Lightning
        src={`http://cdn150.picsart.com/upscale-247003083001212.png`}
      />
    </Component>
  );
}

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

const Lightning = styled.img`
  height: 100%;
  opacity: 0;
  width: auto;
  z-index: 1;
`;
