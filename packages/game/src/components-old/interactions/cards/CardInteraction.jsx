import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import useHover from 'react-use-hover';
import { limitNumberWithinRange } from '@ccg/utils';

// child components
import { Card } from '@ccg/components';
import CardIsPlayable from './CardIsPlayable';
import CardIsPlayableEffect from './CardIsPlayableEffect';
import CardIsSelected from './CardIsSelected';
import CardIsSelectedEffect from './CardIsSelectedEffect';
import { GAME_CONFIG } from '@ccg/config';
import { usePrevious } from '@ccg/hooks';

export default function CardInteraction({
  G,
  ctx,
  moves,
  isActive,
  yourID,
  card,
  index
}) {
  const { selectedCardIndex, spellObject, warcryObject } = G;
  const { currentPlayer, phase } = ctx;
  const { deselectCard, hoverCard, selectCard } = moves;

  const nullCardIndex = selectedCardIndex[currentPlayer] === null;

  const [isHovering, hoverProps] = useHover({
    mouseEnterDelayMS: 0,
    mouseLeaveDelayMS: 0
  });

  const dispatchHover = useCallback(
    (hovering, nullIdx) => {
      hovering && nullIdx ? hoverCard(index) : hoverCard(null);
    },
    [hoverCard, index]
  );

  useEffect(() => {
    phase === 'play' && isActive && dispatchHover(isHovering, nullCardIndex);
  }, [isActive, phase, isHovering, nullCardIndex, dispatchHover]);

  const {
    artist,
    attack,
    cardClass,
    collectible,
    cost,
    elite,
    entourage,
    flavor,
    goldenImageSrc,
    health,
    hideStats,
    howToEarn,
    howToEarnGolden,
    id,
    imageSrc,
    mechanics,
    name,
    playRequirements,
    race,
    rarity,
    set,
    sounds,
    spellDamage,
    playType,
    uuid,
    targetingArrowText,
    text,
    type,
    numberPrimary
  } = card;

  const playerSpellBuff = G.buffs[currentPlayer].spellDamage;
  const playerSpellDamage = numberPrimary;
  const dynamicSpellDamageText = Math.abs(playerSpellBuff + playerSpellDamage);

  const numberOfCards = G.counts[yourID].hand;
  const WARCRY_OBJECT_ACTIVE = warcryObject[yourID] !== null;
  const SPELL_OBJECT_ACTIVE = spellObject[yourID] !== null;
  const CAN_AFFORD = !GAME_CONFIG.debugData.enableCost
    ? true
    : cost <= G.energy[yourID].current;
  const IS_PLAYABLE =
    isActive && CAN_AFFORD && !WARCRY_OBJECT_ACTIVE && !SPELL_OBJECT_ACTIVE;
  const IS_SELECTED = G.selectedCardIndex[yourID] === index;

  const yourHandStyle = {
    // transform: `transformY(0) scale(0.475)`
    transform: `
      translateY(calc(${calcOffset(index, numberOfCards + 1)} * 1px))
      rotate(calc(${calcRotate(index, numberOfCards + 1)} * 0.875deg))
      scale(0.575)
    `
  };

  function calcOffset(index, total = 10, offsetRange = 80) {
    // abs(($i - ($total - 1) / 2) / ($total - 2) * $offsetRange);
    const MIN = 10;
    const MAX = 60;

    const calculation = Math.abs(
      ((index - (total - 1.85) / 2) / (total - 2)) * offsetRange
    );

    return limitNumberWithinRange(calculation, MAX, MIN);
  }

  // ($i - ($total - 1) / 2) / ($total - 2) * $rotationRange;
  function calcRotate(index, total = 10, rotationRange = 50) {
    const MIN = -25;
    const MAX = 25;
    const calculation =
      ((index - (total - 1) / 2) / (total - 2)) * rotationRange;

    return limitNumberWithinRange(calculation, MAX, MIN);
  }

  function selectPlayableCard(index) {
    hoverCard(null);
    return selectCard(card, index);
  }

  function deselectPlayableCard() {
    deselectCard();
    setTimeout(() => {
      hoverCard(null);
    }, 0);
  }

  const [isAnimating, setIsAnimating] = useState(true);
  const [cardUuid, setCardUuid] = useState(null);
  const previousCardUuid = usePrevious(cardUuid);
  const previousIndex = usePrevious(index);

  const handleAnimatingCallback = useCallback(
    (idx, uniqueId) => {
      if (uniqueId !== previousCardUuid && idx !== previousIndex) {
        setIsAnimating(true);

        setTimeout(() => {
          setIsAnimating(false);
        }, 3000);
      }
    },
    [previousIndex, previousCardUuid]
  );

  useEffect(() => {
    setCardUuid(uuid);
  }, [uuid]);

  useEffect(() => {
    handleAnimatingCallback(index, uuid);
  }, [index, uuid, handleAnimatingCallback]);

  return (
    <div
      data-file="interactions/cards/CardInteractionLayer"
      data-index={index}
      data-is-playable={!isAnimating && IS_PLAYABLE}
      data-is-selected={IS_SELECTED}
      className={[
        'card-in-your-hand',
        GAME_CONFIG.matchConfig.enableCardAnimation && isAnimating
          ? 'animate-in'
          : ''
      ].join(' ')}
      style={yourHandStyle}
      {...hoverProps}
    >
      {isActive ? (
        <React.Fragment>
          {IS_SELECTED && <CardIsSelectedEffect />}
          {IS_PLAYABLE && !IS_SELECTED && <CardIsPlayableEffect />}
        </React.Fragment>
      ) : null}

      <Card
        artist={artist}
        attack={attack}
        cardClass={cardClass}
        collectible={collectible}
        cost={cost}
        elite={elite}
        entourage={entourage}
        flavor={flavor}
        goldenImageSrc={goldenImageSrc}
        health={health}
        hideStats={hideStats}
        howToEarn={howToEarn}
        howToEarnGolden={howToEarnGolden}
        id={id}
        imageSrc={imageSrc}
        mechanics={mechanics}
        name={name}
        playRequirements={playRequirements}
        race={race}
        rarity={rarity}
        set={set}
        sounds={sounds}
        spellDamage={spellDamage}
        playType={playType}
        uuid={uuid}
        targetingArrowText={targetingArrowText}
        text={text}
        type={type}
        dynamicSpellDamageText={dynamicSpellDamageText}
      />

      {isActive ? (
        <React.Fragment>
          {IS_SELECTED && (
            <CardIsSelected onClick={() => deselectPlayableCard()} />
          )}
          {IS_PLAYABLE && !IS_SELECTED && (
            <CardIsPlayable onClick={() => selectPlayableCard(index)} />
          )}
        </React.Fragment>
      ) : null}
    </div>
  );
}

CardInteraction.propTypes = {
  G: PropTypes.object,
  ctx: PropTypes.object,
  moves: PropTypes.object,
  isActive: PropTypes.bool,
  yourID: PropTypes.string,
  card: PropTypes.object,
  index: PropTypes.number,
  numberOfCards: PropTypes.number
};
