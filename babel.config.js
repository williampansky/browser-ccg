module.exports = {
  // babelRcRoots: ['.', 'packages/*'],
  presets: [
    [
      '@babel/preset-env',
      {
        corejs: 3,
        useBuiltIns: 'entry',
        targets: { node: 'current' }
      }
    ]
  ],
  plugins: [
    // '@babel/plugin-transform-runtime',
    '@babel/plugin-transform-modules-commonjs'
  ]
};
