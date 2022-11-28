import { current } from 'immer';
import { ReactNode, useEffect, useState } from 'react';
import { useEffectListener } from 'bgio-effects/react';
import type { Card, DiscardCardEffects, PlayerID } from '../../../../types';

// import styles from './HandSlotCardWrapper.module.scss';

interface Props {
  children: ReactNode;
  data?: Card;
  index?: number;
  moves?: any;
  prevHand?: Card[];
  player?: PlayerID;
}

export const HandSlotCardWrapper = ({
  children,
  data,
  index,
  moves,
  prevHand,
  player,
}: Props) => {
  // boolean states
  const [canBeBuffed, setCanBeBuffed] = useState<boolean>(false);
  const [wasDiscarded, setWasDiscarded] = useState<boolean>(false);

  useEffect(() => {
    if (data?.booleans?.canBeBuffed) setCanBeBuffed(true);
    // if (data?.booleans?.wasDiscarded) setWasDiscarded(true);
  }, [data])

  // useEffectListener(
  //   'discardCard',
  //   (effectPayload: any) => {
  //     const payload: DiscardCardEffects = {
  //       cardUuid: effectPayload?.card,
  //       cardIdx: effectPayload?.cardIdx,
  //       player: effectPayload?.player
  //     };

  //     if (payload.cardIdx === index && payload?.cardUuid === data?.uuid) {
  //       setWasDiscarded(true);
  //     }

  //     // return () => moves?.updatePlayerHandArray(player, prevHand, payload?.cardUuid);
  //   },
  //   []
  // );

  return (
    <div
      className={[
        'player__handslot',
        canBeBuffed ? 'handslot--can-be-buffed' : '',
        wasDiscarded ? 'handslot--discarded' : '',
      ].join(' ')}
      data-component='HandSlotCardWrapper'
    >
      {children}
    </div>
  );
};
