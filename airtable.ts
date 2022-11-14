import Airtable from 'airtable';

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
};

// Authenticate
Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY,
});

// console.log(process.env.AIRTABLE_API_KEY)

// Initialize a base
const base = Airtable.base(process.env.AIRTABLE_BASE_ID!);

// Reference a table
const constantsTable = base(tables.CONSTANTS);
const mechanicsTable = base(tables.MECHANICS);
const herosTable = base(tables.HEROS);
const abilitiesTable = base(tables.HERO_ABILITIES);
const setsGameTable = base(tables.SET_GAME);
const setsCoreTable = base(tables.SET_CORE);
const setsPrimeTable = base(tables.SET_PRIME);
const setsEntourageTable = base(tables.SET_ENTOURAGE);

export {
  constantsTable,
  mechanicsTable,
  herosTable,
  abilitiesTable,
  setsGameTable,
  setsCoreTable,
  setsPrimeTable,
  setsEntourageTable,
};
