import type { Card } from '../../../../types';

interface Props {
  data?: Card;
  index?: number;
  zoneNumber?: number;
}

export const MinionOnPlayAnimation = ({ data, index, zoneNumber }: Props) => {
  const b = data && data?.booleans;

  return (
    <div
      className={[
        'minionslot minionslot--onplay-was-triggered',
        // b?.onPlayWasTriggered ? 'minionslot--onplay-was-triggered' : '',
      ].join(' ')}
      data-component='MinionOnPlayAnimation'
      data-index={index}
    />
  );
};
