import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TailwindProvider } from 'tailwindcss-react-native';
import AppNavigation from './navigation/appNavigation';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TailwindProvider>
        <AppNavigation />
      </TailwindProvider>
    </GestureHandlerRootView>
  );
}
