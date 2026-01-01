// Jest setup file for React Native
// This file runs before all tests

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock Expo modules
jest.mock('expo-image-picker', () => ({
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
}));

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
}));

// Mock React Native modules
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: function SafeAreaView(props) {
    return props.children;
  },
  useSafeAreaInsets: jest.fn(() => ({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  })),
}));

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: function NavigationContainer(props) {
    return props.children;
  },
  useFocusEffect: jest.fn(),
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    push: jest.fn(),
  })),
  useRoute: jest.fn(() => ({
    params: {},
  })),
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: jest.fn(() => ({
    Navigator: function Navigator(props) {
      return props.children;
    },
    Screen: function Screen() {
      return null;
    },
  })),
}));

// Suppress console errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = function consoleError(...args) {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
