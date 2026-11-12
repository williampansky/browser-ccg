import { Action, applyAction, CardCatalog, GameEvent, GameState, legalActions, PlayerId, Rng } from '../../engine';

export interface NukeHeroResult {
  state: GameState;
  /** The actions that were applied, in order (events per action, for the log). */
  steps: { action: Action; events: GameEvent[]; before: GameState }[];
}

/**
 * "Nuke the enemy player": every ready minion, then the hero's weapon, hits the enemy hero. A minion keeps swinging
 * while it can (Onslaught attacks twice). Stops early if the game ends. Does not end the turn.
 */
export const nukeHero = (state: GameState, me: PlayerId, rng: Rng, catalog: CardCatalog): NukeHeroResult => {
  const foe: PlayerId = me === '0' ? '1' : '0';
  let cur = state;
  const steps: NukeHeroResult['steps'] = [];
  const run = (action: Action) => {
    const r = applyAction(cur, action, { rng, catalog });
    if ('error' in r) return false;
    steps.push({ action, events: r.events, before: cur });
    cur = r.state;
    return true;
  };
  const hitsHero = (t: { kind: string; player?: PlayerId }) => t.kind === 'hero' && t.player === foe;

  for (const m of state.players[me].board) {
    for (let swings = 0; swings < 4 && cur.status === 'playing'; swings++) {
      const hit = legalActions(cur, me, catalog).find(
        (a) => a.type === 'Attack' && a.attackerId === m.instanceId && hitsHero(a.target)
      );
      if (!hit || !run(hit)) break;
    }
  }
  if (cur.status === 'playing') {
    const swing = legalActions(cur, me, catalog).find((a) => a.type === 'WeaponAttack' && hitsHero(a.target));
    if (swing) run(swing);
  }
  return { state: cur, steps };
};
