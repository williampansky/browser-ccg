/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { useMediaQuery } from 'react-responsive';
import Select from 'react-select';
import { BoardSlot } from '@ccg/components';
import IMAGES, { SETS } from '@ccg/images';
import { PLAYER_BOARDS, TYPE } from '@ccg/enums';
import {
  exists,
  getCardBaseImage,
  getCardFlairImage,
  getImage
} from '@ccg/utils';
import {
  CARDS_CORE,
  CARDS_ENTOURAGE,
  CARDS_GAME,
  CARDS_PRIME,
  MECHANICS
} from '@ccg/data';

export default function MinionDev() {
  const [cardsArray, setCardsArray] = useState([]);
  const [selectedCard, setSelectedCard] = useState();
  const [CARD, SETCARD] = useState(CARDS_CORE['CORE_020']);
  const database = {
    ...CARDS_CORE,
    ...CARDS_ENTOURAGE,
    ...CARDS_PRIME
  };

  // card prop states
  const [canAttack, setCanAttack] = useState(false);
  const [canBeAttackedByMinion, setCanBeAttackedByMinion] = useState(false);
  const [canBeAttackedByPlayer, setCanBeAttackedByPlayer] = useState(false);
  const [canBeAttackedBySpell, setCanBeAttackedBySpell] = useState(false);
  const [canBeAttackedByOnPlay, setcanBeAttackedByOnPlay] = useState(false);
  const [canBeBuffed, setCanBeBuffed] = useState(false);
  const [canBeDebuffed, setCanBeDebuffed] = useState(false);
  const [canBeExpired, setCanBeExpired] = useState(false);
  const [canBeHealed, setCanBeHealed] = useState(false);
  const [canBeReturned, setCanBeReturned] = useState(false);
  const [canBeSacrificed, setCanBeSacrificed] = useState(false);
  const [canBeStolen, setCanBeStolen] = useState(false);
  const [canReceiveEnergyShield, setCanReceiveEnergyShield] = useState(false);
  const [canReceiveGuard, setCanReceiveGuard] = useState(false);
  const [canReceiveOnslaught, setCanReceiveOnslaught] = useState(false);
  const [hasBoon, setHasBoon] = useState(false);
  const [hasCurse, setHasCurse] = useState(false);
  const [hasBubble, sethasBubble] = useState(false);
  const [hasEventListener, setHasEventListener] = useState(false);
  const [hasBulwark, sethasBulwark] = useState(false);
  const [hasOnslaught, setHasOnslaught] = useState(false);
  const [hasPoison, setHasPoison] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [isConcealed, setIsConcealed] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [isElite, setIsElite] = useState(false);
  const [isDead, setIsDead] = useState(false);
  const [isImmune, setIsImmune] = useState(false);
  const [wasAttacked, setWasAttacked] = useState(false);
  const [willExpire, setWillExpire] = useState(false);
  const [willExpireIn, setWillExpireIn] = useState(2);

  const isBigScreen = useMediaQuery(
    { minDeviceWidth: 1200 },
    { deviceWidth: 1200 },
    { query: '(min-width: 1200px)' }
  );

  const handleOnChange = useCallback(
    // string => {
    //   router.push(router.pathname, { query: { id: string } });
    //   return setSelectedCard(string);
    // },
    []
  );

  const handleCardsArray = useCallback(array => {
    return setCardsArray(
      array
        .filter(obj => obj.type === TYPE[1])
        .map(obj => {
          const { id } = obj;
          return {
            label: id,
            value: id
          };
        })
        .sort((a, b) => {
          if (a.label > b.label) return 1;
          if (a.label < b.label) return -1;
          return 0;
        })
    );
  }, []);

  // useEffect(() => {
  //   database.length && handleCardsArray(database);
  // }, [handleCardsArray, database]);

  // const handleSetCard = useCallback(
  //   string => {
  //     const card = database.find(obj => obj.id === string);
  //     if (!exists(card)) return;
  //     return SETCARD(card);
  //   },
  //   [database]
  // );

  // useEffect(() => {
  //   handleSetCard(selectedCard);
  // }, [handleSetCard, selectedCard]);

  const initCardMechanics = useCallback((card, key) => {
    if (!exists(card)) return;
    const { mechanics } = card;
    if (!exists(mechanics)) return;

    // prettier-ignore
    switch (key) {
      case 'hasBoon':           return mechanics.includes('%BOON%');
      case 'hasCurse':          return mechanics.includes('%ON_DEATH%');
      case 'hasBubble':   return mechanics.includes('%BUBBLE%');
      case 'hasEventListener':  return mechanics.includes('%EVENT%');
      case 'hasBulwark':          return mechanics.includes('%BULWARK%');
      case 'hasOnslaught':      return mechanics.includes('%DOUBLE_ATTACK%');
      case 'hasPoison':         return mechanics.includes('%POISON%');
      case 'isConcealed':       return mechanics.includes('%HIDDEN%');
      default:                  return false;
    }
  }, []);

  return (
    <div className="card__developer minion__developer">
      <div className="margin id__selector">
        <div className="label">Select Card</div>
        {cardsArray.length !== 0 ? (
          <Select
            className={'selector'}
            // defaultInputValue={query && query.id}
            isSearchable={isBigScreen ? true : false}
            options={cardsArray}
            onChange={selectedOption => handleOnChange(selectedOption.value)}
            width="100%"
          />
        ) : null}
      </div>
      <div className="flex">
        <section className="right">
          {exists(CARD) && CARD !== {} ? (
            <div>
              <BoardSlot
                G={{
                  selectedCardObject: {
                    '0': null
                  }
                }}
                moves={{
                  deselectMinion: () => setIsAttacking(false),
                  selectMinion: () => setIsAttacking(true)
                }}
                canDrop={false}
                dev={true}
                data={{
                  minionData: {
                    ...CARD,
                    elite: !isElite ? CARD.elite : isElite
                  },
                  canAttack: canAttack,
                  canBeAttackedByMinion: canBeAttackedByMinion,
                  canBeAttackedByPlayer: canBeAttackedByPlayer,
                  canBeAttackedBySpell: canBeAttackedBySpell,
                  canBeAttackedByOnPlay: canBeAttackedByOnPlay,
                  canBeBuffed: canBeBuffed,
                  canBeDebuffed: canBeDebuffed,
                  canBeExpired: canBeExpired,
                  canBeHealed: canBeHealed,
                  canBeReturned: canBeReturned,
                  canBeSacrificed: canBeSacrificed,
                  canBeStolen: canBeStolen,
                  canReceiveEnergyShield: canReceiveEnergyShield,
                  canReceiveGuard: canReceiveGuard,
                  canReceiveOnslaught: canReceiveOnslaught,
                  currentAttack: CARD.attack,
                  currentHealth: CARD.health,
                  hasBoon: !hasBoon
                    ? initCardMechanics(CARD, 'hasBoon')
                    : hasBoon,
                  hasCurse: !hasCurse
                    ? initCardMechanics(CARD, 'hasCurse')
                    : hasCurse,
                  hasEventListener: !hasEventListener
                    ? initCardMechanics(CARD, 'hasEventListener')
                    : hasEventListener,
                  hasBubble: !hasBubble
                    ? initCardMechanics(CARD, 'hasBubble')
                    : hasBubble,
                  hasBulwark: !hasBulwark
                    ? initCardMechanics(CARD, 'hasBulwark')
                    : hasBulwark,
                  hasOnslaught: !hasOnslaught
                    ? initCardMechanics(CARD, 'hasOnslaught')
                    : hasOnslaught,
                  hasPoison: !hasPoison
                    ? initCardMechanics(CARD, 'hasPoison')
                    : hasPoison,
                  isAttacking: isAttacking,
                  isAttackingMinionIndex: null,
                  isAttackingPlayer: false,
                  isConcealed: !isConcealed
                    ? initCardMechanics(CARD, 'isConcealed')
                    : isConcealed,
                  isDisabled: isDisabled,
                  isDead: isDead,
                  isImmune: !isImmune
                    ? initCardMechanics(CARD, 'isImmune')
                    : isImmune,
                  totalAttack: CARD.attack,
                  totalHealth: CARD.health,
                  wasAttacked: wasAttacked,
                  willExpire: willExpire,
                  willExpireIn: willExpireIn
                }}
                board={PLAYER_BOARDS[1]}
                render={true}
                index={0}
                isActive={true}
                onClick={e => e.target.blur()}
                yourID={'0'}
                isEntering={isEntering}
              />
            </div>
          ) : null}
          <img
            alt=""
            className="board__floor"
            role="presentation"
            src={getImage('boards/BOARD_FLOOR.jpg', IMAGES)}
          />
        </section>
        <section className="left">
          <div className="margin">
            <div className="margin-small">
              <button
                data-active={canAttack}
                onClick={() => setCanAttack(!canAttack ? true : false)}
              >
                canAttack
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={canBeAttackedByMinion}
                onClick={() =>
                  setCanBeAttackedByMinion(
                    !canBeAttackedByMinion ? true : false
                  )
                }
              >
                canBeAttackedByMinion
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={canBeAttackedByPlayer}
                onClick={() =>
                  setCanBeAttackedByPlayer(
                    !canBeAttackedByPlayer ? true : false
                  )
                }
              >
                canBeAttackedByPlayer
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={canBeAttackedBySpell}
                onClick={() =>
                  setCanBeAttackedBySpell(!canBeAttackedBySpell ? true : false)
                }
              >
                canBeAttackedBySpell
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={canBeAttackedByOnPlay}
                onClick={() =>
                  setcanBeAttackedByOnPlay(
                    !canBeAttackedByOnPlay ? true : false
                  )
                }
              >
                canBeAttackedByOnPlay
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={canBeBuffed}
                onClick={() => setCanBeBuffed(!canBeBuffed ? true : false)}
              >
                canBeBuffed
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={canBeDebuffed}
                onClick={() => setCanBeDebuffed(!canBeDebuffed ? true : false)}
              >
                canBeDebuffed
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={canBeExpired}
                onClick={() => setCanBeExpired(!canBeExpired ? true : false)}
              >
                canBeExpired
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={canBeHealed}
                onClick={() => setCanBeHealed(!canBeHealed ? true : false)}
              >
                canBeHealed
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={canBeReturned}
                onClick={() => setCanBeReturned(!canBeReturned ? true : false)}
              >
                canBeReturned
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={canBeSacrificed}
                onClick={() =>
                  setCanBeSacrificed(!canBeSacrificed ? true : false)
                }
              >
                canBeSacrificed
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={canBeStolen}
                onClick={() => setCanBeStolen(!canBeStolen ? true : false)}
              >
                canBeStolen
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={canReceiveEnergyShield}
                onClick={() =>
                  setCanReceiveEnergyShield(
                    !canReceiveEnergyShield ? true : false
                  )
                }
              >
                canReceiveEnergyShield
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={canReceiveGuard}
                onClick={() =>
                  setCanReceiveGuard(!canReceiveGuard ? true : false)
                }
              >
                canReceiveGuard
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={canReceiveOnslaught}
                onClick={() =>
                  setCanReceiveOnslaught(!canReceiveOnslaught ? true : false)
                }
              >
                canReceiveOnslaught
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={isElite}
                onClick={() => setIsElite(!isElite ? true : false)}
              >
                isElite
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={hasBoon}
                onClick={() => setHasBoon(!hasBoon ? true : false)}
              >
                hasBoon
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={hasCurse}
                onClick={() => setHasCurse(!hasCurse ? true : false)}
              >
                hasCurse
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={hasBubble}
                onClick={() => sethasBubble(!hasBubble ? true : false)}
              >
                hasBubble
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={hasEventListener}
                onClick={() =>
                  setHasEventListener(!hasEventListener ? true : false)
                }
              >
                hasEventListener
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={hasBulwark}
                onClick={() => sethasBulwark(!hasBulwark ? true : false)}
              >
                hasBulwark
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={hasOnslaught}
                onClick={() => setHasOnslaught(!hasOnslaught ? true : false)}
              >
                hasOnslaught
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={hasPoison}
                onClick={() => setHasPoison(!hasPoison ? true : false)}
              >
                hasPoison
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={isAttacking}
                onClick={() => setIsAttacking(!isAttacking ? true : false)}
              >
                isAttacking
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={isConcealed}
                onClick={() => setIsConcealed(!isConcealed ? true : false)}
              >
                isConcealed
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={isDead}
                onClick={() => setIsDead(!isDead ? true : false)}
              >
                isDead
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={isDisabled}
                onClick={() => setIsDisabled(!isDisabled ? true : false)}
              >
                isDisabled
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={isEntering}
                onClick={() => {
                  setIsEntering(true);
                  setTimeout(() => {
                    setIsEntering(false);
                  }, 400);
                }}
              >
                isEntering
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={isImmune}
                onClick={() => setIsImmune(!isImmune ? true : false)}
              >
                isImmune
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={wasAttacked}
                onClick={() => {
                  setWasAttacked(true);
                  setTimeout(() => {
                    setWasAttacked(false);
                  }, 500);
                }}
              >
                wasAttacked
              </button>
            </div>
            <div className="margin-small">
              <button
                data-active={willExpire}
                onClick={() => setWillExpire(!willExpire ? true : false)}
              >
                willExpire
              </button>
            </div>
            <div className="margin-small">
              <input
                onChange={e => setWillExpireIn(e.target.value)}
                type="number"
                defaultValue={willExpireIn}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
