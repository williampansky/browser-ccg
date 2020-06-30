import ABILITIES_DATABASE from '../data/abilities.json';
import createHeroAbilityObject from '../creators/create-hero-ability-object';

const playerHeroAbilities = {
  __DATA_MODEL: {
    '0': [],
    '1': []
  },

  /**
   * Sets the provided player's abilities array.
   */
  set: (G, player, hero) => {
    const array = Object.keys(ABILITIES_DATABASE)
      .map(key => ABILITIES_DATABASE[key])
      .filter(obj => obj.key === hero);

    const newArray = array.map(obj => createHeroAbilityObject(obj));
    G.playerHeroAbilities[player] = newArray;
  }
};

export default playerHeroAbilities;
