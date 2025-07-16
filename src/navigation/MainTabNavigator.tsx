import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import PoliticalFigureSearchScreen from '../screens/PoliticalFigureSearchScreen';
import PoliticalChatScreen from '../screens/PoliticalChatScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SharedNavBar from '../components/SharedNavBar';
import AuthModal from '../components/AuthModal';
import { authService } from '../services/authService';
import { User } from '../types/auth';

export default function MainTabNavigator() {
  const [selectedTab, setSelectedTab] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [chatState, setChatState] = useState<{
    screen: 'search' | 'chat';
    figureId?: string;
    figureName?: string;
  }>({ screen: 'search' });
  const [previousUser, setPreviousUser] = useState<User | null>(null);

  useEffect(() => {
    loadUser();
    
    const unsubscribe = authService.onAuthStateChanged((newUser) => {
      // If user signs out (was signed in, now not), go to home
      if (previousUser && !newUser) {
        setSelectedTab('home');
      }
      
      setPreviousUser(user);
      setUser(newUser);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    console.log('ChatState changed:', chatState);
  }, [chatState]);

  useEffect(() => {
    console.log('SelectedTab changed:', selectedTab);
  }, [selectedTab]);

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
      // Don't change the selected tab, stay on current tab
      return;
    }
    
    // Reset chat state when switching to other tabs
    if (tabKey !== 'chat') {
      setChatState({ screen: 'search' });
    }
    
    setSelectedTab(tabKey);
  };

  const navigateToChat = (figureId: string, figureName: string) => {
    console.log('navigateToChat called with:', figureId, figureName);
    
    // Use a callback to ensure the state is updated before switching tabs
    setChatState(prevState => {
      console.log('Updating chat state from:', prevState);
      const newState = {
        screen: 'chat' as const,
        figureId,
        figureName
      };
      console.log('New chat state:', newState);
      return newState;
    });
    
    // Switch to chat tab
    setSelectedTab('chat');
  };

  const navigateBackToSearch = () => {
    setChatState({ screen: 'search' });
  };

  const renderCurrentScreen = () => {
    console.log('renderCurrentScreen - selectedTab:', selectedTab, 'chatState:', chatState);
    
    switch (selectedTab) {
      case 'home':
        return <HomeScreen />;
      case 'chat':
        if (chatState.screen === 'chat' && chatState.figureId && chatState.figureName) {
          console.log('Rendering PoliticalChatScreen with figureId:', chatState.figureId);
          return (
            <PoliticalChatScreen
              route={{
                params: {
                  figureId: chatState.figureId,
                  figureName: chatState.figureName
                }
              } as any}
              navigation={{
                goBack: navigateBackToSearch
              } as any}
            />
          );
        }
        console.log('Rendering PoliticalFigureSearchScreen');
        return (
          <PoliticalFigureSearchScreen
            navigation={{
              navigate: (screenName: string, params: any) => {
                console.log('Mock navigation.navigate called with:', screenName, params);
                if (screenName === 'PoliticalChat') {
                  navigateToChat(params.figureId, params.figureName);
                }
              },
              goBack: () => setSelectedTab('home')
            } as any}
          />
        );
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
      
      {/* Hide nav bar when in individual chat */}
      {!(selectedTab === 'chat' && chatState.screen === 'chat') && (
        <SharedNavBar 
          selectedTab={selectedTab} 
          onTabPress={handleTabPress}
        />
      )}

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