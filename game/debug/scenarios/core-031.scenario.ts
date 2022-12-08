import { add } from 'mathjs';
import { Zone } from '../../../types';
import { createCardObject } from '../../../utils';
import setsCore from '../../data/setsCore.json';

const creature = createCardObject(setsCore.find((o) => o.id === '033')!);
// const obj1 = createCardObject(setsCore.find((o) => o.id === '001')!);
const notCreature = createCardObject(setsCore.find((o) => o.id === '052')!);

export default {
  zones: [
    {
      sides: {
        '0': [
          {
            ...creature,
            revealed: true,
          },
          {
            ...notCreature,
            revealed: true,
          },
        ],
        '1': [],
      },
    },
  ],
};
