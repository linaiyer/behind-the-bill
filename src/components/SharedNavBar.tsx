import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';

const BLACK = '#111';

interface SharedNavBarProps {
  selectedTab: string;
  onTabPress: (tabKey: string) => void;
}

const navTabs = [
  { key: 'home', selected: require('../../assets/home_selected.png'), unselected: require('../../assets/home_unselected.png') },
  { key: 'chat', selected: require('../../assets/chat_selected.png'), unselected: require('../../assets/chat_unselected.png') },
  { key: 'settings', selected: require('../../assets/settings_selected.png'), unselected: require('../../assets/settings_unselected.png') },
];

export default function SharedNavBar({ selectedTab, onTabPress }: SharedNavBarProps) {
  const handleTabPress = (tabKey: string) => {
    onTabPress(tabKey);
    // Navigation is handled by the parent MainTabNavigator
  };

  return (
    <View style={styles.bottomNavWrap}>
      <View style={styles.bottomNav}>
        {navTabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={selectedTab === tab.key ? styles.navBubbleSelected : styles.navBubble}
            onPress={() => handleTabPress(tab.key)}
            activeOpacity={0.85}
          >
            <Image
              source={selectedTab === tab.key ? tab.selected : tab.unselected}
              style={{ width: 28, height: 28, tintColor: selectedTab === tab.key ? BLACK : '#fff' }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
  },
  bottomNav: {
    flexDirection: 'row',
    borderRadius: 40,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    width: 260,
    height: 64,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  navBubble: {
    backgroundColor: BLACK,
    borderRadius: 32,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    zIndex: 1001,
    elevation: 11,
  },
  navBubbleSelected: {
    backgroundColor: '#fff',
    borderRadius: 32,
    width: 56,
    height: 56,
    zIndex: 1001,
    elevation: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: BLACK,
  },
});