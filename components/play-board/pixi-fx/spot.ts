import {
  BLEND_MODES,
  BlurFilter,
  Graphics,
  LINE_CAP,
  LINE_JOIN,
  Sprite,
  Texture,
} from 'pixi.js';

import { spriteById, spriteUrl } from '../spell-fx-sprites';
import { colourNumber } from '../spell-fx-tune';
import type { SpellFxTune } from '../spell-fx-tune';

import { spinRadians } from './shared';
import type { FxContext, FxPoint, PixiFx } from './types';

/** A spot picture: its first size (fraction), and how long it pops and fades. */
const SPOT_PICTURE_FROM = 0.6;

const SPOT_PICTURE_POP = 0.25;

const SPOT_PICTURE_FADE_IN = 0.2;

const SPOT_PICTURE_FADE_OUT = 0.35;

const SPOT_START_RADIUS = 16;

const SPOT_RING_FADE = 0.7;

const SPOT_GLOW_ALPHA = 0.8;

const SPOT_RISE_STAGGER = 0.7;

const SPOT_RISE_SWAY = 0.03;

const SPOT_PULSE_SWELL = 0.4;

/** The corners of a regular polygon, one point up. */
const polygon = (at: FxPoint, radius: number, sides: number): FxPoint[] => {
  const corners = Math.max(3, Math.round(sides));
  const points: FxPoint[] = [];
  for (let corner = 0; corner < corners; corner++) {
    const angle = (corner / corners) * Math.PI * 2 - Math.PI / 2;
    points.push({
      x: at.x + Math.cos(angle) * radius,
      y: at.y + Math.sin(angle) * radius,
    });
  }
  return points;
};

interface SparkLaunch {
  delay: number;
  from: FxPoint;
  vx: number;
  vy: number;
}

/**
 * Where each spot spark starts, when, and how fast it moves: outward from the
 * spot, rising (scattered over a disc, staggered like drifting motes) or
 * inward from a circle.
 */
const makeSparks = (
  at: FxPoint,
  tune: SpellFxTune,
  count: number,
): SparkLaunch[] => {
  const { spotSparkMotion: motion, spotSparkSpeed: speed } = tune;
  const launches: SparkLaunch[] = [];
  for (let spark = 0; spark < count; spark++) {
    const angle = (spark / count) * Math.PI * 2;
    const scatter = tune.spotSparkSpread * Math.sqrt(Math.random());
    const around = Math.random() * Math.PI * 2;
    const disc = {
      x: at.x + Math.cos(around) * scatter,
      y: at.y + Math.sin(around) * scatter,
    };
    if (motion === 'rising') {
      launches.push({
        delay: Math.random() * tune.spotLife * SPOT_RISE_STAGGER,
        from: disc,
        vx: (Math.random() - 0.5) * SPOT_RISE_SWAY,
        vy: -speed,
      });
    } else if (motion === 'inward') {
      const reach = tune.spotSparkSpread || tune.spotRadius;
      const ring = {
        x: at.x + Math.cos(angle) * reach,
        y: at.y + Math.sin(angle) * reach,
      };
      launches.push({
        delay: 0,
        from: ring,
        vx: -Math.cos(angle) * speed,
        vy: -Math.sin(angle) * speed,
      });
    } else {
      launches.push({
        delay: 0,
        from: disc,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
      });
    }
  }
  return launches.sort((a, b) => a.delay - b.delay);
};

/** A ring's radius and opacity at `age` (0 to 1) for the tune's motion. */
const ringState = (
  age: number,
  tune: SpellFxTune,
): { alpha: number; radius: number } => {
  const open = 1 - Math.pow(1 - age, 3);
  const reach = tune.spotRadius - SPOT_START_RADIUS;
  if (tune.spotRingsMotion === 'in') {
    return {
      alpha: Math.sin(Math.PI * age),
      radius: tune.spotRadius - reach * open,
    };
  }
  if (tune.spotRingsMotion === 'pulse') {
    const swell =
      1 - SPOT_PULSE_SWELL + SPOT_PULSE_SWELL * Math.sin(Math.PI * age);
    return {
      alpha: Math.sin(Math.PI * age),
      radius: SPOT_START_RADIUS + reach * swell,
    };
  }
  return { alpha: 1 - age, radius: SPOT_START_RADIUS + reach * open };
};

/** Builds the `spot` effect on top of the shared overlay. */
export const createSpot = (context: FxContext): PixiFx['spot'] => {
  const { addToStage, app, jobs, spawn, texture, wake } = context;

  const spot = (at: FxPoint, tune: SpellFxTune): void => {
    const steel = colourNumber(tune.spotColour);
    const gold = colourNumber(tune.spotAccentColour);
    const rings = Math.max(1, Math.round(tune.spotRings));
    const ringsTotal = tune.spotLife + (rings - 1) * tune.spotRingGap;
    const glow = new Sprite(texture);
    glow.anchor.set(0.5);
    glow.tint = steel;
    glow.blendMode = BLEND_MODES.ADD;
    glow.position.set(at.x, at.y);
    addToStage(glow);
    // A picture pops up at the spot (a shield, a skull, a potion) and rises.
    const art = spriteById(tune.sprite);
    const picture = tune.spotHasSprite
      ? new Sprite(Texture.from(spriteUrl(art.id)))
      : null;
    if (picture) {
      picture.anchor.set(0.5);
      picture.alpha = 0;
      addToStage(picture);
    }
    // One layer per ring, so each can have its own blur (the first ring's plus
    // a step per later ring). No blur skips the filter's cost.
    const layers = Array.from({ length: rings }, (_, ring) => {
      const layer = new Graphics();
      layer.blendMode = BLEND_MODES.ADD;
      app.stage.addChild(layer as never);
      const blur = Math.max(
        0,
        tune.spotRingBlur + ring * tune.spotRingBlurStep,
      );
      const softener = blur > 0 ? new BlurFilter(blur) : null;
      if (softener) layer.filters = [softener];
      return { layer, softener };
    });
    const sparkCount = tune.spotHasSparks ? Math.round(tune.spotSparkCount) : 0;
    const sparks = makeSparks(at, tune, sparkCount);
    let sparkIndex = 0;
    const total = Math.max(
      ringsTotal,
      sparks.length ? sparks[sparks.length - 1].delay : 0,
    );
    let elapsed = 0;
    jobs.add((deltaMs) => {
      elapsed += deltaMs;
      // Sparks are launched when their turn comes (rising ones are staggered).
      while (
        sparkIndex < sparks.length &&
        sparks[sparkIndex].delay <= elapsed
      ) {
        const spark = sparks[sparkIndex++];
        spawn(
          spark.from,
          gold,
          tune.spotSparkScale,
          tune.spotSparkLife,
          spark.vx,
          spark.vy,
        );
      }
      if (elapsed >= total && sparkIndex >= sparks.length) {
        glow.destroy();
        picture?.destroy();
        for (const { layer, softener } of layers) {
          layer.destroy();
          softener?.destroy();
        }
        return false;
      }
      const first = Math.min(1, elapsed / tune.spotLife);
      const opening = 1 - Math.pow(1 - first, 3);
      glow.scale.set(tune.spotGlowScale * (0.4 + 0.6 * opening));
      glow.alpha = tune.spotHasGlow ? SPOT_GLOW_ALPHA * (1 - first) : 0;
      if (picture) {
        const life = Math.min(1, elapsed / tune.spotLife);
        const pop = 1 - Math.pow(1 - Math.min(1, life / SPOT_PICTURE_POP), 3);
        const fadeIn = Math.min(1, life / SPOT_PICTURE_FADE_IN);
        const fadeOut = Math.min(1, (1 - life) / SPOT_PICTURE_FADE_OUT);
        picture.alpha = Math.max(0, Math.min(fadeIn, fadeOut));
        const scale = SPOT_PICTURE_FROM + (1 - SPOT_PICTURE_FROM) * pop;
        picture.width = tune.spriteSize * scale;
        picture.height = tune.spriteSize * scale;
        picture.position.set(at.x, at.y - tune.spotSpriteRise * opening);
        picture.rotation =
          (tune.spriteTurn * Math.PI) / 180 +
          spinRadians(tune.spriteSpin, elapsed);
      }
      for (let ring = 0; ring < rings; ring++) {
        const drawing = layers[ring].layer;
        drawing.clear();
        const age = (elapsed - ring * tune.spotRingGap) / tune.spotLife;
        if (age <= 0 || age >= 1) continue;
        const { alpha, radius } = ringState(age, tune);
        const colour = ring === 0 ? steel : gold;
        const corners = polygon(at, radius, tune.spotSides);
        drawing.lineStyle({
          alpha,
          cap: LINE_CAP.ROUND,
          color: colour,
          join: LINE_JOIN.ROUND,
          width: tune.spotWidth * (1 - age * SPOT_RING_FADE),
        });
        drawing.beginFill(colour, tune.spotFillAlpha * alpha);
        drawing.moveTo(corners[0].x, corners[0].y);
        for (const corner of corners.slice(1))
          drawing.lineTo(corner.x, corner.y);
        drawing.closePath();
        drawing.endFill();
      }
      return true;
    });
    wake();
  };

  return spot;
};
