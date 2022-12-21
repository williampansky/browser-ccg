import { current } from 'immer';
import { ReactNode, useEffect, useState } from 'react';
import { useEffectListener } from 'bgio-effects/react';
import type { Card, DiscardEffects, PlayerID } from '../../../../types';
import { useDispatch } from 'react-redux';
import { setDiscardedCard } from '../../../../features';

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
  const dispatch = useDispatch();
  const b = data?.booleans;
  const wasDiscarded = b?.wasDiscarded === true;
  // console.log(wasDiscarded)

  // boolean states
  // const [canBeBuffed, setCanBeBuffed] = useState<boolean>(false);
  // const [wasDiscarded, setWasDiscarded] = useState<boolean>(false);

  useEffect(() => {
    // if (b?.canBeBuffed) setCanBeBuffed(true);
    if (wasDiscarded) dispatch(setDiscardedCard(data));
  }, [wasDiscarded])

  // useEffectListener(
  //   'discardCard',
  //   (effectPayload: any) => {
  //     const payload: DiscardEffects = {
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
        // canBeBuffed ? 'handslot--can-be-buffed' : '',
        // wasDiscarded ? 'handslot--discarded' : '',
      ].join(' ')}
      data-component='HandSlotCardWrapper'
    >
      {children}
    </div>
  );
};
