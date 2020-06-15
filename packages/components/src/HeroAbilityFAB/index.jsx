import React, { useCallback, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Fab, Action } from 'react-tiny-fab';
import 'react-tiny-fab/dist/styles.css';
import styles from './styles.module.scss';
import { HeroAbilityButton } from '@ccg/components';

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

  return (
    <div
      className={styles['hero__ability__fab']}
      data-component="HeroAbilityFAB"
    >
      <Fab
        alwaysShowTitle={false}
        event="click"
        icon={
          <Fragment>
            <img
              alt="Hero Abilities"
              className={[
                styles['main__button__image'],
                styles['fab--closed']
              ].join(' ')}
              role="presentation"
              src={abilitiesImageBase}
            />
            <img
              alt="Hero Abilities"
              className={[
                styles['main__button__image'],
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
              abilityLocked,
              cooldown,
              cooldownInEffect,
              cost,
              id,
              mechanics,
              name,
              playContext,
              playType,
              ultimate
            } = obj;

            return (
              <Action
                key={idx}
                onClick={event => handleAbilityClick(event, id)}
              >
                <HeroAbilityButton
                  abilityLocked={abilityLocked}
                  cooldown={cooldown}
                  cooldownInEffect={cooldownInEffect}
                  cost={cost}
                  costImageSrc={costImageSrc}
                  heroSymbol={heroSymbol}
                  index={idx}
                  mechanics={mechanics}
                  name={name}
                  playContext={playContext}
                  playType={playType}
                  ultimate={ultimate}
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
