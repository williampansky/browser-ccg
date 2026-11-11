import type {
  Card,
  CardIssue,
  CardIssueCode,
  CardNumbers,
  CardSource,
  CardType,
  LoadCardsInput,
  LoadCardsOptions,
  LoadCardsResult,
  PlayType,
  RawCard,
  RawGlossaryEntry,
} from './types';

/** Thrown by `loadCards` in strict mode when the data has error-level problems. */
export class CardDataError extends Error {
  readonly issues: CardIssue[];

  constructor(issues: CardIssue[]) {
    const errors = issues.filter((i) => i.level === 'error');
    super(
      `Card data has ${errors.length} error(s):\n` +
        errors.map((i) => `  [${i.code}] ${i.id}: ${i.message}`).join('\n')
    );
    this.name = 'CardDataError';
    this.issues = issues;
  }
}

/**
 * Known typos in the Airtable data, fixed at load time. Keep this list short and
 * remove an entry once the data itself is fixed.
 */
const ENTOURAGE_ID_FIXES: Record<string, string> = {
  PRIME112a: 'PRIME_112a',
};

const TYPES: Record<string, CardType> = {
  MINION: 'minion',
  SPELL: 'spell',
  ITEM: 'item',
  WEAPON: 'weapon',
};

/**
 * Strips the percent signs (and an Airtable select index like the `0 ` in
 * `0 %CLASS_NONE%`) from a symbol: `%RARITY_FREE%` -> `RARITY_FREE`.
 */
export function stripSymbol(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const match = value.trim().match(/^(?:\d+\s+)?%([A-Z0-9_]+)%$/);
  return match ? match[1] : undefined;
}

function stripPrefix(value: unknown, prefix: string): string | undefined {
  const symbol = stripSymbol(value);
  if (!symbol) return undefined;
  return symbol.startsWith(prefix) ? symbol.slice(prefix.length) : symbol;
}

/**
 * Turns the HTML-ish card text into plain text: line breaks (including the malformed
 * `<br >`) become spaces, other tags are removed, whitespace is collapsed.
 */
export function sanitizeText(html: string): string {
  return html
    .replace(/<br\s*\/?\s*>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function loadCards(
  input: LoadCardsInput,
  options: LoadCardsOptions = {}
): LoadCardsResult {
  const { strict = true } = options;
  const issues: CardIssue[] = [];

  const mechanicSymbols = new Map<string, RawGlossaryEntry>();
  input.mechanics.forEach((m) => mechanicSymbols.set(m.symbol, m));

  /** symbol (with percent signs) -> display name, for rendering text */
  const glossary = new Map<string, string>();
  [...input.mechanics, ...input.constants].forEach((entry) => {
    if (entry.symbol && entry.name) glossary.set(entry.symbol, String(entry.name));
  });

  const report = (
    level: CardIssue['level'],
    code: CardIssueCode,
    id: string,
    message: string
  ) => issues.push({ level, code, id, message });

  const cards: Card[] = [];
  const byId = new Map<string, Card>();

  const sources: [CardSource, RawCard[]][] = [
    ['core', input.core],
    ['prime', input.prime],
    ['entourage', input.entourage],
    ['game', input.game ?? []],
  ];

  for (const [source, records] of sources) {
    for (const raw of records) {
      const card = normaliseCard(raw, source, mechanicSymbols, glossary, report);
      if (!card) continue;

      if (byId.has(card.id)) {
        report('error', 'duplicate-id', card.id, `appears more than once`);
        continue;
      }

      cards.push(card);
      byId.set(card.id, card);
    }
  }

  resolveEntourage(cards, byId, report);

  if (strict && issues.some((i) => i.level === 'error')) {
    throw new CardDataError(issues);
  }

  return { cards, byId, issues };
}

type Report = (
  level: CardIssue['level'],
  code: CardIssueCode,
  id: string,
  message: string
) => void;

function normaliseCard(
  raw: RawCard,
  source: CardSource,
  mechanicSymbols: Map<string, RawGlossaryEntry>,
  glossary: Map<string, string>,
  report: Report
): Card | undefined {
  const id = typeof raw.id === 'string' && raw.id ? raw.id : undefined;
  if (!id) {
    report('error', 'missing-field', '(unknown)', `a ${source} record has no id`);
    return undefined;
  }

  // type
  const typeKey = stripPrefix(raw.type, 'TYPE_');
  const type = typeKey ? TYPES[typeKey] : undefined;
  if (!type) {
    report('error', 'unknown-type', id, `unrecognised type ${JSON.stringify(raw.type)}`);
    return undefined;
  }

  // numbers: absent means "not applicable"; 0 is a real value, so never use `||`
  const readNumber = (field: string): number | undefined => {
    const value = raw[field];
    if (value === undefined || value === null || value === '') return undefined;
    const n = Number(value);
    if (!Number.isFinite(n)) {
      report('error', 'bad-number', id, `${field} is not a number: ${JSON.stringify(value)}`);
      return undefined;
    }
    return n;
  };

  const cost = readNumber('cost');
  if (cost === undefined) {
    report('error', 'missing-field', id, 'has no cost');
    return undefined;
  }

  const rng = readNumber('numberRNG');
  const random = readNumber('numberRandom');
  if (rng !== undefined && random !== undefined) {
    report('error', 'numbers-conflict', id, 'has both numberRNG and numberRandom');
  }

  const numbers: CardNumbers = {};
  const primary = readNumber('numberPrimary');
  const secondary = readNumber('numberSecondary');
  const overcharge = readNumber('numberOvercharge');
  if (primary !== undefined) numbers.primary = primary;
  if (secondary !== undefined) numbers.secondary = secondary;
  const randomCount = rng !== undefined ? rng : random;
  if (randomCount !== undefined) numbers.random = randomCount;
  if (overcharge !== undefined) numbers.overcharge = overcharge;

  // mechanics: fail loudly on a symbol that mechanics.json does not define
  const mechanics: string[] = [];
  const rawMechanics = Array.isArray(raw.mechanics) ? raw.mechanics : [];
  for (const symbol of rawMechanics) {
    if (typeof symbol !== 'string' || !mechanicSymbols.has(symbol)) {
      report('error', 'unknown-mechanic', id, `mechanic ${JSON.stringify(symbol)} is not defined`);
      continue;
    }
    const stripped = stripSymbol(symbol);
    if (stripped) mechanics.push(stripped);
  }

  // targeting: playType is the source of truth; %TARGET% is only a hint
  const playTypeRaw = typeof raw.playType === 'string' ? raw.playType.toUpperCase() : undefined;
  const playType: PlayType | undefined =
    playTypeRaw === 'TARGETED' ? 'targeted' : playTypeRaw === 'GLOBAL' ? 'global' : undefined;
  const hasTargetMechanic = mechanics.includes('TARGET');
  if (playType === 'targeted' && !hasTargetMechanic) {
    report('warning', 'playtype-target-mismatch', id, 'playType is TARGETED but mechanics has no TARGET');
  } else if (playType === 'global' && hasTargetMechanic) {
    report('warning', 'playtype-target-mismatch', id, 'playType is GLOBAL but mechanics has TARGET');
  }

  // name
  const name = typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : undefined;
  if (!name) report('warning', 'missing-name', id, 'has no name');

  // text
  const textTemplate = typeof raw.text === 'string' ? sanitizeText(raw.text) : '';
  const text = renderText(textTemplate, numbers, glossary, (code, message) =>
    report('warning', code, id, message)
  );

  // entourage: a comma-separated string of ids; resolved later
  const entourage =
    typeof raw.entourage === 'string'
      ? raw.entourage
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .map((s) => ENTOURAGE_ID_FIXES[s] ?? s)
      : [];

  const isToken = source === 'entourage' || raw.isEntourage === true;

  const card: Card = {
    id,
    source,
    type,
    cost,
    rarity: stripPrefix(raw.rarity, 'RARITY_') ?? 'NONE',
    set: stripSymbol(raw.set) ?? 'UNKNOWN',
    mechanics,
    numbers,
    textTemplate,
    text,
    entourage,
    isToken,
    elite: raw.elite === true,
    // tokens have no `active` field at all; everything else is active only when explicitly true
    active: isToken ? true : raw.active === true,
    collectible: raw.collectible === true,
  };

  if (name) card.name = name;
  const attack = readNumber('attack');
  const health = readNumber('health');
  if (attack !== undefined) card.attack = attack;
  if (health !== undefined) card.health = health;
  if (type === 'minion' && (attack === undefined || health === undefined)) {
    report('warning', 'missing-field', id, 'minion is missing attack or health');
  }
  const race = stripPrefix(raw.race, 'RACE_');
  if (race) card.race = race;
  if (playType) card.playType = playType;
  const playContext = stripSymbol(raw.playContext);
  if (playContext) card.playContext = playContext;
  if (typeof raw.flavor === 'string' && raw.flavor) card.flavor = sanitizeText(raw.flavor);
  if (typeof raw.description === 'string' && raw.description) card.designNote = raw.description;
  if (typeof raw.targetingArrowText === 'string' && raw.targetingArrowText) {
    card.targetingArrowText = raw.targetingArrowText;
  }
  // artistName sometimes holds a URL in PRIME; keep what is there, do not guess
  if (typeof raw.artistName === 'string' && raw.artistName) card.artistName = raw.artistName;
  if (typeof raw.artistUrl === 'string' && raw.artistUrl) card.artistUrl = raw.artistUrl;

  return card;
}

/**
 * Substitutes `%NUM%`/`%NUM1%` (primary) and `%NUM2%` (secondary), and replaces glossary tokens
 * with their display names. Unknown tokens are left in place and reported.
 */
function renderText(
  template: string,
  numbers: CardNumbers,
  glossary: Map<string, string>,
  report: (code: CardIssueCode, message: string) => void
): string {
  return template.replace(/%([A-Z0-9_]+)%/g, (token, name: string) => {
    if (name === 'NUM' || name === 'NUM1') {
      if (numbers.primary === undefined) {
        report('text-number-missing', `${token} used but there is no numberPrimary`);
        return token;
      }
      return String(numbers.primary);
    }

    if (name === 'NUM2') {
      if (numbers.secondary === undefined) {
        report('text-number-missing', `${token} used but there is no numberSecondary`);
        return token;
      }
      return String(numbers.secondary);
    }

    const display = glossary.get(token);
    if (display) return display;

    report('unknown-text-token', `${token} is not in the glossary`);
    return token;
  });
}

function resolveEntourage(
  cards: Card[],
  byId: Map<string, Card>,
  report: Report
): void {
  for (const card of cards) {
    const resolved: string[] = [];
    for (const ref of card.entourage) {
      if (byId.has(ref)) resolved.push(ref);
      else report('warning', 'unresolved-entourage', card.id, `entourage ${ref} does not exist`);
    }
    card.entourage = resolved;
  }
}
