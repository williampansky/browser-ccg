import { findMinion } from '../rules/lookup';
import type { MinionInstance } from '../state/types';
import type { TargetFilter } from './types';

const ownerOf: (...a: Parameters<TargetFilter>) => string | undefined = (c) =>
  c.candidate.kind === 'hero' ? c.candidate.player : findMinion(c.state, c.candidate.instanceId)?.owner;

/** Any hero or minion, on either side. */
export const anyCharacter = (): TargetFilter => () => true;
export const enemyCharacter = (): TargetFilter => (c) => ownerOf(c) !== c.caster;
export const anyMinion = (): TargetFilter => (c) => c.candidate.kind === 'minion';
export const enemyMinion = (): TargetFilter => (c) => c.candidate.kind === 'minion' && ownerOf(c) !== c.caster;
export const friendlyMinion = (): TargetFilter => (c) => c.candidate.kind === 'minion' && ownerOf(c) === c.caster;
export const friendlyCharacter = (): TargetFilter => (c) => ownerOf(c) === c.caster;

/**
 * A minion on the given side that passes `test`. `race` is the minion's card race (needs the catalog,
 * which `legalTargets` supplies). Heroes never pass.
 */
export const minionWhere =
  (side: 'enemy' | 'friendly' | 'any', test: (m: MinionInstance, race?: string) => boolean): TargetFilter =>
  (c) => {
    if (c.candidate.kind !== 'minion') return false;
    const found = findMinion(c.state, c.candidate.instanceId);
    if (!found) return false;
    if (side === 'enemy' && found.owner === c.caster) return false;
    if (side === 'friendly' && found.owner !== c.caster) return false;
    return test(found.minion, c.catalog?.get(found.minion.cardId)?.race);
  };
