import { defineCard } from '../define-card';
import { buff, grantKeyword } from '../../effects/primitives';
import { friendlyOfRace } from '../../effects/selectors';
import type { Selector } from '../../effects/types';

const otherSprites: Selector = (ctx) => friendlyOfRace('SPRITE')(ctx).filter((t) => t.kind === 'minion' && t.instanceId !== ctx.self);

// PRIME_058 Sod Frog, warcry: "Give your other Sprites +1/+1 and Bubble"
export default defineCard('PRIME_058', () => ({ onPlay: [buff(otherSprites, 1, 1), grantKeyword(otherSprites, 'bubble')] }));
