import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Sidebar from '../components/Sidebar';

import HomeScreen from '../screens/HomeScreen.js';
import OnboardingScreen from '../screens/OnboardingScreen.js';
import QuestionnaireScreen from '../screens/QuestionnaireScreen.js';
import DashboardScreen from '../screens/DashboardScreen.js';
import AddMemoryScreen from '../screens/AddMemoryScreen.js';
import ProfileScreen from '../screens/ProfileScreen.js';
import LogSignScreen from '../screens/LogSignScreen.js';
import MemoryAlbumScreen from '../screens/MemoryAlbumScreen.js';
import StoryScreen from '../screens/StoryScreen.js';
import SettingScreen from '../screens/SettingScreen.js';
import HelpSupportScreen from '../screens/HelpSupportScreen.js';
import WishJarScreen from '../screens/WishJarScreen.js';
import MemoryCalendar from '../screens/MemoryCalendar.js';
import BoardScreen from '../screens/BoardScreen.js';
import JoyJarScreen from '../screens/JoyJarScreen.js';
import AlbumsPage from '../screens/AlbumsPage.js';
import ItemDetailScreen from '../screens/ItemDetailScreen.js';
import ImageViewerScreen from '../screens/ImageViewerScreen.js';
import ChangePasswordScreen from '../screens/ChangePasswordScreen.js';
import DeleteAccountScreen from '../screens/DeleteAccountScreen.js';
import TermsScreen from '../screens/TermsScreen.js';


// just add these two lines
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Put your stack as it already is, just moved inside a function:
function MainStack() {
  return (
    <Stack.Navigator initialRouteName="Onboarding">
      <Stack.Screen name="Onboarding" options={{ headerShown: false }} component={OnboardingScreen} />
      <Stack.Screen name="Home" options={{ headerShown: false }} component={HomeScreen} />
      <Stack.Screen name="Questionnaire" options={{ headerShown: false }} component={QuestionnaireScreen} />
      <Stack.Screen name="Dashboard" options={{ headerShown: false }} component={DashboardScreen} />
      <Stack.Screen name="AddMemory" options={{ headerShown: false }} component={AddMemoryScreen} />
      <Stack.Screen name="ProfileScreen" options={{ headerShown: false }} component={ProfileScreen} /> 
      <Stack.Screen name="LogSignScreen" options={{ headerShown: false }} component={LogSignScreen} />
      <Stack.Screen name="MemoryAlbumScreen" options={{ headerShown: false }} component={MemoryAlbumScreen} />
      <Stack.Screen name="StoryScreen" options={{ headerShown: false }} component={StoryScreen} />
      <Stack.Screen name="SettingScreen" options={{ headerShown: false }} component={SettingScreen} />
      <Stack.Screen name="HelpSupportScreen" options={{ headerShown: false }} component={HelpSupportScreen} />
      <Stack.Screen name="WishJarScreen" options={{ headerShown: false }} component={WishJarScreen} />
      <Stack.Screen name="MemoryCalendar" options={{ headerShown: false }} component={MemoryCalendar} />
      <Stack.Screen name="BoardScreen" options={{ headerShown: false }} component={BoardScreen} />
      <Stack.Screen name="DashboardScreen" options={{ headerShown: false }} component={DashboardScreen} />
      <Stack.Screen name="JoyJarScreen" options={{ headerShown: false }} component={JoyJarScreen} />
      <Stack.Screen name="AlbumsPage" options={{ headerShown: false }} component={AlbumsPage} />
      <Stack.Screen name="ItemDetailScreen" options={{ headerShown: false }} component={ItemDetailScreen} />
      <Stack.Screen name="ImageViewer" options={{ headerShown: false }} component={ImageViewerScreen} /> 
      <Stack.Screen name="ChangePasswordScreen" options={{ headerShown: false }} component={ChangePasswordScreen} />
      <Stack.Screen name="DeleteAccountScreen" options={{ headerShown: false }} component={DeleteAccountScreen} />
      <Stack.Screen name="TermsScreen" options={{ headerShown: false }} component={TermsScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={(props) => <Sidebar {...props} />}
       
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            width: 200, 
          },
        }}
      >
        <Drawer.Screen name="Main" component={MainStack} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}