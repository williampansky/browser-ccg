import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

const CardAttack = ({ attack, badgeImgSrc, elite, type, typeEnums }) => {
  return type === typeEnums['MINION'] || type === typeEnums['WEAPON'] ? (
    <div
      className={[
        styles['card__attack'],
        elite ? styles['card__attack__elite'] : ''
      ].join(' ')}
    >
      <div className="text__value" data-value={attack}>
        {attack}
      </div>
      <img
        alt=""
        className={
          elite
            ? styles['card__attack__badge__elite']
            : styles['card__attack__badge']
        }
        role="presentation"
        src={badgeImgSrc}
      />
    </div>
  ) : null;
};

CardAttack.propTypes = {
  attack: PropTypes.number,
  badgeImgSrc: PropTypes.string,
  elite: PropTypes.bool,
  type: PropTypes.string,
  typeEnums: PropTypes.object
};

export default CardAttack;
