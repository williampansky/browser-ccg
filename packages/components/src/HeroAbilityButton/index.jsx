import React, { Fragment, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { MECHANICS, PLAY_CONTEXT, PLAY_TYPE } from '@ccg/enums';
import { getHeroImage, removeSymbols } from '@ccg/utils';
import { AppIcon } from '@ccg/components';

/**
 * @requires AppIcon
 */
const HeroAbilityButton = ({
  cooldown,
  cost,
  costImageSrc,
  heroSymbol,
  index,
  mechanics,
  name,
  playContext,
  playType,
  ultimate
}) => {
  const handleAbilityIcon = useCallback(
    (cardMechanics, playType, playContext) => {
      if (playType === PLAY_TYPE['TARGETED']) return 'TARGET';
      else if (playContext === PLAY_CONTEXT['SUMMON']) return 'SUMMON';
      else if (cardMechanics.includes(MECHANICS['AOE'])) return 'AOE';
      else if (cardMechanics.includes(MECHANICS['DAMAGE'])) return 'DAMAGE';
    },
    []
  );

  return (
    <Fragment>
      <div className={styles['main__button__cost']}>
        <div className={styles['main__button__cost--gem']}>
          <div className="text__value">{cost}</div>
          <img alt="" role="presentation" src={costImageSrc} />
        </div>
        <div className={styles['main__button__cost--cooldown']}>
          <div>
            <div className="text__value">{ultimate ? 'Ult' : cooldown}</div>
          </div>
          <AppIcon fileName="icon-uikit-refresh" />
        </div>
      </div>

      <div className={styles['main__button__spell__type']}>
        <AppIcon
          color="white"
          fileName={handleAbilityIcon(mechanics, playType, playContext)}
        />
      </div>

      <img
        alt={name}
        className={styles['main__button__icon']}
        role="presentation"
        src={getHeroImage(
          heroSymbol,
          `${removeSymbols(heroSymbol)}_00${index}`
        )}
      />
    </Fragment>
  );
};

HeroAbilityButton.propTypes = {
  cooldown: PropTypes.number.isRequired,
  cost: PropTypes.number.isRequired,
  costImageSrc: PropTypes.string.isRequired,
  heroSymbol: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  mechanics: PropTypes.array.isRequired,
  name: PropTypes.string.isRequired,
  playContext: PropTypes.string.isRequired,
  playType: PropTypes.string.isRequired,
  ultimate: PropTypes.bool.isRequired
};

HeroAbilityButton.defaultProps = {
  cooldown: 0,
  ultimate: false
};

export default HeroAbilityButton;
