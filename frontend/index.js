import { registerRootComponent } from 'expo';

import App from './App';
import { LogBox } from 'react-native'; 
LogBox.ignoreLogs([
  'Text strings must be rendered within a <Text> component.'
]);
registerRootComponent(App);
