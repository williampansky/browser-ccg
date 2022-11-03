import { useEffectListener } from 'bgio-effects/react';
import { Ctx } from 'boardgame.io';
import React, { ReactElement, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { Card, GameState, PlayerID } from '../../../../../../types';
import { Minion } from '../../../../../../components/game-components/Minion/Minion';
import { showCardModal } from '../../../card-modal/card-modal.slice';

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
  const [objData, setObjData] = useState<Card | null>(null);
  const [incoming, setIncoming] = useState<boolean>(false);

  useEffect(() => {
    if (zoneRef[player]?.length && zoneRef[player][slotIndex]) {
      const ref = zoneRef[player][slotIndex].revealed;
      if (!ref) setIncoming(true);
    }
  }, [zoneRef]);

  useEffect(() => {
    if (data?.revealed) {
      setObjData(data);
      setIncoming(false);
    }
  }, [data]);

  const getAnimationDirection = (zoneNumber: number): string => {
    const scaleEnd = 'scale(1)';
    const scaleStart = 'scale(5)';
    const translateStart0 = 'translate(-50%, 50%)';
    const translateStart1 = 'translate(0, 100%)';
    const translateStart2 = 'translate(50%, 50%)';

    switch (zoneNumber) {
      case 0:
        return objData
          ? `${scaleEnd} translate(0,0)`
          : `${scaleStart} ${translateStart0}`;
      case 1:
        return objData
          ? `${scaleEnd} translate(0,0)`
          : `${scaleStart} ${translateStart1}`;
      case 2:
        return objData
          ? `${scaleEnd} translate(0,0)`
          : `${scaleStart} ${translateStart2}`;
      default:
        return '';
    }
  };

  const onUnrevealedClick = () => {
    if (!incoming) return;
    return dispatch(showCardModal(zoneRef[player][slotIndex]));
  }

  // if (G?.ZonesCardsReference[zoneNumber]['0'][slotIndex]) {
  // if (objData?.revealed === false) {
  if (incoming) {
    return (
      <div
      onClick={onUnrevealedClick}
      style={{
        height: 'var(--card-height)',
        width: 'calc(var(--minion-height) / 1.25)',
        transition: '100ms ease-in',
        opacity: 0.65,
        border: '1px solid orange',
        borderRadius: '1.25em 1.25em 0 0',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexFlow: 'column nowrap',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.25em',
          textAlign: 'center',
          position: 'relative',
          border: '1px solid black',
          borderRadius: '1.25em 1.25em 0 0',
          background: 'white',
          height: '100%',
          width: '100%',
          transform: 'scale(95%)',
        }}
      >
        <div
          style={{
            fontSize: '0.85em',
            fontWeight: 'bold',
            display: 'flex',
            flexFlow: 'column nowrap',
            alignItems: 'center',
            justifyContent: 'center',
            height: '1.195em',
            width: '1.15em',
            position: 'absolute',
            top: '-0.35em',
            right: 'auto',
            bottom: 'auto',
            left: '-0.35em',
            background: 'lightgreen',
            borderRadius: '50%',
          }}
        >
          {zoneRef[player][slotIndex]?.currentCost}
        </div>
        <div
          style={{
            fontSize: '0.85em',
            fontWeight: 'bold',
            display: 'flex',
            flexFlow: 'column nowrap',
            alignItems: 'center',
            justifyContent: 'center',
            height: '1.195em',
            width: '1.15em',
            position: 'absolute',
            top: '-0.35em',
            right: '-0.35em',
            bottom: 'auto',
            left: 'auto',
            color: 'white',
            background: 'red',
            borderRadius: '50%',
          }}
        >
          {zoneRef[player][slotIndex]?.displayPower}
        </div>
        <div style={{ fontSize: '0.5em' }}>{zoneRef[player][slotIndex]?.name}</div>
      </div>
    </div>
    );
  }

  return (
    <div
      onClick={() => objData && dispatch(showCardModal(objData))}
      style={{
        height: 'var(--card-height)',
        width: 'calc(var(--minion-height) / 1.25)',
        transition: '250ms ease-in',
        position: objData ? 'relative' : 'relative',
        opacity: objData ? '1' : '0',
        zIndex: objData ? 'auto' : '-1',
        transform: getAnimationDirection(zoneNumber),
        transitionDelay: objData?.revealed ? `${slotIndex * 100}ms` : '0ms',
        // filter: objData ? 'blur(0)' : 'blur(1px)'
      }}
    >
      {/* @ts-ignore */}
      <Minion {...objData} />
    </div>
  );
};
