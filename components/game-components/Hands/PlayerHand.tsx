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
import { SelectCardMove } from '../../../game/moves/select-card.move';
import { DeselectCardMove } from '../../../game/moves/deselect-card.move';
import { PlayCardMove } from '../../../game/moves/play-card.move';

interface Props {
  G: GameState;
  ctx: Ctx;
  onCardClick: (card: Card) => void;
  onCardSelect: ({ player, cardUuid }: SelectCardMove) => void;
  onCardDeselect: ({ player }: DeselectCardMove) => void;
  onCardSlotDrop: ({ zoneNumber }: PlayCardMove) => void;
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
    lastMoveMade,
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
  const [hand, setHand] = useState<Card[]>([]);
  const prevHand = usePrevious(hand);
  const [handLength, setHandLength] = useState<number>(0);
  const prevHandLength = usePrevious(handLength);
  const [cardHeight, setCardHeight] = useState<number>(0);
  const [cardWidth, setCardWidth] = useState<number>(0);
  const [cardTap, setCardTap] = useState<boolean>(false);
  const [lastIdx, setLastIdx] = useState<number | undefined>(undefined);
  const [lastUuid, setLastUuid] = useState<string | undefined>(undefined);

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
    setHand(playerHand);
  }, [playerHand, setHand]);
  
  useEffect(() => {
    setHandLength(hand.length);
  }, [hand, setHandLength]);
  
  useEffect(() => {
    if (handLength !== prevHandLength) {
      setLastIdx(undefined);
      setLastUuid(undefined);
    }
  }, [handLength, prevHandLength, setLastIdx, setLastUuid]);

  // rerenders hand correctly based on new array length
  useEffect(() => {
    setSprings(fn(handLength, width));
  }, [handLength, width]);

  const bind: any = useGesture(
    {
      // ts-ignore
      onDragStart: ({
        active,
        args: [originalIndex, canPlay],
        down,
        dragging,
        tap,
      }) => {
        const curIndex = order.current?.indexOf(originalIndex);
        if (!tap) {
          select(canPlay, originalIndex);
          setSprings(fn(handLength, width, down, dragging, active, curIndex));
        }
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
          inspect(originalIndex);
        } else if (!canPlay) {
          cancel();
        } else {
          setSprings(
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
          const zoneNumber = Number(elem.getAttribute('data-index'));
          // setLastIdx(originalIndex);
          // setLastUuid(hand[originalIndex].uuid);
          onCardSlotDrop({ zoneNumber });
        } else {
          deselect();
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
      if (canPlay && !selectedCardData[player]) {
        return onCardSelect({ player, cardUuid: hand[i].uuid });
      }
    },
    [hand, selectedCardData[player], onCardSelect]
  );

  /**
   * Deselects card
   */
  const deselect = useCallback(() => {
    return onCardDeselect({ player });
  }, [onCardDeselect]);

  /**
   * Inspects card vvia modal
   */
  const inspect = useCallback(
    (i: number) => {
      return onCardClick(hand[i]);
    },
    [onCardClick, hand]
  );

  /**
   * Returns card's canPlay boolean value if the object
   * exists in hand[i]; otherwise returns false.
   *
   * Note that this avoids breaking crashes when playing cards
   * and running `setSprings(fn(handLength));`
   */
  const getCanPlay = useCallback(
    (i: number) => {
      if (hand && hand[i]) return hand[i]?.canPlay;
      return false;
    },
    [hand]
  );

  /**
   * Returns card's uuid string value if the object
   * exists in hand[i]; otherwise returns `''`.
   *
   * Note that this avoids breaking crashes when playing cards
   * and running `setSprings(fn(handLength));`
   */
  const getUuid = useCallback(
    (i: number) => {
      if (hand && hand[i]) return hand[i]?.uuid;
      return '';
    },
    [hand]
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
              // return hand &&
              //   hand[i] &&
              //   order &&
              //   order.current![i] === i ? (
              return hand ? (
                <Fragment key={i}>
                  <animated.div
                    {...bind(i, canPlay)}
                    key={`DragSlot_${i}`}
                    className={styles['drag-slot']}
                    data-component='PlayerHandDragSlot'
                    data-index={i}
                    data-uuid={uuid}
                    data-last-played={lastIdx === i}
                    style={{
                      zIndex: 110 - i,
                      cursor: canPlay ? cursor : 'default',
                      marginLeft,
                      height: 65,
                      width: `${cardWidth}px`,
                      transform: to([scale], (sc) => {
                        if (width && width >= 1024) return `scale(${sc})`;
                        return '';
                      }),
                    }}
                  />

                  <animated.div
                    {...bind(i, canPlay)}
                    key={`HandSlot_${i}`}
                    className={[styles['hand-slot']].join(' ')}
                    data-component='PlayerHandCardSlot'
                    data-index={i}
                    data-uuid={uuid}
                    data-last-played={lastIdx === i}
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
                      data={hand[i]}
                      index={i}
                      moves={moves}
                      prevHand={prevHand}
                      player={player}
                    >
                      <CardComponent
                        {...hand[i]}
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
