import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { PLAYER_BOARDS } from '@ccg/enums';

export default function ClassSkillButton({
  G,
  ctx,
  moves,
  isActive,
  playerClass,
  board,
  canUse,
  classSkillSphereSrc
}) {
  const { initClassSkill } = moves;

  function handleClick() {
    if (!isActive || !canUse) return;
    return initClassSkill(G, ctx);
  }

  function classSkillImage(string) {
    const playerClass = string.replace(/(%)/g, '').toUpperCase();
    return `assets/images/class-skills/${playerClass}/DEFAULT.jpg`;
  }

  function classText(string) {
    // prettier-ignore
    switch (string) {
      default:            return;
    }
  }

  return (
    <Component
      data-file="class-skill/ClassSkillButton"
      board={board}
      canUse={canUse}
      isActive={isActive}
      onClick={() => handleClick()}
    >
      {isActive ? (
        <Cost canUse={canUse}>
          <TextValue>{`2`}</TextValue>
          <CostGem src={`assets/card-assets/Cost.png`} />
        </Cost>
      ) : null}

      {board === PLAYER_BOARDS[1] ? (
        canUse && isActive ? (
          <TextValue canUse={canUse}>
            <span>{classText(playerClass)}</span>
          </TextValue>
        ) : null
      ) : null}

      {canUse && isActive ? (
        <Image backgroundImage={classSkillImage(playerClass)} board={board} />
      ) : (
        <Image backgroundImage={`assets/images/Game_logo.png`} board={board} />
      )}

      <Badge src={classSkillSphereSrc} />

      {canUse && isActive && <BoxShadow />}
    </Component>
  );
}

const Badge = styled.img`
  height: calc(var(--class-skill-button-size) + 30px);
  right: -15px;
  top: -12px;
  position: absolute;
  pointer-events: none;
`;

const Image = styled.div`
  height: calc(var(--class-skill-button-size) - 45px);
  width: calc(var(--class-skill-button-size) - 45px);
  right: 21px;
  top: 22px;
  position: absolute;
  background-image: ${p => `url(${p.backgroundImage})`};
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: 50%;
  border-top: 1px solid rgba(255, 255, 255, 1);
  border-bottom: 1px solid rgba(0, 0, 0, 1);
  z-index: 1;

  &:before {
    content: ${p => (p.board === PLAYER_BOARDS[1] ? '' : 'none')};
    width: 100%;
    height: 100%;
    background: transparent;
    pointer-events: none;
    border-radius: 50%;
    position: absolute;
    background: rgba(0, 0, 0, 0.15);
  }
`;

const CostGem = styled.img`
  position: absolute;
  height: calc(var(--card-height) / 4.5);
  width: calc(var(--card-height) / 4.5);
`;

const Cost = styled.div`
  font-family: 'Carter One', sans-serif;
  align-items: center;
  border-radius: 50%;
  display: flex;
  flex-flow: column nowrap;
  font-size: 1em;
  font-weight: 600;
  height: calc(var(--card-height) / 4.5);
  justify-content: center;
  left: 15px;
  line-height: 1;
  position: absolute;
  transform: ${p => (p.canUse ? 'scale(1)' : 'scale(0)')};
  transition: transform 800ms cubic-bezier(0.19, 1, 0.22, 1);
  top: 0;
  user-select: none;
  width: calc(var(--card-height) / 4.5);
  z-index: 5;
`;

const TextValue = styled.div`
  align-items: center;
  color: white;
  display: flex;
  flex-flow: column nowrap;
  font-family: 'Carter One', sans-serif;
  font-size: 20px;
  justify-content: center;
  opacity: 1;
  pointer-events: none;
  position: relative;
  text-align: center;
  transform: scale(0.85);
  transition-property: opacity, transform;
  transition: 200ms ease-in-out;
  width: 100%;
  z-index: 2;
  text-shadow: 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black;

  span {
    font-size: 0.75em;
    line-height: 1.15;
    width: 80px;
    pointer-events: none;
    display: block;
  }
`;

const BoxShadow = styled.div`
  animation: fadeIn 1200ms var(--animation-transition-cubic) forwards;
  border-radius: 50%;
  bottom: 0;
  box-shadow: var(--box-shadow-can-be-selected);
  content: '';
  height: 96%;
  left: 4px;
  opacity: 0;
  position: absolute;
  right: 0;
  top: 2px;
  transition: 300ms ease-in-out;
  transition-property: box-shadow, opacity;
  width: 96%;
  will-change: box-shadow, opacity;
  z-index: 0;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

function determineCursor(board, canUse, isActive) {
  if (!isActive) return 'default';
  if (board === PLAYER_BOARDS[2]) return 'default';
  return canUse ? 'pointer' : 'not-allowed';
}

const Component = styled.div`
  align-items: center;
  border-radius: 50%;
  cursor: ${p => determineCursor(p.board, p.canUse, p.isActive)};
  display: flex;
  flex-flow: column nowrap;
  height: var(--class-skill-button-size);
  justify-content: center;
  position: absolute;
  right: 4%;
  top: -350%;
  user-select: none;
  width: var(--class-skill-button-size);
  transition: 600ms cubic-bezier(0.19, 1, 0.22, 1);
  transition-property: opacity, transform;

  .player-avatar--is_attacking & {
    opacity: 0;
    transform: translateX(-150%) scale(0.5);
    z-index: -1;
  }
  
  .player-avatar--is_attacking_player & {
    transition-delay: 400ms;
  }

  ${Cost} > ${TextValue} {
    opacity: 1;
    transform: scale(1);
  }

  &:hover ${BoxShadow} {
    box-shadow: 0px 0px 20px 10px var(--box-shadow-is-selected-color);
  }
`;
