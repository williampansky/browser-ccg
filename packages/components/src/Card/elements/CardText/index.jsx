import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

const CardText = ({
  createMarkup,
  formatCardText,
  numberPrimary,
  numberSecondary,
  spellDmgBoon,
  text
}) => {
  return text ? (
    <div className={styles['card__text']}>
      <p
        className="text__value"
        dangerouslySetInnerHTML={createMarkup(
          formatCardText(text, numberPrimary, numberSecondary, spellDmgBoon)
        )}
      />
    </div>
  ) : null;
};

CardText.propTypes = {
  createMarkup: PropTypes.func.isRequired,
  formatCardText: PropTypes.func.isRequired,
  numberPrimary: PropTypes.number.isRequired,
  numberSecondary: PropTypes.number.isRequired,
  spellDmgBoon: PropTypes.number.isRequired,
  text: PropTypes.string
};

export default CardText;
