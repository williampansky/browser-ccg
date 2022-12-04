import React, { useEffect, useState } from 'react';
import Image from 'next/image';

import type { Card, GameConfig, PlayerID, Zone as IZone } from '../../../../types';
import { usePrevious } from '../../../../hooks';

import {
  MinionSlotWrapper,
  OpponentZoneSlot,
  PlayerZoneSlot,
  ZoneDropSlot,
  ZoneLeaderEffects,
  ZoneName,
  ZonePower,
  ZoneRevealOverlay,
} from '..';

interface Props {
  gameConfig: GameConfig;
  moves: any;
  theirID: PlayerID;
  turn: number;
  yourID: PlayerID;
  zone: IZone;
  zoneNumber: number;
  zonesAreActive: boolean;
  onAttackMinionClick: (zS?: PlayerID, c?: Card) => void
  onBuffMinionClick: (zS?: PlayerID, c?: Card) => void
  onHealMinionClick: (zS?: PlayerID, c?: Card) => void
}

export const Zone = ({
  gameConfig,
  moves,
  theirID,
  turn,
  yourID,
  zone,
  zoneNumber,
  zonesAreActive,
  onAttackMinionClick,
  onBuffMinionClick,
  onHealMinionClick
}: Props) => {
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
                index={idx}
                moves={moves}
                opponent={theirID}
                player={yourID}
                theirID={theirID}
                yourID={yourID}
                zoneNumber={zoneNumber}
                zoneSide={theirID}
                onAttackMinionClick={onAttackMinionClick}
                onBuffMinionClick={onBuffMinionClick}
                onHealMinionClick={onHealMinionClick}
              >
                <OpponentZoneSlot
                  key={idx}
                  data={zone.sides[theirID][idx]}
                  onClick={(val: any) => console.log(val)}
                  zoneNumber={zoneNumber}
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
        <ZoneDropSlot
          isActive={zone?.disabled[yourID] ? false : zonesAreActive}
          zoneNumber={zoneNumber}
        />

        <div className={['zone__side', 'side__player'].join(' ')}>
          {[...Array.from(Array(numerics.numberOfSlotsPerZone))].map(
            (_, idx: number) => {
              return (
                <MinionSlotWrapper
                  key={idx}
                  data={zone.sides[yourID][idx]}
                  index={idx}
                  moves={moves}
                  opponent={theirID}
                  player={yourID}
                  theirID={theirID}
                  yourID={yourID}
                  zoneNumber={zoneNumber}
                  zoneSide={yourID}
                  onAttackMinionClick={onAttackMinionClick}
                  onBuffMinionClick={onBuffMinionClick}
                  onHealMinionClick={onHealMinionClick}
                >
                  <PlayerZoneSlot
                    data={zone.sides[yourID][idx]}
                    onClick={(val: any) => console.log(val)}
                    zoneNumber={zoneNumber}
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
