import React, { useLayoutEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { PLAY_TYPE, RACE, RARITY, SET, TYPE } from '@ccg/enums';
import IMAGES, { CARDS, HEROS, SETS } from '@ccg/images';
import {
  createMarkup,
  exists,
  fontSizeBasedOnCharacterLength,
  formatCardText,
  getCardAssetImage,
  replaceConstant,
  getImage,
  removeSymbols,
  getCardByID,
  getCardBaseImage,
  getCardFlairImage,
  getHeroAbilityName,
  getHeroAbilityText
} from '@ccg/utils';
import { DECK_DEFAULT_001 } from '@ccg/data';
import { Card, Minion } from '@ccg/components';

import BoardSlot from '../board-slots/BoardSlot';

const GameWrapper = props => {
  // boardgame.io props
  const {
    G,
    ctx,
    moves,
    events,
    reset,
    undo,
    redo,
    step,
    log,
    gameID,
    playerID,
    gameMetadata,
    isActive,
    isMultiplayer,
    isConnected,
    credentials,
    addressBarSize
  } = props;

  // states
  const [fabActive, setFabActive] = useState(false);

  useLayoutEffect(() => {
    fabActive
      ? document.body.classList.add('body-fade')
      : document.body.classList.remove('body-fade');
  }, [fabActive]);

  const { boards, health, players, playerHero } = G;

  // id declarations
  const yourID = playerID === '0' ? '0' : '1';
  const theirID = playerID === '0' ? '1' : '0';

  return (
    <div
      className="game__wrapper"
      data-address-bar-size={addressBarSize}
      style={{ height: `calc(100vh - ${addressBarSize}px)` }}
    >
      <div className="player__wrapper their__player__wrapper">
        <div className="avatar__image">
          <img
            alt={replaceConstant(playerHero[theirID])}
            className="avatar__image your__avatar"
            role="presentation"
            src={getImage(
              `heros/${removeSymbols(playerHero[theirID])}/AVATAR.jpg`,
              IMAGES
            )}
          />
        </div>
        <div className="player__info__wrapper">
          <div>
            <div className="player__name">
              <span className="text__value">Player {theirID}</span>
            </div>
            <div className="player__hero">
              <span className="">{replaceConstant(playerHero[theirID])}</span>
            </div>
            <div className="player__health">
              <span className="text__value">{health[theirID]}</span>
            </div>
          </div>
          <div>
            <div className="opponent__stats__and__skills__wrapper">
              <div className="player__abilities__wrapper">
                <ul className="abilities__list">
                  <li>
                    <div className="abilities__list__button">
                      <img
                        alt="Abilities Icon"
                        className="abilities__icon"
                        src={getImage('HERO_EXILE/HERO_EXILE_001.jpg', HEROS)}
                      />
                    </div>
                  </li>
                  <li>
                    <div className="abilities__list__button">
                      <img
                        alt="Abilities Icon"
                        className="abilities__icon"
                        src={getImage('HERO_EXILE/HERO_EXILE_002.jpg', HEROS)}
                      />
                    </div>
                  </li>
                  <li>
                    <div className="abilities__list__button">
                      <img
                        alt="Abilities Icon"
                        className="abilities__icon"
                        src={getImage('HERO_EXILE/HERO_EXILE_003.jpg', HEROS)}
                      />
                    </div>
                  </li>
                </ul>
              </div>
              <div className="player__stats__wrapper">
                <div className="player__stats">
                  <div className="cards__stat cards__in__hand">
                    <span className="stat__label">Hand</span>
                    <span className="stat__value text__value">
                      {players[theirID].hand.length}
                    </span>
                  </div>
                  <div className="cards__stat cards__in__deck">
                    <span className="stat__label">Deck</span>
                    <span className="stat__value text__value">
                      {players[theirID].deck.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="game__board">
        <div className="board__play__area their__board__play__area">
          {boards[theirID].map((obj, i) => (
            <React.Fragment key={i}>
              <BoardSlot
                G={G}
                ctx={ctx}
                moves={moves}
                isActive={isActive}
                data={obj}
                index={i}
                yourID={yourID}
                theirID={theirID}
                dev={false}
              />
            </React.Fragment>
          ))}
        </div>
        <div className="board__play__area your__board__play__area">
          {boards[yourID].map((obj, i) => (
            <React.Fragment key={i}>
              <BoardSlot
                G={G}
                ctx={ctx}
                moves={moves}
                isActive={isActive}
                data={obj}
                index={i}
                yourID={yourID}
                theirID={theirID}
                dev={false}
              />
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="player__wrapper your__player__wrapper">
        <div className="avatar__image">
          <img
            alt={replaceConstant(playerHero[yourID])}
            className="avatar__image your__avatar"
            role="presentation"
            src={getImage(
              `heros/${removeSymbols(playerHero[yourID])}/AVATAR.jpg`,
              IMAGES
            )}
          />
        </div>
        <div className="player__info__wrapper">
          <div>
            <div className="player__name">
              <span className="text__value">Player {yourID}</span>
            </div>
            <div className="player__hero">
              <span className="">{replaceConstant(playerHero[yourID])}</span>
            </div>
            <div className="player__health">
              <span className="text__value">{health[yourID]}</span>
            </div>
          </div>
          <div>
            <div className="player__stats__wrapper">
              <div className="player__stats">
                <div className="cards__stat cards__in__hand">
                  <span className="stat__label">Hand</span>
                  <span className="stat__value text__value">
                    {players[yourID].hand.length}
                  </span>
                </div>
                <div className="cards__stat cards__in__deck">
                  <span className="stat__label">Deck</span>
                  <span className="stat__value text__value">
                    {players[yourID].deck.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="cards__wrapper your__cards__wrapper">
        {DECK_DEFAULT_001.map((string, i) => {
          const card = getCardByID(string);
          return (
            <div className="card__wrapper" key={i}>
              <Card
                active={card.active}
                artist={card.artist}
                attack={card.attack}
                collectible={card.collectible}
                cost={card.cost}
                deckBuilder={card.deckBuilder}
                elite={card.elite}
                entourage={card.entourage}
                flavor={card.flavor}
                health={card.health}
                howToEarn={card.howToEarn}
                howToEarnGolden={card.howToEarnGolden}
                id={card.id}
                imageBaseSrc={getCardBaseImage(card.rarity, card.type, CARDS)}
                imageFlairSrc={getCardFlairImage(card.id, card.set, SETS)}
                isGolden={card.isGolden}
                mechanics={card.mechanics}
                name={card.name}
                numberOvercharge={card.numberOvercharge}
                numberPrimary={card.numberPrimary}
                numberRNG={card.numberRNG}
                numberSecondary={card.numberSecondary}
                onClick={card.onClick}
                playContext={card.playContext}
                playRequirements={card.playRequirements}
                playType={card.playType}
                race={card.race}
                rarity={card.rarity}
                set={card.set}
                sounds={card.sounds}
                targetingArrowText={card.targetingArrowText}
                text={card.text}
                type={card.type}
              />
            </div>
          );
        })}
      </div>
      <div className="player__abilities__wrapper">
        <div
          className={[
            'abilities__icon__button',
            fabActive ? 'active' : ''
          ].join(' ')}
          role="button"
          onClick={() => setFabActive(!fabActive ? true : false)}
          onKeyPress={() => setFabActive(!fabActive ? true : false)}
          tabIndex={0}
        >
          <img
            alt="Close Abilities"
            className="abilities__icon"
            src={
              fabActive
                ? getImage('heros/ABILITIES_ICON_CLOSE.jpg', IMAGES)
                : getImage('heros/ABILITIES_ICON.jpg', IMAGES)
            }
          />
        </div>
        <ul
          className={['abilities__list', fabActive ? 'active' : ''].join(' ')}
        >
          <li>
            <div
              className="abilities__list__button"
              role="button"
              onClick={e => console.log(e)}
              onKeyPress={e => console.log(e)}
              tabIndex={0}
            >
              <div className="abilities__list__info">
                <div className="ability__name">
                  {getHeroAbilityName('HERO_ZEUS_001')}
                </div>
                <div className="ability__description">
                  {getHeroAbilityText('HERO_ZEUS_001')}
                </div>
              </div>
              <img
                alt="Abilities Icon"
                className="abilities__icon"
                src={getImage('HERO_ZEUS/HERO_ZEUS_001.jpg', HEROS)}
              />
            </div>
          </li>
          <li>
            <div
              className="abilities__list__button"
              role="button"
              onClick={e => console.log(e)}
              onKeyPress={e => console.log(e)}
              tabIndex={0}
            >
              <div className="abilities__list__info">
                <div className="ability__name">
                  {getHeroAbilityName('HERO_ZEUS_002')}
                </div>
                <div className="ability__description">
                  {getHeroAbilityText('HERO_ZEUS_002')}
                </div>
              </div>
              <img
                alt="Abilities Icon"
                className="abilities__icon"
                src={getImage('HERO_ZEUS/HERO_ZEUS_002.jpg', HEROS)}
              />
            </div>
          </li>
          <li>
            <div
              className="abilities__list__button"
              role="button"
              onClick={e => console.log(e)}
              onKeyPress={e => console.log(e)}
              tabIndex={0}
            >
              <div className="abilities__list__info">
                <div className="ability__name">
                  {getHeroAbilityName('HERO_ZEUS_003')}
                </div>
                <div className="ability__description">
                  {getHeroAbilityText('HERO_ZEUS_003')}
                </div>
              </div>
              <img
                alt="Abilities Icon"
                className="abilities__icon"
                src={getImage('HERO_ZEUS/HERO_ZEUS_003.jpg', HEROS)}
              />
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

GameWrapper.propTypes = {
  props: PropTypes.shape({
    G: PropTypes.object,
    ctx: PropTypes.object,
    moves: PropTypes.object,
    events: PropTypes.object,
    reset: PropTypes.object,
    undo: PropTypes.object,
    redo: PropTypes.object,
    step: PropTypes.object,
    log: PropTypes.object,
    gameID: PropTypes.string,
    playerID: PropTypes.string,
    playerName: PropTypes.string,
    plugins: PropTypes.object,
    gameMetadata: PropTypes.object,
    isActive: PropTypes.bool,
    isMultiplayer: PropTypes.bool,
    isConnected: PropTypes.bool,
    credentials: PropTypes.object
  })
};

export default GameWrapper;
