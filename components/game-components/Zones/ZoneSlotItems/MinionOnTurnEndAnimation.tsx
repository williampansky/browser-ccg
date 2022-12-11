import { add, multiply } from 'mathjs';

interface Props {
  index: number;
  mapIndex: number;
}

export const MinionOnTurnEndAnimation = ({ index, mapIndex }: Props) => {
  return (
    <div
      className='minionslot minionslot--event-was-triggered'
      data-component='MinionTurnEndAnimation'
      data-index={index}
      data-map-index={mapIndex}
      style={{
        animationDelay: `${multiply(add(mapIndex, 1), 200)}ms`,
      }}
    />
  );
};
