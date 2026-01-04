import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import App from './App';

console.log('[index.js] App imported successfully');

AppRegistry.registerComponent(appName, () => App);
