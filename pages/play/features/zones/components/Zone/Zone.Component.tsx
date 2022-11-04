import React, { useEffect, useState } from 'react';
import type { ReactElement } from 'react';

import { usePrevious } from '../../../../../../hooks';
import type {
  PlayerID,
  Zone as ZoneServerProps,
  ZonesCardsReference,
} from '../../../../../../types';

import styles from './zone.module.scss';

import { OpponentZoneSlot } from '../ZoneSlotOpponent';
import { PlayerZoneSlot } from '../ZoneSlotPlayer';
import { ZoneDropSlot } from '../ZoneDropSlot';
import { ZoneLeaderEffects } from '../ZoneLeaderEffects';
import { ZonePower } from '../ZonePower';
import { ZoneRevealOverlay } from '../ZoneRevealOverlay';
import { ZoneName } from '../ZoneName';

interface ZoneClientProps {
  opponent: string;
  player: string;
  turn: number;
  zone: ZoneServerProps;
  zoneNumber: number;
  zoneRef: ZonesCardsReference;
  zonesAreActive: boolean;
}

export const Zone = ({
  opponent,
  player,
  turn,
  zone,
  zoneNumber,
  zoneRef,
  zonesAreActive,
}: ZoneClientProps): ReactElement => {
  const { powers } = zone;
  const [zoneLeader, setZoneLeader] = useState<PlayerID | undefined>(undefined);
  const [zonePowers, setZonePowers] = useState({ '0': 0, '1': 0 });
  const prevZonePowers = usePrevious({ '0': 0, '1': 0 });

  useEffect(() => {
    setZonePowers({
      '0': powers['0'],
      '1': powers['1'],
    });
  }, [powers]);

  useEffect(() => {
    if (powers['0'] > powers['1']) setZoneLeader('0');
    else if (powers['1'] > powers['0']) setZoneLeader('1');
    else setZoneLeader(undefined);
  }, [powers]);

  return (
    <div
      className={[
        styles['wrapper'],
        zone?.disabled[player] ? styles['disabled'] : '',
      ].join(' ')}
    >
      <div className={[styles['zone-side'], styles['opponent-side']].join(' ')}>
        {[...Array.from(Array(6))].map((_, idx: number) => {
          return (
            <OpponentZoneSlot
              key={idx}
              data={zone.sides[opponent][idx]}
              onClick={(val: any) => console.log(val)}
              zoneNumber={zoneNumber}
              zoneRef={zoneRef}
              slotIndex={idx}
              opponent={opponent}
            />
          )
          //  : (
          //   <div key={idx} className={styles['blank-slot']} />
          // );
        })}
      </div>

      <div className={styles['zone-center']}>
        <ZoneName name={zone?.name} effectText={zone?.effectText} />

        <ZoneRevealOverlay
          isRevealed={zone?.revealed}
          turn={turn}
          zoneNumber={zoneNumber}
        />

        <ZoneLeaderEffects zoneLeader={zoneLeader} />

        <ZonePower
          key='opponent'
          playerId={opponent}
          playerIdContext='opponent'
          zoneLeader={zoneLeader}
          zonePowers={zonePowers}
        />
        <ZonePower
          key='player'
          playerId={player}
          playerIdContext='player'
          zoneLeader={zoneLeader}
          zonePowers={zonePowers}
        />
      </div>

      <div className={styles['player-side-wrapper']}>
        <ZoneDropSlot isActive={zonesAreActive} zoneNumber={zoneNumber} />

        <div className={[styles['zone-side'], styles['player-side']].join(' ')}>
          {[...Array.from(Array(6))].map((_, idx: number) => {
            return  (
              <PlayerZoneSlot
                key={idx}
                data={zone.sides[player][idx]}
                onClick={(val: any) => console.log(val)}
                zoneNumber={zoneNumber}
                zoneRef={zoneRef}
                slotIndex={idx}
                player={player}
              />
            )
          })}
        </div>
      </div>
    </div>
  );
};
