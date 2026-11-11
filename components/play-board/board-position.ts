/**
 * Which gap a click lands in: the number of minions whose horizontal centre is left of the click.
 * 0 is the far left, `centres.length` the far right. `centres` must be in board order (left to right).
 */
export const gapIndex = (centres: number[], clickX: number): number => centres.filter((c) => c < clickX).length;
