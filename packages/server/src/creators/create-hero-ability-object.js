/**
 * Creates an object with Ability-specific key:values.
 * @param {object} ability
 */
const createHeroAbilityObject = ability => {
  return {
    ...ability,
    abilityLocked: true,
    cooldown: ability.ultimate ? -1 : ability.cooldown,
    cooldownCurrentCount: 0,
    cooldownInEffect: false,
    id: ability.key
  };
};

export default createHeroAbilityObject;
