import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import MainTabNavigator from './MainTabNavigator';
import ArticleReaderScreen from '../screens/ArticleReaderScreen';
import ContextScreen from '../screens/ContextScreen';
import LegislativeSimulatorScreen from '../screens/LegislativeSimulatorScreen';
import PoliticalChatScreen from '../screens/PoliticalChatScreen';
import PreferencesScreen from '../screens/PreferencesScreen';
import NewsSubscriptionsScreen from '../screens/NewsSubscriptionsScreen';
import { NewsArticle } from '../utils/newsApi';
// import SurveyScreen from '../screens/SurveyScreen'; // We'll add this next

export type RootStackParamList = {
  Welcome: undefined;
  Home: undefined;
  ArticleReader: { article: NewsArticle };
  Context: { term: string };
  LegislativeSimulator: { billName: string; billDescription?: string };
  PoliticalChat: { figureId: string; figureName: string };
  Preferences: undefined;
  NewsSubscriptions: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Home" component={MainTabNavigator} />
        <Stack.Screen name="ArticleReader" component={ArticleReaderScreen} />
        <Stack.Screen name="Context" component={ContextScreen} />
        <Stack.Screen name="LegislativeSimulator" component={LegislativeSimulatorScreen} />
        <Stack.Screen name="PoliticalChat" component={PoliticalChatScreen} />
        <Stack.Screen name="Preferences" component={PreferencesScreen} />
        <Stack.Screen name="NewsSubscriptions" component={NewsSubscriptionsScreen} />
        {/* <Stack.Screen name="Survey" component={SurveyScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
