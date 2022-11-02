import { ReactElement } from 'react';
import { Card as CardProps } from '../../interfaces';

export interface ReactCardProps extends CardProps {
  isSelected: boolean;
}

export const CardInHand = ({
  isSelected,
  ...card
}: ReactCardProps): ReactElement => {
  const {
    baseCost,
    basePower,
    canPlay,
    currentCost,
    displayPower,
    name,
    powerOverride,
    powerStream,
    uuid,
  } = card;

  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.25em',
        textAlign: 'center',
        position: 'relative',
        border: '1px solid',
        borderColor: canPlay ? 'violet' : 'gray',
        boxShadow: canPlay
          ? '0px 0px 0px 2px rgb(238, 130, 238)'
          : '0px 0px 0px 0px transparent',
        borderRadius: '0.25em',
        background: canPlay ? 'white' : 'gray',
        height: '3.5em',
        width: '2.45em',
        transition: '75ms ease-in',
        pointerEvents: 'none',
        touchAction: 'none',
        animation: 'animateCardIntoHand 75ms ease-in',
      }}
    >
      <div
        style={{
          fontSize: '0.85em',
          fontWeight: 'bold',
          display: 'flex',
          flexFlow: 'column nowrap',
          alignItems: 'center',
          justifyContent: 'center',
          height: '1.195em',
          width: '1.15em',
          position: 'absolute',
          top: '-0.35em',
          right: 'auto',
          bottom: 'auto',
          left: '-0.35em',
          background: canPlay ? 'lightgreen' : '#508850',
          borderRadius: '50%',
        }}
      >
        {currentCost}
      </div>
      <div
        style={{
          fontSize: '0.85em',
          fontWeight: 'bold',
          display: 'flex',
          flexFlow: 'column nowrap',
          alignItems: 'center',
          justifyContent: 'center',
          height: '1.195em',
          width: '1.15em',
          position: 'absolute',
          top: '-0.35em',
          right: '-0.35em',
          bottom: 'auto',
          left: 'auto',
          color: canPlay ? 'white' : 'black',
          background: canPlay ? 'red' : '#880707',
          borderRadius: '50%',
        }}
      >
        {displayPower}
      </div>
      <div style={{ fontSize: '0.5em' }}>{name}</div>
    </div>
  );
};
