import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';

console.log('[index.js] Starting app initialization...');

try {
  const App = require('./App').default;
  console.log('[index.js] App required successfully, type:', typeof App);
  
  // Register the component
  AppRegistry.registerComponent(appName, () => {
    console.log('[index.js] Component factory called, returning App');
    return App;
  });
  console.log('[index.js] Component registered');
} catch (error) {
  console.error('[index.js] FATAL ERROR:', error?.message || error);
  console.error('[index.js] Stack:', error?.stack);
  
  // Fallback
  AppRegistry.registerComponent(appName, () => {
    const { Text, View } = require('react-native');
    return () => (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>App initialization failed</Text>
      </View>
    );
  });
}
