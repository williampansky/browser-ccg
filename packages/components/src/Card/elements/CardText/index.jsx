import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

const CardText = ({ text }) => (
  <div className={styles['card__text']}>
    <p className="text__value" dangerouslySetInnerHTML={text} />
  </div>
);

CardText.propTypes = {
  text: PropTypes.object
};

export default CardText;
