import React from 'react';
import PropTypes from 'prop-types';

export default function HasGuardForeground({ imgSrc }) {
  const [isAnimating, setIsAnimating] = React.useState(false);

  // prettier-ignore
  React.useEffect(() => {
    setIsAnimating(true)
    setTimeout(() => { setIsAnimating(false); }, 200);
  }, []);

  return (
    <img
      alt=""
      className={[
        'minion--has-guard-foreground'
        // isAnimating ? '--is-animating' : ''
      ].join(' ')}
      data-file="mechanics/HasGuardForeground"
      role="presentation"
      src={imgSrc}
    />
  );
}

HasGuardForeground.propTypes = {
  imgSrc: PropTypes.string
};
