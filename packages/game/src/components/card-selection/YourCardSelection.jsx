import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Card } from '@ccg/components';

export default function YourCardSelection({
  G,
  ctx,
  moves,
  isActive,
  yourID,
  data
}) {
  const { replaceCard, setReady } = moves;
  const { ready, discard, cards } = data;

  function handleDiscardBool(card) {
    const { uuid } = card;
    return discard.find(obj => obj.uuid === uuid) ? true : false;
  }

  return (
    <Component data-file="CardSelection">
      <Dialog>
        <InfoWrapper>
          <h2 className="text__value">
            {ready ? "You're All Set!" : 'Choose Starting Cards'}
          </h2>
        </InfoWrapper>
        <GridWrapper>
          <Grid>
            {cards.map((card, index) => {
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
                spellType,
                uuid,
                targetingArrowText,
                text,
                type,
                warcryNumber
              } = card;

              const playerSpellBuff = G.buffs[yourID].spellDamage;
              const playerSpellDamage = warcryNumber;
              const dynamicSpellDamageText = Math.abs(
                playerSpellBuff + playerSpellDamage
              );

              return (
                <div
                  className="item"
                  data-discard={handleDiscardBool(card)}
                  key={index}
                  onClick={() => replaceCard(yourID, card)}
                >
                  <div className="discard">
                    <div className="text__value">X</div>
                  </div>
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
                    spellType={spellType}
                    uuid={uuid}
                    targetingArrowText={targetingArrowText}
                    text={text}
                    type={type}
                    dynamicSpellDamageText={dynamicSpellDamageText}
                  />
                </div>
              );
            })}
          </Grid>
        </GridWrapper>
        <InfoWrapper>
          <button
            className={'end__turn__button'}
            onClick={() => setReady(yourID)}
          >
            <span className="text__value">
              {ready ? 'Waiting for Opponent' : 'Ready'}
            </span>
          </button>
        </InfoWrapper>
      </Dialog>
    </Component>
  );
}

YourCardSelection.propTypes = {
  G: PropTypes.object,
  ctx: PropTypes.object,
  moves: PropTypes.object,
  isActive: PropTypes.bool,
  yourID: PropTypes.string,
  data: PropTypes.object
};

YourCardSelection.defaultProps = {
  data: {
    discard: [],
    cards: []
  }
};

const Component = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9000;
  background: rgba(0, 0, 0, 0.6);
`;

const Dialog = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
`;

const InfoWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;

  button {
    width: auto;
    padding: 0 10px;
  }

  h2 {
    margin: 0;
  }
`;

const GridWrapper = styled.div`
  width: 100%;
  height: 50%;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
`;

const Grid = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;

  .item {
    cursor: pointer;
    margin: 0 4vw;
    transform: scale(1.45);
    position: relative;
    z-index: 1;
    transition: transform 200ms var(--animation-transition-cubic);
    will-change: transform;

    &:before {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      border-radius: var(--card-border-radius);
      box-shadow: var(--box-shadow-can-be-selected);
      z-index: -1;
      opacity: 1;
      transition: opacity 200ms var(--animation-transition-cubic);
      will-change: opacity;
    }

    &:after {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      border-radius: var(--card-border-radius);
      box-shadow: var(--box-shadow-is-selected);
      z-index: -1;
      opacity: 0;
      transition: opacity 200ms var(--animation-transition-cubic);
      will-change: opacity;
    }
  }

  /* prettier-ignore */
  .item:hover {
    &:before { opacity: 0; }
    &:after { opacity: 1; }
  }

  .item .discard {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
    z-index: 10;
    opacity: 0;
    pointer-events: none;

    .text__value {
      font-size: 200px;
      color: #ff3b1b;
      top: 0;
    }
  }

  /* prettier-ignore */
  .item[data-discard='true'] {
    transform: scale(1.4);
    .discard { opacity: 1; }
    &:before { opacity: 0; }
    &:after { opacity: 0; }
  }
`;
