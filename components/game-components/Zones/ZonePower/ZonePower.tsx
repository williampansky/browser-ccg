import type { PlayerID } from '../../../../types';
import styles from './ZonePower.module.scss';

interface Props {
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
}: Props) => {
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
