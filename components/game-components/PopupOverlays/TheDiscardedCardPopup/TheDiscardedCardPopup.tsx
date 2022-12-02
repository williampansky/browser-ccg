import { gt } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { usePrevious } from '../../../../hooks';
import { RootState } from '../../../../store';
import { Card as ICard, GameState, PlayerID } from '../../../../types';
import { Card } from '../../Card';
import { useSpring, animated } from 'react-spring';
import { config as springConfig, easings } from 'react-spring';
import styles from './TheDiscardedCardPopup.module.scss';

interface Props {
  G: GameState;
  player: PlayerID | null;
  yourID: PlayerID;
  array: ICard[];
  arrayLength: number;
}

export const TheDiscardedCardPopup = ({
  G,
  player,
  yourID,
  array,
  arrayLength,
}: Props) => {
  const [overlay, setOverlay] = useState<ICard | undefined>(undefined);
  const prevDiscardedArr = usePrevious(arrayLength);

  const handleOverlayCallback = useCallback(() => {
    if (gt(arrayLength, prevDiscardedArr)) {
      setOverlay(array[arrayLength - 1]);
    }
  }, [array, arrayLength, prevDiscardedArr]);

  useEffect(() => {
    handleOverlayCallback();
  }, [arrayLength]);

  const spring = useSpring({
    from: { opacity: 0, transform: 'translate3d(75px, 20px, 0px) scale(0.35)' },
    to: async (next, cancel) => {
      await next({ opacity: 1, transform: 'translate3d(75px, 20px, 0px) scale(0.65)' });
      await next({ opacity: 1, transform: 'translate3d(75px, 20px, 0px) scale(0.65)' });
      await next({ opacity: 0, transform: 'translate3d(75px, -100%, 0px) scale(0.675)' });
      await next(() => setOverlay(undefined));
    },
    reset: true,
    config: {
      ...springConfig.default,
      duration: 900,
      easing: easings.easeInCubic
    },
  });

  return overlay ? (
    <animated.div
      className={styles['component']}
      data-component='TheDiscardedCardPopup'
      style={spring}
    >
      <Card {...overlay} canPlay={true} />
    </animated.div>
  ) : null;
};
