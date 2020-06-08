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
  canUse
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
      // case CARDCLASS[1]:  return CLASS_SKILLS[1].name;
      // case CARDCLASS[2]:  return CLASS_SKILLS[2].name;
      // case CARDCLASS[3]:  return CLASS_SKILLS[3].name;
      // case CARDCLASS[4]:  return CLASS_SKILLS[4].name;
      // case CARDCLASS[5]:  return CLASS_SKILLS[5].name;
      // case CARDCLASS[6]:  return CLASS_SKILLS[6].name;
      // case CARDCLASS[7]:  return CLASS_SKILLS[7].name;
      // case CARDCLASS[8]:  return CLASS_SKILLS[8].name;
      // case CARDCLASS[9]:  return CLASS_SKILLS[9].name;
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

      <Sphere src={`assets/card-assets/Class_Skill_Sphere.png`} />
    </Component>
  );
}

const Sphere = styled.img`
  height: 150px;
  right: -15px;
  top: -12px;
  position: absolute;
  pointer-events: none;
`;

const Image = styled.div`
  height: 100px;
  width: 100px;
  right: 9px;
  top: 10px;
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
  height: 150px;
  position: absolute;
  height: calc(var(--card-height) / 6.5);
  width: calc(var(--card-height) / 6.5);
`;

const Cost = styled.div`
  font-family: 'Carter One', sans-serif;
  align-items: center;
  border-radius: 50%;
  display: flex;
  flex-flow: column nowrap;
  font-size: 1em;
  font-weight: 600;
  height: calc(var(--card-height) / 7);
  justify-content: center;
  left: 5px;
  line-height: 1;
  position: absolute;
  transform: ${p => (p.canUse ? 'scale(1)' : 'scale(0)')};
  transition: transform 800ms cubic-bezier(0.19, 1, 0.22, 1);
  top: 0;
  user-select: none;
  width: calc(var(--card-height) / 7);
  z-index: 5;
`;

const TextValue = styled.div`
  color: white;
  font-family: 'Carter One', sans-serif;
  text-align: center;
  pointer-events: none;
  z-index: 2;
  position: relative;
  opacity: 1;
  transition: 200ms ease-in-out;
  transition-property: opacity, transform;
  transform: scale(0.85);
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
  height: 120px;
  justify-content: center;
  position: absolute;
  right: -155px;
  top: 0;
  user-select: none;
  width: 120px;
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
`;
