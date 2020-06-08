import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

export default function WarcryObject({ data }) {
  const { id, attack, playType, targetingArrowText } = data;
  return (
    <div data-file="warcrys/WarcryObject" className={'warcry-object'}>
      <div className={'warcry__object__ring'} />
      <div className={'warcry__object__content'}>
        <div className={'warcry-object-label'}>Targeted Warcry Spell</div>
        <div className={'warcry-object-text'}>{targetingArrowText}</div>
      </div>
      <meta name="id" content={id} />
      <meta name="attack" content={attack} />
      <meta name="playType" content={playType} />
      <meta name="targetingArrowText" content={targetingArrowText} />
      <Badge src={`assets/card-assets/Class_Skill_Sphere.png`} />
    </div>
  );
}

WarcryObject.propTypes = {
  data: PropTypes.object
};

const Badge = styled.img`
  height: calc(var(--class-skill-button-size) + 30px);
  right: -15px;
  top: -12px;
  position: absolute;
  pointer-events: none;
`;
