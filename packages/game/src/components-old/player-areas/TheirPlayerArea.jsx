/* eslint-disable react/prop-types */
import React from 'react';
// import PropTypes from 'prop-types';
import styled from 'styled-components';
import TheirAvatar from 'components/game/avatars/TheirAvatar';
import PlayerWeapon from 'components/game/player-weapon/PlayerWeapon';

export default function TheirPlayerArea({
  G,
  ctx,
  moves,
  isActive,
  board,
  theirID,
  yourID,
  playerClass
}) {
  const { playerWeapon, playerCanAttack, playerAttackValue } = G;
  const WEAPON = playerWeapon[theirID];
  const WEAPON_AP = WEAPON && WEAPON.attack;
  const WEAPON_HP = WEAPON && WEAPON.health;
  const WEAPON_IMG = WEAPON && WEAPON.imageSrc;

  return (
    <Component board={board} data-file="player-areas/TheirPlayerArea">
      <AvatarWrapper board={board}>
        <TheirAvatar
          G={G}
          ctx={ctx}
          moves={moves}
          isActive={isActive}
          board={board}
          theirID={theirID}
          yourID={yourID}
          playerClass={playerClass[theirID]}
        />

        {playerWeapon[theirID] !== null ? (
          <PlayerWeapon
            canUse={playerCanAttack[theirID]}
            playerAttackValue={playerAttackValue[theirID]}
            weaponAttack={WEAPON_AP}
            weaponHealth={WEAPON_HP}
            weaponImageSrc={WEAPON_IMG}
          />
        ) : null}
      </AvatarWrapper>
    </Component>
  );
}

const Component = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: flex-end;
  padding: var(--board-theirPlayerArea-height) 0 0;
  height: var(--board-theirPlayerArea-height);
  position: relative;
  z-index: 1;
`;

const AvatarWrapper = styled.div`
  border-bottom-left-radius: var(--avatar-border-radius);
  border-bottom-right-radius: var(--avatar-border-radius);
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: flex-end;
  padding: 10px 0 12px;
  position: relative;
  height: calc(var(--avatar-height) * 2);
  width: calc(var(--avatar-width) * 1.15);
  top: calc(var(--avatar-height) / 1.5);
`;
