import {AppRegistry} from 'react-native';

console.log('[index.js] Starting app initialization...');

try {
  const App = require('./App').default;
  console.log('[index.js] App required successfully, type:', typeof App);
  
  // Register the component as "main" - this is what Expo looks for
  AppRegistry.registerComponent('main', () => {
    console.log('[index.js] Component factory called, returning App');
    return App;
  });
  console.log('[index.js] Component registered as "main"');
} catch (error) {
  console.error('[index.js] FATAL ERROR:', error?.message || error);
  console.error('[index.js] Stack:', error?.stack);
  
  // Fallback
  AppRegistry.registerComponent('main', () => {
    const { Text, View } = require('react-native');
    return () => (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>App initialization failed</Text>
      </View>
    );
  });
}
