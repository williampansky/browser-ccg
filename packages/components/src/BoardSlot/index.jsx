import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

const BoardSlot = props => {
  // const { theirBoard, theirId, yourBoard, yourId } = props;

  return (
    <div className={styles['board__slot']} data-component="BoardSlot"></div>
  );
};

BoardSlot.propTypes = {
  theirId: PropTypes.string.isRequired,
  theirBoard: PropTypes.object,
  yourId: PropTypes.string.isRequired,
  yourBoard: PropTypes.object
};

BoardSlot.defaultProps = {
  theirBoard: {},
  yourBoard: {}
};

export default BoardSlot;
