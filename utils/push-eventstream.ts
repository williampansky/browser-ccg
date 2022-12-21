import type { Card } from '../types';

/**
 * Pushes to a card's eventStream array
 */
const pushEventStream = (
  cardToAdjust: Card,
  cardToBlame: Card,
  event: string
): void => {
  // push to stream
  cardToAdjust.eventStream.push({
    blame: cardToBlame.name,
    event,
    uuid: cardToBlame.uuid,
  });
};

export default pushEventStream;
