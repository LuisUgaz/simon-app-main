module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-reanimated/plugin', [
    "module:react-native-dotenv",
    {
      moduleName: "@env",
      path: ".env",
    },
  ],],
  env: {
    production: {
      plugins: [
        'react-native-paper/babel',
        [
          "module:react-native-dotenv",
          {
            moduleName: "@env",
            path: ".env",
          },
        ],
      ],
    },
  },
};
