import { add } from 'mathjs';
import { Zone } from '../../../types';
import { createCardObject } from '../../../utils';
import setsCore from '../../data/setsCore.json';

const obj1 = createCardObject(setsCore.find((o) => o.id === '001')!);
const obj2 = createCardObject(setsCore.find((o) => o.id === '052')!);
const obj3 = createCardObject(setsCore.find((o) => o.id === '052')!);
const obj4 = createCardObject(setsCore.find((o) => o.id === '052')!);
const obj5 = createCardObject(setsCore.find((o) => o.id === '052')!);

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
            revealed: true,
          },
          {
            ...obj3,
            revealed: true,
          },
        ],
      },
    },
    {
      sides: {
        '1': [
          {
            ...obj4,
            revealed: true,
          },
          {
            ...obj5,
            revealed: true,
          },
        ],
      },
    },
  ],
};
