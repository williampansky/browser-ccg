import React from 'react';
import PropTypes from 'prop-types';

export default function HasBulwarkForeground({ imgSrc }) {
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
        'minion--has-bulwark-foreground'
        // isAnimating ? '--is-animating' : ''
      ].join(' ')}
      data-file="mechanics/HasBulwarkForeground"
      role="presentation"
      src={imgSrc}
    />
  );
}

HasBulwarkForeground.propTypes = {
  imgSrc: PropTypes.string
};
