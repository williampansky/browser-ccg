import React from 'react';
import styled from 'styled-components';

export default function CardIsSelectedEffect() {
  return <CardEffect data-file="interactions/cards/CardIsSelectedEffect" />;
}

const CardEffect = styled.div`
  border-radius: var(--card-border-radius);
  box-shadow: 0 0 10px #00c469, 0 0 20px #0ee681;
  content: '';
  height: var(--card-height);
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  transition: box-shadow 400ms cubic-bezier(0.19, 1, 0.22, 1);
  width: 100%;
  z-index: 0;
`;
