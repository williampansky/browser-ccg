import React, { ReactElement, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { Card, PlayerID } from '../../../../types';
import { Minion } from '../../../../components/game-components/Minion/Minion';
import { showCardModal } from '../../../card-modal/card-modal.slice';
import { getRandomNumberBetween } from '../../../../utils';
import styles from './zoneslot-player.module.scss';

interface ReactZoneSlot {
  data?: Card;
  onClick: (card: Card) => void;
  zoneNumber: number;
  zoneRef: any;
  slotIndex: number;
  player: PlayerID;
}

export const PlayerZoneSlot = ({
  data,
  zoneNumber,
  zoneRef,
  slotIndex,
  player,
  onClick,
}: ReactZoneSlot): ReactElement => {
  const dispatch = useDispatch();
  const [objData, setObjData] = useState<Card | undefined>(undefined);
  const [incoming, setIncoming] = useState<boolean>(false);

  const [rotation, setRotation] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);

  const getAnimationDirection = (
    zoneNumber: number,
    incoming: boolean = false,
    data?: Card
  ): string => {
    const scaleEnd = 'scale(1)';
    const scaleStart = 'scale(3)';
    const translateStart0 = 'translate(-100%, 100%)';
    const translateStart1 = 'translate(0, 100%)';
    const translateStart2 = 'translate(100%, 100%)';

    if (incoming)
      switch (zoneNumber) {
        case 0:
          return data
            ? `${scaleStart} ${translateStart0}`
            : `${scaleEnd} translate(0,0)`;
        case 1:
          return data
            ? `${scaleStart} ${translateStart1}`
            : `${scaleEnd} translate(0,0)`;
        case 2:
          return data
            ? `${scaleStart} ${translateStart2}`
            : `${scaleEnd} translate(0,0)`;
        default:
          return '';
      }

    switch (zoneNumber) {
      case 0:
        return data
          ? `${scaleEnd} translate(0,0)`
          : `${scaleStart} ${translateStart0}`;
      case 1:
        return data
          ? `${scaleEnd} translate(0,0)`
          : `${scaleStart} ${translateStart1}`;
      case 2:
        return data
          ? `${scaleEnd} translate(0,0)`
          : `${scaleStart} ${translateStart2}`;
      default:
        return '';
    }
  };

  useEffect(() => {
    if (zoneRef[player]?.length && zoneRef[player][slotIndex]) {
      const ref = zoneRef[player][slotIndex].revealed;
      if (!ref) setIncoming(true);
    } else {
      setIncoming(false);
      setObjData(undefined);
    }
  }, [zoneRef]);

  const onUnrevealedClick = () => {
    if (!incoming) return;
    return dispatch(showCardModal(zoneRef[player][slotIndex]));
  };

  useEffect(() => {
    if (data?.revealed) {
      setObjData(data);
      setIncoming(false);
    }
  }, [data]);

  useEffect(() => {
    setRotation(getRandomNumberBetween(-3, 3));
    setOffsetY(getRandomNumberBetween(-2, 2));
  }, []);

  if (incoming) {
    return (
      <div
        onClick={onUnrevealedClick}
        className={styles['incoming-wrapper']}
        style={{
          top: `${offsetY}px`,
          transform: `${getAnimationDirection(
            zoneNumber,
            incoming,
            objData
          )} rotate(${rotation}deg)`,
        }}
      >
        <div className={styles['incoming-minion-wrapper']}>
          {/* @ts-ignore */}
          <Minion {...zoneRef[player][slotIndex]} />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => objData && dispatch(showCardModal(objData))}
      style={{
        height: 'var(--minion-height)',
        width: 'calc(var(--minion-height) / 1.25)',
        transition: '250ms ease-in',
        position: 'relative',
        pointerEvents: objData ? 'auto' : 'none',
        top: `${offsetY}px`,
        opacity: objData ? 1 : 0,
        zIndex: objData ? '1' : '-1',
        transform: `${getAnimationDirection(
          zoneNumber,
          incoming,
          objData
        )} rotate(${rotation}deg)`,
        transitionDelay: objData?.revealed ? `${slotIndex * 200}ms` : '0ms',
      }}
    >
      {/* @ts-ignore */}
      <Minion {...objData} />
    </div>
  );
};
