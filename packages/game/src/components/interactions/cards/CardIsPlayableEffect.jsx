import React from 'react';
import styled from 'styled-components';

export default function CardIsPlayableEffect() {
  const [isReady, setIsReady] = React.useState(true);

  React.useEffect(() => {
    setTimeout(() => {
      setIsReady(true);
    }, 0);
  }, []);

  return (
    <CardEffect
      data-file="interactions/cards/CardIsPlayableEffect"
      isReady={isReady}
    />
  );
}

const CardEffect = styled.div`
  border-radius: var(--card-border-radius);
  box-shadow: var(--box-shadow-can-be-selected);
  /* box-shadow: 0px 0px 10px 5px var(--box-shadow-can-be-selected-color); */
  content: '';
  height: var(--card-height);
  left: 0;
  opacity: ${p => (p.isReady ? 1 : 0)};
  pointer-events: none;
  position: absolute;
  top: 0;
  transition: 400ms cubic-bezier(0.19, 1, 0.22, 1);
  transition-property: box-shadow, opacity;
  width: 100%;
  z-index: 0;
`;
