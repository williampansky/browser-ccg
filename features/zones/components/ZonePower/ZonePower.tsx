import type { ReactElement } from 'react';
import type { PlayerID } from '../../../../types';
import styles from './zone-power.module.scss';

interface ZonePowerComponent {
  playerId: PlayerID;
  playerIdContext: string;
  zoneLeader?: PlayerID;
  zonePowers: Record<PlayerID, number>;
}

export const ZonePower = ({
  playerId,
  playerIdContext,
  zoneLeader,
  zonePowers,
}: ZonePowerComponent): ReactElement => {
  return (
    <div
      className={[
        styles['zone-power'],
        styles[`power-${playerIdContext}`],
        zoneLeader === playerId ? styles['leader'] : '',
      ].join(' ')}
    >
      {zonePowers[playerId]}
    </div>
  );
};
