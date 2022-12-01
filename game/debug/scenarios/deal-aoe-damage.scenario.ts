import { Zone } from '../../../types';
import { createCardObject } from '../../../utils';
import setsCore from '../../data/setsCore.json';

const obj = createCardObject(setsCore.find((o) => o.id === '052')!);

export default {
  zones: [
    {
      sides: {
        '0': [
          {
            ...obj,
            booleans: {
              ...obj.booleans,
              hasHealthReduced: true,
            },
            displayHealth: 2,
            healthStream: [
              {
                blame: 'cardToBlame.name',
                adjustment: -6,
                currentHealth: 2,
                uuid: 'cardToBlame.uuid',
              },
            ],
            revealed: true,
          },
          {
            ...obj,
            revealed: true,
          },
        ],
        '1': [
          {
            ...obj,
            booleans: {
              ...obj.booleans,
              hasHealthReduced: true,
            },
            displayHealth: 1,
            healthStream: [
              {
                blame: 'cardToBlame.name',
                adjustment: -7,
                currentHealth: 1,
                uuid: 'cardToBlame.uuid',
              },
            ],
            revealed: true,
          },
        ],
      },
    },
  ],
};
