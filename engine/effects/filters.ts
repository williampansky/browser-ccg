import { findMinion } from '../rules/lookup';
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
