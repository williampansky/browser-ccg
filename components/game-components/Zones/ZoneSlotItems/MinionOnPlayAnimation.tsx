import { add, multiply } from 'mathjs';

interface Props {
  index: number;
  mapIndex: number;
}

export const MinionOnPlayAnimation = ({ index, mapIndex }: Props) => {
  return (
    <div
      className='minionslot minionslot--onplay-was-triggered'
      data-component='MinionOnPlayAnimation'
      data-index={index}
      data-map-index={mapIndex}
      style={{
        animationDelay: `${multiply(add(index, 1), 200)}ms`,
      }}
    />
  );
};
