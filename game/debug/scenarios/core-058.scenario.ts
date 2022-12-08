import { add } from 'mathjs';
import { Zone } from '../../../types';
import { v4 as uuid } from 'uuid';
import { createCardObject } from '../../../utils';
import setsCore from '../../data/setsCore.json';

const obj1 = createCardObject(setsCore.find((o) => o.id === '133')!);
const obj2 = createCardObject(setsCore.find((o) => o.id === '052')!);
const obj3 = createCardObject(setsCore.find((o) => o.id === '122')!);

export default {
  zones: [
    {
      sides: {
        '1': [
          {
            ...obj1,
            revealed: true,
          },
          {
            ...obj2,
            booleans: {
              ...obj2.booleans,
              hasHealthReduced: true,
            },
            displayHealth: 7,
            healthStream: [
              {
                blame: 'cardToBlame1.name',
                adjustment: -1,
                currentHealth: 7,
                uuid: uuid(),
              },
            ],
            revealed: true,
          },
          {
            ...obj3,
            booleans: {
              ...obj3.booleans,
              hasHealthReduced: true,
            },
            displayHealth: 5,
            healthStream: [
              {
                blame: 'cardToBlame2.name',
                adjustment: -3,
                currentHealth: 5,
                uuid: uuid(),
              },
            ],
            revealed: true,
          },
        ],
      },
    },
  ],
};
