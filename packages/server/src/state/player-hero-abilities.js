import ABILITIES_DATABASE from '../data/abilities.json';

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

    G.playerHeroAbilities[player] = array;
  }
};

export default playerHeroAbilities;
