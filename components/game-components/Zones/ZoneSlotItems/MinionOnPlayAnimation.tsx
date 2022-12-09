import { add, multiply } from 'mathjs';
import type { Card } from '../../../../types';

interface Props {
  data?: Card;
  index: number;
  mapIndex: number;
}

export const MinionOnPlayAnimation = ({ index, mapIndex }: Props) => {
  return (
    <div
      className={[
        'minionslot minionslot--onplay-was-triggered',
        // b?.onPlayWasTriggered ? 'minionslot--onplay-was-triggered' : '',
      ].join(' ')}
      data-component='MinionOnPlayAnimation'
      data-index={index}
      data-map-index={mapIndex}
      style={{
        animationDelay: `${multiply(add(index, 1), 200)}ms`
      }}
    />
  );
};
