import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import PoliticalFigureSearchScreen from '../screens/PoliticalFigureSearchScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SharedNavBar from '../components/SharedNavBar';
import AuthModal from '../components/AuthModal';
import { authService } from '../services/authService';
import { User } from '../types/auth';

export default function MainTabNavigator() {
  const [selectedTab, setSelectedTab] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    loadUser();
    
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
    });

    return unsubscribe;
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleTabPress = (tabKey: string) => {
    if (tabKey === 'settings' && !user) {
      // Show auth modal if trying to access settings without being signed in
      setShowAuthModal(true);
      return;
    }
    
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

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setSelectedTab('settings'); // Navigate to settings after successful auth
  };

  return (
    <View style={styles.container}>
      {renderCurrentScreen()}
      
      <SharedNavBar 
        selectedTab={selectedTab} 
        onTabPress={handleTabPress}
      />

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});