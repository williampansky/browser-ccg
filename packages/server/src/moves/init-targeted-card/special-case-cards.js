/**
 * Determines if a targeted card's initiation should be handled by
 * the card's `id` or `playContext` prop; generally, you'd add an `id`
 * to this array if the complexity of a card requires more than what
 * the simple contextual string can provide.
 *
 * @type {array}
 * @member specialCaseCardID
 * @memberof initTargetedCard
 */
const specialCaseCardID = [
  'CORE_089',
  'CORE_090',
  'CORE_093',
  'CORE_113',
  'CORE_126'
];

export default specialCaseCardID;
