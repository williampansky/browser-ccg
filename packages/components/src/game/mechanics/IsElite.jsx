import React from 'react';
import PropTypes from 'prop-types';

// https://codepen.io/vineethtr/pen/qdKXeB?editors=0100
export default function IsElite({ imgSrc }) {
  return (
    <div className="minion--is-elite" data-file="mechanics/IsElite">
      <img alt="" role="presentation" src={imgSrc} />
    </div>
  );
}

IsElite.propTypes = {
  imgSrc: PropTypes.string.isRequired
};
