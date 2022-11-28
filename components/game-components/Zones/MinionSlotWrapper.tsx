import { current } from 'immer';
import { ReactNode, useEffect, useState } from 'react';
import { useEffectListener } from 'bgio-effects/react';
import type { Card, DiscardCardEffects, PlayerID } from '../../../types';

// import styles from './MinionSlotWrapper.module.scss';

interface Props {
  children: ReactNode;
  data?: Card;
  index?: number;
  moves?: any;
  player?: PlayerID;
  prevHand?: Card[];
  zoneNumber?: number;
}

export const MinionSlotWrapper = ({
  children,
  data,
  index,
  moves,
  player,
  zoneNumber,
}: Props) => {
  const booleans = data && data?.booleans;

  const handleOnClick = () => {
    if (data?.booleans?.canBeBuffed) {
      return moves.buffMinion(player, data?.uuid, zoneNumber);
    }
  }

  return (
    <div
      className={[
        'minionslot',
        booleans?.canBeBuffed ? 'minionslot--can-be-buffed' : '',
      ].join(' ')}
      data-component='MinionSlotWrapper'
      data-index={index}
      onClick={handleOnClick}
    >
      {children}
    </div>
  );
};
