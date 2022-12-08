import { add } from 'mathjs';
import { Zone } from '../../../types';
import { createCardObject } from '../../../utils';
import setsCore from '../../data/setsCore.json';

const powerBooner = createCardObject(setsCore.find((o) => o.id === '010')!);
const bothBooner = createCardObject(setsCore.find((o) => o.id === '042')!);
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
              hasHealthIncreased: true,
              hasPowerIncreased: true,
            },
            displayHealth: obj1.baseHealth + bothBooner.numberPrimary,
            displayPower: add(
              add(obj1.basePower, powerBooner.numberPrimary),
              bothBooner.numberPrimary
            ),
            healthStream: [
              {
                blame: bothBooner.name,
                adjustment: bothBooner.numberPrimary,
                currentHealth: add(obj1.baseHealth, bothBooner.numberPrimary),
                uuid: bothBooner.uuid,
              },
            ],
            powerStream: [
              {
                blame: powerBooner.name,
                adjustment: powerBooner.numberPrimary,
                currentPower: add(obj1.basePower, powerBooner.numberPrimary),
                uuid: powerBooner.uuid,
              },
              {
                blame: bothBooner.name,
                adjustment: bothBooner.numberPrimary,
                currentPower: add(
                  add(obj1.basePower, powerBooner.numberPrimary),
                  bothBooner.numberPrimary
                ),
                uuid: bothBooner.uuid,
              },
            ],
            revealed: true,
          },
          {
            ...obj2,
            booleans: {
              ...obj2.booleans,
              hasHealthIncreased: true,
              hasPowerIncreased: true,
            },
            displayHealth: obj2.baseHealth + bothBooner.numberPrimary,
            displayPower: add(obj2.basePower, bothBooner.numberPrimary),
            healthStream: [
              {
                blame: bothBooner.name,
                adjustment: bothBooner.numberPrimary,
                currentHealth: add(obj2.baseHealth, bothBooner.numberPrimary),
                uuid: bothBooner.uuid,
              },
            ],
            powerStream: [
              {
                blame: bothBooner.name,
                adjustment: bothBooner.numberPrimary,
                currentPower: add(obj2.basePower, bothBooner.numberPrimary),
                uuid: bothBooner.uuid,
              },
            ],
            revealed: true,
          },
          {
            ...powerBooner,
            booleans: {
              ...powerBooner.booleans,
              hasHealthIncreased: true,
              hasPowerIncreased: true,
            },
            displayHealth: powerBooner.baseHealth + bothBooner.numberPrimary,
            displayPower: add(powerBooner.basePower, bothBooner.numberPrimary),
            healthStream: [
              {
                blame: bothBooner.name,
                adjustment: bothBooner.numberPrimary,
                currentHealth: add(
                  powerBooner.baseHealth,
                  bothBooner.numberPrimary
                ),
                uuid: bothBooner.uuid,
              },
            ],
            powerStream: [
              {
                blame: bothBooner.name,
                adjustment: bothBooner.numberPrimary,
                currentPower: add(
                  powerBooner.basePower,
                  bothBooner.numberPrimary
                ),
                uuid: bothBooner.uuid,
              },
            ],
            revealed: true,
          },
          {
            ...bothBooner,
            revealed: true,
          },
        ],
      },
    },
  ],
};
