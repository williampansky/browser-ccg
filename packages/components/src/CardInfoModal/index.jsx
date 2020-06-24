import React, { useCallback, useState, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { getCardBaseImage, getCardFlairImage, removeSymbols } from '@ccg/utils';
import { AppIcon, Card } from '@ccg/components';

const CardInfoModal = props => {
  const {
    card,
    contextActions,
    deselectCardFunction,
    imagesDataCards,
    imagesDataSets,
    selectedCardUuid,
    selectedCardInteractionContext,
    selectCardContextFunction
  } = props;

  const [animateIn, setAnimateIn] = useState(false);

  // prettier-ignore
  useLayoutEffect(() => {
    setTimeout(() => { setAnimateIn(true); }, 250);

    return () => {
      setAnimateIn(false);
    }
  }, [card]);

  const handleCancelClick = useCallback(
    event => {
      event.preventDefault();
      return deselectCardFunction();
    },
    [deselectCardFunction]
  );

  const handleContextClick = useCallback(
    (event, obj) => {
      const { value } = obj;
      event.preventDefault();
      return selectCardContextFunction(value);
    },
    [selectCardContextFunction]
  );

  return (
    <div
      className={[
        'board__slot--card-tooltip',
        determineIfCardHover()
          ? 'uk-animation-scale-up uk-transform-origin-bottom-left'
          : ''
      ].join(' ')}
      id={`${id}--${index}`}
    >
      <Card
        active={active}
        artist={artist}
        attack={attack}
        collectible={collectible}
        cost={cost}
        deckBuilder={false}
        elite={elite}
        entourage={entourage}
        flavor={flavor}
        health={health}
        howToEarn={howToEarn}
        howToEarnGolden={howToEarnGolden}
        id={id}
        imageBaseSrc={getCardBaseImage(rarity, type)}
        imageFlairSrc={getCardFlairImage(id, set, isGolden)}
        isGolden={isGolden}
        mechanics={mechanics}
        name={name}
        numberOvercharge={numberOvercharge}
        numberPrimary={numberPrimary}
        numberRNG={numberRNG}
        numberSecondary={numberSecondary}
        onClick={() => {}}
        playContext={playContext}
        playRequirements={playRequirements}
        playType={playType}
        race={race}
        rarity={rarity}
        set={set}
        sounds={sounds}
        targetingArrowText={targetingArrowText}
        text={text}
        type={type}
      />
      {mechanics && mechanics.length ? (
        <div className="tooltip__mechanics__wrapper">
          {mechanics.map((m, i) => {
            return (
              <div className="mechanic__item" key={m}>
                <div className="mechanic__item-title">{replaceConstant(m)}</div>
                <div className="mechanic__item-description">
                  {getMechanicShortDescription(m)}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

CardInfoModal.propTypes = {
  card: PropTypes.object,
  contextActions: PropTypes.array,
  deselectCardFunction: PropTypes.func,
  imagesDataCards: PropTypes.object.isRequired,
  imagesDataSets: PropTypes.object.isRequired,
  selectedCardUuid: PropTypes.string
};

CardInfoModal.defaultProps = {
  card: null,
  contextActions: [],
  imagesDataCards: {},
  imagesDataSets: {},
  selectedCardUuid: '',
  selectedCardContext: null,
  deselectCardFunction: () => {},
  selectCardContextFunction: () => {}
};

export default CardInfoModal;
