import type { Card } from "../cards/types";
import { CardDef, Definition, numbersOf } from "./define-card";
import core006 from "./core/core-006";
import core016 from "./core/core-016";
import core036 from "./core/core-036";
import core112 from "./core/core-112";
import core054 from "./core/core-054";
import core026 from "./core/core-026";
import core082 from "./core/core-082";
import core019 from "./core/core-019";
import core041 from "./core/core-041";
import core032 from "./core/core-032";
import core122 from "./core/core-122";
import core020 from "./core/core-020";
import core025 from "./core/core-025";
import core053 from "./core/core-053";
import core083 from "./core/core-083";
import core058 from "./core/core-058";
import core120 from "./core/core-120";
import core069 from "./core/core-069";
import core072 from "./core/core-072";
import core079 from "./core/core-079";
import core121 from "./core/core-121";
import core124 from "./core/core-124";
import core060 from "./core/core-060";
import core125 from "./core/core-125";
import core047 from "./core/core-047";
import core077 from "./core/core-077";
import core087 from "./core/core-087";
import core073 from "./core/core-073";
import core078 from "./core/core-078";
import core067 from "./core/core-067";
import core049 from "./core/core-049";
import core080 from "./core/core-080";
import core097 from "./core/core-097";
import core098 from "./core/core-098";
import core115 from "./core/core-115";
import core089 from "./core/core-089";
import core090 from "./core/core-090";
import core101 from "./core/core-101";
import core126 from "./core/core-126";
import core093 from "./core/core-093";
import core070 from "./core/core-070";
import core109 from "./core/core-109";
import core056 from "./core/core-056";
import core075 from "./core/core-075";
import core088 from "./core/core-088";
import core046 from "./core/core-046";
import core059 from "./core/core-059";
import core099 from "./core/core-099";
import core110 from "./core/core-110";
import core123 from "./core/core-123";
import core103 from "./core/core-103";
import core104 from "./core/core-104";
import core086 from "./core/core-086";
import core066 from "./core/core-066";
import core105 from "./core/core-105";
import core119 from "./core/core-119";
import core116 from "./core/core-116";
import core118 from "./core/core-118";
import core057 from "./core/core-057";
import core064 from "./core/core-064";
import core033 from "./core/core-033";
import core007 from "./core/core-007";
import core092 from "./core/core-092";
import core113 from "./core/core-113";
import core045 from "./core/core-045";
import core051 from "./core/core-051";
import core055 from "./core/core-055";
import core011 from './core/core-011';
import core015 from './core/core-015';
import core028 from './core/core-028';
import core037 from './core/core-037';
import core003 from './core/core-003';
import core062 from './core/core-062';
import core108 from './core/core-108';
import core130 from './core/core-130';
import core048 from './core/core-048';
import core106 from './core/core-106';
import core111 from './core/core-111';
import core127 from './core/core-127';
import core081 from './core/core-081';
import core084 from './core/core-084';
import core050 from './core/core-050';
import core091 from './core/core-091';
import { primeDefinitions } from "./prime";
import game001 from "./game/game-001";
import core001 from "./core/core-001";
import core012 from "./core/core-012";
import core013 from "./core/core-013";
import core021 from "./core/core-021";
import core035 from "./core/core-035";
import core061 from "./core/core-061";
import core071 from "./core/core-071";
import core085 from "./core/core-085";
import core043 from "./core/core-043";
import core044 from "./core/core-044";
import core063 from "./core/core-063";
import core065 from "./core/core-065";
import core068 from "./core/core-068";
import core074 from "./core/core-074";
import core094 from "./core/core-094";
import core095 from "./core/core-095";
import core096 from "./core/core-096";
import core102 from "./core/core-102";
import core107 from "./core/core-107";
import core114 from "./core/core-114";
import core129 from "./core/core-129";

/** Every card with behaviour beyond its stats and keywords. Vanilla cards have no entry. */
const all: Definition[] = [
  ...primeDefinitions,
  core091,
  core050,
  core084,
  core081,
  core127,
  core111,
  core106,
  core048,
  core130,
  core108,
  core062,
  core003,
  core037,
  core028,
  core015,
  core011,
  core055,
  core051,
  core045,
  core113,
  core092,
  core007,
  core033,
  core064,
  core057,
  core118,
  core116,
  core119,
  core105,
  core066,
  core086,
  core104,
  core103,
  core123,
  core110,
  core099,
  core059,
  core046,
  core088,
  core075,
  core056,
  core109,
  core070,
  core093,
  core126,
  core101,
  core090,
  core089,
  core115,
  core098,
  core097,
  core080,
  core049,
  core067,
  core078,
  core073,
  core087,
  core077,
  core047,
  core125,
  core060,
  core124,
  core121,
  core079,
  core072,
  core069,
  core120,
  core058,
  core083,
  core053,
  core025,
  core020,
  core122,
  core032,
  core041,
  core019,
  core082,
  core026,
  core054,
  core112,
  core036,
  core016,
  core006,
  game001,
  core001,
  core012,
  core013,
  core021,
  core035,
  core061,
  core071,
  core085,
  core043,
  core044,
  core063,
  core065,
  core068,
  core074,
  core094,
  core095,
  core096,
  core102,
  core107,
  core114,
  core129,
];

const byId = new Map(all.map((d) => [d.id, d]));
if (byId.size !== all.length) throw new Error("duplicate card definition id");

/** The behaviour of a card, or undefined if it has none defined yet. */
export const getCardDef = (card: Card): CardDef | undefined =>
  byId.get(card.id)?.create(numbersOf(card.id, card.numbers));
