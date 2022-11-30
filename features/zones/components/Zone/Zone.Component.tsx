import React, { useEffect, useState } from 'react';
import Image from 'next/image';

import type {
  GameConfig,
  PlayerID,
  Zone as ZoneServerProps,
  ZonesCardsReference,
} from '../../../../types';

import { usePrevious } from '../../../../hooks';
import { OpponentZoneSlot } from '../ZoneSlotOpponent';
import { PlayerZoneSlot } from '../ZoneSlotPlayer';
import { ZoneDropSlot } from '../ZoneDropSlot';
import { ZoneLeaderEffects } from '../ZoneLeaderEffects';
import { ZonePower } from '../ZonePower';
import { ZoneRevealOverlay } from '../ZoneRevealOverlay';
import { ZoneName } from '../ZoneName';
import { MinionSlotWrapper } from '../../../../components/game-components/Zones/MinionSlotWrapper';

interface ZoneClientProps {
  yourID: PlayerID;
  theirID: PlayerID;
  turn: number;
  zone: ZoneServerProps;
  zoneNumber: number;
  zoneRef: ZonesCardsReference;
  zonesAreActive: boolean;
  gameConfig: GameConfig;
  moves: any;
}

export const Zone = ({
  theirID,
  yourID,
  turn,
  zone,
  zoneNumber,
  zoneRef,
  zonesAreActive,
  gameConfig,
  moves,
}: ZoneClientProps) => {
  const { powers } = zone;
  const { numerics, zonesConfig } = gameConfig;
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

  const zoneClasses = [
    'zone',
    zone?.disabled[yourID] ? 'zone--disabled-you' : '',
    zone?.disabled[theirID] ? 'zone--disabled-them' : '',
    zone?.disabled[yourID] && zone?.disabled[theirID] ? 'zone--disabled' : '',
  ].join(' ');

  return (
    <div className={zoneClasses}>
      <div className={['zone__side', 'side__opponent'].join(' ')}>
        {[...Array.from(Array(numerics.numberOfSlotsPerZone))].map(
          (_, idx: number) => {
            return (
              <MinionSlotWrapper
                key={idx}
                data={zone.sides[theirID][idx]}
                player={yourID}
                opponent={theirID}
                index={idx}
                moves={moves}
                zoneNumber={zoneNumber}
                zoneSide={theirID}
              >
                <OpponentZoneSlot
                  key={idx}
                  data={zone.sides[theirID][idx]}
                  onClick={(val: any) => console.log(val)}
                  zoneNumber={zoneNumber}
                  zoneRef={zoneRef}
                  slotIndex={idx}
                  playerId={theirID}
                  yourID={yourID}
                  theirID={theirID}
                />
              </MinionSlotWrapper>
            );
          }
        )}
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
          playerId={theirID}
          playerIdContext='opponent'
          zoneLeader={zoneLeader}
          zonePowers={zonePowers}
        />
        <ZonePower
          key='player'
          playerId={yourID}
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
          {[...Array.from(Array(numerics.numberOfSlotsPerZone))].map(
            (_, idx: number) => {
              return (
                <MinionSlotWrapper
                  key={idx}
                  data={zone.sides[yourID][idx]}
                  player={yourID}
                  opponent={theirID}
                  index={idx}
                  moves={moves}
                  zoneNumber={zoneNumber}
                  zoneSide={yourID}
                >
                  <PlayerZoneSlot
                    data={zone.sides[yourID][idx]}
                    onClick={(val: any) => console.log(val)}
                    zoneNumber={zoneNumber}
                    zoneRef={zoneRef}
                    slotIndex={idx}
                    playerId={yourID}
                    yourID={yourID}
                    theirID={theirID}
                  />
                </MinionSlotWrapper>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
};
