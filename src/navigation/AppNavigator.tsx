import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import HomeScreen from '../screens/HomeScreen';
import ArticleReaderScreen from '../screens/ArticleReaderScreen';
import ContextScreen from '../screens/ContextScreen';
import LegislativeSimulatorScreen from '../screens/LegislativeSimulatorScreen';
// import SurveyScreen from '../screens/SurveyScreen'; // We'll add this next

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ArticleReader" component={ArticleReaderScreen} />
        <Stack.Screen name="Context" component={ContextScreen} />
        <Stack.Screen name="LegislativeSimulator" component={LegislativeSimulatorScreen} />
        {/* <Stack.Screen name="Survey" component={SurveyScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
