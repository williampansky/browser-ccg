const importAll = require =>
  require.keys().reduce((acc, next) => {
    acc[next.replace('./', '')] = require(next);
    return acc;
  }, {});

const IMAGES = importAll(
  require.context('./images', false, /\.(png|jpe?g|svg)$/)
);

export default IMAGES;
