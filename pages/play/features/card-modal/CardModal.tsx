import { Ctx } from 'boardgame.io';
import React, { ReactElement, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardPowerStream, GameState } from '../../../../types';
import type { RootState } from '../../store';
import { hideCardModal } from './card-modal.slice';
import type { CardModal as ICardModal } from './card-modal.slice';
import { Card as CardComponent } from '../../../../components/game-components/Card/Card';

export const CardModal = (): ReactElement | null => {
  const dispatch = useDispatch();
  const onClick = () => dispatch(hideCardModal(null));
  const cardModalData = useSelector(
    ({ cardModal }: RootState) => cardModal
  ) as ICardModal;

  return (
    <div
      onClick={onClick}
      style={{
        height: '100%',
        width: '100%',
        transition: '150ms ease-in',
        opacity: cardModalData ? '1' : '0',
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: cardModalData ? 999 : -1,
        pointerEvents: cardModalData ? 'auto' : 'none',
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'center',
        justifyContent: 'center',
        // background: 'rgba(255,255,255,0.65)',
        background: 'rgba(0,0,0,0.865)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 'auto',
          left: 0,
          padding: '1em 0.5em',
          display: 'flex',
          flexFlow: 'row wrap',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          gridGap: '0.5em',
        }}
      >
        {cardModalData?.powerStream.map((s: CardPowerStream, i: number) => {
          return (
            <React.Fragment key={`stream_${i}`}>
              <div
                style={{
                  display: 'flex',
                  flexFlow: 'column nowrap',
                  alignItems: 'center',
                  justifyContent: 'center',
                  maxWidth: '5em',
                  padding: '0.25em',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    background: 'gray',
                    borderRadius: '50%',
                    padding: '0.5em',
                    height: '2em',
                    width: '2em',
                    display: 'flex',
                    flexFlow: 'column nowrap',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 4,
                  }}
                >
                  {s.currentPower}
                </div>
                <div style={{ color: 'white', fontSize: 9 }}>{s.blame}</div>
              </div>

              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  flexFlow: 'column nowrap',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ color: 'white', fontSize: 14 }}>{'<-'}</div>
              </div>
            </React.Fragment>
          );
        })}

        {cardModalData?.zonePowerAdjustment && (
          <div
            style={{
              display: 'flex',
              flexFlow: 'column nowrap',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: '5em',
              padding: '0.25em',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                background: 'gray',
                borderRadius: '50%',
                padding: '0.5em',
                height: '2em',
                width: '2em',
                display: 'flex',
                flexFlow: 'column nowrap',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 4,
              }}
            >
              {cardModalData?.zonePowerAdjustment}
            </div>
            <div style={{ color: 'white', fontSize: 9 }}>Zone Adjustment</div>
          </div>
        )}

        <div
          style={{
            height: '100%',
            display: 'flex',
            flexFlow: 'column nowrap',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ color: 'white', fontSize: 14 }}>{'<-'}</div>
        </div>

        {cardModalData?.basePower && (
          <div
            style={{
              display: 'flex',
              flexFlow: 'column nowrap',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: '5em',
              padding: '0.25em',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                background: 'gray',
                borderRadius: '50%',
                padding: '0.5em',
                height: '2em',
                width: '2em',
                display: 'flex',
                flexFlow: 'column nowrap',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 4,
              }}
            >
              {cardModalData?.basePower}
            </div>
            <div style={{ color: 'white', fontSize: 9 }}>Base Power</div>
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          flexFlow: 'column nowrap',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1em',
          textAlign: 'center',
          position: 'relative',
          // border: '1px solid black',
          // borderRadius: '1.25em',
          // background: 'white',
          // height: '80vw',
          // width: '60vw',
          // maxHeight: `600px`,
          // maxWidth: `400px`,
          transform: cardModalData ? 'scale(100%)' : 'scale(0%)',
          transition: '150ms ease-in',
        }}
      >
        {/* @ts-ignore */}
        <CardComponent {...cardModalData} />
      </div>
    </div>
  );
};
