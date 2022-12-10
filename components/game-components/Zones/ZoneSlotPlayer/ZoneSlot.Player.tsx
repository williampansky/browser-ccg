import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import type { Card, PlayerID } from '../../../../types';
import { Minion } from '../../../../components/game-components/Minion/Minion';
import { showCardModal } from '../../../../features/card-modal/card-modal.slice';
import { usePrevious } from '../../../../hooks';

interface Props {
  data?: Card;
  onClick: (card: Card) => void;
  playerId: PlayerID;
  slotIndex: number;
  theirID: PlayerID;
  yourID: PlayerID;
  zoneNumber: number;
}

export const PlayerZoneSlot = ({
  data,
  onClick,
  playerId,
  slotIndex,
  theirID,
  yourID,
  zoneNumber,
}: Props) => {
  const dispatch = useDispatch();
  const [objData, setObjData] = useState<Card | undefined>(undefined);
  const prevObjData = usePrevious(objData);

  const getAnimationDirection = (zoneNumber: number, data?: Card): string => {
    const scaleEnd = 'scale(1)';
    const scaleStart = 'scale(3)';
    const translateStart0 = 'translate(-100%, 100%)';
    const translateStart1 = 'translate(0, 100%)';
    const translateStart2 = 'translate(100%, 100%)';

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

  const getTransitionDelay = (obj?: Card) => {
    if (obj && obj.revealed) {
      if (obj.isEntourage) {
        const idx = slotIndex + 1;
        return `${idx * 400}ms`;
      }

      return `${slotIndex * 200}ms`;
    }

    return '0ms';
  }

  useEffect(() => {
    if (data && data?.revealed && playerId === yourID) {
      setObjData(data);
    } else if (data === undefined && prevObjData !== undefined) {
      setTimeout(() => setObjData(undefined), 500);
    }
  }, [data, playerId]);

  return (
    <div
      onClick={() => objData && dispatch(showCardModal(objData))}
      data-component='PlayerZoneSlot'
      style={{
        height: 'var(--minion-height)',
        width: 'calc(var(--minion-height) / 1.25)',
        transition: '250ms ease-in',
        position: 'relative',
        pointerEvents: objData ? 'auto' : 'none',
        opacity: objData ? 1 : 0,
        zIndex: objData ? '1' : '-1',
        transform: `${getAnimationDirection(zoneNumber, objData)}`,
        // transitionDelay: objData?.revealed ? `${slotIndex * 200}ms` : '0ms',
        transitionDelay: getTransitionDelay(objData)
      }}
    >
      <Minion {...objData!} />
    </div>
  );
};
