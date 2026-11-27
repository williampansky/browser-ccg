import { BLEND_MODES, Graphics, LINE_CAP, Sprite, Texture } from 'pixi.js';

import { spriteById, spriteUrl } from '../spell-fx-sprites';
import { colourNumber } from '../spell-fx-tune';
import type { SpellFxTune } from '../spell-fx-tune';

import { spinRadians, SPRITE_REACH } from './shared';
import type { FxContext, FxPoint, PixiFx } from './types';

const TRAVEL_PULSE_RATE = 0.035;

/** The least a picture must move in a frame before it turns to face it. */
const SPRITE_TURN_MIN = 0.5;

interface StreamerLane {
  phase: number;
  reach: number;
  side: number;
  speed: number;
}

const STREAMER_SEGMENTS = 28;

const STREAMER_WAVE_TURNS = 1.1;

const STREAMER_FLAIL_RATE = 0.006;

/**
 * Draws the head's streamers: wavy strands that run back from `head` against
 * its heading, fan out toward their tips and thin and fade as they go, each
 * flailing on its own phase.
 */
const drawStreamers = (
  graphics: Graphics,
  lanes: StreamerLane[],
  head: FxPoint,
  heading: number,
  elapsed: number,
  fadeOut: number,
  tune: SpellFxTune,
): void => {
  const colour = colourNumber(tune.travelStreamerColour);
  // They grow out of the head and fade in over the first moments, not pop in.
  const raw =
    tune.travelStreamerGrow > 0
      ? Math.min(1, elapsed / tune.travelStreamerGrow)
      : 1;
  const grown = 1 - Math.pow(1 - raw, 2);
  const backX = -Math.cos(heading);
  const backY = -Math.sin(heading);
  const sideX = -backY;
  const sideY = backX;
  graphics.clear();
  for (const lane of lanes) {
    const length = tune.travelStreamerLength * lane.reach * grown;
    const point = (along: number): FxPoint => {
      const sway =
        Math.sin(
          lane.phase +
            elapsed *
              STREAMER_FLAIL_RATE *
              tune.travelStreamerFlail *
              lane.speed -
            along * Math.PI * 2 * STREAMER_WAVE_TURNS,
        ) *
        tune.travelStreamerWave *
        along;
      const sideways = lane.side * tune.travelStreamerSpread * along + sway;
      return {
        x: head.x + backX * length * along + sideX * sideways,
        y: head.y + backY * length * along + sideY * sideways,
      };
    };
    for (let segment = 0; segment < STREAMER_SEGMENTS; segment++) {
      const from = segment / STREAMER_SEGMENTS;
      const start = point(from);
      const finish = point((segment + 1) / STREAMER_SEGMENTS);
      graphics.lineStyle({
        alpha: tune.travelStreamerAlpha * (1 - from) * fadeOut * grown,
        cap: LINE_CAP.BUTT,
        color: colour,
        width: Math.max(0.5, tune.travelStreamerWidth * (1 - from)),
      });
      graphics.moveTo(start.x, start.y);
      graphics.lineTo(finish.x, finish.y);
    }
  }
};

/** Builds the `travel` effect on top of the shared overlay. */
export const createTravel = (context: FxContext): PixiFx['travel'] => {
  const { addToStage, app, burstWith, jobs, spawn, texture, wake } = context;

  const travel = (
    from: FxPoint,
    to: FxPoint,
    ms: number,
    tune: SpellFxTune,
  ): void => {
    const isSprite = tune.travelHasSprite;
    const art = spriteById(tune.sprite);
    const size = tune.spriteSize;
    const tipRadians = ((art.tip + tune.spriteTurn) * Math.PI) / 180;
    // A picture lands a little off the target's centre, point first: the path
    // ends where its centre will be, a blade's length back from the spot.
    const scatterAngle = Math.random() * Math.PI * 2;
    const scatterRadius = tune.spriteScatter * Math.sqrt(Math.random());
    const hit = isSprite
      ? {
          x: to.x + Math.cos(scatterAngle) * scatterRadius,
          y: to.y + Math.sin(scatterAngle) * scatterRadius,
        }
      : to;
    const aimX = hit.x - from.x;
    const aimY = hit.y - from.y;
    const aimLength = Math.hypot(aimX, aimY) || 1;
    const back = isSprite ? tune.spriteDepth - size * SPRITE_REACH : 0;
    const end = {
      x: hit.x + (aimX / aimLength) * back,
      y: hit.y + (aimY / aimLength) * back,
    };
    const halo = new Sprite(texture);
    const core = new Sprite(texture);
    halo.tint = colourNumber(tune.travelColour);
    core.tint = 0xffffff;
    const picture = new Sprite(Texture.from(spriteUrl(art.id)));
    picture.anchor.set(0.5);
    const heads = isSprite ? [picture] : [halo, core];
    for (const part of heads) {
      if (part !== picture) {
        part.anchor.set(0.5);
        part.blendMode = BLEND_MODES.ADD;
      }
      addToStage(part);
    }
    const dx = end.x - from.x;
    const dy = end.y - from.y;
    const distance = Math.hypot(dx, dy) || 1;
    // A gentle sideways arc, so a shot is not a ruler line.
    const arcX = (-dy / distance) * distance * tune.travelArc;
    const arcY = (dx / distance) * distance * tune.travelArc;
    // Wispy streamers that flail off behind the head (drawn fresh each frame).
    const streamers = tune.travelHasStreamers ? new Graphics() : null;
    if (streamers) {
      streamers.blendMode = BLEND_MODES.ADD;
      app.stage.addChild(streamers as never);
    }
    const lanes = Array.from(
      { length: Math.round(tune.travelStreamerCount) },
      () => ({
        phase: Math.random() * Math.PI * 2,
        reach: 0.55 + Math.random() * 0.45,
        side: Math.random() * 2 - 1,
        speed: 0.7 + Math.random() * 0.6,
      }),
    );
    let elapsed = 0;
    let last = from;
    let heading = Math.atan2(dy, dx);
    let arrivedAt: number | null = null;
    jobs.add((deltaMs) => {
      elapsed += deltaMs;
      const linear = Math.min(1, elapsed / ms);
      const eased = Math.pow(linear, tune.travelEase);
      const bend = Math.sin(Math.PI * eased);
      const at = {
        x: from.x + dx * eased + arcX * bend,
        y: from.y + dy * eased + arcY * bend,
      };
      // The point leads: face the way the head is moving.
      if (Math.hypot(at.x - last.x, at.y - last.y) > SPRITE_TURN_MIN) {
        heading = Math.atan2(at.y - last.y, at.x - last.x);
      }
      if (arrivedAt === null) {
        if (isSprite) {
          picture.position.set(at.x, at.y);
          picture.rotation =
            heading - tipRadians + spinRadians(tune.spriteSpin, elapsed);
          picture.width = size;
          picture.height = size;
        } else {
          const pulse =
            1 + tune.travelPulse * Math.sin(elapsed * TRAVEL_PULSE_RATE);
          halo.position.set(at.x, at.y);
          core.position.set(at.x, at.y);
          // A stretched head turns along the flight, like a beam's point.
          halo.rotation = heading;
          core.rotation = heading;
          halo.scale.set(
            tune.travelHaloScale * pulse * tune.travelStretch,
            tune.travelHaloScale * pulse,
          );
          core.scale.set(
            tune.travelCoreScale * pulse * tune.travelStretch,
            tune.travelCoreScale * pulse,
          );
        }
        const puffs = tune.travelHasTrail
          ? Math.round(tune.travelTrailPerFrame)
          : 0;
        for (let puff = 0; puff < puffs; puff++) {
          const jitter = () => (Math.random() - 0.5) * tune.travelTrailSpread;
          const drift = () => (Math.random() - 0.5) * tune.travelTrailDrift;
          // Spread the puffs along the way since the last frame, so a fast
          // orb leaves a stream and not a row of dots.
          const behind = puff / Math.max(1, puffs);
          const origin = {
            x: at.x + (last.x - at.x) * behind + jitter(),
            y: at.y + (last.y - at.y) * behind + jitter(),
          };
          spawn(
            origin,
            colourNumber(tune.travelTrailColour),
            tune.travelTrailScale,
            tune.travelTrailLife,
            drift(),
            drift(),
          );
        }
        last = at;
      }
      if (linear >= 1 && arrivedAt === null) {
        arrivedAt = elapsed;
        halo.destroy();
        core.destroy();
        burstWith(hit, 'hit', tune);
      }
      const held = arrivedAt === null ? 0 : elapsed - arrivedAt;
      // A picture sticks in the target, stays a moment, then fades away.
      const pictureLeft = isSprite
        ? tune.spriteStick + tune.spriteFade - held
        : 0;
      if (isSprite && arrivedAt !== null) {
        const fade = Math.max(1, tune.spriteFade);
        picture.alpha =
          held <= tune.spriteStick
            ? 1
            : Math.max(0, 1 - (held - tune.spriteStick) / fade);
      }
      // The streamers keep flailing a moment after the hit, fading out.
      const streamersLeft = streamers ? tune.travelStreamerLinger - held : 0;
      if (streamers) {
        const fadeOut =
          arrivedAt === null
            ? 1
            : Math.max(
                0,
                streamersLeft / Math.max(1, tune.travelStreamerLinger),
              );
        drawStreamers(streamers, lanes, at, heading, elapsed, fadeOut, tune);
      }
      if (arrivedAt === null) return true;
      if (pictureLeft > 0 || streamersLeft > 0) return true;
      picture.destroy();
      streamers?.destroy();
      return false;
    });
    wake();
  };

  return travel;
};
