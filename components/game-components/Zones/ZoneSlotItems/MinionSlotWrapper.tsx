import Image from 'next/image';
import { ReactNode, useEffect, useState } from 'react';
import type { Card, PlayerID } from '../../../../types';

import { getRandomNumberBetween } from '../../../../utils';
import { Context } from '../../../../enums';
import { MinionOnPlayAnimation } from './MinionOnPlayAnimation';
import { MinionEventAnimation } from './MinionEventAnimation';

import SUBTYPE_RACE_DEMONIC from '../../../../public/images/card-assets/SUBTYPE_RACE_DEMONIC.png';

// import styles from './MinionSlotWrapper.module.scss';

interface Props {
  children: ReactNode;
  data?: Card;
  index?: number;
  moves?: any;
  opponent?: PlayerID;
  player?: PlayerID;
  prevHand?: Card[];
  theirID?: PlayerID;
  yourID?: PlayerID;
  zoneNumber?: number;
  zoneSide?: PlayerID;
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

  const handleOnClick = (): void => {
    if (b?.canBeAttackedBySpell) move(Context.CanBeAttackedBySpell);
    if (b?.canBeBuffed) move(Context.CanBeBuffed);
    if (b?.canBeDestroyed) move(Context.CanBeDestroyed);
    if (b?.canBeHealed) move(Context.CanBeHealed);
  };

  const move = (
    context: string,
  ): void => {
    switch (context) {
      case Context.CanBeAttackedBySpell:
        return attackMinion(player, zoneSide, data?.uuid, zoneNumber);
      case Context.CanBeAttackedByWeapon:
        return attackMinion(player, zoneSide, data?.uuid, zoneNumber);
      case Context.CanBeBuffed:
        return buffMinion(player, zoneSide, data?.uuid, zoneNumber);
      case Context.CanBeDestroyed:
        return destroyMinion(player, zoneSide, data?.uuid, zoneNumber);
      case Context.CanBeHealed:
        return healMinion(player, zoneSide, data?.uuid, zoneNumber);
      default:
        return;
    }
  };

  return (
    <div
      className={[
        'minionslot',
        b?.canBeAttackedBySpell && playerView ? 'minionslot--can-be-attacked' : '',
        b?.canBeBuffed && playerView ? 'minionslot--can-be-buffed' : '',
        b?.canBeDestroyed && playerView ? 'minionslot--can-be-destroyed' : '',
        b?.canBeHealed && playerView ? 'minionslot--can-be-healed' : '',
        b?.isDestroyed && playerView ? 'minionslot--is-destroyed' : '',
      ].join(' ')}
      data-component='MinionSlotWrapper'
      data-index={index}
      data-zone-side={zoneSide}
      onClick={handleOnClick}
      style={{
        transform: `rotate(${rotation}deg)`,
        top: `${offsetY}px`,
      }}
    >
      <>
      {b?.isDestroyed && (
        <div className='dead-graphic'>
          <Image
            src={SUBTYPE_RACE_DEMONIC}
            layout='fill'
          />
        </div>
      )}

        {children}
        <MinionEventAnimation data={data} index={index} zoneNumber={zoneNumber} />
        <MinionOnPlayAnimation data={data} index={index} zoneNumber={zoneNumber} />
      </>
    </div>
  );
};
