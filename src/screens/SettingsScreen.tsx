import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { authService } from '../services/authService';
import { User } from '../types/auth';
import AIConfigModal from '../components/AIConfigModal';
import { getAboutText, getPrivacyPolicyText, getSupportText } from '../utils/appInfo';
import { useUserPreferences, getThemeColors, getFontScale } from '../hooks/useUserPreferences';

type RootStackParamList = {
  Settings: undefined;
  Preferences: undefined;
  NewsSubscriptions: undefined;
};

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const BLACK = '#111111';
const GRAY = '#6B6B6B';
const THEME_COLOR = '#008080';

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { preferences } = useUserPreferences();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAIConfig, setShowAIConfig] = useState(false);

  // Get theme colors and font scale based on user preferences
  const themeColors = getThemeColors(preferences.display.darkMode);
  const fontScale = getFontScale(preferences.display.fontSize);

  useEffect(() => {
    loadUser();
    
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.signOut();
              setUser(null);
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleNewsSubscriptions = () => {
    if (user) {
      navigation.navigate('NewsSubscriptions');
    }
  };

  const handlePreferences = () => {
    if (user) {
      navigation.navigate('Preferences');
    }
  };

  const handleAIConfig = () => {
    console.log('AI Config button pressed');
    console.log('Showing AI config modal');
    setShowAIConfig(true);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME_COLOR} />
          <Text style={[styles.loadingText, { color: themeColors.secondaryText }]}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Show basic settings even without authentication, but hide user-specific features
  const showUserFeatures = !!user;

  // Create dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    container: {
      ...styles.container,
      backgroundColor: themeColors.background,
    },
    title: {
      ...styles.title,
      color: themeColors.text,
    },
    subtitle: {
      ...styles.subtitle,
      color: themeColors.secondaryText,
    },
    userName: {
      ...styles.userName,
      color: themeColors.text,
    },
    userEmail: {
      ...styles.userEmail,
      color: themeColors.secondaryText,
    },
    sectionTitle: {
      ...styles.sectionTitle,
      color: themeColors.text,
    },
    settingTitle: {
      ...styles.settingTitle,
      color: themeColors.text,
    },
    settingDescription: {
      ...styles.settingDescription,
      color: themeColors.secondaryText,
    },
    settingArrow: {
      ...styles.settingArrow,
      color: themeColors.secondaryText,
    },
    userInfo: {
      ...styles.userInfo,
      backgroundColor: themeColors.card,
    },
    settingItem: {
      ...styles.settingItem,
      borderBottomColor: themeColors.border,
    },
    loadingText: {
      ...styles.loadingText,
      color: themeColors.secondaryText,
    },
  });

  // Show authenticated settings screen
  return (
    <View style={dynamicStyles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={dynamicStyles.title}>Settings</Text>
          <Text style={dynamicStyles.subtitle}>App preferences and configuration</Text>
        </View>

        {showUserFeatures && (
          <View style={styles.userSection}>
            <View style={dynamicStyles.userInfo}>
              {user.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </Text>
                </View>
              )}
              <View style={styles.userDetails}>
                <Text style={dynamicStyles.userName}>{user.displayName || 'User'}</Text>
                <Text style={dynamicStyles.userEmail}>{user.email}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.settingsSection}>
          <Text style={dynamicStyles.sectionTitle}>App Configuration</Text>
          
          <TouchableOpacity
            style={dynamicStyles.settingItem}
            onPress={handleAIConfig}
          >
            <View style={styles.settingIcon}>
              <Text style={styles.settingEmoji}>🤖</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={dynamicStyles.settingTitle}>AI Highlighting</Text>
              <Text style={dynamicStyles.settingDescription}>
                Configure OpenAI API key for enhanced political term highlighting and context
              </Text>
            </View>
            <Text style={dynamicStyles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {showUserFeatures && (
          <View style={styles.settingsSection}>
            <Text style={dynamicStyles.sectionTitle}>Personalization</Text>
          
            <TouchableOpacity
              style={dynamicStyles.settingItem}
              onPress={handleNewsSubscriptions}
            >
              <View style={styles.settingIcon}>
                <Text style={styles.settingEmoji}>📰</Text>
              </View>
              <View style={styles.settingContent}>
                <Text style={dynamicStyles.settingTitle}>News Subscriptions</Text>
                <Text style={dynamicStyles.settingDescription}>
                  Connect your news subscriptions to see more articles
                </Text>
              </View>
              <Text style={dynamicStyles.settingArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={dynamicStyles.settingItem}
              onPress={handlePreferences}
            >
              <View style={styles.settingIcon}>
                <Text style={styles.settingEmoji}>⚙️</Text>
              </View>
              <View style={styles.settingContent}>
                <Text style={dynamicStyles.settingTitle}>Interests & Preferences</Text>
                <Text style={dynamicStyles.settingDescription}>
                  Set your political interests, notifications, and display preferences
                </Text>
              </View>
              <Text style={dynamicStyles.settingArrow}>›</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.settingsSection}>
          <Text style={dynamicStyles.sectionTitle}>App Information</Text>
          
          <TouchableOpacity
            style={dynamicStyles.settingItem}
            onPress={() => Alert.alert('About', getAboutText())}
          >
            <View style={styles.settingIcon}>
              <Text style={styles.settingEmoji}>ℹ️</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={dynamicStyles.settingTitle}>About</Text>
              <Text style={dynamicStyles.settingDescription}>
                Version information and app details
              </Text>
            </View>
            <Text style={dynamicStyles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.settingItem}
            onPress={() => Alert.alert('Privacy Policy', getPrivacyPolicyText())}
          >
            <View style={styles.settingIcon}>
              <Text style={styles.settingEmoji}>🔒</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={dynamicStyles.settingTitle}>Privacy Policy</Text>
              <Text style={dynamicStyles.settingDescription}>
                How we handle your data and privacy
              </Text>
            </View>
            <Text style={dynamicStyles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.settingItem}
            onPress={() => Alert.alert('Help & Support', getSupportText())}
          >
            <View style={styles.settingIcon}>
              <Text style={styles.settingEmoji}>❓</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={dynamicStyles.settingTitle}>Help & Support</Text>
              <Text style={dynamicStyles.settingDescription}>
                Get help, report issues, or ask questions
              </Text>
            </View>
            <Text style={dynamicStyles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {showUserFeatures && (
          <View style={styles.settingsSection}>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        )}

        <AIConfigModal
          visible={showAIConfig}
          onClose={() => setShowAIConfig(false)}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
    marginTop: 12,
  },
  userSection: {
    paddingHorizontal: 28,
    paddingBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: THEME_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontFamily: 'WorkSans_700Bold',
    color: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'WorkSans_600SemiBold',
    color: BLACK,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
  },
  settingsSection: {
    paddingHorizontal: 28,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'WorkSans_600SemiBold',
    color: BLACK,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingEmoji: {
    fontSize: 24,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'WorkSans_600SemiBold',
    color: BLACK,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
    lineHeight: 18,
  },
  settingArrow: {
    fontSize: 24,
    color: GRAY,
    fontFamily: 'WorkSans_400Regular',
  },
  signOutButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  signOutButtonText: {
    fontSize: 16,
    fontFamily: 'WorkSans_600SemiBold',
    color: '#fff',
  },
});