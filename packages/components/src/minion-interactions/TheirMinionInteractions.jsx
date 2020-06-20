import React from 'react';
import PropTypes from 'prop-types';

// child components
import CanBeAttackedByMinion from './CanBeAttackedByMinion';
import CanBeAttackedByPlayer from './CanBeAttackedByPlayer';
import CanBeAttackedBySpell from './CanBeAttackedBySpell';
import CanBeAttackedByWarcry from './CanBeAttackedByWarcry';
import CanBeDebuffed from './CanBeDebuffed';
import CanBeExpired from './CanBeExpired';
import CanBeReturned from './CanBeReturned';

export default function TheirMinionInteractions(props) {
  const { canBeAttackedByMinion, handleCanBeAttackedByMinionFunction } = props;
  // if (canBeAttackedBySpell) {
  //   return <CanBeAttackedBySpell moves={moves} index={index} />;
  // }

  // if (canBeAttackedByWarcry) {
  //   return <CanBeAttackedByWarcry moves={moves} index={index} />;
  // }

  if (canBeAttackedByMinion) {
    return (
      <CanBeAttackedByMinion onClick={handleCanBeAttackedByMinionFunction} />
    );
  }

  // if (canBeAttackedByPlayer) {
  //   return <CanBeAttackedByPlayer moves={moves} index={index} />;
  // }

  // if (canBeDebuffed) {
  //   return <CanBeDebuffed moves={moves} index={index} />;
  // }

  // if (canBeReturned) {
  //   return <CanBeReturned moves={moves} index={index} targetContext={2} />;
  // }

  // if (canBeExpired) {
  //   return <CanBeExpired moves={moves} index={index} />;
  // }

  return null;
}

TheirMinionInteractions.propTypes = {
  G: PropTypes.object,
  ctx: PropTypes.object,
  moves: PropTypes.object,
  data: PropTypes.object,
  index: PropTypes.number,
  canBeAttackedByMinion: PropTypes.bool,
  canBeAttackedByPlayer: PropTypes.bool,
  canBeAttackedBySpell: PropTypes.bool
};
