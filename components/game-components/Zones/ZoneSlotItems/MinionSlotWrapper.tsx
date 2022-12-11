import Image from 'next/image';
import { ReactNode, SyntheticEvent, useEffect, useState } from 'react';
import type { Card, PlayerID } from '../../../../types';

import { getRandomNumberBetween } from '../../../../utils';
import { Context } from '../../../../enums';
import { MinionOnPlayAnimation } from './MinionOnPlayAnimation';
import { MinionEventAnimation } from './MinionEventAnimation';
import { MinionOnTurnEndAnimation } from './MinionOnTurnEndAnimation';

import SUBTYPE_RACE_DEMONIC from '../../../../public/images/card-assets/SUBTYPE_RACE_DEMONIC.png';
import { AttackMinionMove } from '../../../../game/moves/attack-minion.move';
import { BuffMinionMove } from '../../../../game/moves/buff-minion.move';
import { DestroyMinionMove, HealMinionMove } from '../../../../game/moves';

// import styles from './MinionSlotWrapper.module.scss';

interface Props {
  children: ReactNode;
  data?: Card;
  index: number;
  moves?: any;
  opponent?: PlayerID;
  player?: PlayerID;
  prevHand?: Card[];
  theirID?: PlayerID;
  yourID?: PlayerID;
  zoneNumber?: number;
  zoneSide: PlayerID;
  onAttackMinionClick: ({ card, targetPlayer }: AttackMinionMove) => void;
  onBuffMinionClick: ({ card, targetPlayer }: BuffMinionMove) => void;
  onDestroyMinionClick: ({ card, targetPlayer }: DestroyMinionMove) => void;
  onHealMinionClick: ({ card, targetPlayer }: HealMinionMove) => void;
}

export const MinionSlotWrapper = ({
  children,
  data,
  index,
  moves,
  opponent,
  player,
  theirID,
  yourID,
  zoneNumber,
  zoneSide,
  onAttackMinionClick,
  onBuffMinionClick,
  onDestroyMinionClick,
  onHealMinionClick,
}: Props) => {
  const b = data && data?.booleans;
  const playerView = zoneSide === yourID;
  const { attackMinion, buffMinion, destroyMinion, healMinion } = moves;

  const [rotation, setRotation] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);

  useEffect(() => {
    setRotation(getRandomNumberBetween(-3, 3));
    setOffsetY(getRandomNumberBetween(-2, 2));
  }, []);

  const handleOnClick = (event: SyntheticEvent): void => {
    const target = event.target as HTMLDivElement;
    target.blur();
    
    if (b?.canBeAttackedBySpell) move(Context.CanBeAttackedBySpell);
    if (b?.canBeBuffed) move(Context.CanBeBuffed);
    if (b?.canBeDestroyed) move(Context.CanBeDestroyed);
    if (b?.canBeHealed) move(Context.CanBeHealed);
  };

  const move = (context: string): void => {
    switch (context) {
      case Context.CanBeAttackedBySpell:
        return onAttackMinionClick({ card: data!, targetPlayer: zoneSide });
      case Context.CanBeAttackedByWeapon:
        return attackMinion(player, zoneSide, data?.uuid, zoneNumber);
      case Context.CanBeBuffed:
        return onBuffMinionClick({ card: data!, targetPlayer: zoneSide });
      case Context.CanBeDestroyed:
        return onDestroyMinionClick({ card: data!, targetPlayer: zoneSide });
      case Context.CanBeHealed:
        return onHealMinionClick({ card: data!, targetPlayer: zoneSide });
      default:
        return;
    }
  };

  return (
    <div
      className={[
        'minionslot',
        b?.canBeAttackedBySpell ? 'minionslot--can-be-attacked' : '',
        b?.canBeBuffed ? 'minionslot--can-be-buffed' : '',
        b?.canBeDestroyed ? 'minionslot--can-be-destroyed' : '',
        b?.canBeHealed ? 'minionslot--can-be-healed' : '',
        b?.isDestroyed ? 'minionslot--is-destroyed' : '',
      ].join(' ')}
      data-component='MinionSlotWrapper'
      data-index={index}
      data-zone-side={zoneSide}
      data-uuid={data?.uuid}
      onClick={handleOnClick}
      style={{
        transform: `rotate(${rotation}deg)`,
        top: `${offsetY}px`,
      }}
    >
      <>
        {b?.isDestroyed && (
          <div className='dead-graphic'>
            <Image src={SUBTYPE_RACE_DEMONIC} layout='fill' />
          </div>
        )}

        {children}

        {data?.eventStream.map((e, i) => {
          switch (e.event) {
            case 'eventWasTriggered':
              return (
                <MinionEventAnimation
                  key={`${i}_${e.uuid}`}
                  index={index}
                  mapIndex={i}
                />
              );
            case 'onPlayWasTriggered':
              return (
                <MinionOnPlayAnimation
                  key={`${i}_${e.uuid}`}
                  index={index}
                  mapIndex={i}
                />
              );
            case 'onTurnEndWasTriggered':
              return (
                <MinionOnTurnEndAnimation
                  key={`${i}_${e.uuid}`}
                  index={index}
                  mapIndex={i}
                />
              );
          
            default:
              break;
          }
        })}

        {/* {b && (
          <>
            <MinionEventAnimation
              eventWasTriggered={b?.eventWasTriggered}
              index={index}
              zoneNumber={zoneNumber}
            />
            <MinionOnPlayAnimation
              data={data}
              index={index}
              zoneNumber={zoneNumber}
            />
          </>
        )} */}
      </>
    </div>
  );
};
