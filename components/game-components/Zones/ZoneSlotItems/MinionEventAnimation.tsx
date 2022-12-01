import type { Card } from '../../../../types';

interface Props {
  data?: Card;
  index?: number;
  zoneNumber?: number;
}

export const MinionEventAnimation = ({ data, index, zoneNumber }: Props) => {
  const b = data && data?.booleans;

  return (
    <div
      className={[
        'minionslot',
        b?.eventWasTriggered ? 'minionslot--event-was-triggered' : '',
      ].join(' ')}
      data-component='MinionEventAnimation'
      data-index={index}
    />
  );
};
