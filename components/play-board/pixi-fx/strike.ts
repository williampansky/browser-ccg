import {
  BLEND_MODES,
  Graphics,
  LINE_CAP,
  LINE_JOIN,
  Sprite,
  Texture,
} from 'pixi.js';

import { spriteById, spriteUrl } from '../spell-fx-sprites';
import { colourNumber } from '../spell-fx-tune';
import type { SpellFxTune } from '../spell-fx-tune';

import { spinRadians, SPRITE_REACH } from './shared';
import type { FxContext, FxPoint, PixiFx } from './types';

const STRIKE_CORE = 0xffffff;

/** How hard a falling picture speeds up (1 = steady). */
const STRIKE_FALL_POWER = 2.2;

const STRIKE_OVERSHOOT = 30;

const BRANCH_SEGMENTS = 5;

const BRANCH_WIDTH = 0.45;

/** The glow layers of a bolt, widest and faintest first. */
const BOLT_LAYERS: { alpha: number; isCore: boolean; width: number }[] = [
  { alpha: 0.18, isCore: false, width: 26 },
  { alpha: 0.45, isCore: false, width: 11 },
  { alpha: 1, isCore: true, width: 4 },
];

/**
 * A jagged line from `from` to `to`. The sideways kick shrinks toward the end
 * so the bolt lands exactly on its target.
 */
const jaggedPath = (
  from: FxPoint,
  to: FxPoint,
  segments: number,
  jitter: number,
): FxPoint[] => {
  const points: FxPoint[] = [from];
  for (let step = 1; step < segments; step++) {
    const along = step / segments;
    const kick = (Math.random() - 0.5) * 2 * jitter * (1 - along * along);
    points.push({
      x: from.x + (to.x - from.x) * along + kick,
      y: from.y + (to.y - from.y) * along,
    });
  }
  points.push(to);
  return points;
};

/** A few short forks that leave the main bolt and wander downward. */
const makeBranches = (path: FxPoint[], tune: SpellFxTune): FxPoint[][] => {
  const { strikeBranches, strikeBranchReach, strikeJitter } = tune;
  if (!tune.strikeHasForks) return [];
  const branches: FxPoint[][] = [];
  for (let index = 0; index < Math.round(strikeBranches); index++) {
    const fork = path[2 + Math.floor(Math.random() * (path.length - 5))];
    const side = Math.random() < 0.5 ? -1 : 1;
    const end = {
      x: fork.x + side * (strikeBranchReach * (0.4 + Math.random() * 0.6)),
      y: fork.y + strikeBranchReach * (0.3 + Math.random() * 0.6),
    };
    branches.push(jaggedPath(fork, end, BRANCH_SEGMENTS, strikeJitter / 2));
  }
  return branches;
};

/** Strokes a path in glow layers, widest and faintest first. */
const drawBolt = (
  graphics: Graphics,
  path: FxPoint[],
  widthScale: number,
  alpha: number,
  tune: SpellFxTune,
): void => {
  const { strikeColour, strikeWidth } = tune;
  for (const layer of BOLT_LAYERS) {
    graphics.lineStyle({
      alpha: layer.alpha * alpha,
      cap: LINE_CAP.ROUND,
      color: layer.isCore ? STRIKE_CORE : colourNumber(strikeColour),
      join: LINE_JOIN.ROUND,
      width: layer.width * widthScale * strikeWidth,
    });
    graphics.moveTo(path[0].x, path[0].y);
    for (const point of path.slice(1)) graphics.lineTo(point.x, point.y);
  }
};

/** The steepest lean a strike may have from vertical (degrees). */
const STRIKE_MAX_ANGLE = 75;

/**
 * Where a strike starts: above the top of the screen, leaned off vertical by
 * the tune's angle so that it still ends on `to` (plus the random sway).
 */
const strikeOrigin = (to: FxPoint, tune: SpellFxTune): FxPoint => {
  const lean = Math.max(
    -STRIKE_MAX_ANGLE,
    Math.min(STRIKE_MAX_ANGLE, tune.strikeAngle),
  );
  const run = to.y + STRIKE_OVERSHOOT;
  return {
    x:
      to.x -
      Math.tan((lean * Math.PI) / 180) * run +
      (Math.random() - 0.5) * tune.strikeSway,
    y: -STRIKE_OVERSHOOT,
  };
};

/** Builds the `strike` effect on top of the shared overlay. */
export const createStrike = (context: FxContext): PixiFx['strike'] => {
  const { addToStage, app, burstWith, flashScreen, jobs, texture, wake } =
    context;

  /**
   * A picture falls from above point-first onto `to`, sticks in, then fades:
   * the strike with an axe, a spear or a shard in place of the bolt.
   */
  const strikePicture = (to: FxPoint, ms: number, tune: SpellFxTune): void => {
    const art = spriteById(tune.sprite);
    const size = tune.spriteSize;
    const tipRadians = ((art.tip + tune.spriteTurn) * Math.PI) / 180;
    const picture = new Sprite(Texture.from(spriteUrl(art.id)));
    picture.anchor.set(0.5);
    addToStage(picture);
    const scatterAngle = Math.random() * Math.PI * 2;
    const scatterRadius = tune.spriteScatter * Math.sqrt(Math.random());
    const hit = {
      x: to.x + Math.cos(scatterAngle) * scatterRadius,
      y: to.y + Math.sin(scatterAngle) * scatterRadius,
    };
    // The point leads along the way it falls (leaned by the angle); the centre
    // ends a blade's length back from the spot.
    const origin = strikeOrigin(hit, tune);
    const fallX = hit.x - origin.x;
    const fallY = hit.y - origin.y;
    const fallLength = Math.hypot(fallX, fallY) || 1;
    const heading = Math.atan2(fallY, fallX);
    const back = size * SPRITE_REACH - tune.spriteDepth;
    const endX = hit.x - (fallX / fallLength) * back;
    const endY = hit.y - (fallY / fallLength) * back;
    const startX = origin.x - (fallX / fallLength) * size;
    const startY = origin.y - (fallY / fallLength) * size;
    const duration = Math.max(1, ms);
    let elapsed = 0;
    let arrivedAt: number | null = null;
    jobs.add((deltaMs) => {
      elapsed += deltaMs;
      const linear = Math.min(1, elapsed / duration);
      const fall = Math.pow(linear, STRIKE_FALL_POWER);
      if (arrivedAt === null) {
        picture.position.set(
          startX + (endX - startX) * fall,
          startY + (endY - startY) * fall,
        );
        picture.rotation =
          heading - tipRadians + spinRadians(tune.spriteSpin, elapsed);
        picture.width = size;
        picture.height = size;
      }
      if (linear >= 1 && arrivedAt === null) {
        arrivedAt = elapsed;
        burstWith(hit, 'hit', tune, colourNumber(tune.strikeColour));
        if (tune.strikeHasFlash) flashScreen(tune.strikeScreenFlash);
      }
      if (arrivedAt === null) return true;
      const held = elapsed - arrivedAt;
      const fade = Math.max(1, tune.spriteFade);
      picture.alpha =
        held <= tune.spriteStick
          ? 1
          : Math.max(0, 1 - (held - tune.spriteStick) / fade);
      if (held < tune.spriteStick + tune.spriteFade) return true;
      picture.destroy();
      return false;
    });
    wake();
  };

  const strike = (to: FxPoint, ms: number, tune: SpellFxTune): void => {
    if (tune.strikeHasSprite) {
      strikePicture(to, ms, tune);
      return;
    }
    const colour = colourNumber(tune.strikeColour);
    const isBeam = tune.strikeStyle === 'beam';
    // A jagged bolt, or (for a beam) a straight line that grows to the target.
    const newPath = (origin: FxPoint): FxPoint[] =>
      isBeam
        ? [origin, to]
        : jaggedPath(
            origin,
            to,
            Math.round(tune.strikeSegments),
            tune.strikeJitter,
          );
    const bolt = new Graphics();
    bolt.blendMode = BLEND_MODES.ADD;
    app.stage.addChild(bolt as never);
    const glow = new Sprite(texture);
    glow.anchor.set(0.5);
    glow.tint = colour;
    glow.blendMode = BLEND_MODES.ADD;
    glow.position.set(to.x, to.y);
    addToStage(glow);
    const origin = strikeOrigin(to, tune);
    let path = newPath(origin);
    let branches = isBeam ? [] : makeBranches(path, tune);
    let elapsed = 0;
    let isStruck = false;
    let reroll = 0;
    jobs.add((deltaMs) => {
      elapsed += deltaMs;
      // Before the strike a glow gathers where it will land.
      if (elapsed < ms) {
        glow.scale.set(tune.strikeGlowScale * (elapsed / ms));
        glow.alpha = elapsed / ms;
        return true;
      }
      const since = elapsed - ms;
      // A beam takes a moment to reach the target; its hit lands then.
      const reach =
        isBeam && tune.strikeBeamGrow > 0
          ? Math.min(1, since / tune.strikeBeamGrow)
          : 1;
      if (!isStruck && reach >= 1) {
        isStruck = true;
        burstWith(to, 'hit', tune, colour);
        if (tune.strikeHasFlash) flashScreen(tune.strikeScreenFlash);
      }
      const life =
        1 - since / (tune.strikeLife + (isBeam ? tune.strikeBeamGrow : 0));
      if (life <= 0) {
        bolt.destroy();
        glow.destroy();
        return false;
      }
      if (isBeam) {
        path = [
          origin,
          {
            x: origin.x + (to.x - origin.x) * reach,
            y: origin.y + (to.y - origin.y) * reach,
          },
        ];
      } else if (since > reroll) {
        // The bolt re-forms a few times, like a real flicker.
        reroll += tune.strikeReroll;
        path = newPath(origin);
        branches = makeBranches(path, tune);
      }
      const flicker = !isBeam && Math.random() < tune.strikeDropout ? 0.35 : 1;
      const alpha = Math.min(1, life * 1.5) * flicker;
      glow.scale.set(tune.strikeGlowScale * (1 + (1 - life)));
      glow.alpha = alpha;
      bolt.clear();
      drawBolt(bolt, path, 1, alpha, tune);
      for (const branch of branches)
        drawBolt(bolt, branch, BRANCH_WIDTH, alpha, tune);
      return true;
    });
    wake();
  };

  return strike;
};
