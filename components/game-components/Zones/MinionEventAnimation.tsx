import { current } from 'immer';
import { ReactNode, useEffect, useState } from 'react';
import { useEffectListener } from 'bgio-effects/react';
import type { Card, DiscardCardEffects, PlayerID } from '../../../types';
import { getRandomNumberBetween } from '../../../utils';
import { Context } from '../../../enums';

// import styles from './MinionOnPlayAnimation.module.scss';

interface Props {
  data?: Card;
  index?: number;
  zoneNumber?: number;
}

export const MinionEventAnimation = ({ data, index, zoneNumber }: Props) => {
  const b = data && data?.booleans;

  return (
    <div
      className={[
        'minionslot',
        b?.eventWasTriggered ? 'minionslot--event-was-triggered' : '',
      ].join(' ')}
      data-component='MinionEventAnimation'
      data-index={index}
    />
  );
};
