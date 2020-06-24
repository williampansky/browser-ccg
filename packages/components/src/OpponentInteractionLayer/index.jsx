import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import {
  OpponentCanBeAttackedByMinion,
  OpponentCanBeAttackedByOnPlay,
  OpponentCanBeAttackedByPlayer,
  OpponentCanBeAttackedBySpell
} from '@ccg/components';

const OpponentInteractionLayer = props => {
  const {
    moves: { attackPlayerWithMinion },
    canBeAttackedByMinion,
    canBeAttackedByOnPlay,
    canBeAttackedByPlayer,
    canBeAttackedBySpell
  } = props;

  const [activeState, setActiveState] = useState(null);

  const handleActiveStateCallback = useCallback(
    (byMinion, byOnPlay, byPlayer, bySpell) => {
      if (byMinion) return setActiveState('canBeAttackedByMinion');
      if (byOnPlay) return setActiveState('canBeAttackedByOnPlay');
      if (byPlayer) return setActiveState('canBeAttackedByPlayer');
      if (bySpell) return setActiveState('canBeAttackedBySpell');
      else return setActiveState(null);
    },
    []
  );

  useEffect(() => {
    handleActiveStateCallback(
      canBeAttackedByMinion,
      canBeAttackedByOnPlay,
      canBeAttackedByPlayer,
      canBeAttackedBySpell
    );
  }, [
    handleActiveStateCallback,
    canBeAttackedByMinion,
    canBeAttackedByOnPlay,
    canBeAttackedByPlayer,
    canBeAttackedBySpell
  ]);

  return (
    <div
      className={[styles['opponent__interaction__layer']].join(' ')}
      data-component="OpponentInteractionLayer"
    >
      <OpponentCanBeAttackedByMinion
        activeState={activeState === 'canBeAttackedByMinion' ? true : false}
        onClick={() => attackPlayerWithMinion()}
      />
      <OpponentCanBeAttackedByOnPlay
        activeState={activeState === 'canBeAttackedByOnPlay' ? true : false}
        onClick={() => console.log('canBeAttackedByOnPlay')}
      />
      <OpponentCanBeAttackedByPlayer
        activeState={activeState === 'canBeAttackedByPlayer' ? true : false}
        onClick={() => console.log('canBeAttackedByPlayer')}
      />
      <OpponentCanBeAttackedBySpell
        activeState={activeState === 'canBeAttackedBySpell' ? true : false}
        onClick={() => console.log('canBeAttackedBySpell')}
      />
    </div>
  );
};

OpponentInteractionLayer.propTypes = {
  canBeAttackedByMinion: PropTypes.bool,
  canBeAttackedByOnPlay: PropTypes.bool,
  canBeAttackedByPlayer: PropTypes.bool,
  canBeAttackedBySpell: PropTypes.bool
};

OpponentInteractionLayer.defaultProps = {
  canBeAttackedByMinion: true,
  canBeAttackedByOnPlay: true,
  canBeAttackedByPlayer: true,
  canBeAttackedBySpell: true
};

export default OpponentInteractionLayer;
