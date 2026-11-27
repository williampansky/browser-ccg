import { SupportLink } from '../../site-components/SupportLink';
import { Button, Group, Panel, SegmentedControl, Toggle } from '../../ui';
import { UiThemePicker } from '../../ui-theme/UiThemePicker';
import { VersionLabel } from '../../site-components/VersionLabel';
import type { PlayerProfile } from '../../player-profile/profile';
import { saveLogCardTrigger, useLogCardTrigger } from '../log-card-trigger';
import type { OnlineGame } from '../online/types';
import type { Mode } from '../types';
import {
  effectiveSidebarMode,
  saveSidebarMode,
  useSidebarMode,
} from '../sidebar-mode';
import boardStyles from '../play-board.module.scss';
import styles from './play-menu.module.scss';

interface Props {
  isA11yOn: boolean;
  isDamageDelayed: boolean;
  isOver: boolean;
  isSmartAi: boolean;
  isSoundOn: boolean;
  isTimerOn: boolean;
  mode: Mode;
  /** Set for an online game: the menu shows Lobby instead of New game. */
  online?: OnlineGame;
  onA11yChange: (isOn: boolean) => void;
  onClose: () => void;
  onConcede: () => void;
  onDamageDelayChange: (isOn: boolean) => void;
  /** Links out of the game; PlayBoard confirms first while a game runs. */
  onLeaveClick: (event: { preventDefault: () => void }) => void;
  onModeChange: (mode: Mode) => void;
  onNewGame: () => void;
  onSmartAiChange: (isSmart: boolean) => void;
  onSoundChange: (isOn: boolean) => void;
  onTimerChange: (isOn: boolean) => void;
  profile: PlayerProfile;
  sideColor: string;
  turnLimit: number;
}

/**
 * The /play menu dialog: resume, new game, concede, settings, links out.
 */
export const PlayMenu = ({
  isA11yOn,
  isDamageDelayed,
  isOver,
  isSmartAi,
  isSoundOn,
  isTimerOn,
  mode,
  online,
  onA11yChange,
  onClose,
  onConcede,
  onDamageDelayChange,
  onLeaveClick,
  onModeChange,
  onNewGame,
  onSmartAiChange,
  onSoundChange,
  onTimerChange,
  profile,
  sideColor,
  turnLimit,
}: Props) => {
  const sidebarChoice = useSidebarMode();
  const logCardTrigger = useLogCardTrigger();

  return (
    <div className={boardStyles.modalBackdrop} data-ui-sfx onClick={onClose}>
      <Panel
        aria-label="Menu"
        className={styles.menu}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className={styles.menuHead}>
          <div className={styles.menuTitleRow}>
            <div>
              <h3>Menu</h3>
            </div>
            <div>
              <VersionLabel />
            </div>
          </div>

          <span className={styles.menuWho}>
            Playing as <b style={{ color: sideColor }}>{profile.name}</b> ·{' '}
            <a href="/profile" onClick={onLeaveClick}>
              Profile
            </a>
          </span>
        </header>

        <Button
          autoFocus
          className={styles.menuPrimary}
          onClick={onClose}
          variant="primary"
        >
          Resume
        </Button>

        <div className={styles.menuPair}>
          {online ? (
            <Button onClick={online.leave}>
              Lobby
              <small>{isOver ? 'find another game' : 'leaves the game'}</small>
            </Button>
          ) : (
            <Button onClick={onNewGame}>
              New game
              <small>choose decks</small>
            </Button>
          )}

          <Button disabled={isOver} onClick={onConcede} variant="danger">
            Concede
            <small>{isOver ? 'game is over' : 'give up this game'}</small>
          </Button>
        </div>

        <Group aria-label="Settings" className={styles.menuGroup}>
          <h4>Settings</h4>
          <Toggle checked={isSoundOn} label="Sound" onChange={onSoundChange} />
          <Toggle
            checked={isDamageDelayed}
            label="Damage waits for effects"
            onChange={onDamageDelayChange}
          />
          <Toggle
            checked={isTimerOn}
            label={`Turn timer (${turnLimit}s)`}
            onChange={onTimerChange}
          />
          <Toggle
            checked={isA11yOn}
            label="Accessibility mode"
            onChange={onA11yChange}
          />
          <SegmentedControl
            label="Log and deck"
            onChange={saveSidebarMode}
            options={[
              {
                label: 'Separate',
                title: 'two panels',
                value: 'separate' as const,
              },
              {
                label: 'Connected',
                title: 'one sidebar with a bar to drag between them',
                value: 'connected' as const,
              },
            ]}
            value={effectiveSidebarMode(sidebarChoice)}
          />
          <SegmentedControl
            label="Card view from the log"
            onChange={saveLogCardTrigger}
            options={[
              {
                label: 'Right-click',
                title: 'right-click a card name in the log',
                value: 'rightClick' as const,
              },
              {
                label: 'Click',
                title: 'a single click on a card name in the log',
                value: 'click' as const,
              },
            ]}
            value={logCardTrigger}
          />

          {!online && (
            <>
              <SegmentedControl
                label="Opponent"
                onChange={onSmartAiChange}
                options={[
                  {
                    disabled: mode !== 'ai',
                    label: 'Greedy',
                    title: 'looks one move ahead',
                    value: true,
                  },
                  {
                    disabled: mode !== 'ai',
                    label: 'Random',
                    title: 'plays any legal move',
                    value: false,
                  },
                ]}
                value={isSmartAi}
              />
              <SegmentedControl
                label="Mode"
                onChange={onModeChange}
                options={[
                  {
                    label: 'vs AI',
                    title: 'Switching starts a new game',
                    value: 'ai' as const,
                  },
                  {
                    label: 'Hot-seat',
                    title: 'Switching starts a new game',
                    value: 'hotseat' as const,
                  },
                ]}
                value={mode}
              />
            </>
          )}

          <UiThemePicker blurb={false} />
        </Group>

        <footer className={styles.menuLinks}>
          <a href="/" onClick={onLeaveClick}>
            Home
          </a>
          {!online && (
            <a href="/play" onClick={onLeaveClick}>
              Play online
            </a>
          )}
          <SupportLink />
          <a href="/deckbuilder" onClick={onLeaveClick}>
            Deck builder
          </a>
          <a href="/collection" onClick={onLeaveClick}>
            Cards
          </a>
        </footer>
      </Panel>
    </div>
  );
};
