import { BLEND_MODES, BlurFilter, Graphics, LINE_CAP } from 'pixi.js';

import { colourNumber } from '../spell-fx-tune';
import type { SpellFxTune } from '../spell-fx-tune';

import type { FxContext, FxPoint, FxRect, PixiFx } from './types';

const AREA_MIN_DROP_SPEED = 0.05;
const AREA_RAIN_SWAY = 0.04;
const AREA_MIN_RING_MS = 200;
const AREA_SHOCK_REACH = 1.15;
const AREA_SHOCK_THIN = 0.6;
const AREA_SHOCK_FILL = 0.14;
const AREA_SEGMENTS = 44;
const AREA_FADE_IN = 0.2;
const AREA_FADE_OUT = 0.3;

/** How much of an arm, from its rim end, fades in. */
const AREA_RIM_FADE = 0.14;
const AREA_GROW_FROM = 0.55;
const AREA_GROW_BY = 0.35;
const AREA_GLOW_WIDTH = 2.4;
const AREA_GLOW_ALPHA = 0.3;
const AREA_EMBER_LIFE_MS = 520;
const AREA_EMBER_SCALE = 0.32;
const AREA_EMBER_DRIFT = 0.05;
const AREA_WAVE_EDGE = 14;
const AREA_WAVE_RIPPLE = 0.045;
const AREA_WAVE_SPEED = 0.012;
const AREA_MIN_SIDE = 220;

/** A colour part way from `a` to `b` (0 = a, 1 = b). */
const mixColour = (a: number, b: number, t: number): number => {
  const channel = (shift: number): number => {
    const from = (a >> shift) & 0xff;
    const to = (b >> shift) & 0xff;
    return Math.round(from + (to - from) * t);
  };
  return (channel(16) << 16) | (channel(8) << 8) | channel(0);
};

/**
 * The effect's strength over its life: it fades in, holds, then fades out
 * (`age` runs 0 to 1).
 */
const areaEnvelope = (age: number): number =>
  Math.max(0, Math.min(1, age / AREA_FADE_IN, (1 - age) / AREA_FADE_OUT));

/** A point on a swirl arm: `t` 0 at the rim, 1 at the eye. */
const swirlPoint = (
  rect: FxRect,
  arm: number,
  t: number,
  grow: number,
  spin: number,
  tune: SpellFxTune,
): FxPoint => {
  const angle =
    (arm / Math.max(1, Math.round(tune.areaArms))) * Math.PI * 2 +
    spin +
    t * tune.areaTurns * Math.PI * 2;
  const reach = (1 - t) * grow;
  return {
    x: rect.x + rect.width / 2 + Math.cos(angle) * (rect.width / 2) * reach,
    y: rect.y + rect.height / 2 + Math.sin(angle) * (rect.height / 2) * reach,
  };
};

/** Draws one frame of the swirl: arms of fire spiralling in to the eye. */
const drawSwirl = (
  graphics: Graphics,
  rect: FxRect,
  age: number,
  elapsedMs: number,
  tune: SpellFxTune,
): void => {
  const body = colourNumber(tune.areaColour);
  const edge = colourNumber(tune.areaAccentColour);
  const envelope = areaEnvelope(age);
  const grow =
    AREA_GROW_FROM +
    AREA_GROW_BY * (1 - Math.pow(1 - Math.min(1, age / AREA_GROW_BY), 3));
  const spin = (elapsedMs / 1000) * tune.areaSpin * Math.PI * 2;
  graphics.clear();
  const arms = Math.max(1, Math.round(tune.areaArms));
  for (let arm = 0; arm < arms; arm++) {
    for (let segment = 0; segment < AREA_SEGMENTS; segment++) {
      const from = segment / AREA_SEGMENTS;
      const start = swirlPoint(rect, arm, from, grow, spin, tune);
      const finish = swirlPoint(
        rect,
        arm,
        (segment + 1) / AREA_SEGMENTS,
        grow,
        spin,
        tune,
      );
      const width = tune.areaWidth * (0.3 + 0.7 * (1 - from));
      const colour = mixColour(edge, body, from);
      // Each arm fades in from its rim end, so it has no hard cut-off.
      const soften = Math.min(1, from / AREA_RIM_FADE);
      const alpha = envelope * soften * (0.25 + 0.75 * (1 - from));
      for (const layer of [
        { alpha: alpha * AREA_GLOW_ALPHA, width: width * AREA_GLOW_WIDTH },
        { alpha, width },
      ]) {
        graphics.lineStyle({
          alpha: layer.alpha,
          cap: LINE_CAP.BUTT,
          color: colour,
          width: layer.width,
        });
        graphics.moveTo(start.x, start.y);
        graphics.lineTo(finish.x, finish.y);
      }
    }
  }
};

/** Draws one frame of the sweep: a wavy band of fire crossing the region. */
const drawSweep = (
  graphics: Graphics,
  rect: FxRect,
  age: number,
  elapsedMs: number,
  tune: SpellFxTune,
): void => {
  const body = colourNumber(tune.areaColour);
  const edge = colourNumber(tune.areaAccentColour);
  const envelope = areaEnvelope(age);
  graphics.clear();
  const fronts: number[] =
    tune.areaDirection === 'out'
      ? [
          rect.x + rect.width / 2 + (age * rect.width) / 2,
          rect.x + rect.width / 2 - (age * rect.width) / 2,
        ]
      : [
          tune.areaDirection === 'left'
            ? rect.x + rect.width * (1 - age)
            : rect.x + rect.width * age,
        ];
  for (const front of fronts) {
    for (const layer of [
      { alpha: 0.2, colour: body, width: tune.areaWaveWidth * 2.2 },
      {
        alpha: 0.45,
        colour: mixColour(body, edge, 0.5),
        width: tune.areaWaveWidth * 1.2,
      },
      { alpha: 0.85, colour: edge, width: tune.areaWaveWidth * 0.45 },
    ]) {
      const rows = 24;
      const left: FxPoint[] = [];
      const right: FxPoint[] = [];
      for (let row = 0; row <= rows; row++) {
        const y = rect.y + (rect.height * row) / rows;
        const ripple =
          Math.sin(y * AREA_WAVE_RIPPLE + elapsedMs * AREA_WAVE_SPEED) *
          AREA_WAVE_EDGE;
        left.push({ x: front - layer.width / 2 + ripple, y });
        right.push({ x: front + layer.width / 2 - ripple, y });
      }
      graphics.beginFill(layer.colour, layer.alpha * envelope);
      graphics.moveTo(left[0].x, left[0].y);
      for (const point of left.slice(1)) graphics.lineTo(point.x, point.y);
      for (const point of right.slice().reverse())
        graphics.lineTo(point.x, point.y);
      graphics.closePath();
      graphics.endFill();
    }
  }
};

/** Draws one frame of the shockwave: rings spreading from the region's middle. */
const drawShockwave = (
  graphics: Graphics,
  rect: FxRect,
  elapsedMs: number,
  tune: SpellFxTune,
): void => {
  const body = colourNumber(tune.areaColour);
  const edge = colourNumber(tune.areaAccentColour);
  const rings = Math.max(1, Math.round(tune.areaRings));
  const ringLife = Math.max(
    AREA_MIN_RING_MS,
    tune.areaMs - (rings - 1) * tune.areaRingGap,
  );
  graphics.clear();
  for (let ring = 0; ring < rings; ring++) {
    const age = (elapsedMs - ring * tune.areaRingGap) / ringLife;
    if (age <= 0 || age >= 1) continue;
    const open = 1 - Math.pow(1 - age, 3);
    const reach = open * AREA_SHOCK_REACH;
    const alpha = Math.pow(1 - age, 1.2);
    const colour = mixColour(edge, body, age);
    graphics.lineStyle({
      alpha,
      color: colour,
      width: Math.max(1, tune.areaWidth * (1 - age * AREA_SHOCK_THIN)),
    });
    graphics.beginFill(colour, AREA_SHOCK_FILL * alpha);
    graphics.drawEllipse(
      rect.x + rect.width / 2,
      rect.y + rect.height / 2,
      (rect.width / 2) * reach,
      (rect.height / 2) * reach,
    );
    graphics.endFill();
  }
};

/** Builds the `area` effect on top of the shared overlay. */
export const createArea = (context: FxContext): PixiFx['area'] => {
  const { app, flashScreen, jobs, spawn, wake } = context;

  const area = (rect: FxRect, tune: SpellFxTune): void => {
    const graphics = new Graphics();
    graphics.blendMode = BLEND_MODES.ADD;
    app.stage.addChild(graphics as never);
    const softener = tune.areaBlur > 0 ? new BlurFilter(tune.areaBlur) : null;
    if (softener) graphics.filters = [softener];
    const body = colourNumber(tune.areaColour);
    const edge = colourNumber(tune.areaAccentColour);
    if (tune.areaHasFlash) flashScreen(tune.areaFlash, edge);
    let elapsed = 0;
    let owed = 0;
    jobs.add((deltaMs) => {
      elapsed += deltaMs;
      const age = Math.min(1, elapsed / tune.areaMs);
      if (tune.areaStyle === 'sweep')
        drawSweep(graphics, rect, age, elapsed, tune);
      else if (tune.areaStyle === 'shockwave')
        drawShockwave(graphics, rect, elapsed, tune);
      else if (tune.areaStyle === 'rain') graphics.clear();
      else drawSwirl(graphics, rect, age, elapsed, tune);
      // Embers ride the effect: a few new ones each frame, on the arms or in
      // the band. Rain is made of falling (or rising) drops instead.
      const isRain = tune.areaStyle === 'rain';
      owed += ((isRain ? tune.areaDrops : tune.areaEmbers) * deltaMs) / 1000;
      const envelope = areaEnvelope(age);
      while (owed >= 1 && envelope > 0) {
        owed -= 1;
        if (isRain) {
          const speed = Math.max(AREA_MIN_DROP_SPEED, tune.areaDropSpeed);
          const isUp = tune.areaFall === 'up';
          spawn(
            {
              x: rect.x + Math.random() * rect.width,
              y: isUp ? rect.y + rect.height : rect.y,
            },
            Math.random() < 0.5 ? body : edge,
            tune.areaDropScale,
            rect.height / speed,
            (Math.random() - 0.5) * AREA_RAIN_SWAY,
            isUp ? -speed : speed,
          );
          continue;
        }
        const origin =
          tune.areaStyle === 'swirl'
            ? swirlPoint(
                rect,
                Math.floor(
                  Math.random() * Math.max(1, Math.round(tune.areaArms)),
                ),
                Math.random(),
                1,
                (elapsed / 1000) * tune.areaSpin * Math.PI * 2,
                tune,
              )
            : {
                x: rect.x + Math.random() * rect.width,
                y: rect.y + Math.random() * rect.height,
              };
        spawn(
          origin,
          edge,
          AREA_EMBER_SCALE,
          AREA_EMBER_LIFE_MS,
          (Math.random() - 0.5) * AREA_EMBER_DRIFT,
          (Math.random() - 0.5) * AREA_EMBER_DRIFT,
        );
      }
      if (age < 1) return true;
      graphics.destroy();
      softener?.destroy();
      return false;
    });
    wake();
  };

  return area;
};
