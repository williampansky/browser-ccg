/** Anything that can sit in a class list: a class name, or a falsy value from `condition && styles.x` that is left out. */
export type ClassPart = string | false | null | undefined;

/**
 * Joins class names with single spaces and leaves out the falsy ones, so a condition can sit inline.
 *
 * ```js
 * cx(styles.gameOver, loss && styles.gameOverLoss, undefined)
 * // 'gameOver gameOverLoss' when `loss`, else 'gameOver'
 * ```
 */
export default function cx(...parts: ClassPart[]): string {
  return parts.filter(Boolean).join(' ');
}
