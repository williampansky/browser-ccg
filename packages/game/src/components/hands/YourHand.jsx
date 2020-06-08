import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { PLAYER_BOARDS } from '@ccg/enums';

// child components
import PlayerEnergy from '../player-energy/PlayerEnergyV2';
import CardInteraction from '../interactions/cards/CardInteraction';
import SpellObject from '../spells/SpellObjectV2';
import ClassSkillButton from '../class-skill/ClassSkillButtonV3';
import PlayerHealth from '../player-health/PlayerHealthV5';
import WarcryObject from '../warcrys/WarcryObjectV2';

export default function YourHand({
  G,
  ctx,
  moves,
  isActive,
  yourID,
  gameWidth
}) {
  const {
    counts,
    energy,
    players,
    playerClass,
    selectedCardIndex,
    selectedCardObject,
    playerCanUseClassSkill,
    spellObject,
    warcryObject,
    health,
    playerShieldPoints,
    cardBack
  } = G;

  const yourHand = players[yourID] && players[yourID].hand;
  const handLength = counts[yourID] && counts[yourID].hand;
  const cardIsSelected = selectedCardIndex[yourID];
  const selectedCardObj = selectedCardObject[yourID];
  const selectedCardCost = selectedCardObj && selectedCardObj.cost;
  const activeSpellObject = spellObject[yourID];
  const activeWarcryObject = warcryObject[yourID];

  const [hand, setHand] = React.useState([]);
  // React.useEffect(() => {
  //   setTimeout(() => {
  //     setHand(yourHand);
  //   }, 100);
  // }, [yourHand, setHand]);

  const handleHandCallback = React.useCallback(array => {
    setTimeout(() => {
      setHand(array);
    }, 100);
  }, []);

  React.useEffect(() => {
    handleHandCallback(yourHand);
  }, [yourHand, handleHandCallback]);

  return (
    <Component
      data-file="hands/YourHand"
      data-number-of-cards={handLength}
      gameWidth={gameWidth}
    >
      <PlayerHealth
        health={health[yourID]}
        board={PLAYER_BOARDS[1]}
        shieldPoints={playerShieldPoints[yourID]}
        // wasAttacked={wasAttacked}
      />

      <ClassSkillButton
        G={G}
        ctx={ctx}
        moves={moves}
        isActive={isActive}
        playerClass={playerClass[yourID]}
        board={PLAYER_BOARDS[1]}
        canUse={playerCanUseClassSkill[yourID] && energy[yourID].current >= 2}
      />

      {/* <Deck
        board={PLAYER_BOARDS[1]}
        cardBackSrc={cardBack[yourID]}
        length={counts[yourID].deck}
      /> */}

      <PlayerEnergy
        energy={energy[yourID]}
        selectedCost={selectedCardObj && selectedCardObj.cost}
      />

      {warcryObject[yourID] ? (
        <WarcryObject data={warcryObject[yourID]} />
      ) : null}

      {spellObject[yourID] ? <SpellObject data={spellObject[yourID]} /> : null}

      {hand.map((card, index) => {
        return (
          <React.Fragment key={index}>
            <CardInteraction
              G={G}
              ctx={ctx}
              moves={moves}
              isActive={isActive}
              yourID={yourID}
              card={card}
              index={index}
              numberOfCards={handLength}
            />
          </React.Fragment>
        );
      })}
    </Component>
  );
}

const Component = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  position: relative;
  width: ${p => `calc(${p.gameWidth}px - 600px)`};
  height: var(--board-yourHand-height);
  z-index: var(--board-yourHand-zIndex);
  bottom: var(--board-yourHand-height);
  z-index: 250;
  margin-left: 300px;
`;

YourHand.propTypes = {
  G: PropTypes.object,
  ctx: PropTypes.object,
  moves: PropTypes.object,
  isActive: PropTypes.bool,
  yourID: PropTypes.string,
  gameWidth: PropTypes.number
};
