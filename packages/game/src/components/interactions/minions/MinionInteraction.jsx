import React from 'react';
import PropTypes from 'prop-types';
import { PLAYER_BOARDS } from '@ccg/enums';

// child components
import TheirMinionInteractions from './TheirMinionInteractions';
import YourMinionInteractions from './YourMinionInteractions';

export default function MinionInteraction({
  G,
  ctx,
  moves,
  isActive,
  index,
  yourID,
  theirID,
  board,
  data,
  canAttack,
  canBeAttackedByMinion,
  canBeAttackedByPlayer,
  canBeAttackedBySpell,
  canBeAttackedByWarcry,
  canBeBuffed,
  canBeHealed,
  canBeDebuffed,
  canBeExpired,
  canBeReturned,
  canBeSacrificed,
  canBeStolen,
  canReceiveEnergyShield,
  canReceiveGuard,
  canReceiveOnslaught,
  hasBoon,
  hasEnergyShield,
  hasGuard,
  hasOnslaught,
  isAttacking,
  isConcealed,
  isCursed,
  isDisabled,
  totalAttack,
  totalHealth,
  willExpire,
  dev
}) {
  switch (board) {
    case 'TheirBoard':
      return (
        <TheirMinionInteractions
          G={G}
          ctx={ctx}
          moves={moves}
          yourID={yourID}
          theirID={theirID}
          data={data}
          index={index}
          board={board}
          canAttack={canAttack}
          canBeAttackedByMinion={canBeAttackedByMinion}
          canBeAttackedByPlayer={canBeAttackedByPlayer}
          canBeAttackedBySpell={canBeAttackedBySpell}
          canBeAttackedByWarcry={canBeAttackedByWarcry}
          canBeBuffed={canBeBuffed}
          canBeDebuffed={canBeDebuffed}
          canBeExpired={canBeExpired}
          canBeHealed={canBeHealed}
          canBeReturned={canBeReturned}
          canBeSacrificed={canBeSacrificed}
          canBeStolen={canBeStolen}
          canReceiveEnergyShield={canReceiveEnergyShield}
          canReceiveOnslaught={canReceiveOnslaught}
          hasBoon={hasBoon}
          hasEnergyShield={hasEnergyShield}
          hasGuard={hasGuard}
          hasOnslaught={hasOnslaught}
          isAttacking={isAttacking}
          isConcealed={isConcealed}
          isCursed={isCursed}
          isDisabled={isDisabled}
          willExpire={willExpire}
          dev={dev}
        />
      );

    default:
      return (
        <YourMinionInteractions
          G={G}
          ctx={ctx}
          moves={moves}
          yourID={yourID}
          theirID={theirID}
          data={data}
          index={index}
          board={board}
          canAttack={canAttack}
          canBeAttackedByMinion={canBeAttackedByMinion}
          canBeAttackedByPlayer={canBeAttackedByPlayer}
          canBeAttackedBySpell={canBeAttackedBySpell}
          canBeAttackedByWarcry={canBeAttackedByWarcry}
          canBeBuffed={canBeBuffed}
          canBeDebuffed={canBeDebuffed}
          canBeExpired={canBeExpired}
          canBeHealed={canBeHealed}
          canBeReturned={canBeReturned}
          canBeSacrificed={canBeSacrificed}
          canBeStolen={canBeStolen}
          canReceiveEnergyShield={canReceiveEnergyShield}
          canReceiveGuard={canReceiveGuard}
          canReceiveOnslaught={canReceiveOnslaught}
          hasBoon={hasBoon}
          hasEnergyShield={hasEnergyShield}
          hasGuard={hasGuard}
          hasOnslaught={hasOnslaught}
          isAttacking={isAttacking}
          isConcealed={isConcealed}
          isCursed={isCursed}
          isDisabled={isDisabled}
          willExpire={willExpire}
          dev={dev}
        />
      );
  }
}

MinionInteraction.propTypes = {
  G: PropTypes.object,
  ctx: PropTypes.object,
  moves: PropTypes.object,
  isActive: PropTypes.bool,
  index: PropTypes.number,
  render: PropTypes.bool,
  yourID: PropTypes.string,
  theirID: PropTypes.string,
  board: PropTypes.string,
  data: PropTypes.object,
  canAttack: PropTypes.bool,
  canBeAttackedByMinion: PropTypes.bool,
  canBeAttackedByPlayer: PropTypes.bool,
  canBeAttackedBySpell: PropTypes.bool,
  canBeAttackedByWarcry: PropTypes.bool,
  canBeBuffed: PropTypes.bool,
  canBeHealed: PropTypes.bool,
  canBeDebuffed: PropTypes.bool,
  canBeExpired: PropTypes.bool,
  canBeReturned: PropTypes.bool,
  canBeSacrificed: PropTypes.bool,
  canBeStolen: PropTypes.bool,
  canReceiveEnergyShield: PropTypes.bool,
  canReceiveGuard: PropTypes.bool,
  canReceiveOnslaught: PropTypes.bool,
  hasBoon: PropTypes.bool,
  hasEnergyShield: PropTypes.bool,
  hasGuard: PropTypes.bool,
  isAttacking: PropTypes.bool,
  isConcealed: PropTypes.bool,
  isCursed: PropTypes.bool,
  isDisabled: PropTypes.bool,
  hasOnslaught: PropTypes.bool,
  totalAttack: PropTypes.number,
  totalHealth: PropTypes.number,
  willExpire: PropTypes.bool,
  dev: PropTypes.bool
};

MinionInteraction.defaultProps = {
  G: {},
  ctx: {},
  moves: {},
  isActive: false,
  index: 0,
  render: true,
  yourID: '0',
  theirID: '0',
  board: PLAYER_BOARDS[1],
  data: {},
  canAttack: false,
  canBeAttackedByMinion: false,
  canBeAttackedByPlayer: false,
  canBeAttackedBySpell: false,
  canBeAttackedByWarcry: false,
  canBeBuffed: false,
  canBeHealed: false,
  canBeDebuffed: false,
  canBeExpired: false,
  canBeReturned: false,
  canBeSacrificed: false,
  canBeStolen: false,
  canReceiveEnergyShield: false,
  canReceiveGuard: false,
  canReceiveOnslaught: false,
  hasBoon: false,
  hasEnergyShield: false,
  hasGuard: false,
  isAttacking: false,
  isConcealed: false,
  isCursed: false,
  isDisabled: false,
  hasOnslaught: false,
  totalAttack: 0,
  totalHealth: 1,
  willExpire: false,
  dev: false
};
