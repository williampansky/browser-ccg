import React from 'react';
import PropTypes from 'prop-types';

export default function HasGuardForeground() {
  const [isAnimating, setIsAnimating] = React.useState(false);

  // prettier-ignore
  React.useEffect(() => {
    setIsAnimating(true)
    setTimeout(() => { setIsAnimating(false); }, 200);
  }, []);

  return (
    <div
      className={[
        'minion--has-guard-foreground'
        // isAnimating ? '--is-animating' : ''
      ].join(' ')}
      data-file="mechanics/HasGuardForeground"
    />
  );
}

HasGuardForeground.propTypes = {
  moves: PropTypes.object,
  data: PropTypes.object,
  index: PropTypes.number
};
