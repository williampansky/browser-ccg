import { useEffectListener } from 'bgio-effects/react';
import { Ctx } from 'boardgame.io';
import React, { ReactElement, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { Card, GameState, PlayerID } from '../../../../types';
import { showCardModal } from '../../../card-modal/card-modal.slice';
import { Minion } from '../../../../components/game-components/Minion/Minion';
import { getRandomNumberBetween } from '../../../../utils';
import { gameConfig } from '../../../../app.config';

interface Props {
  G?: GameState;
  data?: Card;
  onClick: (card: Card) => void;
  zoneNumber: number;
  zoneRef: any;
  slotIndex: number;
  playerId: PlayerID;
  yourID: PlayerID;
  theirID: PlayerID;
}

export const OpponentZoneSlot = ({
  data,
  zoneNumber,
  zoneRef,
  slotIndex,
  playerId,
  yourID,
  theirID,
  onClick,
}: Props) => {
  const dispatch = useDispatch();
  const [objData, setObjData] = useState<Card | undefined>(undefined);
  const [incoming, setIncoming] = useState<boolean>(false);
  const [destroyed, setDestroyed] = useState<boolean>(false);
  const [animation, setAnimation] = useState<string>('');

  const getAnimationDirection = (zoneNumber: number, data?: Card): string => {
    const scaleEnd = 'scale(1, -1)';
    const scaleStart = 'scale(3, -3)';
    const translateStart0 = 'translate(-100%, -100%)';
    const translateStart1 = 'translate(0, -100%)';
    const translateStart2 = 'translate(100%, -100%)';
  
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
    if (data?.revealed && playerId === theirID) {
      setDestroyed(false);
      setObjData(data);
      // setIncoming(false);
    } else if (typeof data === 'undefined') {
      setDestroyed(true);
      if (gameConfig.debugConfig.debugOpponentBoardCardKey === '') {
        setTimeout(() => setObjData(undefined), 500);
      }
    } else if (playerId !== theirID) {
      setObjData(undefined);
      setIncoming(false);
    }
  }, [data, playerId]);

  const onUnrevealedClick = () => {
    if (!incoming) return;
    return onClick(zoneRef[theirID][slotIndex]);
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
          transitionDelay: '200ms'
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
        opacity: objData && !destroyed ? 1 : 0,
        zIndex: objData ? '1' : '-1',
        transform: `${getAnimationDirection(zoneNumber, objData)}`,
        transitionDelay: objData?.revealed ? `${slotIndex * 200}ms` : '0ms',
        pointerEvents: objData ? 'auto' : 'none'
        // filter: objData ? 'blur(0)' : 'blur(1px)'
      }}
    >
      {/* @ts-ignore */}
      <Minion {...objData} />
    </div>
  );
};
