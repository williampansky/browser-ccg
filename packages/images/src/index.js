const importAll = require =>
  require.keys().reduce((acc, next) => {
    acc[next.replace('./', '')] = require(next);
    return acc;
  }, {});

// all images
const IMAGES = importAll(require.context('.', true, /\.(png|jpe?g|svg)$/));

// card asset images
const CARD_ASSETS = importAll(
  require.context('./card-assets', true, /\.(png|jpe?g|svg)$/)
);

// minion mechanics
const MECHANICS = importAll(
  require.context('./mechanics', true, /\.(png|jpe?g|svg)$/)
);

// minion interactions
const INTERACTIONS = importAll(
  require.context('./interactions', true, /\.(png|jpe?g|svg)$/)
);

// abilities
const ABILITIES_ICON = importAll(
  require.context('./heros', false, /\.(png|jpe?g|svg)$/)
)['ABILITIES_ICON.jpg'];
const ABILITIES_ICON_CLOSE = importAll(
  require.context('./heros', false, /\.(png|jpe?g|svg)$/)
)['ABILITIES_ICON_CLOSE.jpg'];

// card cost gem
const COST_GEM_IMAGE = importAll(
  require.context('./card-assets', false, /\.(png|jpe?g|svg)$/)
)['BADGE_GEM.png'];

// card flair img placeholder
const PLACEHOLDER_IMAGE = importAll(
  require.context('./sets', false, /\.(png|jpe?g|svg)$/)
)['PLACEHOLDER.jpg'];

// basic card front
const PLACEHOLDER_BASE_IMAGE = importAll(
  require.context('./cards/front', false, /\.(png)$/)
)['NONE.png'];

const CARDS = importAll(require.context('./cards', true, /\.(png)$/));
const SETS = importAll(require.context('./sets', true, /\.(jpg)$/));
const HEROS = importAll(require.context('./heros', true, /\.(jpg)$/));
const ICONS = importAll(require.context('./icons', true, /\.(svg)$/));

export {
  ABILITIES_ICON_CLOSE,
  ABILITIES_ICON,
  CARD_ASSETS,
  CARDS,
  COST_GEM_IMAGE,
  HEROS,
  ICONS,
  INTERACTIONS,
  MECHANICS,
  PLACEHOLDER_BASE_IMAGE,
  PLACEHOLDER_IMAGE,
  SETS
};

export default IMAGES;
