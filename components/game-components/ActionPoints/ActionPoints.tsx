import Image from 'next/image';
import { ReactElement, useEffect, useState } from 'react';
import type { ActionPoints as IActionPoints } from '../../../types';
import { gameConfig } from '../../../app.config';
import styles from './action-points.module.scss';
import { ActionPoint } from '../';

const {
  numerics: { actionPointsTotal },
} = gameConfig;

interface ActionPointsProps {
  actionPoints: IActionPoints;
}

export const ActionPoints = ({ actionPoints }: ActionPointsProps) => {
  const { current, total } = actionPoints;

  return (
    <div
      className={[styles['component']].join(' ')}
      data-component='ActionPoints'
    >
      <div className={styles['grid']} data-total={total}>
        {[...Array.from(Array(total))].map(
          (ap: number, i: number) => {
            return (
              <div key={i} className={styles['grid-item']}>
                <ActionPoint filled={current > i ? true: false} />
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};
