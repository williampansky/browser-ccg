// @ts-nocheck
import { Ctx } from 'boardgame.io';
import React, { ReactElement } from 'react';
import { Card, GameState } from '../../interfaces';
import { CardInHand } from '../Card/CardInHand';
import { useGesture } from '@use-gesture/react';
import { useCallbackRef } from 'use-callback-ref';
import { useSprings, animated, config as springConfig, to } from 'react-spring';

interface PlayerHandProps {
  G: GameState;
  ctx: Ctx;
  onCardClick: (card: Card) => void;
  onCardSelect: (playerId: string, uuid: string) => void;
  onCardDeselect: (playerId: string) => void;
  onCardSlotDrop: (playerId: string, zoneNumber: number) => void;
}

export const PlayerHand = ({
  G,
  ctx,
  onCardClick,
  onCardSelect,
  onCardDeselect,
  onCardSlotDrop,
}: PlayerHandProps): ReactElement => {
  // Store indicies as a local ref, this represents the item order
  const [_, update] = React.useState<{} | null>(null);

  // Returns fitting styles for dragged/idle items
  const fn =
    (
      isDown?: any,
      isDragging?: any,
      isHovered?: any,
      curIndex?: any,
      x?: any,
      y?: any
    ) =>
    (index: number) => {
      const logMatch = false;
      const disableRotation = false;
      const match = curIndex === index;
      const nextMatch = curIndex === index + 1;
      const prevMatch = curIndex === index - 1;
      const gtMatch = curIndex > index;
      const ltMatch = curIndex < index;
      const hoverOffsetY = 0;

      if (match && logMatch)
        console.log(
          `isDown:(${isDown}), isHovered:(${isHovered}), xy:(${x},${y})`
        );

      const context = () => {
        if (isDown || isDragging) return 'isDown';
        else if (isHovered && !isDragging) return 'isHovered';
        return 'none';
      };

      if (context() === 'isDown' && match)
        return {
          x: x,
          y: y + hoverOffsetY,
          rotate: 0,
          scale: 2,
          marginTop: 0,
          zIndex: 100,
          cursor: 'grabbing',
          immediate: (n: string) => n === 'x' || n === 'y' || n === 'scale',
          config: springConfig.default,
        };
      else if (context() === 'isHovered' && match) {
        return {
          display: 'none', // disables hidden hover listener div
          x: 0,
          y: hoverOffsetY,
          rotate: 0,
          scale: 1,
          marginTop: 0,
          zIndex: 100,
          cursor: 'grab',
          immediate: true,
          config: {
            ...springConfig.default,
            tension: 500,
            friction: 38,
            duration: 75,
          },
        };
      } else {
        return {
          x: 0,
          y: 0,
          rotate: 0,
          scale: 0.665,
          marginLeft: 0,
          marginTop: 0,
          zIndex: index * 1,
          cursor: 'grab',
          display: 'block',
          immediate: (n: string) => n === 'zIndex',
          config: springConfig.default,
        };
      }
    };

  // Create springs, each corresponds to an item,
  // controlling its transform, scale, etc.
  const [springs, setSprings] = useSprings(G.players['0'].hand.length, fn());

  const order = useCallbackRef(
    Array.from(Array(G.Config.gameConfig.cardsPerHand)).map((_, index) => index),
    () => update({})
  );

  const bind: any = useGesture(
    {
      onDragStart: ({ active, args: [originalIndex], down, dragging }) => {
        const curIndex = order.current?.indexOf(originalIndex);
        setSprings(fn(down, dragging, active, curIndex));
      },
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
          return onCardClick(G.players['0'].hand[originalIndex]);
        } else if (!canPlay) {
          cancel();
        } else {
          setSprings(
            fn(down, dragging, active, curIndex, first ? 0 : x, first ? 0 : y)
          );
        }
      },
      onDragEnd: ({ active, args: [originalIndex], down, dragging, xy }) => {
        const curIndex = order.current?.indexOf(originalIndex);
        const elem = document.elementFromPoint(xy[0], xy[1]);
        setSprings(fn(down, dragging, active, curIndex));

        // @ts-ignore
        if (elem && elem.dataset.receive) {
          // console.log('🚀 target', elem);
          onCardSlotDrop('0', Number(elem.getAttribute('data-index')));
        }
      },
      onHover: ({ active, args: [originalIndex], down, dragging }) => {
        const curIndex = order.current?.indexOf(originalIndex);
        setSprings(fn(down, dragging, active, curIndex));
      },
    },
    {
      // @ts-ignore
      // order,
      // domTarget: order.current,
      drag: {
        // preventDefault: true,
        enabled: true,
        mouseOnly: false,
        from: [0, 0],
        threshold: undefined,
        rubberband: 0.915, // 0.15
        // preventScroll: true,
        eventOptions: { passive: true },
        filterTaps: true,
        delay: 0,
        swipe: { distance: 60, velocity: 0.5 },
      },
    }
  );

  const handleSelect = React.useCallback(
    (e: MouseEvent, canPlay: boolean, i: number) => {
      if (canPlay) onCardSelect('0', G.players['0'].hand[i].uuid);
    },
    [G.players['0'].hand, onCardSelect]
  );

  const handleDeselect = React.useCallback(
    (e: MouseEvent) => {
      onCardDeselect('0');
    },
    [onCardDeselect]
  );

  return (
    <React.Fragment>
      <div
        style={{
          width: '100%',
          position: 'absolute',
          top: 'auto',
          bottom: '10px',
          left: 0,
          right: 0,
          maxWidth: '100%',
          minHeight: '54px',
          padding: '0 1em',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gridGap: '0',
            width: '100%',
            position: 'relative',
            minHeight: '54px',
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
              const { canPlay } = G.players['0'].hand[i];
              return order && order.current![i] === i ? (
                <React.Fragment key={i}>
                  {/* <animated.div
                    {...bind(i, canPlay)}
                    key={`DragSlot_${i}`}
                    onMouseDownCapture={(e: MouseEvent) => handleSelect(e, canPlay, i)}
                    onMouseUpCapture={(e: MouseEvent) => handleMouseUp(e)}
                    style={{
                      zIndex: 110 - i,
                      opacity: 0.45,
                      background: 'yellow',
                      display: 'block',
                      cursor: canPlay ? cursor : 'default',
                      marginLeft: marginLeft.to((mL: number) => `${mL}px`),
                      pointerEvents: 'auto',
                      position: 'relative',
                      height: '3.5em',
                      width: '2.45em',
                      top: 0,
                      transform: to([x, y], (x, y) => {
                        return `translate3d(${x}px, ${y}px, 0)`;
                      }),
                    }}
                  /> */}

                  <animated.div
                    {...bind(i, canPlay)}
                    key={`HandSlot_${i}`}
                    onMouseDownCapture={(e: MouseEvent) => {
                      return handleSelect(e, canPlay, i);
                    }}
                    onTouchStartCapture={(e: MouseEvent) => {
                      return handleSelect(e, canPlay, i);
                    }}
                    onMouseUpCapture={(e: MouseEvent) => {
                      return handleDeselect(e);
                    }}
                    onTouchEndCapture={(e: MouseEvent) => {
                      return handleDeselect(e);
                    }}
                    style={{
                      zIndex,
                      display: 'flex',
                      flexFlow: 'column nowrap',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: canPlay ? cursor : 'default',
                      marginLeft: marginLeft.to((mL: number) => `${mL}px`),
                      marginTop: marginTop.to((mT: number) => `${mT}px`),
                      // opacity: G.SelectedCardIndex['0'] === i ? 0.795 : 1,
                      // pointerEvents: 'none',
                      position: 'relative',
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
                    <CardInHand
                      {...G.players['0'].hand[i]}
                      key={G.players['0'].hand[i].uuid}
                      // onClick={(c: Card) => onCardClick(c)}
                      isSelected={
                        G.SelectedCardData[0]?.uuid ===
                        G.players['0'].hand[i].uuid
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
