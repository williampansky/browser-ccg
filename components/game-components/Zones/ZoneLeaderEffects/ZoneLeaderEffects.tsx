import type { PlayerID } from '../../../../types';
import styles from './ZoneLeaderEffects.module.scss';

interface Props {
  zoneLeader?: PlayerID;
}

export const ZoneLeaderEffects = ({ zoneLeader }: Props) => {
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
