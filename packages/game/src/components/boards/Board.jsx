import React from 'react';
import PropTypes from 'prop-types';
import { PLAYER_BOARDS, TYPE, PLAY_TYPE } from '@ccg/enums';

// child components
import YourAvatar from '../avatars/YourAvatar';
import TheirAvatar from '../avatars/TheirAvatar';
import ItemSlot from '../board-slots/ItemSlot';
import WeaponSlot from '../board-slots/WeaponSlot';
import SpellSlot from '../board-slots/SpellSlot';
import TheirBoardPlayerArea from '../board-play-areas/TheirBoardPlayArea';
import YourBoardPlayArea from '../board-play-areas/YourBoardPlayArea';

export default function Board({
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
  yourID,
  theirID,
  gameWidth
}) {
  const {
    cardBack,
    counts,
    energy,
    playerCanAttack,
    playerCanUseClassSkill,
    playerAttackValue,
    playerIsAttacking,
    playerClass,
    playerWeapon,
    selectedCardObject,
    selectedCardType,
    selectedCardSpellType,
    warcryObject,
    spellObject
  } = G;

  const { playCard } = moves;

  const selectedCard = selectedCardObject[yourID];
  const cardId = selectedCard && selectedCard.id;
  const cardUUID = selectedCard && selectedCard.uuid;
  const cardType = selectedCard && selectedCardType[yourID];
  const spellType = selectedCard && selectedCardSpellType[yourID];
  const spellObjectId = spellObject[yourID] && spellObject[yourID].id;

  function castGlobalSpell(index = 0, uuid = cardUUID, id = cardId) {
    return playCard(index, uuid, id);
  }

  function equipPlayerWeapon(index = 0, uuid = cardUUID, id = cardId) {
    return playCard(index, uuid, id);
  }

  return (
    <div data-file="boards/Board" className={['board'].join(' ')}>
      {cardType === TYPE[2] && spellType === PLAY_TYPE['GLOBAL'] ? (
        <ItemSlot
          index={0}
          gameWidth={1920}
          onClick={() => castGlobalSpell()}
        />
      ) : null}

      {cardType === TYPE[3] && spellType === PLAY_TYPE['GLOBAL'] ? (
        <SpellSlot
          index={0}
          gameWidth={1920}
          onClick={() => castGlobalSpell()}
        />
      ) : null}

      {cardType === TYPE[4] ? (
        <WeaponSlot
          index={0}
          gameWidth={1920}
          onClick={() => equipPlayerWeapon()}
        />
      ) : null}
      {/* <TheirBoard
        G={G}
        ctx={ctx}
        moves={moves}
        events={events}
        playerID={playerID}
        isActive={isActive}
        theirID={theirID}
        yourID={yourID}
      /> */}

      {/* <YourBoard
        G={G}
        ctx={ctx}
        moves={moves}
        events={events}
        playerID={playerID}
        isActive={isActive}
        yourID={yourID}
      /> */}
      <TheirAvatar
        G={G}
        ctx={ctx}
        moves={moves}
        isActive={isActive}
        board={PLAYER_BOARDS[2]}
        theirID={theirID}
        yourID={yourID}
        playerClass={playerClass[theirID]}
      />
      <TheirBoardPlayerArea
        G={G}
        ctx={ctx}
        moves={moves}
        isActive={isActive}
        board={PLAYER_BOARDS[2]}
        theirID={theirID}
        yourID={yourID}
      />
      <YourBoardPlayArea
        G={G}
        ctx={ctx}
        moves={moves}
        isActive={isActive}
        board={PLAYER_BOARDS[1]}
        theirID={theirID}
        yourID={yourID}
      />
      <YourAvatar
        G={G}
        ctx={ctx}
        moves={moves}
        isActive={isActive}
        board={PLAYER_BOARDS[1]}
        yourID={yourID}
        playerClass={playerClass[yourID]}
        playerIsAttacking={playerIsAttacking[yourID]}
      />
      {/* {warcryObject[yourID] ? (
        <WarcryObject data={warcryObject[yourID]} />
      ) : null} */}
      {/* {spellObject[yourID] ? <SpellObject data={spellObject[yourID]} /> : null} */}
      {/* <Deck
        board={PLAYER_BOARDS[1]}
        cardBackSrc={cardBack[yourID]}
        length={counts[yourID].deck}
      /> */}
    </div>
  );
}

Board.propTypes = {
  G: PropTypes.object,
  ctx: PropTypes.object,
  moves: PropTypes.object,
  events: PropTypes.object,
  reset: PropTypes.func,
  undo: PropTypes.func,
  redo: PropTypes.func,
  step: PropTypes.func,
  log: PropTypes.array,
  gameID: PropTypes.string,
  playerID: PropTypes.string,
  gameMetadata: PropTypes.object,
  isActive: PropTypes.bool,
  isMultiplayer: PropTypes.bool,
  isConnected: PropTypes.bool,
  credentials: PropTypes.string,
  yourID: PropTypes.string,
  theirID: PropTypes.string,
  gameWidth: PropTypes.number
};
