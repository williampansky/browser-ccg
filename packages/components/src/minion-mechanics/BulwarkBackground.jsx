import React from 'react';
import PropTypes from 'prop-types';
import { getMinionRaceClass } from '@ccg/utils';

export default function HasBulwarkBackground({ imgSrc, race }) {
  const [isAnimating, setIsAnimating] = React.useState(false);

  // prettier-ignore
  React.useEffect(() => {
    setIsAnimating(true)
    setTimeout(() => { setIsAnimating(false); }, 200);
    return () => setIsAnimating(false);
  }, []);

  return (
    <img
      alt=""
      className={[
        'minion--has-bulwark-background',
        getMinionRaceClass(race)
        // isAnimating ? '--is-animating' : ''
      ].join(' ')}
      data-file="mechanics/HasBulwarkBackground"
      role="presentation"
      src={imgSrc}
    />
  );
}

HasBulwarkBackground.propTypes = {
  imgSrc: PropTypes.string.isRequired,
  race: PropTypes.string.isRequired
};
