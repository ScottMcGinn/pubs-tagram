import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';

// Wrap App import to catch initialization errors
let AppComponent;
try {
  AppComponent = require('./App').default;
  console.log('[index.js] App imported successfully');
} catch (error) {
  console.error('[index.js] FATAL: Failed to import App:', error);
  // Fallback empty component
  AppComponent = () => null;
}

AppRegistry.registerComponent(appName, () => AppComponent);
