import React from 'react';
import PropTypes from 'prop-types';

// https://codepen.io/vineethtr/pen/qdKXeB?editors=0100
export default function Elite({ imgSrc }) {
  return (
    <div className="minion--is-elite" data-file="mechanics/Elite">
      <img alt="" role="presentation" src={imgSrc} />
    </div>
  );
}

Elite.propTypes = {
  imgSrc: PropTypes.string.isRequired
};
