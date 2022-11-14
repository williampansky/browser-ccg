// @ts-ignore
require('dotenv').config({ path: './.env.local' });
const fs = require('fs');
const Airtable = require('airtable-node');
const CONSTANTS = require('./data/constants.json');
const MECHANICS = require('./data/mechanics.json');

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

const constantsDb = {
  ...CONSTANTS,
  ...MECHANICS,
};

function parseCardEntourage(string: string) {
  if (!string || typeof string === 'undefined') return [];
  return string.replace(/\s/g, '').split(',');
}

function replaceAllConstants(stringToParse: string, keyToUse: string = 'name') {
  if (!stringToParse) return;
  return stringToParse.replace(
    /%(.*?)%/g,
    (x) => constantsDb[x] && constantsDb[x][keyToUse]
  );
}

function parseMechanics(arr: string[]) {
  if (!arr || typeof arr === 'undefined') return [];
  return arr.map(s => replaceAllConstants(s, 'value'))
}

function createArtistHtmlLink(name?: string, url?: string): string | undefined {
  if (!name || !url) return undefined;
  if (!name && url) return url;
  if (name && !url) return name;

  const html = `<a href="${url}" rel="noopener noreferrer" target="_blank">${name}</a>`;
  return html;
}

function writeToFile(fileName: string, data: any) {
  try {
    fs.writeFileSync(`./data/${fileName}.json`, data);
    fs.writeFileSync(`./game/data/${fileName}.json`, data);
    console.log(`Writing ${fileName} to system ...`);
  } catch (error) {
    const obj = { dataError: data, catchError: error };
    fs.writeFileSync(`./data/${fileName}.error.txt`, obj);
    fs.writeFileSync(`./game/data/${fileName}.error.txt`, obj);
  }
}

const fetchConstantsData = async (tableId: string) => {
  console.log('Fetching constants ...');
  await base
    .table(tableId)
    .list({ maxRecords: 200 })
    .then((resp: any) => {
      const map = resp.records.map((item: any) => {
        const { fields } = item;
        const { name, symbol, type, description, value } = fields;

        return {
          [symbol]: {
            name,
            symbol,
            value,
            type,
            description,
          },
        };
      });

      const constants = JSON.stringify(Object.assign({}, ...map));
      writeToFile('constants', constants);
    })
    .catch((err: any) => {
      writeToFile('constants', err);
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
        const { name, symbol, value, description, shortDescription } = fields;

        return {
          [symbol]: {
            name,
            symbol,
            value,
            description,
            shortDescription,
          },
        };
      });

      const mechanics = JSON.stringify(Object.assign({}, ...map));
      writeToFile('mechanics', mechanics);
    })
    .catch((err: any) => {
      writeToFile('mechanics', err);
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
      writeToFile('setsGame', setsGame);
    })
    .catch((err: any) => {
      writeToFile('setsGame', err);
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
      writeToFile('setsEntourage', setsEntourage);
    })
    .catch((err: any) => {
      writeToFile('setsEntourage', err);
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
          artist:
            fields?.artistName && fields?.artistUrl
              ? createArtistHtmlLink(fields?.artistName)
              : undefined,
          artistName: fields?.artistName,
          artistUrl: fields?.artistUrl,
          effectAdjustment: fields?.effectAdjustment,
          effectText: replaceAllConstants(fields?.effectText),
          flavorText: fields?.flavorText,
          id: fields?.id,
          mechanics: parseMechanics(fields?.mechanics),
          name: fields?.name,
          set: replaceAllConstants(fields?.set, 'value'),
        };
      });

      const zones = JSON.stringify(map);
      writeToFile('zones', zones);
    })
    .catch((err: any) => {
      writeToFile('zones', err);
    });
};

fetchConstantsData(tables.CONSTANTS);
fetchMechanicsData(tables.MECHANICS);
fetchSetEntourageData(tables.SET_ENTOURAGE);
fetchSetGameData(tables.SET_GAME);
fetchZonesData(tables.ZONES);