import React from 'react';
import PropTypes from 'prop-types';
// import image from 'assets/images/card-back-temp2.png';

export default function CardBack({ imageSrc }) {
  return (
    <div
      className={['card', 'card-back'].join(' ')}
      style={{
        backgroundImage: `url(assets/images/cards/backs/${imageSrc})`
      }}
    />
  );
}

CardBack.propTypes = {
  imageSrc: PropTypes.string
};
