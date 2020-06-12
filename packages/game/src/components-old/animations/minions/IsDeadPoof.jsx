import React from 'react';
import styled from 'styled-components';

export default function IsDeadPoof() {
  return (
    <Component src="https://opengameart.org/sites/default/files/gif_4.gif" />
  );
  // return <Component src={require('assets/images/animation-props/poof.gif')} />;
}

const Component = styled.img`
  position: absolute;
  pointer-events: none;
`;
