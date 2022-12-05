import React from 'react';
import { Fragment } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useSprings, animated, to } from 'react-spring';
import { useCallbackRef } from 'use-callback-ref';
import { useGesture } from '@use-gesture/react';
import { useDispatch, useSelector } from 'react-redux';

import { usePrevious } from '../../../hooks';
import { Card as CardComponent } from '../Card/Card';
import { HandSlotCardWrapper } from './HandSlotCardWrapper';

import type { Ctx } from 'boardgame.io';
import type { RootState } from '../../../store';
import type { Card, GameState, PlayerID } from '../../../types';

import fn from './fn';
import styles from './player-hand.module.scss';
import { LastMoveMade } from '../../../enums';

interface Props {
  G: GameState;
  ctx: Ctx;
  onCardClick: (card: Card) => void;
  onCardSelect: (playerId: string, uuid: string) => void;
  onCardDeselect: (playerId: string) => void;
  onCardSlotDrop: (zoneNumber: number) => void;
  player: PlayerID;
  moves: any;
}

export const PlayerHand = ({
  G,
  ctx,
  moves,
  onCardClick,
  onCardSelect,
  onCardDeselect,
  onCardSlotDrop,
  player,
}: Props) => {
  const {
    gameConfig: {
      numerics: { cardsPerHand },
    },
    selectedCardData,
  } = G;

  const dispatch = useDispatch();
  const { height, width } = useSelector(
    ({ windowSize }: RootState) => windowSize
  );

  const playerHand = G.players[player]?.cards?.hand;
  const selectedCard = selectedCardData[player];

  // useEffect(() => {
  //   playerHand.forEach(c => {
  //     if (c.booleans.wasDiscarded) console.log(true)
  //   })
  // }, [playerHand])

  // states
  const [handLength, setHandLength] = useState<number>(0);
  const prevHandLength = usePrevious(handLength);
  const prevHand = usePrevious(playerHand);
  const [cardHeight, setCardHeight] = useState<number>(0);
  const [cardWidth, setCardWidth] = useState<number>(0);

  useEffect(() => {
    const hString = '--card-height';
    const dString = '--card-width-division';
    const doc = document?.documentElement;
    const hand = document?.getElementById('PlayerHand');

    if (hand !== null && typeof hand !== undefined) {
      const h = getComputedStyle(hand!).getPropertyValue(hString);
      const d = getComputedStyle(doc).getPropertyValue(dString);
      const p1 = parseInt(h, 10);
      const p2 = Number(d);
      setCardWidth(Number(p1 / p2 / 2));
      setCardHeight(p1);
    }
  }, [document]);

  // Store indicies as a local ref, this represents the item order
  const [_, update] = React.useState<{} | null>(null);

  // Create springs, each corresponds to an item,
  // controlling its transform, scale, etc.
  const [springs, setSprings] = useSprings(handLength, fn(handLength, width), [
    handLength,
  ]);

  const order = useCallbackRef(
    [...Array.from(Array(cardsPerHand))].map((_, index) => index),
    () => update({})
  );

  useEffect(() => {
    setHandLength(playerHand?.length);
  }, [playerHand, setHandLength]);

  // rerenders hand correctly based on new array length
  useEffect(() => {
    setSprings(fn(handLength, width));
  }, [handLength, width]);

  const bind: any = useGesture(
    {
      // ts-ignore
      onDragStart: ({ active, args: [originalIndex], down, dragging }) => {
        const curIndex = order.current?.indexOf(originalIndex);
        setSprings(fn(handLength, width, down, dragging, active, curIndex));
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
          return onCardClick(playerHand[originalIndex]);
        } else if (!canPlay) {
          return cancel();
        } else {
          return setSprings(
            fn(
              handLength,
              width,
              down,
              dragging,
              active,
              curIndex,
              first ? 0 : x,
              first ? 0 : y
            )
          );
        }
      },
      // ts-ignore
      onDragEnd: ({ active, args: [originalIndex], down, dragging, xy }) => {
        const curIndex = order.current?.indexOf(originalIndex);
        const elem = document.elementFromPoint(xy[0], xy[1]);
        setSprings(fn(handLength, width, down, dragging, active, curIndex));

        // @ts-ignore
        if (elem && elem.dataset.receive) {
          // console.log('🚀 target', elem);
          onCardSlotDrop(Number(elem.getAttribute('data-index')));
        }
      },
      // ts-ignore
      onHover: ({ active, args: [originalIndex], down, dragging }) => {
        const curIndex = order.current?.indexOf(originalIndex);
        setSprings(fn(handLength, width, down, dragging, active, curIndex));
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

  /**
   * Selects card
   */
  const select = useCallback(
    (canPlay: boolean, i: number) => {
      if (canPlay) onCardSelect(player, playerHand[i].uuid);
    },
    [playerHand, onCardSelect]
  );

  /**
   * Deselects card
   */
  const deselect = useCallback(() => {
    onCardDeselect(player);
  }, [onCardDeselect]);

  /**
   * Returns card's canPlay boolean value if the object
   * exists in playerHand[i]; otherwise returns false.
   *
   * Note that this avoids breaking crashes when playing cards
   * and running `setSprings(fn(handLength));`
   */
  const getCanPlay = useCallback(
    (i: number) => {
      if (playerHand && playerHand[i]) return playerHand[i]?.canPlay;
      return false;
    },
    [playerHand]
  );

  /**
   * Returns card's uuid string value if the object
   * exists in playerHand[i]; otherwise returns `''`.
   *
   * Note that this avoids breaking crashes when playing cards
   * and running `setSprings(fn(handLength));`
   */
  const getUuid = useCallback(
    (i: number) => {
      if (playerHand && playerHand[i]) return playerHand[i]?.uuid;
      return '';
    },
    [playerHand]
  );

  return (
    <Fragment>
      <div id='PlayerHand' className={styles['player-hand']}>
        <div className={styles['grid']}>
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
              const canPlay = getCanPlay(i);
              const uuid = getUuid(i);
              return playerHand &&
                playerHand[i] &&
                order &&
                order.current![i] === i ? (
                <Fragment key={i}>
                  <animated.div
                    {...bind(i, canPlay)}
                    key={`DragSlot_${i}`}
                    className={styles['drag-slot']}
                    data-index={i}
                    data-last-played={
                      G.lastCardPlayed?.card?.uuid === uuid &&
                      G.lastMoveMade === LastMoveMade.PlayCard
                    }
                    onMouseDownCapture={() => select(canPlay, i)}
                    onMouseUpCapture={() => deselect()}
                    onTouchStartCapture={() => select(canPlay, i)}
                    onTouchEndCapture={() => deselect()}
                    style={{
                      zIndex: 110 - i,
                      cursor: canPlay ? cursor : 'default',
                      marginLeft,
                      height: 65,
                      width: `${cardWidth}px`,
                      transform: to([x, y, rotate, scale], (x, y, rt, sc) => {
                        if (width && width >= 1024) return `scale(${sc})`;
                        return '';
                      }),
                    }}
                  />

                  <animated.div
                    {...bind(i, canPlay)}
                    key={`HandSlot_${i}`}
                    className={[styles['hand-slot']].join(' ')}
                    data-index={i}
                    data-component='PlayerHandSlot'
                    data-last-played={
                      G.lastCardPlayed?.card?.uuid === uuid &&
                      G.lastMoveMade === LastMoveMade.PlayCard
                    }
                    style={{
                      zIndex,
                      marginLeft,
                      marginTop: marginTop.to((mT: number) => `${mT}px`),
                      transform: to([x, y, rotate, scale], (x, y, rt, sc) => {
                        return `
                          translate3d(${x}px, ${y}px, 0) 
                          rotate(${rt}deg) 
                          scale(${sc})
                        `;
                      }),
                    }}
                  >
                    <HandSlotCardWrapper
                      data={playerHand[i]}
                      index={i}
                      moves={moves}
                      prevHand={prevHand}
                      player={player}
                    >
                      <CardComponent
                        {...playerHand[i]}
                        key={uuid}
                        isSelected={selectedCard?.uuid === uuid}
                      />
                    </HandSlotCardWrapper>
                  </animated.div>
                </Fragment>
              ) : null;
            }
          )}
        </div>
      </div>
    </Fragment>
  );
};
