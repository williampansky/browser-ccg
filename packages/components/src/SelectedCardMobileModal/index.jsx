import React, { useCallback, useState, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { getCardBaseImage, getCardFlairImage } from '@ccg/utils';
import { AppIcon, Card } from '@ccg/components';

const SelectedCardMobileModal = props => {
  const {
    card,
    contextActions,
    deselectCardFunction,
    imagesDataCards,
    imagesDataSets,
    selectedCardUuid
  } = props;

  const [animateIn, setAnimateIn] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);

  // prettier-ignore
  useLayoutEffect(() => {
    setAnimateOut(false);
    setTimeout(() => { setAnimateIn(true); }, 250);

    return () => {
      setAnimateIn(false);
      setAnimateOut(true);
    }
  }, [card]);

  const handleCancelClick = useCallback(
    event => {
      event.preventDefault();
      return deselectCardFunction();
    },
    [deselectCardFunction]
  );

  return card !== null ? (
    <div
      className={styles['selected__card__mobile__modal']}
      data-component="SelectedCardMobileModal"
      id={`selectedCard__${selectedCardUuid}`}
    >
      <div className={styles['modal__dialog']}>
        <div
          className={[
            styles['context__menu'],
            animateIn ? styles['context__menu--animate-in'] : ''
          ].join(' ')}
        >
          <ul
            className={styles['context__menu__list']}
            data-length={contextActions.length + 1}
          >
            {contextActions.map((ctxObj, idx) => {
              const { label, value } = ctxObj;
              return (
                <li className={styles['list__item']} key={idx}>
                  <button onClick={e => console.log(value)}>
                    <span>{label}</span>
                  </button>
                </li>
              );
            })}

            <li className={styles['list__item']}>
              <button onClick={e => handleCancelClick(e)}>
                {/* <AppIcon
                  color="black"
                  fileName="icon-uikit-close"
                  size="initial"
                /> */}
                <span>Cancel</span>
              </button>
            </li>
          </ul>
        </div>

        <div className={styles['card__wrapper']}>
          <Card
            active={card.active}
            artist={card.artist}
            attack={card.attack}
            collectible={card.collectible}
            cost={card.cost}
            deckBuilder={card.deckBuilder}
            elite={card.elite}
            entourage={card.entourage}
            flavor={card.flavor}
            health={card.health}
            howToEarn={card.howToEarn}
            howToEarnGolden={card.howToEarnGolden}
            id={card.id}
            imageBaseSrc={getCardBaseImage(
              card.rarity,
              card.type,
              imagesDataCards
            )}
            imageFlairSrc={getCardFlairImage(card.id, card.set, imagesDataSets)}
            isGolden={card.isGolden}
            mechanics={card.mechanics}
            name={card.name}
            numberOvercharge={card.numberOvercharge}
            numberPrimary={card.numberPrimary}
            numberRNG={card.numberRNG}
            numberSecondary={card.numberSecondary}
            onClick={card.onClick}
            playContext={card.playContext}
            playRequirements={card.playRequirements}
            playType={card.playType}
            race={card.race}
            rarity={card.rarity}
            set={card.set}
            sounds={card.sounds}
            targetingArrowText={card.targetingArrowText}
            text={card.text}
            type={card.type}
            uuid={card.uuid}
          />
        </div>
      </div>
    </div>
  ) : null;
};

SelectedCardMobileModal.propTypes = {
  card: PropTypes.object,
  contextActions: PropTypes.array,
  deselectCardFunction: PropTypes.func,
  imagesDataCards: PropTypes.object.isRequired,
  imagesDataSets: PropTypes.object.isRequired,
  selectedCardUuid: PropTypes.string
};

SelectedCardMobileModal.defaultProps = {
  card: null,
  contextActions: [],
  imagesDataCards: {},
  imagesDataSets: {},
  selectedCardUuid: ''
};

export default SelectedCardMobileModal;
