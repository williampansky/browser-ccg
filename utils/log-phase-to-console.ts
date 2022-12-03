import chalk from 'chalk';
import { gameConfig } from '../app.config';

const log = console.log;
const key = chalk.gray;
const value = chalk.bold.green;

const logPhaseToConsole = (
  turn: number = 0,
  phase: string = '',
  player?: string,
  custom?: { key: string; value: string }
) => {
  if (gameConfig.debugConfig.logPhaseToConsole) {
    if (custom) {
      if (player) {
        log(`
    TURN: ${value(turn)}
  PLAYER: ${value(player)}
  PHASE: ${value(phase)}
  ${custom.key}: ${value(custom.value)}
        `);
      } else {
        log(`
    TURN: ${value(turn)}
  PHASE: ${value(phase)}
  ${custom.key}: ${value(custom.value)}
        `);
      }
    } else {
      if (player) {
        log(`
    TURN: ${value(turn)}
  PLAYER: ${value(player)}
  PHASE: ${value(phase)}
        `);
      } else {
        log(`
    TURN: ${value(turn)}
  PHASE: ${value(phase)}
        `);
      }
    }
  }
};

export default logPhaseToConsole;
