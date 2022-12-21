import { add } from 'mathjs';
import { Zone } from '../../../types';
import { createCardObject } from '../../../utils';
import setsCore from '../../data/setsCore.json';

const listener = createCardObject(setsCore.find((o) => o.id === '008')!);
// const obj1 = createCardObject(setsCore.find((o) => o.id === '001')!);
// const obj2 = createCardObject(setsCore.find((o) => o.id === '052')!);

export default {
  zones: [
    {
      sides: {
        '0': [
          {
            ...listener,
            revealed: true,
          },
        ],
        '1': [],
      },
    },
  ],
};
