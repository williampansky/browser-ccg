/** What a result line in the log is about; picks its chip colour. */
export type LogTone =
  'damage' | 'heal' | 'armor' | 'death' | 'buff' | 'debuff' | 'note';

/**
 * One line of the log.
 *
 * - `turn`: a turn header ("Turn 3"), with `actor` the side whose turn it is.
 * - `action`: something a side did or a trigger that fired; starts a block.
 * - `effect`: a result of the action above it (damage, a heal, a death).
 * - `info`: game-level text (the opening lines, the winner).
 *
 * `text` is log markup: `**Player 1**` is a player and `__0|Name__` a card
 * name owned by side 0 (`__Name__` when nobody owns it).
 */
export interface LogLine {
  kind: 'turn' | 'action' | 'effect' | 'info';
  /** The side it belongs to: the block's stripe and the card colours */
  actor?: '0' | '1';
  /** A short symbol that says what kind of thing it is */
  icon?: string;
  tone?: LogTone;
  /** The number or change in a result chip ("-6", "+3") */
  amount?: string;
  text: string;
  /** Dimmed detail after the text ("1 left", "now 4/4") */
  note?: string;
}

/** A line's text with the markup stripped, for tests and plain output. */
export const plainLogText = (line: LogLine): string =>
  line.text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(?:\d\|)?(.+?)__/g, '$1');
