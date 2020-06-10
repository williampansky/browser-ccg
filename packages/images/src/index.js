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

// card asset images
const MECHANICS = importAll(
  require.context('./mechanics', true, /\.(png|jpe?g|svg)$/)
);

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

export {
  CARD_ASSETS,
  CARDS,
  HEROS,
  MECHANICS,
  PLACEHOLDER_BASE_IMAGE,
  PLACEHOLDER_IMAGE,
  SETS
};

export default IMAGES;
