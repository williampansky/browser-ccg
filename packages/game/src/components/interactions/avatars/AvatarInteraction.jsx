import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import AvatarCanAttack from './AvatarCanAttack';
import AvatarCanBeAttackedByMinion from './AvatarCanBeAttackedByMinion';
import AvatarCanBeAttackedByPlayer from './AvatarCanBeAttackedByPlayer';
import AvatarCanBeAttackedBySpell from './AvatarCanBeAttackedBySpell';
import AvatarCanBeAttackedByWarcry from './AvatarCanBeAttackedByWarcry';
import AvatarCanBeHealed from './AvatarCanBeHealed';
import AvatarIsAttacking from './AvatarIsAttacking';

export default function AvatarInteraction({
  G,
  ctx,
  moves,
  isActive,
  board,
  theirID,
  yourID,
  playerCanAttack,
  playerCanBeHealed,
  playerIsAttacking
}) {
  const {
    playerCanBeAttackedByMinion,
    playerCanBeAttackedByPlayer,
    playerCanBeAttackedBySpell,
    playerCanBeAttackedByWarcry
  } = G;

  return (
    <Component data-file="interactions/avatars/AvatarInteraction">
      {playerCanAttack && !playerIsAttacking ? (
        <AvatarCanAttack G={G} ctx={ctx} moves={moves} board={board} />
      ) : null}

      {playerCanAttack && playerIsAttacking ? (
        <AvatarIsAttacking moves={moves} board={board} />
      ) : null}

      {playerCanBeAttackedBySpell[theirID] ? (
        <AvatarCanBeAttackedBySpell moves={moves} />
      ) : null}

      {playerCanBeAttackedByWarcry[theirID] ? (
        <AvatarCanBeAttackedByWarcry moves={moves} />
      ) : null}

      {playerCanBeAttackedByMinion[theirID] ? (
        <AvatarCanBeAttackedByMinion G={G} ctx={ctx} moves={moves} />
      ) : null}

      {playerCanBeAttackedByPlayer[theirID] ? (
        <AvatarCanBeAttackedByPlayer moves={moves} />
      ) : null}

      {playerCanBeHealed ? (
        <AvatarCanBeHealed G={G} ctx={ctx} moves={moves} board={board} />
      ) : null}
    </Component>
  );
}

AvatarInteraction.propTypes = {
  G: PropTypes.object,
  ctx: PropTypes.object,
  moves: PropTypes.object,
  isActive: PropTypes.bool,
  index: PropTypes.number,
  board: PropTypes.string,
  theirID: PropTypes.string,
  yourID: PropTypes.string,
  playerCanAttack: PropTypes.bool,
  playerCanBeHealed: PropTypes.bool,
  playerIsAttacking: PropTypes.bool
};

const Component = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: 200ms cubic-bezier(0.19, 1, 0.22, 1);

  .player-avatar--is_attacking ~ & {
    transform: scale(1.1) translateY(-2vh);
  }
`;
