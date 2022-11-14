import React, { useEffect, useState } from 'react';
import type { ReactElement } from 'react';

import { usePrevious } from '../../../../hooks';
import type {
  GameConfig,
  PlayerID,
  Zone as ZoneServerProps,
  ZonesCardsReference,
} from '../../../../types';

import { OpponentZoneSlot } from '../ZoneSlotOpponent';
import { PlayerZoneSlot } from '../ZoneSlotPlayer';
import { ZoneDropSlot } from '../ZoneDropSlot';
import { ZoneLeaderEffects } from '../ZoneLeaderEffects';
import { ZonePower } from '../ZonePower';
import { ZoneRevealOverlay } from '../ZoneRevealOverlay';
import { ZoneName } from '../ZoneName';
import Image from 'next/image';

interface ZoneClientProps {
  opponent: string;
  player: string;
  turn: number;
  zone: ZoneServerProps;
  zoneNumber: number;
  zoneRef: ZonesCardsReference;
  zonesAreActive: boolean;
  gameConfig: GameConfig;
}

export const Zone = ({
  opponent,
  player,
  turn,
  zone,
  zoneNumber,
  zoneRef,
  zonesAreActive,
  gameConfig,
}: ZoneClientProps): ReactElement => {
  const { powers } = zone;
  const { zonesConfig } = gameConfig;
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
        'zone',
        zone?.disabled[player] ? 'zone--disabled' : '',
      ].join(' ')}
    >
      <div className={['zone__side', 'side__opponent'].join(' ')}>
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
          );
          //  : (
          //   <div key={idx} className={styles['blank-slot']} />
          // );
        })}
      </div>

      <div className={'zone__center'}>
        <ZoneName
          name={zonesConfig.zoneNames ? zone?.name : ''}
          effectText={
            zonesConfig.effectAdjustments ? zone?.effectText : undefined
          }
        />

        {zonesConfig.zoneReveals && (
          <ZoneRevealOverlay
            isRevealed={zone?.revealed}
            turn={turn}
            zoneNumber={zoneNumber}
          />
        )}

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

        {zonesConfig.zoneImages && (
          <div className={'center__image'}>
            <Image
              alt=''
              role='presentation'
              layout='fill'
              src={`/images/zones/${zone.id.replace('ZONE_', '')}.jpg`}
            />
          </div>
        )}
      </div>

      <div className={'side__player__wrapper'}>
        <ZoneDropSlot isActive={zonesAreActive} zoneNumber={zoneNumber} />

        <div className={['zone__side', 'side__player'].join(' ')}>
          {[...Array.from(Array(6))].map((_, idx: number) => {
            return (
              <PlayerZoneSlot
                key={idx}
                data={zone.sides[player][idx]}
                onClick={(val: any) => console.log(val)}
                zoneNumber={zoneNumber}
                zoneRef={zoneRef}
                slotIndex={idx}
                player={player}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
