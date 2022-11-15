import Image from 'next/image';
import { ReactElement, useEffect, useState } from 'react';
import type { ActionPoints as IActionPoints } from '../../../types';
import { gameConfig } from '../../../app.config';
import styles from './action-point.module.scss';

// static img imports for nextjs
import apEmpty from '../../../public/images/card-assets/ENERGY_SLOT_EMPTY.png';
import apFilled from '../../../public/images/card-assets/ENERGY_SLOT_FILLED.png';

interface ActionPointProps {
  filled: boolean;
}

export const ActionPoint = ({ filled }: ActionPointProps) => {
  return (
    <div className={styles['component']}>
      <div
        className={[
          styles['img'],
          filled ? styles['block'] : styles['none'],
        ].join(' ')}
      >
        <Image layout='intrinsic' src={apFilled} />
      </div>
      <div
        className={[
          styles['img'],
          !filled ? styles['block'] : styles['none'],
        ].join(' ')}
      >
        <Image layout='intrinsic' src={apEmpty} />
      </div>
    </div>
  );
};
