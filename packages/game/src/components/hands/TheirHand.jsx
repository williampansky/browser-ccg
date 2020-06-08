import React from 'react';
import PropTypes from 'prop-types';

// child components
import CardBack from '../card-back/CardBack';
import GameMenuTrigger from '../game-menu/GameMenuTrigger';
import { limitNumberWithinRange } from '@ccg/utils';

export default function TheirHand({
  G,
  theirID,
  cardBackSrc,
  toggleMenuFn,
  gameWidth
}) {
  const {
    counts,
    energy,
    hoveringCardIndex,
    selectedCardIndex,
    selectedMinionIndex
  } = G;
  const handLength = counts[theirID] && counts[theirID].hand;

  function transforms(idx) {
    let key;

    if (selectedMinionIndex[theirID]) key = '';
    else if (selectedCardIndex[theirID] === idx) key = 'selected';
    else if (hoveringCardIndex[theirID] === idx) key = 'hover';

    switch (key) {
      case 'selected':
        return;

      // case 'hover':
      //   return `translateY(0) scale(0.475)`;

      // default:
      //   return `translateY(-15px) scale(0.475)`;

      case 'hover':
        return `translateY(calc(${calcOffset(idx, handLength + 1)} * 1px))
        rotate(calc(${calcRotate(idx, handLength + 1)} * -0.25deg))
        scale(0.475)`;

      default:
        return `translateY(calc(${calcOffset(idx, handLength + 1)} * -1px))
        rotate(calc(${calcRotate(idx, handLength + 1)} * -1deg))
        scale(0.475)`;
    }
  }

  function classes(idx) {
    let key;

    if (selectedMinionIndex[theirID]) key = '';
    else if (selectedCardIndex[theirID] === idx) key = 'selected';
    else if (hoveringCardIndex[theirID] === idx) key = 'hover';

    switch (key) {
      case 'selected':
        return ['card-in-their-hand', 'card-they-have-selected'].join(' ');

      case 'hover':
        return ['card-in-their-hand', 'card-they-are-hovering'].join(' ');

      default:
        return 'card-in-their-hand';
    }
  }

  function calcOffset(index, total = 10, offsetRange = 80) {
    // abs(($i - ($total - 1) / 2) / ($total - 2) * $offsetRange);
    const MIN = 10;
    const MAX = 50;

    const calculation = Math.abs(
      ((index - (total - 1) / 2) / (total - 2)) * offsetRange
    );

    return limitNumberWithinRange(calculation, MAX, MIN);
  }

  function calcRotate(index, total = 10, rotationRange = 50) {
    // ($i - ($total - 1) / 2) / ($total - 2) * $rotationRange;
    const MIN = -25;
    const MAX = 25;

    const calculation =
      ((index - (total - 1) / 2) / (total - 2)) * rotationRange;

    return limitNumberWithinRange(calculation, MAX, MIN);
  }

  return (
    <div
      data-file="hands/TheirHand"
      data-number-of-cards={handLength}
      style={{ width: `${gameWidth}px` }}
    >
      <GameMenuTrigger toggleMenuFn={toggleMenuFn} />

      {Array.from(Array(handLength)).map((_, index) => {
        return (
          <div
            key={index}
            data-index={index}
            // data-is-animating={true}
            className={classes(index)}
            style={{ transform: transforms(index) }}
          >
            <CardBack imageSrc={cardBackSrc} />
          </div>
        );
      })}
    </div>
  );
}

TheirHand.propTypes = {
  G: PropTypes.shape({
    counts: PropTypes.object,
    energy: PropTypes.object,
    hoveringCardIndex: PropTypes.object,
    selectedCardIndex: PropTypes.object,
    selectedMinionIndex: PropTypes.object
  }),
  theirID: PropTypes.string,
  cardBackSrc: PropTypes.string,
  toggleMenuFn: PropTypes.func,
  gameWidth: PropTypes.number
};
