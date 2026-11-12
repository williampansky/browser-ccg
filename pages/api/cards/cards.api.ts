import { NextApiRequest, NextApiResponse } from 'next';
import { loadHsCards } from '../../../engine';

/**
 * The card list in the engine's own shape (`engine/cards/types.ts`), from `data/`. The old site pages (`collection`, `cards`)
 * still expect the zone-game shape until ROADMAP Milestone 4 switches them over; the deck builder and `/play` do not use this route.
 */
export default (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { cards } = loadHsCards();
    res.status(200).json(cards.filter((c) => !c.isToken).sort((a, b) => a.cost - b.cost || (a.name ?? '').localeCompare(b.name ?? '')));
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ statusCode: 500, message: err?.message });
  }
};
