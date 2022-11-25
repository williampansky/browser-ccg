import type {
  ActionPoints as ActionPointsState,
  Player as PlayerState,
} from '../../../types';
import { ActionPoints } from '../ActionPoints';
import { Avatar } from '../Avatar';
import { EndTurnButton } from '../EndTurnButton';
import { PlayerBar } from '../PlayerBar';
import { gameConfig } from '../../../app.config';
import styles from './player.module.scss';

interface Player {
  actionPoints: ActionPointsState;
  counts: any;
  currentTurn: number;
  endTurnIsDisabled: boolean;
  onEndTurnButtonClick: () => void;
  player: PlayerState;
  turnsPerGame: number;
}

export const Player = ({
  actionPoints,
  counts,
  currentTurn,
  endTurnIsDisabled,
  onEndTurnButtonClick,
  player,
  turnsPerGame,
}: Player) => {
  return (
    <div
      className={[styles['component']].join(' ')}
      data-component='Player'
      data-playerid={player?.playerId}
    >
      <PlayerBar>
        {/* <ActionPoints actionPoints={actionPoints} /> */}
        <div
          style={{
            display: 'flex',
            flexFlow: 'row nowrap',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            color: 'white',
            whiteSpace: 'nowrap',
            width: '100%',
          }}
        >
          <div>
            Hand: <strong>{counts.hand}</strong>/{''}
            <strong>{gameConfig.numerics.cardsPerHand}</strong>
          </div>
          <div>&nbsp;|&nbsp;</div>
          <div>
            Deck: <strong>{counts.deck}</strong>/{''}
            <strong>{gameConfig.numerics.cardsPerDeck}</strong>
          </div>
          <div>&nbsp;|&nbsp;</div>
          <div>
            AP: <strong>{actionPoints.current}</strong>/{''}
            <strong>{actionPoints.total}</strong>
          </div>
        </div>
        <EndTurnButton
          currentTurn={currentTurn}
          isDisabled={endTurnIsDisabled}
          onClick={onEndTurnButtonClick}
          turnsPerGame={turnsPerGame}
        />
      </PlayerBar>
      <Avatar />
    </div>
  );
};
