import { Zone } from '../../../types';
import { createCardObject } from '../../../utils';
import setsCore from '../../data/setsCore.json';

const ifr = createCardObject(setsCore.find((o) => o.id === '085')!);
const obj = createCardObject(setsCore.find((o) => o.id === '052')!);

export default {
  zones: [
    {
      sides: {
        '0': [
          {
            ...ifr,
            booleans: {
              ...obj.booleans,
              hasHealthReduced: true,
            },
            displayHealth: 2,
            healthStream: [
              {
                blame: 'cardToBlame.name1',
                adjustment: -6,
                currentHealth: 2,
                uuid: 'cardToBlame.uuid1',
              },
            ],
            revealed: true,
          },
          {
            ...obj,
            booleans: {
              ...obj.booleans,
              hasHealthReduced: true,
            },
            displayHealth: 2,
            healthStream: [
              {
                blame: 'cardToBlame.name2',
                adjustment: -6,
                currentHealth: 2,
                uuid: 'cardToBlame.uuid2',
              },
            ],
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
                blame: 'cardToBlame.name3',
                adjustment: -7,
                currentHealth: 1,
                uuid: 'cardToBlame.uuid3',
              },
            ],
            revealed: true,
          },
        ],
      },
    },
  ],
};
