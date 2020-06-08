import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

export default function CardIsSelected({ onClick }) {
  return (
    <Component data-file="interactions/cards/CardIsSelected" onClick={onClick}>
      <DeselectLabel>Deselect Card</DeselectLabel>
    </Component>
  );
}

CardIsSelected.propTypes = {
  onClick: PropTypes.func
};

const DeselectLabel = styled.div`
  align-items: center;
  background: rgba(39, 38, 37, 0.65);
  border-radius: var(--card-border-radius);
  color: white;
  display: flex;
  flex-flow: column nowrap;
  font-size: 8px;
  height: 10px;
  justify-content: center;
  line-height: 1;
  margin: 0 auto;
  opacity: 0;
  text-align: center;
  transform: translateY(-150%);
  transition-property: opacity, transform;
  transition: 200ms ease-in-out 0ms;
  white-space: nowrap;
  width: 63px;
`;

const Component = styled.div`
  border-radius: var(--card-border-radius);
  cursor: pointer;
  height: 100%;
  pointer-events: auto;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 200;

  &:hover ${DeselectLabel} {
    opacity: 1;
    transform: translateY(-200%);
    transition-delay: 2000ms;
  }
`;
