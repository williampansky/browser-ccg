import React from 'react';
import PropTypes from 'prop-types';

export default function SpellObject({ data }) {
  const { id, attack, playType, targetingArrowText } = data;
  return (
    <div data-file="warcrys/SpellObject" className={'warcry-object'}>
      <div className={'warcry__object__ring'} />
      <div className={'warcry__object__content'}>
        <div className={'warcry-object-label'}>Targeted Spell</div>
        <div className={'warcry-object-text'}>{targetingArrowText}</div>
      </div>
      <meta name="id" content={id} />
      <meta name="attack" content={attack} />
      <meta name="playType" content={playType} />
      <meta name="targetingArrowText" content={targetingArrowText} />
    </div>
  );
}

SpellObject.propTypes = {
  data: PropTypes.object
};
