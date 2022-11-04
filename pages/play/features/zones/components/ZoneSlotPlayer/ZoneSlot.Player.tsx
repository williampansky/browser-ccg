import { useEffectListener } from 'bgio-effects/react';
import { Ctx } from 'boardgame.io';
import React, { ReactElement, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { Card, GameState, PlayerID } from '../../../../../../types';
import { Minion } from '../../../../../../components/game-components/Minion/Minion';
import { showCardModal } from '../../../card-modal/card-modal.slice';
import { getRandomNumberBetween } from '../../../../../../utils';


const getAnimationStart = (zoneNumber: number): string => {
  const scaleStart = 'scale(5)';
  const translateStart0 = 'translate(-50%, 50%)';
  const translateStart1 = 'translate(0, 100%)';
  const translateStart2 = 'translate(50%, 50%)';
  
  switch (zoneNumber) {
    case 0:
      return `${scaleStart} ${translateStart0}`;
    case 1:
      return `${scaleStart} ${translateStart1}`;
    case 2:
      return `${scaleStart} ${translateStart2}`;
    default:
      return '';
  }
};

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

  const animationStart = useState<string>(getAnimationStart(zoneNumber));
  const animationEnd = useState<string>(`scale(1) translate(0, 0)`);
  const [rotation, setRotation] = useState<number>(0);

  useEffect(() => {
    if (zoneRef[player]?.length && zoneRef[player][slotIndex]) {
      const ref = zoneRef[player][slotIndex].revealed;
      if (!ref) setIncoming(true);
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
    setRotation(getRandomNumberBetween(-2, 2));
  }, []);

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
          border: '1px solid orange',
          borderRadius: '10px',
          transform: `rotate(${rotation}deg)`,
        }}
      >
        <div
          style={{
            transform: 'scale(0.8)',
            position: 'relative',
            top: -0.5,
            left: -1,
            opacity: 0.65,
            transition: '100ms ease-in',
          }}
        >
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
        position: objData ? 'relative' : 'relative',
        opacity: objData ? '1' : '0',
        zIndex: objData ? '1' : '-1',
        transform: `${objData?.revealed ? animationEnd.toString() : animationStart.toString()} rotate(${rotation}deg)`,
        transitionDelay: objData?.revealed ? `${slotIndex * 100}ms` : '0ms',
        // filter: objData ? 'blur(0)' : 'blur(1px)'
      }}
    >
      {/* @ts-ignore */}
      <Minion {...objData} />
    </div>
  );
};
