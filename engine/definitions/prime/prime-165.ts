import { defineCard } from '../define-card';
import { grantKeyword } from '../../effects/primitives';
import { friendlyMinions } from '../../effects/selectors';

// PRIME_165 Bubbles for All!: "Buff all your minions with Bubbles"
export default defineCard('PRIME_165', () => ({ onPlay: [grantKeyword(friendlyMinions(), 'bubble')] }));
