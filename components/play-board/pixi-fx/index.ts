import { createArea } from './area';
import { createFxContext } from './context';
import { createSpot } from './spot';
import { createStrike } from './strike';
import { createTravel } from './travel';
import type { PixiFx } from './types';

export type { FxPoint, FxRect, PixiFx } from './types';

/** Creates the overlay canvas and its particle systems. */
export const createPixiFx = (): PixiFx => {
  const context = createFxContext();
  const { burst, destroy, setSpeed } = context;
  const area = createArea(context);
  const spot = createSpot(context);
  const strike = createStrike(context);
  const travel = createTravel(context);

  return { area, burst, destroy, setSpeed, spot, strike, travel };
};
