module.exports = {
  project: {
    ios: {},
    android: {},
  },
  dependencies: {
    '@react-native-async-storage/async-storage': {
      platforms: {
        android: {
          sourceDir: './node_modules/@react-native-async-storage/async-storage/android',
        },
        ios: {},
      },
    },
    'react-native-gesture-handler': {
      platforms: {
        android: {
          sourceDir: './node_modules/react-native-gesture-handler/android',
        },
        ios: {},
      },
    },
    'react-native-safe-area-context': {
      platforms: {
        android: {
          sourceDir: './node_modules/react-native-safe-area-context/android',
        },
        ios: {},
      },
    },
    'react-native-screens': {
      platforms: {
        android: {
          sourceDir: './node_modules/react-native-screens/android',
        },
        ios: {},
      },
    },
  },
};
