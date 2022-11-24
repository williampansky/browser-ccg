// @ts-ignore
require('dotenv').config({ path: './.env.local' });
const fs = require('fs');
const v4 = require('uuid');
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
  SET_CORE: 'tblQLQ0BnfCAJvu6F',
  SET_ENTOURAGE: 'tblC5Cy6pKp8EaQaV',
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

function formatCardEntourage(arr: string[], set?: string) {
  return arr.map(s => `${set?.replace(/\%/g, '')}_${s}`);
}

function replaceAllConstants(stringToParse: string, keyToUse: string = 'name') {
  if (!stringToParse) return;
  return stringToParse.replace(
    /%(.*?)%/g,
    (x) => constantsDb[x] && constantsDb[x][keyToUse]
  );
}

function createCardKey(id?: string, set?: string): string {
  return set && id ? `${replaceAllConstants(set, 'value')}_${id}` : v4();
}

function parseMechanics(arr: string[]) {
  if (!arr || typeof arr === 'undefined') return [];
  return arr.map((s) => s.replace(/\%/g, ''));
  // return arr.map((s) => replaceAllConstants(s, 'value'));
}

function parseArtistUrl(str?: string) {
  if (!str || typeof str === 'undefined') return undefined;
  return str.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
  // return arr.map((s) => replaceAllConstants(s, 'value'));
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

const fetchSetCoreData = async (tableId: string) => {
  console.log('Fetching core set ...');
  await base
    .table(tableId)
    .list({ maxRecords: 200 })
    .then((resp: any) => {
      const map = resp.records.map((item: any) => {
        const { fields } = item;
        return {
          name: fields?.name,
          id: fields.id,
          rarity: fields?.rarity,
          type: fields?.type,
          race: fields?.race || '%RACE_NONE%',
          cost: fields?.cost || 0,
          health: fields?.health || 0,
          power: fields?.power || 0,
          text: fields?.text,
          set: fields.set,
          active: fields?.active || false,
          isEntourage: false,
          collectible: fields?.collectible || false,
          elite: fields?.elite || false,
          mechanics: parseMechanics(fields?.mechanics),
          mechanicsEnabled: fields?.mechanicsEnabled || false,
          playType: fields?.playType,
          numberPrimary: fields?.numberPrimary,
          numberRng: fields?.numberRng,
          numberSecondary: fields?.numberSecondary,
          targetingText: fields?.targetingText,
          entourage: formatCardEntourage(
            parseCardEntourage(fields?.entourage),
            fields?.set
          ),
          howToEarn: fields?.howToEarn,
          howToEarnGolden: fields?.howToEarnGolden,
          flavorText: fields?.flavorText,
          artistName: fields?.artistName,
          artistUrl: parseArtistUrl(fields?.artistUrl),
          fpoArt: fields?.fpoArt || false,
          description: fields?.description,
          key: createCardKey(fields.id, fields.set),
        };
      }).filter((obj: any) => obj.active);

      const setsCore = JSON.stringify(map);
      writeToFile('setsCore', setsCore);
    })
    .catch((err: any) => {
      writeToFile('setsCore', err);
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
          id: fields.id,
          rarity: fields?.rarity,
          type: fields?.type,
          race: fields?.race || '%RACE_NONE%',
          cost: fields?.cost || 0,
          health: fields?.health || 0,
          power: fields?.power || 0,
          text: fields?.text,
          set: fields.set,
          collectible: false,
          elite: fields?.elite || false,
          active: fields?.active || false,
          mechanics: parseMechanics(fields?.mechanics),
          mechanicsEnabled: fields?.mechanicsEnabled || false,
          playType: fields?.playType,
          numberPrimary: fields?.numberPrimary,
          numberRng: fields?.numberRng,
          numberSecondary: fields?.numberSecondary,
          targetingText: fields?.targetingText,
          flavorText: fields?.flavorText,
          artistName: fields?.artistName,
          artistUrl: parseArtistUrl(fields?.artistUrl),
          fpoArt: fields?.fpoArt || false,
          description: fields?.description,
          key: createCardKey(fields.id, fields.set),
        };
      }).filter((obj: any) => obj.active);

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
          artist: createArtistHtmlLink(fields?.artistName),
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
fetchSetCoreData(tables.SET_CORE);
fetchZonesData(tables.ZONES);

setTimeout(() => {
  process.exit();
}, 5000);
