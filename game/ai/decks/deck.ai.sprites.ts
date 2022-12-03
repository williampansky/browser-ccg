import setsCore from '../../data/setsCore.json';

const db = [
  ...setsCore
];

const CORE = `SET_CORE_`;

// prettier-ignore
export default [
  db.find(obj => obj.key === CORE + '001'),
  db.find(obj => obj.key === CORE + '001'), // 2

  db.find(obj => obj.key === CORE + '009'),
  db.find(obj => obj.key === CORE + '009'), // 4

  db.find(obj => obj.key === CORE + '010'),
  db.find(obj => obj.key === CORE + '010'), // 6

  db.find(obj => obj.key === CORE + '012'),
  db.find(obj => obj.key === CORE + '012'), // 8

  db.find(obj => obj.key === CORE + '013'),
  db.find(obj => obj.key === CORE + '013'), // 10

  db.find(obj => obj.key === CORE + '015'),
  db.find(obj => obj.key === CORE + '015'), // 12

  db.find(obj => obj.key === CORE + '016'),
  db.find(obj => obj.key === CORE + '016'), // 14

  db.find(obj => obj.key === CORE + '005'),
  db.find(obj => obj.key === CORE + '005'), // 16

  db.find(obj => obj.key === CORE + '007'),
  db.find(obj => obj.key === CORE + '007'), // 18

  db.find(obj => obj.key === CORE + '008'),
  db.find(obj => obj.key === CORE + '008'), // 20

  db.find(obj => obj.key === CORE + '036'),
  db.find(obj => obj.key === CORE + '036'), // 22

  db.find(obj => obj.key === CORE + '039'),
  db.find(obj => obj.key === CORE + '039'), // 24

  db.find(obj => obj.key === CORE + '041'),
  db.find(obj => obj.key === CORE + '041'), // 26

  db.find(obj => obj.key === CORE + '050'),
  db.find(obj => obj.key === CORE + '050'), // 28

  db.find(obj => obj.key === CORE + '029'),
  db.find(obj => obj.key === CORE + '110'), // 30
];
