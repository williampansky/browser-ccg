import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { getHeroImage, removeSymbols } from '@ccg/utils';
import { AppIcon } from '@ccg/components';

const OpponentSkillsAroundOrb = props => {
  const { costImageSrc, heroAbilities, heroSymbol } = props;

  return (
    <div
      className={styles['opponent__skills__around__orb']}
      data-component="OpponentSkillsAroundOrb"
    >
      <ul className={styles['opponent__skills__list']}>
        {heroAbilities
          .map((obj, idx) => {
            idx = idx + 1;
            const {
              abilityLocked,
              cooldownInEffect,
              cooldown,
              cost,
              id,
              mechanics,
              name,
              playContext,
              playType,
              ultimate
            } = obj;

            return (
              <li className={styles['opponent__skills__list-item']} key={idx}>
                {!abilityLocked ? (
                  <div
                    className={[
                      styles['opponent__skill__cost'],
                      cooldownInEffect ? styles['overlay--in-effect'] : ''
                    ].join(' ')}
                  >
                    <div className={styles['opponent__skill__cost--gem']}>
                      <div className="text__value">{cost}</div>
                      <img alt="" role="presentation" src={costImageSrc} />
                    </div>
                    <div className={styles['opponent__skill__cost--cooldown']}>
                      <div>
                        <div className="text__value">
                          {ultimate ? 'Ult' : cooldown}
                        </div>
                      </div>
                      <AppIcon fileName="icon-uikit-refresh" size="14px" />
                    </div>
                  </div>
                ) : null}

                <img
                  alt={name}
                  className={styles['opponent__skill__icon']}
                  role="presentation"
                  src={getHeroImage(
                    heroSymbol,
                    `${removeSymbols(heroSymbol)}_00${idx}`
                  )}
                />
              </li>
            );
          })
          .sort((a, b) => a.cost - b.cost)
          .reverse()}
      </ul>
    </div>
  );
};

OpponentSkillsAroundOrb.propTypes = {
  costImageSrc: PropTypes.string,
  heroAbilities: PropTypes.array.isRequired,
  heroSymbol: PropTypes.string.isRequired
};

OpponentSkillsAroundOrb.defaultProps = {
  heroAbilities: []
};

export default OpponentSkillsAroundOrb;
