import React from 'react';
import PropTypes from 'prop-types';
import PlayerHealth from '../player-health/PlayerHealthV2';
import AvatarAnimation from '../animations/avatars/AvatarAnimation';
import AvatarInteraction from '../interactions/avatars/AvatarInteraction';
import ClassSkillButton from '../class-skill/ClassSkillButtonV2';
import PlayerWeapon from '../player-weapon/PlayerWeaponV2';
import { PLAYER_BOARDS } from '@ccg/enums';
import { usePrevious } from '@ccg/hooks';

export default function TheirAvatar({
  G,
  ctx,
  moves,
  isActive,
  board,
  theirID,
  yourID,
  playerClass,
  theirAvatarSrc
}) {
  const {
    playerCanUseClassSkill,
    energy,
    health,
    playerShieldPoints,
    playerCanBeHealed,
    playerIsAttacking,
    playerUsedClassSkill,
    playerCanAttack,
    playerAttackValue,
    playerWeapon
  } = G;
  const THEIR_HEALTH = health[theirID];
  const THEIR_SHIELD = playerShieldPoints[theirID];
  const [wasAttacked, setWasAttacked] = React.useState(false);
  const previousCurrentHealth = usePrevious(THEIR_HEALTH);

  const animateWasAttacked = React.useCallback(
    currentHealth => {
      currentHealth < previousCurrentHealth && setWasAttacked(true);
      return setTimeout(() => {
        setWasAttacked(false);
      }, 510);
    },
    [previousCurrentHealth]
  );

  React.useEffect(() => {
    animateWasAttacked(THEIR_HEALTH);
  }, [THEIR_HEALTH, animateWasAttacked]);

  function classImage(string) {
    const playerClass = string.replace(/(%)/g, '').toUpperCase();
    return `assets/images/classes/${playerClass}/DEFAULT.jpg`;
  }

  return (
    <div
      data-file="avatars/TheirAvatar"
      className={['player-avatar', 'their-avatar'].join(' ')}
    >
      <PlayerHealth
        health={THEIR_HEALTH}
        player="TheirHealth"
        shieldPoints={THEIR_SHIELD}
      />

      <ClassSkillButton
        G={G}
        ctx={ctx}
        moves={moves}
        isActive={isActive}
        playerClass={playerClass}
        board={PLAYER_BOARDS[2]}
        canUse={playerCanUseClassSkill[theirID] && energy[theirID].current >= 2}
      />

      {playerWeapon[theirID] !== null ? (
        <PlayerWeapon
          board={PLAYER_BOARDS[2]}
          canUse={playerCanAttack[theirID]}
          playerAttackValue={playerAttackValue[theirID]}
          weapon={playerWeapon[theirID]}
        />
      ) : null}

      <div
        className={[
          'avatar-image-wrapper',
          wasAttacked ? '--was-attacked' : ''
        ].join(' ')}
      >
        {playerClass && (
          <img
            alt=""
            className={'avatar-image'}
            role="presentation"
            src={theirAvatarSrc}
          />
        )}
      </div>

      <AvatarInteraction
        G={G}
        ctx={ctx}
        moves={moves}
        isActive={isActive}
        board={board}
        theirID={theirID}
        yourID={yourID}
        playerIsAttacking={playerIsAttacking[yourID]}
        playerCanBeHealed={playerCanBeHealed[theirID]}
      />

      <AvatarAnimation
        G={G}
        moves={moves}
        youUsedClassSkill={playerUsedClassSkill[yourID]}
        theyUsedClassSkill={playerUsedClassSkill[theirID]}
      />
    </div>
  );
}

TheirAvatar.propTypes = {
  G: PropTypes.object,
  ctx: PropTypes.object,
  moves: PropTypes.object,
  isActive: PropTypes.bool,
  board: PropTypes.string,
  theirID: PropTypes.string,
  yourID: PropTypes.string,
  playerClass: PropTypes.string
};

TheirAvatar.defaultProps = {
  backgroundColor: 'white'
};
