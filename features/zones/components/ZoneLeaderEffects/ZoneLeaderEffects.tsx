import type { ReactElement } from 'react';
import type { PlayerID } from '../../../../types';
import styles from './zone-leader-effects.module.scss';

interface ZoneLeaderEffectsComponent {
  zoneLeader?: PlayerID;
}

export const ZoneLeaderEffects = ({
  zoneLeader,
}: ZoneLeaderEffectsComponent): ReactElement => {
  return (
    <div
      className={[
        styles['component'],
        zoneLeader === '1' ? styles['leader-opponent'] : '',
        zoneLeader === '0' ? styles['leader-player'] : '',
      ].join(' ')}
    />
  );
};
