import { current } from 'immer';
import { ReactNode, useEffect, useState } from 'react';
import { useEffectListener } from 'bgio-effects/react';
import type { Card, DiscardCardEffects, PlayerID } from '../../../types';
import { getRandomNumberBetween } from '../../../utils';
import { Context } from '../../../enums';
import { MinionOnPlayAnimation } from './MinionOnPlayAnimation';
import { MinionEventAnimation } from './MinionEventAnimation';

// import styles from './MinionSlotWrapper.module.scss';

interface Props {
  children: ReactNode;
  data?: Card;
  index?: number;
  moves?: any;
  player?: PlayerID;
  opponent?: PlayerID;
  prevHand?: Card[];
  zoneNumber?: number;
}

export const MinionSlotWrapper = ({
  children,
  data,
  index,
  moves,
  player,
  opponent,
  zoneNumber,
}: Props) => {
  const b = data && data?.booleans;
  const { attackMinion, buffMinion, destroyMinion } = moves;

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
  };

  const move = (
    context: string,
  ): void => {
    switch (context) {
      case Context.CanBeAttackedBySpell:
        return attackMinion(player, data?.uuid, zoneNumber);
      case Context.CanBeAttackedByWeapon:
        return attackMinion(player, data?.uuid, zoneNumber);
      case Context.CanBeBuffed:
        return buffMinion(player, data?.uuid, zoneNumber);
      case Context.CanBeDestroyed:
        return destroyMinion(player, data?.uuid, zoneNumber);
      case Context.CanBeHealed:
        return buffMinion(player, data?.uuid, zoneNumber);
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
      ].join(' ')}
      data-component='MinionSlotWrapper'
      data-index={index}
      onClick={handleOnClick}
      style={{
        transform: `rotate(${rotation}deg)`,
        top: `${offsetY}px`,
      }}
    >
      <>
        <MinionEventAnimation data={data} index={index} zoneNumber={zoneNumber} />
        <MinionOnPlayAnimation data={data} index={index} zoneNumber={zoneNumber} />
        {children}
      </>
    </div>
  );
};
