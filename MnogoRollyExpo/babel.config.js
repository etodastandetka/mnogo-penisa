module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { 
        web: { 
          unstable_transformProfile: 'hermes-stable' 
        } 
      }]
    ],
    plugins: [
      '@babel/plugin-proposal-export-namespace-from',
    ],
  };
};
