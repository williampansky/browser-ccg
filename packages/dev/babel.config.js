module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        corejs: 3,
        useBuiltIns: 'entry'
      }
    ]
  ],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@': './src/'
        }
      }
    ],
    [
      '@babel/plugin-transform-modules-commonjs',
      {
        allowTopLevelThis: true
      }
    ]
  ]
};
