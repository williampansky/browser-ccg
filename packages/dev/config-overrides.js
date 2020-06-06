/* eslint-disable */
const path = require('path');
const fs = require('fs');
const { override, babelInclude } = require('customize-cra');

module.exports = (config, env) => {
  return Object.assign(
    config,
    override(
      /* Makes sure Babel compiles the stuff in the common folder */
      babelInclude([
        path.resolve('src'),
        fs.realpathSync('../assets/src'),
        fs.realpathSync('../components/src'),
        fs.realpathSync('../config/src'),
        fs.realpathSync('../data/src'),
        fs.realpathSync('../enums/src'),
        fs.realpathSync('../hooks/src'),
        fs.realpathSync('../server/src'),
        fs.realpathSync('../styles/src'),
        fs.realpathSync('../utils/src')
      ])
    )(config, env)
  );
};
