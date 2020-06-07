import React from 'react';
import PropTypes from 'prop-types';
import replaceConstant from '@/utils/replace-constants';

export default function HasGuardBackground({ race }) {
  const [isAnimating, setIsAnimating] = React.useState(false);

  // prettier-ignore
  React.useEffect(() => {
    setIsAnimating(true)
    setTimeout(() => { setIsAnimating(false); }, 200);
  }, []);

  /**
   * Returns minion race in lower case format
   * @param {string} race
   */
  function getMinionRaceClass(race) {
    return `minion__race--${replaceConstant(race).toLowerCase()}`;
  }

  return (
    <div
      className={[
        'minion--has-guard-background',
        getMinionRaceClass(race)
        // isAnimating ? '--is-animating' : ''
      ].join(' ')}
      data-file="mechanics/HasGuardBackground"
    />
  );
}

HasGuardBackground.propTypes = {
  race: PropTypes.string.isRequired
};
