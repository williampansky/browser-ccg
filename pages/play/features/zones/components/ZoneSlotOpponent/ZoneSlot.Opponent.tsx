import { useEffectListener } from 'bgio-effects/react';
import { Ctx } from 'boardgame.io';
import React, { ReactElement, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { Card, GameState, PlayerID } from '../../../../../../types';
import { showCardModal } from '../../../card-modal/card-modal.slice';
import { Minion } from '../../../../../../components/game-components/Minion/Minion';
import { getRandomNumberBetween } from '../../../../../../utils';


interface ReactZoneSlot {
  G?: GameState;
  data?: Card;
  onClick: (card: Card) => void;
  zoneNumber: number;
  zoneRef: any;
  slotIndex: number;
  opponent: PlayerID;
}

export const OpponentZoneSlot = ({
  data,
  zoneNumber,
  zoneRef,
  slotIndex,
  opponent,
  onClick,
}: ReactZoneSlot): ReactElement => {
  const dispatch = useDispatch();
  const [objData, setObjData] = useState<Card | undefined>(undefined);
  const [incoming, setIncoming] = useState<boolean>(false);
  const [animation, setAnimation] = useState<string>('');
  const [rotation, setRotation] = useState<number>(0);

  // useEffect(() => {
  //   if (zoneRef[opponent]?.length && zoneRef[opponent][slotIndex]) {
  //     const ref = zoneRef[opponent][slotIndex].revealed;
  //     if (!ref) setIncoming(true);
  //   }
  // }, [zoneRef]);

  const getAnimationDirection = (zoneNumber: number, data?: Card): string => {
    const scaleEnd = 'scale(1, -1)';
    const scaleStart = 'scale(5, -5)';
    const translateStart0 = 'translate(-50%, -50%)';
    const translateStart1 = 'translate(0, -100%)';
    const translateStart2 = 'translate(50%, -50%)';
  
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
    if (data?.revealed) {
      setObjData(data);
      // setIncoming(false);
    }
  }, [data]);

  useEffect(() => {
    setRotation(getRandomNumberBetween(-3, 3));
  }, []);

  const onUnrevealedClick = () => {
    if (!incoming) return;
    return onClick(zoneRef[opponent][slotIndex]);
  };

  // if (G?.ZonesCardsReference[zoneNumber]['0'][slotIndex]) {
  // if (objData?.revealed === false) {
  if (incoming) {
    return (
      <div
        onClick={onUnrevealedClick}
        style={{
          height: 'var(--minion-height)',
          width: 'calc(var(--minion-height) / 1.25)',
          transition: '100ms ease-in',
          opacity: 0.65,
          border: '1px solid orange',
          borderRadius: '1.25em 1.25em 0 0',
        }}
      />
    );
  }

  return (
    <div
      onClick={() => objData && dispatch(showCardModal(objData))}
      style={{
        height: 'var(--minion-height)',
        width: 'calc(var(--minion-height) / 1.25)',
        transition: '250ms ease-in',
        position: objData ? 'relative' : 'relative',
        opacity: objData ? '1' : '0',
        zIndex: objData ? '1' : '-1',
        transform: `${getAnimationDirection(zoneNumber, objData)} rotate(${rotation}deg)`,
        transitionDelay: objData?.revealed ? `${slotIndex * 100}ms` : '0ms',
        // filter: objData ? 'blur(0)' : 'blur(1px)'
      }}
    >
      {/* @ts-ignore */}
      <Minion {...objData} />
    </div>
  );
};
