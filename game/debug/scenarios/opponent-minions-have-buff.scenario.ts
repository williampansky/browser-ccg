import { add } from 'mathjs';
import { Zone } from '../../../types';
import { createCardObject } from '../../../utils';
import setsCore from '../../data/setsCore.json';

const creature = createCardObject(setsCore.find((o) => o.id === '033')!);
// const obj1 = createCardObject(setsCore.find((o) => o.id === '001')!);
const notCreature = createCardObject(setsCore.find((o) => o.id === '031')!);

export default {
  zones: [
    {
      sides: {
        '1': [
          {
            ...creature,
            booleans: {
              ...creature.booleans,
              isBuffed: true,
              hasPowerIncreased: true,
            },
            displayPower: add(creature.basePower, notCreature.numberPrimary),
            powerStream: [
              {
                blame: notCreature.name,
                adjustment: notCreature.numberPrimary,
                currentPower: add(
                  creature.basePower,
                  notCreature.numberPrimary
                ),
                uuid: notCreature.uuid,
              },
            ],
            revealed: true,
          },
          {
            ...notCreature,
            revealed: true,
          },
        ],
      },
    },
  ],
};
