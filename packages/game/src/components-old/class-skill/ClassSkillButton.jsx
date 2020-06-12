/* eslint-disable react/prop-types */
import React from 'react';
// import PropTypes from 'prop-types';
import styled from 'styled-components';
import CARDCLASS from 'enums/cardClass.enums';
import CLASS_SKILL_DESCRIPTIONS from 'enums/classSkillDescriptions.enums';

export default function ClassSkillButton({
  G,
  ctx,
  moves,
  isActive,
  playerClass,
  canUse
}) {
  const { initClassSkill } = moves;

  function handleClick() {
    if (!isActive || !canUse) return;
    return initClassSkill(G, ctx);
  }

  function classSkillImage(string) {
    // prettier-ignore
    switch (string) {
      case CARDCLASS[1]:  return require('assets/images/class-skills/1.jpg');
      case CARDCLASS[2]:  return require('assets/images/class-skills/2.jpg');
      case CARDCLASS[3]:  return require('assets/images/class-skills/3.jpg');
      case CARDCLASS[4]:  return require('assets/images/class-skills/4.jpg');
      case CARDCLASS[5]:  return require('assets/images/class-skills/5.jpg');
      case CARDCLASS[6]:  return require('assets/images/class-skills/6.jpg');
      case CARDCLASS[7]:  return require('assets/images/class-skills/7.jpg');
      case CARDCLASS[8]:  return require('assets/images/class-skills/8.jpg');
      case CARDCLASS[9]:  return require('assets/images/class-skills/9.jpg');
      default:            return;
    }
  }

  function classText(string) {
    // prettier-ignore
    switch (string) {
      case CARDCLASS[1]:  return CLASS_SKILL_DESCRIPTIONS[1];
      case CARDCLASS[2]:  return CLASS_SKILL_DESCRIPTIONS[2];
      case CARDCLASS[3]:  return CLASS_SKILL_DESCRIPTIONS[3];
      case CARDCLASS[4]:  return CLASS_SKILL_DESCRIPTIONS[4];
      case CARDCLASS[5]:  return CLASS_SKILL_DESCRIPTIONS[5];
      case CARDCLASS[6]:  return CLASS_SKILL_DESCRIPTIONS[6];
      case CARDCLASS[7]:  return CLASS_SKILL_DESCRIPTIONS[7];
      case CARDCLASS[8]:  return CLASS_SKILL_DESCRIPTIONS[8];
      case CARDCLASS[9]:  return CLASS_SKILL_DESCRIPTIONS[9];
      default:            return;
    }
  }

  return (
    <Component
      backgroundImage={classSkillImage(playerClass)}
      data-file="class-skill/ClassSkillButton"
      canUse={canUse}
      onClick={() => handleClick()}
    >
      {isActive ? (
        <Cost canUse={canUse}>
          <TextValue>{`2`}</TextValue>
        </Cost>
      ) : null}
      <TextValue canUse={canUse}>
        <span>{classText(playerClass)}</span>
      </TextValue>
    </Component>
  );
}

const Cost = styled.div`
  font-family: 'Carter One', sans-serif;
  align-items: center;
  background-image: radial-gradient(
    circle,
    hsla(197, 100%, 80%, 1),
    hsla(197, 90%, 65%, 1)
  );
  border-radius: 50%;
  color: #042c3c;
  display: flex;
  flex-flow: column nowrap;
  font-size: 1em;
  font-weight: 600;
  height: calc(var(--card-height) / 8);
  justify-content: center;
  overflow: hidden;
  left: 5px;
  line-height: 1;
  position: absolute;
  transform: ${p => (p.canUse ? 'scale(1)' : 'scale(0)')};
  transition: transform 800ms cubic-bezier(0.19, 1, 0.22, 1);
  top: 0;
  user-select: none;
  width: calc(var(--card-height) / 8);
  z-index: 5;
  box-shadow: 0px 0px 1.5px rgba(0, 0, 0, 0.925),
    0px 0px 4px rgba(0, 0, 0, 0.465);

  &:before {
    content: '';
    width: 100%;
    height: 100%;
    background: transparent;
    pointer-events: none;
    border-radius: 50%;
    border-bottom: 4px solid rgb(56, 164, 207);
    filter: blur(2px);
    position: absolute;
  }

  &:after {
    border-radius: 50%;
    border-top: 1px solid rgba(255, 255, 255, 0.95);
    content: '';
    height: 100%;
    width: 100%;
    position: absolute;
  }
`;

const TextValue = styled.div`
  color: white;
  font-family: 'Carter One', sans-serif;
  text-align: center;
  pointer-events: none;
  z-index: 1;
  position: relative;
  opacity: 1;
  transition: 200ms ease-in-out;
  transition-property: transform opacity;
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

const a =
  'inset 0 0 12px rgba(0, 0, 0, 0.925), inset 0 0 25px rgba(0, 0, 0, 0.125)';
const b = 'inset 0 0 8px rgba(0, 0, 0, 0.25)';

const Component = styled.div`
  align-items: center;
  background-image: ${p => `url(${p.backgroundImage})`};
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  /* background: ${p => (p.canUse ? '#333' : '#999')}; */
  border-radius: 50%;
  cursor: ${p => (p.canUse ? 'pointer' : 'not-allowed')};
  display: flex;
  flex-flow: column nowrap;
  height: 120px;
  justify-content: center;
  position: absolute;
  right: -135px;
  top: 20px;
  user-select: none;
  width: 120px;
  border-top: 1px solid rgba(255, 255, 255, 1);
  border-bottom: 1px solid rgba(0, 0, 0, 1);
  box-shadow: 0px 0px 4.5px rgba(0, 0, 0, 0.925),
    0px 0px 12.5px rgba(0, 0, 0, 0.465);

  &:before {
    box-shadow: ${p => (p.canUse ? a : b)};
    border-radius: 50%;
    border: 10px solid rgb(115, 104, 104);
    content: '';
    height: 100%;
    width: 100%;
    pointer-events: none;
    position: absolute;
    z-index: 1;
  }

  &:after {
    background: ${p => (p.canUse ? 'rgba(0, 0, 0, .2)' : 'rgba(0, 0, 0, .8)')};
    border-radius: 50%;
    content: '';
    height: 100%;
    width: 100%;
    pointer-events: none;
    position: absolute;
    z-index: 0;
    transition: background 800ms cubic-bezier(0.19, 1, 0.22, 1);
  }

  /* &:hover ${TextValue} {
    transform: ${p => (p.canUse ? 'scale(1)' : 'scale(0.85)')};
  } */

  ${Cost} > ${TextValue} {
    opacity: 1;
    transform: scale(1);
  }
`;
