import { useEffect, useState } from 'react';
import type { Card } from '../../../../types';

interface Props {
  eventWasTriggered?: boolean;
  index?: number;
  zoneNumber?: number;
}

export const MinionEventAnimation = ({ eventWasTriggered, index, zoneNumber }: Props) => {
  const [play, setPlay] = useState<boolean>(false);
  // const b = data && data?.booleans;

  useEffect(() => {
    console.log(eventWasTriggered)
    if (eventWasTriggered === true) {
      setPlay(true);
    }
    
    return () => setPlay(false);
  }, [eventWasTriggered])

  // useEffect(() => {
  //   if (play === true) setTimeout(() => setPlay(false), 200);
  // }, [play])

  return (
    <div
      className={[
        'minionslot minionslot--event-was-triggered',
        // play ? 'minionslot--event-was-triggered' : '',
      ].join(' ')}
      data-component='MinionEventAnimation'
      data-index={index}
    />
  );
};
