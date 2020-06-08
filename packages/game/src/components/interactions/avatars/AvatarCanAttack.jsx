import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { PLAYER_BOARDS } from '@ccg/enums';

export default function AvatarCanAttack({ moves, board }) {
  const { initPlayerWeaponAttack } = moves;

  function handleClick() {
    if (board === PLAYER_BOARDS[1]) return initPlayerWeaponAttack();
  }

  return (
    <Component
      board={board}
      data-file="interactions/avatars/AvatarCanAttack"
      onClick={() => handleClick()}
    />
  );
}

AvatarCanAttack.propTypes = {
  moves: PropTypes.object,
  board: PropTypes.string
};

const Component = styled.div`
  animation: fadeIn 1200ms var(--animation-transition-cubic) forwards;
  border-top-left-radius: var(--avatar-border-radius);
  border-top-right-radius: var(--avatar-border-radius);
  cursor: pointer;
  height: 100%;
  opacity: 0;
  transition-property: box-shadow, opacity;
  transition: 100ms ease-in-out;
  width: 100%;
  position: absolute;
  box-shadow: 0px 0px 20px 10px var(--box-shadow-can-be-selected-color);

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;
