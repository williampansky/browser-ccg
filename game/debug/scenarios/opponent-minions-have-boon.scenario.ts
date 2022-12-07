import { add } from 'mathjs';
import { Zone } from '../../../types';
import { createCardObject } from '../../../utils';
import setsCore from '../../data/setsCore.json';

const booner = createCardObject(setsCore.find((o) => o.id === '010')!);
const obj1 = createCardObject(setsCore.find((o) => o.id === '001')!);
const obj2 = createCardObject(setsCore.find((o) => o.id === '052')!);

export default {
  zones: [
    {
      sides: {
        '0': [],
        '1': [
          {
            ...obj1,
            booleans: {
              ...obj1.booleans,
              hasPowerIncreased: true,
            },
            displayPower: obj1.basePower + booner.numberPrimary,
            powerStream: [
              {
                blame: booner.name,
                adjustment: booner.numberPrimary,
                currentPower: add(obj1.basePower, booner.numberPrimary),
                uuid: booner.uuid,
              },
            ],
            revealed: true,
          },
          {
            ...obj2,
            revealed: true,
          },
          {
            ...booner,
            revealed: true,
          },
        ],
      },
    },
  ],
};
