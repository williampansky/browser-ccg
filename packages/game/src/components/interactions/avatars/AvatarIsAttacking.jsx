import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { PLAYER_BOARDS } from '@ccg/enums';

export default function AvatarIsAttacking({ moves, board }) {
  const { terminatePlayerWeaponAttack } = moves;

  function handleClick() {
    if (board === PLAYER_BOARDS[1]) return terminatePlayerWeaponAttack();
  }

  return (
    <Component
      board={board}
      data-file="interactions/avatars/AvatarIsAttacking"
      onClick={() => handleClick()}
    />
  );
}

AvatarIsAttacking.propTypes = {
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
  box-shadow: var(--box-shadow-is-selected);

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;
