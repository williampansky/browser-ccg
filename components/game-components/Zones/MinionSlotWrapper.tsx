import { current } from 'immer';
import { ReactNode, useEffect, useState } from 'react';
import { useEffectListener } from 'bgio-effects/react';
import type { Card, DiscardCardEffects, PlayerID } from '../../../types';
import { getRandomNumberBetween } from '../../../utils';
import { Context } from '../../../enums';

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
  const booleans = data && data?.booleans;
  const { attackMinion, buffMinion, destroyMinion } = moves;

  const [rotation, setRotation] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);

  useEffect(() => {
    setRotation(getRandomNumberBetween(-3, 3));
    setOffsetY(getRandomNumberBetween(-2, 2));
  }, []);

  const handleOnClick = (): void => {
    if (booleans?.canBeAttackedBySpell) move(Context.CanBeAttackedBySpell);
    if (booleans?.canBeBuffed) move(Context.CanBeBuffed);
    if (booleans?.canBeDestroyed) move(Context.CanBeDestroyed);
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
      default:
        return;
    }
  };

  return (
    <div
      className={[
        'minionslot',
        booleans?.canBeAttackedBySpell ? 'minionslot--can-be-attacked' : '',
        booleans?.canBeBuffed ? 'minionslot--can-be-buffed' : '',
        booleans?.canBeDestroyed ? 'minionslot--can-be-destroyed' : '',
      ].join(' ')}
      data-component='MinionSlotWrapper'
      data-index={index}
      onClick={handleOnClick}
      style={{
        transform: `rotate(${rotation}deg)`,
        top: `${offsetY}px`,
      }}
    >
      {children}
    </div>
  );
};
