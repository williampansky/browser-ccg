import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
// import CORE_065 from 'components/game/animations/global/CORE_065';
// import CORE_091 from 'components/game/animations/global/CORE_091';

export default function GlobalAnimations({ G, ctx, moves }) {
  const { lastPlayedCardId } = G;
  const { setLastPlayedCardId } = moves;
  const LPC = lastPlayedCardId;

  return (
    <Component data-file="animations/global/GlobalAnimations">
      {/* {LPC === 'CORE_065' && <CORE_065 onEnd={setLastPlayedCardId} />}
      {LPC === 'CORE_091' && <CORE_091 onEnd={setLastPlayedCardId} />} */}
    </Component>
  );
}

GlobalAnimations.propTypes = {
  G: PropTypes.object,
  ctx: PropTypes.object,
  moves: PropTypes.object
};

const Component = styled.div`
  bottom: 0;
  height: 100%;
  left: 0;
  pointer-events: none;
  position: fixed;
  right: 0;
  top: 0;
  width: 100%;
  user-select: none;
  z-index: 9000;
`;
