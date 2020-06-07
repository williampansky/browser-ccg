import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

// https://codepen.io/vineethtr/pen/qdKXeB?editors=0100
export default function WillExpire({ count }) {
  return (
    <Component data-file="mechanics/WillExpire">
      <ExpirationText>
        <span className="text__value">{count}</span>
      </ExpirationText>
      <ExpirationIcon>&#x2620;</ExpirationIcon>
    </Component>
  );
}

WillExpire.propTypes = {
  count: PropTypes.number
};

const Component = styled.div`
  border-radius: var(--minion-border-radius);
  /* height: 100%; */
  opacity: 1;
  /* width: 100%; */
  pointer-events: none;
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
`;

const ExpirationIcon = styled.div`
  font-size: 22.5px;
  pointer-events: none;
  user-select: none;
`;

const ExpirationText = styled.div`
  font-size: 14px;
  pointer-events: none;
  user-select: none;
  position: absolute;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  width: 89%;
  top: -4px;
`;
