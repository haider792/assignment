/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { handleBackgroundMessages } from './src/services/notificationService';

handleBackgroundMessages();

AppRegistry.registerComponent(appName, () => App);

