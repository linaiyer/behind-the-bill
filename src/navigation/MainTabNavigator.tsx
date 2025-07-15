import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import PoliticalFigureSearchScreen from '../screens/PoliticalFigureSearchScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SharedNavBar from '../components/SharedNavBar';

export default function MainTabNavigator() {
  const [selectedTab, setSelectedTab] = useState('home');

  const handleTabPress = (tabKey: string) => {
    setSelectedTab(tabKey);
  };

  const renderCurrentScreen = () => {
    switch (selectedTab) {
      case 'home':
        return <HomeScreen />;
      case 'chat':
        return <PoliticalFigureSearchScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {renderCurrentScreen()}
      
      <SharedNavBar 
        selectedTab={selectedTab} 
        onTabPress={handleTabPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});