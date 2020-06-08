import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { replaceConstant, replaceDynamicText } from '@ccg/utils';

export default function WarcryObject({ data }) {
  const { id, attack, playType, playContext, targetingArrowText } = data;

  function cardText(string, spellDmg = attack) {
    const replacedDynamicDmg = replaceDynamicText(string, spellDmg);
    const replacedSymbols = replaceConstant(replacedDynamicDmg);
    return replacedSymbols;
  }

  return (
    <Component data-file="warcrys/WarcryObject" data-id={id}>
      <div className="content">
        <div className="label">{`${playType} ${
          playContext ? playContext : 'Warcry'
        }`}</div>
        <div className="text">
          <div className="text__value">{cardText(targetingArrowText)}</div>
        </div>
      </div>
      <Ring />
      <Badge src={`assets/card-assets/Class_Skill_Sphere.png`} />
    </Component>
  );
}

WarcryObject.propTypes = {
  data: PropTypes.object
};

const Component = styled.div`
  animation: translateIn 600ms var(--animation-transition-cubic) forwards;
  border-radius: 50%;
  cursor: default;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  height: var(--class-skill-button-size);
  position: absolute;
  right: 22%;
  top: -500%;
  user-select: none;
  width: var(--class-skill-button-size);
  transition: 600ms cubic-bezier(0.19, 1, 0.22, 1);
  transition-property: opacity, transform;
  font-size: 16px;
  pointer-events: none;

  @keyframes translateIn {
    0% {
      opacity: 0;
      transform: scale(0.1);
    }
    80% {
      opacity: 1;
      transform: scale(1.25);
    }
    100% {
      transform: scale(1);
    }
  }

  .content {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
    width: 75%;
    margin: 0 auto;
    text-align: center;
    position: relative;
    z-index: 1;
  }

  .content .label {
    font-family: 'Verdana', sans-serif;
    color: white;
    text-transform: uppercase;
    font-size: 0.675em;
    margin: 0 auto 10px;
  }

  .content .text__value {
    top: 0;
  }
`;

const Ring = styled.div`
  animation: rotate 1s linear infinite;
  background: linear-gradient(#3cf, transparent, #3cf);
  border-radius: 110px;
  bottom: 0;
  left: 0;
  margin: 0 auto;
  padding: 10px;
  position: absolute;
  right: -1px;
  top: -2px;
  z-index: -1;
  width: 100%;
  height: 100%;

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const Badge = styled.img`
  height: calc(var(--class-skill-button-size) + 30px);
  right: -15px;
  top: -12px;
  position: absolute;
  pointer-events: none;
`;
