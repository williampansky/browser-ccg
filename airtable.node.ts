// @ts-ignore
require('dotenv').config({ path: './.env.local' });
const fs = require('fs');
const Airtable = require('airtable-node');

const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const base = new Airtable({ apiKey: API_KEY }).base(BASE_ID);

/**
 * Object of airtable table ids
 */
const tables = {
  CONSTANTS: 'tblZkwNKTByvWfO6P',
  HERO_ABILITIES: 'tblU5qFbU8cc0diXq',
  HEROS: 'tblTWmz40jBegB1TJ',
  MECHANICS: 'tblmYzve1mJUuIpfq',
  SET_CORE: 'tblwYhK2ndoM2lohc',
  SET_ENTOURAGE: 'tblC5Cy6pKp8EaQaV',
  SET_GAME: 'tblQLQ0BnfCAJvu6F',
  SET_PRIME: 'tblajpxLahsUgKzVd',
  ZONES: 'tblKes7sTnuFcFStH',
};

function parseCardEntourage(string: string) {
  if (!string || typeof string === 'undefined') return [];
  return string.replace(/\s/g, '').split(',');
}

const fetchConstantsData = async (tableId: string) => {
  console.log('Fetching constants ...');
  await base
    .table(tableId)
    .list({ maxRecords: 200 })
    .then((resp: any) => {
      const map = resp.records.map((item: any) => {
        const { fields } = item;
        const { name, symbol, type, description } = fields;

        return {
          [symbol]: {
          name,
          symbol,
          type,
          description,
          key: symbol, // required for `react-select` pkg
          value: name, // required for `react-select` pkg
          },
        };
      });

      const constants = JSON.stringify(Object.assign({}, ...map));
      // const constants = JSON.stringify(map);
      fs.writeFileSync('./data/constants.json', constants);
      fs.writeFileSync('./game/data/constants.json', constants);
    })
    .catch((err: any) => {
      fs.writeFileSync('./data/constants.error.txt', err);
      fs.writeFileSync('./game/data/constants.error.txt', err);
    });
};

const fetchMechanicsData = async (tableId: string) => {
  console.log('Fetching mechanics ...');
  await base
    .table(tableId)
    .list({ maxRecords: 200 })
    .then((resp: any) => {
      const map = resp.records.map((item: any) => {
        const { fields } = item;
        const { name, symbol, description, shortDescription } = fields;

        return {
          [symbol]: {
          name,
          symbol,
          description,
          shortDescription,
          key: symbol, // required for `react-select` pkg
          value: name, // required for `react-select` pkg
          },
        };
      });

      const mechanics = JSON.stringify(Object.assign({}, ...map));
      // const mechanics = JSON.stringify(map);
      fs.writeFileSync('./data/mechanics.json', mechanics);
      fs.writeFileSync('./game/data/mechanics.json', mechanics);
    })
    .catch((err: any) => {
      fs.writeFileSync('./data/mechanics.error.txt', err);
      fs.writeFileSync('./game/data/mechanics.error.txt', err);
    });
};

const fetchSetGameData = async (tableId: string) => {
  console.log('Fetching game set ...');
  await base
    .table(tableId)
    .list({ maxRecords: 200 })
    .then((resp: any) => {
      const map = resp.records.map((item: any) => {
        const { fields } = item;
        if (!fields.active) return;
        return {
          name: fields?.name,
          id: fields?.id,
          rarity: fields?.rarity,
          type: fields?.type,
          race: fields?.race,
          cost: fields?.cost,
          power: fields?.power,
          text: fields?.text,
          set: fields?.set,
          collectible: fields?.collectible || false,
          elite: fields?.elite || false,
          mechanics: fields?.mechanics,
          playType: fields?.playType,
          numberPrimary: fields?.numberPrimary,
          numberRng: fields?.numberRng,
          numberSecondary: fields?.numberSecondary,
          targetingText: fields?.targetingText,
          entourage: parseCardEntourage(fields?.entourage),
          howToEarn: fields?.howToEarn,
          howToEarnGolden: fields?.howToEarnGolden,
          flavorText: fields?.flavorText,
          artistName: fields?.artistName,
          artistUrl: fields?.artistUrl,
          description: fields?.description,
        };
      });

      const setsGame = JSON.stringify(map);
      fs.writeFileSync('./data/setsGame.json', setsGame);
      fs.writeFileSync('./game/data/setsGame.json', setsGame);
    })
    .catch((err: any) => {
      fs.writeFileSync('./data/setsGame.error.txt', err);
      fs.writeFileSync('./game/data/setsGame.error.txt', err);
    });
};

const fetchSetEntourageData = async (tableId: string) => {
  console.log('Fetching entourage set ...');
  await base
    .table(tableId)
    .list({ maxRecords: 200 })
    .then((resp: any) => {
      const map = resp.records.map((item: any) => {
        const { fields } = item;
        return {
          isEntourage: true,
          name: fields?.name,
          id: fields?.id,
          rarity: fields?.rarity,
          type: fields?.type,
          race: fields?.race,
          cost: fields?.cost,
          power: fields?.power,
          text: fields?.text,
          set: fields?.set,
          collectible: fields?.collectible || false,
          elite: fields?.elite || false,
          mechanics: fields?.mechanics,
          playType: fields?.playType,
          numberPrimary: fields?.numberPrimary,
          numberRng: fields?.numberRng,
          numberSecondary: fields?.numberSecondary,
          targetingText: fields?.targetingText,
          flavorText: fields?.flavorText,
          artistName: fields?.artistName,
          artistUrl: fields?.artistUrl,
          description: fields?.description,
        };
      });

      const setsEntourage = JSON.stringify(map);
      fs.writeFileSync('./data/setsEntourage.json', setsEntourage);
      fs.writeFileSync('./game/data/setsEntourage.json', setsEntourage);
    })
    .catch((err: any) => {
      fs.writeFileSync('./data/setsEntourage.error.txt', err);
      fs.writeFileSync('./game/data/setsEntourage.error.txt', err);
    });
};

const fetchZonesData = async (tableId: string) => {
  console.log('Fetching zones ...');
  await base
    .table(tableId)
    .list({ maxRecords: 20 })
    .then((resp: any) => {
      const map = resp.records.map((item: any) => {
        const { fields } = item;
        return {
          artistName: fields?.artistName,
          artistUrl: fields?.artistUrl,
          effectAdjustment: fields?.effectAdjustment,
          effectText: fields?.effectText,
          flavorText: fields?.flavorText,
          id: fields?.id,
          mechanics: fields?.mechanics,
          name: fields?.name,
          set: fields?.set,
        };
      });

      const zones = JSON.stringify(map);
      fs.writeFileSync('./data/zones.json', zones);
      fs.writeFileSync('./game/data/zones.json', zones);
    })
    .catch((err: any) => {
      fs.writeFileSync('./data/zones.error.txt', err);
      fs.writeFileSync('./game/data/zones.error.txt', err);
    });
};

fetchConstantsData(tables.CONSTANTS);
fetchMechanicsData(tables.MECHANICS);
fetchSetEntourageData(tables.SET_ENTOURAGE);
fetchSetGameData(tables.SET_GAME);
fetchZonesData(tables.ZONES);
