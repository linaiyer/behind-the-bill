import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BLACK = '#111111';
const GRAY = '#6B6B6B';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>App preferences and configuration</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.comingSoon}>Settings screen coming soon...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 64,
    paddingHorizontal: 28,
    paddingBottom: 20,
  },
  title: {
    fontSize: 36,
    fontFamily: 'WorkSans_700Bold',
    color: BLACK,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 16,
    color: GRAY,
    fontFamily: 'WorkSans_400Regular',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  comingSoon: {
    fontSize: 18,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
    textAlign: 'center',
  },
});