import React, { useCallback, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Fab, Action } from 'react-tiny-fab';
import 'react-tiny-fab/dist/styles.css';
import styles from './styles.module.scss';
import { MECHANICS, PLAY_CONTEXT, PLAY_TYPE } from '@ccg/enums';
import { getHeroImage, removeSymbols } from '@ccg/utils';
import { AppIcon } from '@ccg/components';

const HeroAbilityFAB = ({
  abilitiesImageBase,
  abilitiesImageClose,
  costImageSrc,
  heroAbilities,
  heroSymbol,
  onAbilityClick,
  onClick
}) => {
  const mainButtonStyles = {
    height: 'var(--player-fab-size)',
    margin: 0,
    padding: 0,
    position: 'relative',
    maxHeight: 'var(--player-fab-size)',
    maxWidth: 'var(--player-fab-size)',
    overflow: 'hidden',
    width: 'var(--player-fab-size)',
    zIndex: 1
  };

  const position = {
    bottom: 0,
    left: 0,
    margin: 0,
    padding: 0,
    position: 'relative',
    right: 0,
    top: 0,
    zIndex: 1
  };

  const handleAbilityClick = useCallback(
    (event, abilityId) => {
      event.preventDefault();
      return onAbilityClick(abilityId);
    },
    [onAbilityClick]
  );

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
    <div className={styles['hero__ability__fab']}>
      <Fab
        alwaysShowTitle={false}
        event="click"
        icon={
          <Fragment>
            <img
              alt="Hero Abilities"
              className={[
                styles['main__button__icon'],
                styles['fab--closed']
              ].join(' ')}
              role="presentation"
              src={abilitiesImageBase}
            />
            <img
              alt="Hero Abilities"
              className={[
                styles['main__button__icon'],
                styles['fab--open']
              ].join(' ')}
              role="presentation"
              src={abilitiesImageClose}
            />
          </Fragment>
        }
        key={-1}
        mainButtonStyles={mainButtonStyles}
        position={position}
      >
        {heroAbilities
          .map((obj, idx) => {
            idx = idx + 1;
            const {
              cooldown,
              cost,
              id,
              mechanics,
              name,
              playType,
              playContext,
              ultimate
            } = obj;

            return (
              <Action
                key={idx}
                onClick={event => handleAbilityClick(event, id)}
              >
                <div className={styles['main__button__cost']}>
                  <div className={styles['main__button__cost--gem']}>
                    <div className="text__value">{cost}</div>
                    <img alt="" role="presentation" src={costImageSrc} />
                  </div>
                  <div className={styles['main__button__cost--cooldown']}>
                    <div>
                      <div className="text__value">
                        {ultimate ? 'Ult' : cooldown}
                      </div>
                    </div>
                    <AppIcon fileName="icon-uikit-refresh" />
                  </div>
                </div>
                <div className={styles['main__button__spell__type']}>
                  <AppIcon
                    color="white"
                    fileName={handleAbilityIcon(
                      mechanics,
                      playType,
                      playContext
                    )}
                  />
                </div>
                <img
                  alt={name}
                  className={styles['main__button__icon']}
                  role="presentation"
                  src={getHeroImage(
                    heroSymbol,
                    `${removeSymbols(heroSymbol)}_00${idx}`
                  )}
                />
              </Action>
            );
          })
          .sort((a, b) => a.cost - b.cost)
          .reverse()}
      </Fab>
    </div>
  );
};

HeroAbilityFAB.propTypes = {
  abilitiesImageBase: PropTypes.string,
  abilitiesImageClose: PropTypes.string,
  costImageSrc: PropTypes.string,
  heroAbilities: PropTypes.array.isRequired,
  heroSymbol: PropTypes.string.isRequired,
  onAbilityClick: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired
};

HeroAbilityFAB.defaultProps = {
  heroAbilities: [],
  onAbilityClick: payload => {
    console.log(payload);
  },
  onClick: () => {}
};

export default HeroAbilityFAB;
