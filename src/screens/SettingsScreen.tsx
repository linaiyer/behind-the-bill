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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAIConfig, setShowAIConfig] = useState(false);

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
    if (user) {
      setShowAIConfig(true);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME_COLOR} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Don't render anything if user is not authenticated
  // The AuthModal in MainTabNavigator will handle sign-in
  if (!user) {
    return null;
  }

  // Show authenticated settings screen
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>App preferences and configuration</Text>
        </View>

        <View style={styles.userSection}>
          <View style={styles.userInfo}>
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
              <Text style={styles.userName}>{user.displayName || 'User'}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Personalization</Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleNewsSubscriptions}
          >
            <View style={styles.settingIcon}>
              <Text style={styles.settingEmoji}>📰</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>News Subscriptions</Text>
              <Text style={styles.settingDescription}>
                Connect your news subscriptions to see more articles
              </Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handlePreferences}
          >
            <View style={styles.settingIcon}>
              <Text style={styles.settingEmoji}>⚙️</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Interests & Preferences</Text>
              <Text style={styles.settingDescription}>
                Set your political interests, notifications, and display preferences
              </Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleAIConfig}
          >
            <View style={styles.settingIcon}>
              <Text style={styles.settingEmoji}>🤖</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>AI Highlighting</Text>
              <Text style={styles.settingDescription}>
                Configure AI-powered political term highlighting
              </Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>App Information</Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => Alert.alert('About', getAboutText())}
          >
            <View style={styles.settingIcon}>
              <Text style={styles.settingEmoji}>ℹ️</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>About</Text>
              <Text style={styles.settingDescription}>
                Version information and app details
              </Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => Alert.alert('Privacy Policy', getPrivacyPolicyText())}
          >
            <View style={styles.settingIcon}>
              <Text style={styles.settingEmoji}>🔒</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Privacy Policy</Text>
              <Text style={styles.settingDescription}>
                How we handle your data and privacy
              </Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => Alert.alert('Help & Support', getSupportText())}
          >
            <View style={styles.settingIcon}>
              <Text style={styles.settingEmoji}>❓</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Help & Support</Text>
              <Text style={styles.settingDescription}>
                Get help, report issues, or ask questions
              </Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingsSection}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

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