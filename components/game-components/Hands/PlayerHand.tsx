import { Ctx } from 'boardgame.io';
import React, { ReactElement } from 'react';
import { Card, GameState, PlayerID } from '../../../types';
import { CardInHand } from '../Card/CardInHand';
import { Card as CardComponent } from '../Card/Card';
import { useGesture } from '@use-gesture/react';
import { useCallbackRef } from 'use-callback-ref';
import { useSprings, animated, config as springConfig, to } from 'react-spring';
import styles from './player-hand.module.scss';
import calcOffsetX from './calc-offset-x';
import calcScale from './calc-scale';
import fn from './fn';

interface PlayerHandProps {
  G: GameState;
  ctx: Ctx;
  onCardClick: (card: Card) => void;
  onCardSelect: (playerId: string, uuid: string) => void;
  onCardDeselect: (playerId: string) => void;
  onCardSlotDrop: (playerId: string, zoneNumber: number) => void;
  player: PlayerID;
}

export const PlayerHand = ({
  G,
  ctx,
  onCardClick,
  onCardSelect,
  onCardDeselect,
  onCardSlotDrop,
  player
}: PlayerHandProps): ReactElement => {
  const handLength = G.players[player].cards.hand.length;

  // Store indicies as a local ref, this represents the item order
  const [_, update] = React.useState<{} | null>(null);

  
  // Create springs, each corresponds to an item,
  // controlling its transform, scale, etc.
  const [springs, setSprings] = useSprings(handLength, fn());

  const order = useCallbackRef(
    Array.from(Array(G.gameConfig.numerics.cardsPerHand)).map(
      (_, index) => index
    ),
    () => update({})
  );

  const bind: any = useGesture(
    {
      // ts-ignore
      onDragStart: ({ active, args: [originalIndex], down, dragging }) => {
        const curIndex = order.current?.indexOf(originalIndex);
        setSprings(fn(handLength, down, dragging, active, curIndex));
      },
      // ts-ignore
      onDrag: ({
        active,
        args: [originalIndex, canPlay],
        cancel,
        down,
        dragging,
        first,
        movement: [x, y],
        tap,
      }) => {
        const curIndex = order.current?.indexOf(originalIndex);

        if (tap) {
          return onCardClick(G.players[player].cards.hand[originalIndex]);
        } else if (!canPlay) {
          cancel();
        } else {
          setSprings(
            fn(handLength, down, dragging, active, curIndex, first ? 0 : x, first ? 0 : y)
          );
        }
      },
      // ts-ignore
      onDragEnd: ({ active, args: [originalIndex], down, dragging, xy }) => {
        const curIndex = order.current?.indexOf(originalIndex);
        const elem = document.elementFromPoint(xy[0], xy[1]);
        setSprings(fn(handLength, down, dragging, active, curIndex));

        // @ts-ignore
        if (elem && elem.dataset.receive) {
          // console.log('🚀 target', elem);
          onCardSlotDrop(player, Number(elem.getAttribute('data-index')));
        }
      },
      // ts-ignore
      onHover: ({ active, args: [originalIndex], down, dragging }) => {
        const curIndex = order.current?.indexOf(originalIndex);
        setSprings(fn(handLength, down, dragging, active, curIndex));
      },
    },
    {
      // @ts-ignore
      drag: {
        enabled: true,
        mouseOnly: false,
        from: [0, 0],
        threshold: undefined,
        rubberband: 0.915, // 0.15
        eventOptions: { passive: true },
        filterTaps: true,
        delay: 0,
        swipe: { distance: 60, velocity: 0.5 },
      },
    }
  );

  const handleSelect = React.useCallback(
    (e: MouseEvent | TouchEvent, canPlay: boolean, i: number) => {
      if (canPlay) onCardSelect(player, G.players[player].cards.hand[i].uuid);
    },
    [G.players[player].cards.hand, onCardSelect]
  );

  const handleDeselect = React.useCallback(
    (e: MouseEvent | TouchEvent) => {
      onCardDeselect(player);
    },
    [onCardDeselect]
  );

  return (
    <React.Fragment>
      <div
        className={styles['player-hand']}
        style={{
          width: '100%',
          position: 'absolute',
          top: 'auto',
          bottom: '10px',
          left: 0,
          right: 0,
          maxWidth: '100%',
          minHeight: '54px',
          maxHeight: '54px',
          padding: '0 1em',
        }}
      >
        <div
          style={{
            // display: 'grid',
            // gridTemplateColumns: 'repeat(8, 1fr)',
            // gridGap: '0',
            width: '100%',
            position: 'relative',
            minHeight: '54px',
            maxHeight: '54px',
            display: 'flex',
            flexFlow: 'row nowrap',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {springs?.map(
            (
              {
                dragging,
                cursor,
                display,
                marginLeft,
                marginTop,
                rotate,
                scale,
                zIndex,
                x,
                y,
              }: any,
              i
            ) => {
              const { canPlay } = G.players['0'].cards.hand[i];
              return order && order.current![i] === i ? (
                <React.Fragment key={i}>
                  <animated.div
                    {...bind(i, canPlay)}
                    key={`DragSlot_${i}`}
                    onMouseDownCapture={(e: MouseEvent) => {
                      return handleSelect(e, canPlay, i);
                    }}
                    onMouseUpCapture={(e: MouseEvent) => {
                      return handleDeselect(e);
                    }}
                    onTouchStartCapture={(e: TouchEvent) => {
                      return handleSelect(e, canPlay, i);
                    }}
                    onTouchEndCapture={(e: TouchEvent) => {
                      return handleDeselect(e);
                    }}
                    style={{
                      zIndex: 110 - i,
                      opacity: 0.25,
                      background: 'yellow',
                      display: 'block',
                      cursor: canPlay ? cursor : 'default',
                      marginLeft: marginLeft.to((mL: number) => `${mL}px`),
                      pointerEvents: 'auto',
                      position: 'absolute',
                      height: 'var(--card-height)',
                      width: 'calc(var(--card-width) / 2)',
                      top: -15,
                      // transform: to([x, y], (x, y) => {
                      //   return `translate3d(${x}px, ${y}px, 0)`;
                      // }),
                    }}
                  />

                  <animated.div
                    {...bind(i, canPlay)}
                    key={`HandSlot_${i}`}
                    style={{
                      zIndex,
                      display: 'flex',
                      flexFlow: 'column nowrap',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 1,
                      // cursor: canPlay ? cursor : 'default',
                      cursor: 'none',
                      marginLeft: marginLeft.to((mL: number) => `${mL}px`),
                      marginTop: marginTop.to((mT: number) => `${mT}px`),
                      // opacity: G.SelectedCardIndex['0'] === i ? 0.795 : 1,
                      pointerEvents: 'none',
                      position: 'absolute',
                      touchAction: 'none',
                      transform: to([x, y, rotate, scale], (x, y, rt, sc) => {
                        return `
                          translate3d(${x}px, ${y}px, 0) 
                          rotate(${rt}deg) 
                          scale(${sc})
                        `;
                      }),
                    }}
                  >
                    <CardComponent
                      {...G.players['0'].cards.hand[i]}
                      key={G.players['0'].cards.hand[i].uuid}
                      isSelected={
                        G.selectedCardData['0']?.uuid ===
                        G.players['0'].cards.hand[i].uuid
                      }
                    />
                  </animated.div>
                </React.Fragment>
              ) : null;
            }
          )}
        </div>
      </div>
    </React.Fragment>
  );
};
